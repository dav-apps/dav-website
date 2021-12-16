import {
	Chart,
	LineController,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend,
	Tooltip
} from 'chart.js'
import { DateTime } from 'luxon'
import {
	ApiResponse,
	AppsController,
	App,
	AppUsersController,
	GetAppUsersResponseData,
	GetAppUserActivitiesResponseData,
	AppUserActivitiesController
} from 'dav-js'
import 'dav-ui-components'
import { Header } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import { getDataService } from '../../utils'

let locale = getLocale().appStatisticsPage
let dataService = getDataService()
let header: Header
let userChartCanvas: HTMLCanvasElement
let totalUsersText: HTMLParagraphElement
let activeUsersChartCanvas: HTMLCanvasElement

Chart.register(
	LineController,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Legend,
	Tooltip
)

let userChart: Chart
let activeUsersChart: Chart

let app: App

window.addEventListener("load", main)

async function main() {
	header = document.getElementById("header") as Header
	userChartCanvas = document.getElementById("user-chart") as HTMLCanvasElement
	totalUsersText = document.getElementById("total-users-text") as HTMLParagraphElement
	activeUsersChartCanvas = document.getElementById("active-users-chart") as HTMLCanvasElement

	userChart = new Chart(userChartCanvas, {
		type: 'line',
		data: {
			labels: [],
			datasets: [{
				label: locale.numberOfUsers,
				data: [],
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgb(255, 99, 132)'
			}]
		}
	})

	activeUsersChart = new Chart(activeUsersChartCanvas, {
		type: 'line',
		data: {
			labels: [],
			datasets: [
				{ label: locale.daily, data: [], borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgb(255, 99, 132)' },
				{ label: locale.monthly, data: [], borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgb(54, 162, 235)' },
				{ label: locale.yearly, data: [], borderColor: 'rgb(255, 205, 86)', backgroundColor: 'rgb(255, 205, 86)' }
			]
		}
	})

	await dataService.userLoadedPromiseHolder.AwaitResult()

	if (!dataService.dav.isLoggedIn || !dataService.dav.user.Dev) {
		window.location.href = "/"
		return
	}

	// Get the app id
	let urlPathParts = window.location.pathname.split('/')
	let appId = +urlPathParts[2]

	// Get the app
	let getAppResponse = await AppsController.GetApp({ id: appId })

	if (getAppResponse.status == 200) {
		app = (getAppResponse as ApiResponse<App>).data
	} else {
		// Redirect to the Dev page
		window.location.href = "/dev"
		return
	}

	header.header = locale.title.replace('{0}', app.Name)
	setEventListeners()

	let getAppUsersResponse = await AppUsersController.GetAppUsers({ id: appId })

	if (getAppUsersResponse.status == 200) {
		processUsers((getAppUsersResponse as ApiResponse<GetAppUsersResponseData>).data)
	} else {
		// Redirect to the app page
		window.location.href = `/dev/${appId}`
		return
	}

	let getAppUserActivitiesResponse = await AppUserActivitiesController.GetAppUserActivities({ id: appId })

	if (getAppUserActivitiesResponse.status == 200) {
		processUserActivities((getAppUserActivitiesResponse as ApiResponse<GetAppUserActivitiesResponseData>).data)
	} else {
		// Redirect to the app page
		window.location.href = `/dev/${appId}`
		return
	}
}

function setEventListeners() {
	header.addEventListener("backButtonClick", navigateBack)
}

function navigateBack() {
	// Redirect to the Dev page
	window.location.href = `/dev/${app.Id}`
}

function processUsers(appUsersResponseData: GetAppUsersResponseData) {
	totalUsersText.innerText = locale.totalUsers.replace('{0}', appUsersResponseData.appUsers.length.toString())

	let currentDate = DateTime.now().startOf("month").minus({ months: 5 }).setLocale(navigator.language)
	let start = currentDate
	let months: Map<string, number> = new Map()

	// Get the last 6 months
	for (let i = 0; i < 6; i++) {
		months.set(currentDate.toFormat("MMMM yyyy"), 0)
		currentDate = currentDate.plus({ months: 1 })
	}

	for (let appUser of appUsersResponseData.appUsers) {
		// Add the cumulative user count
		let startedUsing = DateTime.fromJSDate(appUser.createdAt).startOf('month').setLocale(navigator.language)
		let startedUsingMonth = startedUsing.toFormat("MMMM yyyy")
		let startedUsingBeforeStart = start > startedUsing

		let startedUsingMonthFound = false
		for (let month of months.entries()) {
			if (startedUsingMonthFound || startedUsingBeforeStart) {
				months.set(month[0], month[1] + 1)
			} else if (startedUsingMonth == month[0]) {
				startedUsingMonthFound = true
				months.set(month[0], month[1] + 1)
			}
		}
	}

	userChart.data.labels = []
	userChart.data.datasets[0].data = []

	for (let month of months.entries()) {
		userChart.data.labels.push(month[0])
		userChart.data.datasets[0].data.push(month[1])
	}

	userChart.update()
}

function processUserActivities(userActivities: GetAppUserActivitiesResponseData) {
	// Save the days in a separate array with timestamps
	let days: { date: DateTime, daily: number, monthly: number, yearly: number }[] = []

	for (let day of userActivities.days) {
		days.push({
			date: DateTime.fromJSDate(day.time).setLocale(navigator.language).minus({ days: 1 }),
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
	activeUsersChart.data.datasets[0].data = []
	activeUsersChart.data.datasets[1].data = []
	activeUsersChart.data.datasets[2].data = []

	for (let day of days) {
		activeUsersChart.data.datasets[0].data.push(day.daily)
		activeUsersChart.data.datasets[1].data.push(day.monthly)
		activeUsersChart.data.datasets[2].data.push(day.yearly)
		activeUsersChart.data.labels.push(day.date.toFormat("DD"))
	}

	activeUsersChart.update()
}