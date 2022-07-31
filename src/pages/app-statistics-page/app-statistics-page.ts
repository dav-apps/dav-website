import {
	Chart,
	LineController,
	PieController,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
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

let locale = getLocale(navigator.language).statisticsPage
let header: Header
let userChartCanvas: HTMLCanvasElement
let activeUsersChartCanvas: HTMLCanvasElement
let plansChartCanvas: HTMLCanvasElement
let confirmationsChartCanvas: HTMLCanvasElement

Chart.register(
	LineController,
	PieController,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement,
	Legend,
	Tooltip
)

let userChart: Chart
let activeUsersChart: Chart
let plansChart: Chart
let confirmationsChart: Chart

let app: App

window.addEventListener("load", main)

async function main() {
	header = document.getElementById("header") as Header
	userChartCanvas = document.getElementById("user-chart") as HTMLCanvasElement
	activeUsersChartCanvas = document.getElementById("active-users-chart") as HTMLCanvasElement
	plansChartCanvas = document.getElementById("plans-chart") as HTMLCanvasElement
	confirmationsChartCanvas = document.getElementById("confirmations-chart") as HTMLCanvasElement

	userChart = new Chart(userChartCanvas, {
		type: 'line',
		data: {
			labels: [],
			datasets: [
				{
					label: locale.numberOfUsers,
					data: [],
					borderColor: 'rgb(255, 99, 132)',
					backgroundColor: 'rgb(255, 99, 132)'
				},
				{
					label: "Free",
					data: [],
					borderColor: 'rgb(54, 162, 235)',
					backgroundColor: 'rgb(54, 162, 235)'
				},
				{
					label: "Plus",
					data: [],
					borderColor: 'rgb(255, 205, 86)',
					backgroundColor: 'rgb(255, 205, 86)'
				},
				{
					label: "Pro",
					data: [],
					borderColor: 'rgb(111, 205, 205)',
					backgroundColor: 'rgb(111, 205, 205)'
				}
			]
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

	plansChart = new Chart(plansChartCanvas, {
		type: 'pie',
		data: {
			labels: ["Free", "Plus", "Pro"],
			datasets: [{
				data: [0, 0, 0],
				backgroundColor: [
					'rgb(255, 99, 132)',
					'rgb(54, 162, 235)',
					'rgb(255, 205, 86)'
				]
			}]
		}
	})

	confirmationsChart = new Chart(confirmationsChartCanvas, {
		type: 'pie',
		data: {
			labels: [locale.confirmed, locale.unconfirmed],
			datasets: [{
				data: [0, 0],
				backgroundColor: [
					'rgb(255, 99, 132)',
					'rgb(54, 162, 235)'
				]
			}]
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

	header.header = locale.appTitle.replace('{0}', app.Name)
	setEventListeners()

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

function processUserSnapshots(
	userSnapshots: {
		snapshots: AppUserSnapshot[]
	}
) {
	// Save the days in a separate array with timestamps
	let snapshots: {
		date: DateTime,
		daily: number,
		weekly: number,
		monthly: number,
		yearly: number,
		free: number,
		plus: number,
		pro: number,
		confirmed: number,
		unconfirmed: number
	}[] = []

	for (let snapshot of userSnapshots.snapshots) {
		snapshots.push({
			date: DateTime.fromJSDate(new Date(snapshot.time)).setLocale(navigator.language).minus({ days: 1 }),
			daily: snapshot.dailyActive,
			weekly: snapshot.weeklyActive,
			monthly: snapshot.monthlyActive,
			yearly: snapshot.yearlyActive,
			free: snapshot.freePlan,
			plus: snapshot.plusPlan,
			pro: snapshot.proPlan,
			confirmed: snapshot.emailConfirmed,
			unconfirmed: snapshot.emailUnconfirmed
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

	// Show the number of users on the users line chart
	userChart.data.datasets[0].data = []
	userChart.data.datasets[1].data = []
	userChart.data.datasets[2].data = []
	userChart.data.datasets[3].data = []

	for (let snapshot of snapshots) {
		userChart.data.datasets[0].data.push(snapshot.free + snapshot.plus + snapshot.pro)
		userChart.data.datasets[1].data.push(snapshot.free)
		userChart.data.datasets[2].data.push(snapshot.plus)
		userChart.data.datasets[3].data.push(snapshot.pro)
		userChart.data.labels?.push(snapshot.date.toFormat("DD"))
	}

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

	if (snapshots.length > 0) {
		// Show the distribution of plans on the pie chart
		plansChart.data.datasets[0].data[0] = snapshots[snapshots.length - 1].free
		plansChart.data.datasets[0].data[1] = snapshots[snapshots.length - 1].plus
		plansChart.data.datasets[0].data[2] = snapshots[snapshots.length - 1].pro

		// Show the distribution of confirmed users on the pie chart
		confirmationsChart.data.datasets[0].data[0] = snapshots[snapshots.length - 1].confirmed
		confirmationsChart.data.datasets[0].data[1] = snapshots[snapshots.length - 1].unconfirmed
	}

	userChart.update()
	activeUsersChart.update()
	plansChart.update()
	confirmationsChart.update()
}