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
import axios from 'axios'
import { DateTime } from 'luxon'
import { App, AppUserSnapshot } from 'dav-js'
import 'dav-ui-components'
import { Header } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'

let locale = getLocale(navigator.language).appStatisticsPage
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
				{ label: locale.weekly, data: [], borderColor: 'rgb(54, 162, 235)', backgroundColor: 'rgb(54, 162, 235)' },
				{ label: locale.monthly, data: [], borderColor: 'rgb(255, 205, 86)', backgroundColor: 'rgb(255, 205, 86)' },
				{ label: locale.yearly, data: [], borderColor: 'rgb(111, 205, 205)', backgroundColor: 'rgb(111, 205, 205)', hidden: true }
			]
		}
	})

	// Get the app id
	let urlPathParts = window.location.pathname.split('/')
	let appId = +urlPathParts[2]
   let csrfToken = document.querySelector(`meta[name="csrf-token"]`)?.getAttribute("content")
   if (csrfToken == null) return

	// Get the app
	try {
		let getAppResponse = await axios({
			method: 'get',
			url: `/api/app/${appId}`,
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		app = getAppResponse.data
	} catch (error) {
		// Redirect to the Dev page
		window.location.href = "/dev"
		return
	}

	header.header = locale.title.replace('{0}', app.Name)
	setEventListeners()

	try {
		let getAppUsersResponse = await axios({
			method: 'get',
			url: `/api/app/${appId}/users`,
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		processUsers(getAppUsersResponse.data)
	} catch (error) {
		// Redirect to the app page
		window.location.href = `/dev/${appId}`
		return
	}

	try {
		let getAppUserSnapshotsResponse = await axios({
			method: 'get',
			url: `/api/app/${appId}/user_snapshots`,
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		processUserSnapshots(getAppUserSnapshotsResponse.data)
	} catch (error) {
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

function processUsers(
	appUsersResponseData: {
		appUsers: {
			userId: number,
			createdAt: string
		}[]
	}
) {
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
		let startedUsing = DateTime.fromJSDate(new Date(appUser.createdAt)).startOf('month').setLocale(navigator.language)
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

function processUserSnapshots(
	userSnapshots: {
		snapshots: AppUserSnapshot[]
	}
) {
	// Save the days in a separate array with timestamps
	let snapshots: { date: DateTime, daily: number, weekly: number, monthly: number, yearly: number }[] = []

	for (let snapshot of userSnapshots.snapshots) {
		snapshots.push({
			date: DateTime.fromJSDate(new Date(snapshot.time)).setLocale(navigator.language).minus({ days: 1 }),
			daily: snapshot.dailyActive,
			weekly: snapshot.weeklyActive,
			monthly: snapshot.monthlyActive,
			yearly: snapshot.yearlyActive
		})
	}

	// Sort the days by time
	snapshots.sort((a, b) => {
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
	activeUsersChart.data.datasets[3].data = []

	for (let snapshot of snapshots) {
		activeUsersChart.data.datasets[0].data.push(snapshot.daily)
		activeUsersChart.data.datasets[1].data.push(snapshot.weekly)
      activeUsersChart.data.datasets[2].data.push(snapshot.monthly)
		activeUsersChart.data.datasets[3].data.push(snapshot.yearly)
		activeUsersChart.data.labels?.push(snapshot.date.toFormat("DD"))
	}

	activeUsersChart.update()
}