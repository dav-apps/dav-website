import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { ChartConfiguration } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts'
import { DateTime } from 'luxon'
import {
	ApiResponse,
	ApiErrorResponse,
	UsersController,
	UserActivitiesController,
	GetUsersResponseData,
	GetUserActivitiesResponseData
} from 'dav-js'
import { enUS } from 'src/locales/locales'
import { DataService } from 'src/app/services/data-service'

@Component({
	selector: 'dav-website-statistics-page',
	templateUrl: './statistics-page.component.html'
})
export class StatisticsPageComponent {
	locale = enUS.statisticsPage
	@ViewChild("userChart") userChart: BaseChartDirective
	@ViewChild("plansChart") plansChart: BaseChartDirective
	@ViewChild("confirmationsChart") confirmationsChart: BaseChartDirective
	@ViewChild("activeUsersChart") activeUsersChart: BaseChartDirective
	totalUsersText: string = this.locale.totalUsers.replace('{0}', '0')

	userChartData: ChartConfiguration['data'] = {
		datasets: [{
			data: [],
			label: this.locale.numberOfUsers,
			fill: "origin"
		}],
		labels: []
	}
	plansChartData: ChartConfiguration['data'] = {
		datasets: [{
			data: [0, 0, 0]
		}],
		labels: ["Free", "Plus", "Pro"]
	}
	confirmationsChartData: ChartConfiguration['data'] = {
		datasets: [{
			data: [0, 0]
		}],
		labels: [this.locale.confirmed, this.locale.unconfirmed]
	}
	activeUsersChartData: ChartConfiguration['data'] = {
		datasets: [
			{
				data: [],
				label: this.locale.daily,
				fill: "origin"
			},
			{
				data: [],
				label: this.locale.monthly,
				fill: "origin"
			},
			{
				data: [],
				label: this.locale.yearly,
				fill: "origin"
			}
		],
		labels: []
	}

	constructor(
		public dataService: DataService,
		private router: Router
	) {
		this.locale = this.dataService.GetLocale().statisticsPage
		this.dataService.showNavbar = true
		this.dataService.showFooter = false

		// Set the labels
		this.userChartData.datasets[0].label = this.locale.numberOfUsers
		this.confirmationsChartData.labels[0] = this.locale.confirmed
		this.confirmationsChartData.labels[1] = this.locale.unconfirmed
		this.activeUsersChartData.datasets[0].label = this.locale.daily
		this.activeUsersChartData.datasets[1].label = this.locale.monthly
		this.activeUsersChartData.datasets[2].label = this.locale.yearly
	}

	async ngOnInit() {
		await this.dataService.userPromise
		if (!this.dataService.dav.isLoggedIn) {
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage
			this.router.navigate(['/'])
			return
		} else if (!this.dataService.dav.user.Dev) {
			this.dataService.startPageErrorMessage = this.locale.accessNotAllowedMessage
			this.router.navigate(['/'])
			return
		}

		this.GetUsersResponse(
			await UsersController.GetUsers()
		)

		let start = DateTime.now().startOf('day').minus({ months: 6 }).toSeconds()
		this.GetActiveUsersResponse(
			await UserActivitiesController.GetUserActivities({ start })
		)
	}

	ProcessUsers(userResponseData: GetUsersResponseData) {
		// Set the total users
		this.totalUsersText = this.locale.totalUsers.replace('{0}', userResponseData.users.length.toString())

		let currentDate = DateTime.now().startOf('month').minus({ months: 5 }).setLocale(this.dataService.locale)
		let start = currentDate
		let months: Map<string, number> = new Map()
		this.plansChartData.datasets[0].data = [0, 0, 0]
		this.confirmationsChartData.datasets[0].data = [0, 0]

		// Get the last 6 months
		for (let i = 0; i < 6; i++) {
			months.set(currentDate.toFormat('MMMM yyyy'), 0)
			currentDate = currentDate.plus({ months: 1 })
		}

		for (let user of userResponseData.users) {
			// Add the cumulative user counts
			let createdAt = DateTime.fromJSDate(user.createdAt).startOf("month").setLocale(this.dataService.locale)
			let createdMonth = createdAt.toFormat('MMMM yyyy')
			let createdBeforeStart = start > createdAt

			let createdMonthFound = false
			for (let month of months.entries()) {
				if (createdMonthFound || createdBeforeStart) {
					months.set(month[0], month[1] + 1)
				} else if (createdMonth == month[0]) {
					createdMonthFound = true
					months.set(month[0], month[1] + 1)
				}
			}

			// Count the plan
			(this.plansChartData.datasets[0].data[user.plan] as number)++

			// Count the email confirmation
			(this.confirmationsChartData.datasets[0].data[user.confirmed ? 0 : 1] as number)++
		}

		// Show the number of users
		this.userChartData.datasets[0].data = []
		this.userChartData.labels = []

		for (let month of months.entries()) {
			this.userChartData.labels.push(month[0])
			this.userChartData.datasets[0].data.push(month[1])
		}

		this.userChart.update()
		this.plansChart.update()
		this.confirmationsChart.update()
	}

	ProcessUserActivities(userActivities: GetUserActivitiesResponseData) {
		// Save the days in a separate array with timestamps
		let days: { date: DateTime, daily: number, monthly: number, yearly: number }[] = []

		for (let day of userActivities.days) {
			days.push({
				date: DateTime.fromJSDate(day.time).setLocale(this.dataService.locale).minus({ days: 1 }),
				daily: day.countDaily,
				monthly: day.countMonthly,
				yearly: day.countYearly
			})
		}

		// Sort the days by time
		days.sort((a, b) => {
			if (a.date > b.date) {
				return 1
			} else if (a.date < b.date) {
				return -1
			} else {
				return 0
			}
		})

		// Show the days on the active users line chart
		this.activeUsersChartData.datasets[0].data = []
		this.activeUsersChartData.datasets[1].data = []
		this.activeUsersChartData.datasets[2].data = []

		for (let day of days) {
			this.activeUsersChartData.datasets[0].data.push(day.daily)
			this.activeUsersChartData.datasets[1].data.push(day.monthly)
			this.activeUsersChartData.datasets[2].data.push(day.yearly)
			this.activeUsersChartData.labels.push(day.date.toFormat("DDD"))
		}

		this.activeUsersChart.update()
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