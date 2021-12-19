import { Component, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { ChartConfiguration } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts'
import { DateTime } from 'luxon'
import {
	ApiResponse,
	ApiErrorResponse,
	App,
	AppsController,
	AppUserActivitiesController,
	GetAppUserActivitiesResponseData,
	AppUsersController,
	GetAppUsersResponseData
} from 'dav-js'
import { enUS } from 'src/locales/locales'
import { DataService } from 'src/app/services/data-service'

@Component({
	selector: 'dav-website-app-statistics-page',
	templateUrl: './app-statistics-page.component.html'
})
export class AppStatisticsPageComponent {
	locale = enUS.appStatisticsPage
	@ViewChild("userChart") userChart: BaseChartDirective
	@ViewChild("activeUsersChart") activeUsersChart: BaseChartDirective
	app: App = new App(0, "", "", false, null, null, null)
	totalUsersText: string = this.locale.totalUsers.replace('{0}', '0')

	userChartData: ChartConfiguration['data'] = {
		datasets: [{
			data: [],
			label: this.locale.numberOfUsers
		}],
		labels: []
	}
	activeUsersChartData: ChartConfiguration['data'] = {
		datasets: [
			{
				data: [],
				label: this.locale.daily
			},
			{
				data: [],
				label: this.locale.monthly
			},
			{
				data: [],
				label: this.locale.yearly
			}
		],
		labels: []
	}

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().appStatisticsPage

		// Set the labels
		this.userChartData.datasets[0].label = this.locale.numberOfUsers
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

		let appId = +this.activatedRoute.snapshot.paramMap.get('id')

		await this.LoadApp(appId)
		await this.LoadAppUsers(appId)
		await this.LoadActiveAppUsers(appId)
	}

	async LoadApp(appId: number) {
		let response: ApiResponse<App> | ApiErrorResponse = await AppsController.GetApp({ id: appId })

		if (response.status == 200) {
			this.app = (response as ApiResponse<App>).data
		} else {
			// Redirect to the Dev page
			this.router.navigate(['dev'])
		}
	}

	async LoadAppUsers(appId: number) {
		let response: ApiResponse<GetAppUsersResponseData> | ApiErrorResponse = await AppUsersController.GetAppUsers({ id: appId })

		if (response.status == 200) {
			this.ProcessUsers((response as ApiResponse<GetAppUsersResponseData>).data)
		} else {
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id])
		}
	}

	async LoadActiveAppUsers(appId: number) {
		let response: ApiResponse<GetAppUserActivitiesResponseData> | ApiErrorResponse = await AppUserActivitiesController.GetAppUserActivities({ id: appId })

		if (response.status == 200) {
			this.ProcessActiveUsers((response as ApiResponse<GetAppUserActivitiesResponseData>).data)
		} else {
			// Redirect to the App page
			this.router.navigate(['dev', this.app.Id])
		}
	}

	ProcessUsers(appUsersResponseData: GetAppUsersResponseData) {
		// Set the total users
		this.totalUsersText = this.locale.totalUsers.replace('{0}', appUsersResponseData.appUsers.length.toString())

		let currentDate = DateTime.now().startOf("month").minus({ months: 5 }).setLocale(this.dataService.locale)
		let start = currentDate
		let months: Map<string, number> = new Map()

		// Get the last 6 months
		for (let i = 0; i < 6; i++) {
			months.set(currentDate.toFormat('MMMM yyyy'), 0)
			currentDate = currentDate.plus({ months: 1 })
		}

		for (let appUser of appUsersResponseData.appUsers) {
			// Add the cumulative user count
			let startedUsing = DateTime.fromJSDate(appUser.createdAt).startOf('month').setLocale(this.dataService.locale)
			let startedUsingMonth = startedUsing.toFormat('MMMM yyyy')
			let startedUsingBeforeStart: boolean = start > startedUsing

			let startedUsingMonthFound: boolean = false
			for (let month of months.entries()) {
				if (startedUsingMonthFound || startedUsingBeforeStart) {
					months.set(month[0], month[1] + 1)
				} else if (startedUsingMonth == month[0]) {
					startedUsingMonthFound = true
					months.set(month[0], month[1] + 1)
				}
			}
		}

		this.userChartData.datasets[0].data = []
		this.userChartData.labels = []

		for (let month of months.entries()) {
			this.userChartData.labels.push(month[0])
			this.userChartData.datasets[0].data.push(month[1])
		}

		this.userChart.update()
	}

	ProcessActiveUsers(activeUsers: GetAppUserActivitiesResponseData) {
		// Save the days in a separate array with timestamps
		let days: { date: DateTime, daily: number, monthly: number, yearly: number }[] = []

		for (let day of activeUsers.days) {
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

	GoBack() {
		this.router.navigate(['dev', this.app.Id])
	}
}