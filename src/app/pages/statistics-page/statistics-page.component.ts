import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { IIconStyles } from 'office-ui-fabric-react'
import { ChartDataSets } from 'chart.js'
import { Label } from 'ng2-charts'
import * as moment from 'moment'
import {
	Dav,
	ApiResponse,
	ApiErrorResponse,
	UsersController,
	UserActivitiesController,
	GetUsersResponseData,
	GetUserActivitiesResponseData
} from 'dav-npm'
import { enUS } from 'src/locales/locales'
import { DataService } from 'src/app/services/data-service'

@Component({
	selector: 'dav-website-statistics-page',
	templateUrl: './statistics-page.component.html'
})
export class StatisticsPageComponent {
	locale = enUS.statisticsPage
	userChartDataSets: ChartDataSets[] = [{ data: [], label: this.locale.numberOfUsers }]
	userChartLabels: Label[] = []
	plansChartData: number[] = [0, 0, 0]
	plansChartLabels: Label[] = ["Free", "Plus", "Pro"]
	confirmationsChartData: number[] = [0, 0]
	confirmationsChartLabels: Label[] = [this.locale.confirmed, this.locale.unconfirmed]
	activeUsersChartDataSets: ChartDataSets[] = [
		{ data: [], label: this.locale.daily },
		{ data: [], label: this.locale.monthly },
		{ data: [], label: this.locale.yearly }
	]
	activeUsersChartLabels: Label[] = []
	currentlyActiveUsersDataSets: ChartDataSets[] = [{ data: [], label: this.locale.currentlyActiveUsers }]
	currentlyActiveUsersChartLabels: Label[] = [this.locale.daily, this.locale.monthly, this.locale.yearly]
	totalUsersText: string = this.locale.totalUsers.replace('{0}', '0')

	backButtonIconStyles: IIconStyles = {
		root: {
			fontSize: 19
		}
	}

	constructor(
		public dataService: DataService,
		private router: Router
	) {
		this.locale = this.dataService.GetLocale().statisticsPage
		moment.locale(this.dataService.locale)

		// Set the labels
		this.userChartDataSets[0].label = this.locale.numberOfUsers
		this.confirmationsChartLabels[0] = this.locale.confirmed
		this.confirmationsChartLabels[1] = this.locale.unconfirmed
		this.activeUsersChartDataSets[0].label = this.locale.daily
		this.activeUsersChartDataSets[1].label = this.locale.monthly
		this.activeUsersChartDataSets[2].label = this.locale.yearly
		this.currentlyActiveUsersDataSets[0].label = this.locale.currentlyActiveUsers
		this.currentlyActiveUsersChartLabels[0] = this.locale.daily
		this.currentlyActiveUsersChartLabels[1] = this.locale.monthly
		this.currentlyActiveUsersChartLabels[2] = this.locale.yearly
	}

	async ngOnInit() {
		await this.dataService.userPromise
		if (this.dataService.user == null) {
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage
			this.router.navigate(['/'])
			return
		} else if (!this.dataService.user.Dev) {
			this.dataService.startPageErrorMessage = this.locale.accessNotAllowedMessage
			this.router.navigate(['/'])
			return
		}

		this.GetUsersResponse(
			await UsersController.GetUsers()
		)

		let start = moment().startOf('day').subtract(6, 'months').unix()
		this.GetActiveUsersResponse(
			await UserActivitiesController.GetUserActivities({ start })
		)
	}

	ProcessUsers(users: GetUsersResponseData) {
		// Set the total users
		this.totalUsersText = this.locale.totalUsers.replace('{0}', users.users.length.toString())

		let currentDate = moment().startOf('month').subtract(5, 'months')
		let start = currentDate.clone()
		let months: Map<string, number> = new Map()
		this.plansChartData = [0, 0, 0]
		this.confirmationsChartData = [0, 0]

		// Get the last 6 months
		for (let i = 0; i < 6; i++) {
			months.set(currentDate.format('MMMM YYYY'), 0)
			currentDate.add(1, 'month')
		}

		for (let user of users.users) {
			// Add the cumulative user counts
			let createdAt = moment(+user.createdAt / 1000).startOf('month')
			let createdMonth = createdAt.format('MMMM YYYY')
			let createdBeforeStart: boolean = createdAt.isBefore(start)

			let createdMonthFound: boolean = false
			for (let month of months.entries()) {
				if (createdMonthFound || createdBeforeStart) {
					months.set(month[0], month[1] + 1)
				} else if (createdMonth == month[0]) {
					createdMonthFound = true
					months.set(month[0], month[1] + 1)
				}
			}

			// Count the plan
			this.plansChartData[user.plan]++

			// Count the email confirmation
			this.confirmationsChartData[user.confirmed ? 0 : 1]++
		}

		// Show the number of users
		this.userChartDataSets[0].data = []
		this.userChartLabels = []
		for (let month of months.entries()) {
			this.userChartLabels.push(month[0])
			this.userChartDataSets[0].data.push(month[1])
		}
	}

	ProcessUserActivities(userActivities: GetUserActivitiesResponseData) {
		// Save the days in a separate array with timestamps
		let days: { timestamp: number, daily: number, monthly: number, yearly: number }[] = []
		for (let day of userActivities.days) {
			let timestamp = moment(+day.time / 1000).subtract(1, 'day').unix()
			days.push({
				timestamp,
				daily: day.countDaily,
				monthly: day.countMonthly,
				yearly: day.countYearly
			})
		}

		// Sort the days by time
		days.sort((a, b) => {
			if (a.timestamp > b.timestamp) {
				return 1
			} else if (a.timestamp < b.timestamp) {
				return -1
			} else {
				return 0
			}
		})

		// Show the days on the active users line chart
		this.activeUsersChartDataSets[0].data = []
		this.activeUsersChartDataSets[1].data = []
		this.activeUsersChartDataSets[2].data = []

		for (let day of days) {
			this.activeUsersChartDataSets[0].data.push(day.daily)
			this.activeUsersChartDataSets[1].data.push(day.monthly)
			this.activeUsersChartDataSets[2].data.push(day.yearly)
			this.activeUsersChartLabels.push(moment.unix(day.timestamp).format('LL'))
		}

		// Show the currently active users on the bar chart
		if (days.length > 0) {
			this.currentlyActiveUsersDataSets[0].data = [days[days.length - 1].daily, days[days.length - 1].monthly, days[days.length - 1].yearly]
		} else {
			this.currentlyActiveUsersDataSets[0].data = [0, 0, 0]
		}
	}

	GetUsersResponse(response: ApiResponse<GetUsersResponseData> | ApiErrorResponse) {
		if (response.status == 200) {
			this.ProcessUsers((response as ApiResponse<GetUsersResponseData>).data)
		} else {
			// Redirect to the Dev page
			this.router.navigate(['dev'])
		}
	}

	GetActiveUsersResponse(response: ApiResponse<GetUserActivitiesResponseData> | ApiErrorResponse) {
		if (response.status == 200) {
			this.ProcessUserActivities((response as ApiResponse<GetUserActivitiesResponseData>).data)
		} else {
			// Redirect to the Dev page
			this.router.navigate(['dev'])
		}
	}

	GoBack() {
		this.router.navigate(['dev'])
	}
}