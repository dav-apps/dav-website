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
import 'dav-ui-components'
import { Header } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'

let locale = getLocale().statisticsPage
let header: Header
let userChartCanvas: HTMLCanvasElement
let totalUsersText: HTMLParagraphElement
let plansChartCanvas: HTMLCanvasElement
let confirmationsChartCanvas: HTMLCanvasElement
let activeUsersChartCanvas: HTMLCanvasElement

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
let plansChart: Chart
let confirmationsChart: Chart
let activeUsersChart: Chart

window.addEventListener("load", main)

async function main() {
	header = document.getElementById("header") as Header
	userChartCanvas = document.getElementById("user-chart") as HTMLCanvasElement
	totalUsersText = document.getElementById("total-users-text") as HTMLParagraphElement
	plansChartCanvas = document.getElementById("plans-chart") as HTMLCanvasElement
	confirmationsChartCanvas = document.getElementById("confirmations-chart") as HTMLCanvasElement
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

	setEventListeners()

	let csrfToken = document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")

	try {
		let getUsersResponse = await axios({
			method: 'get',
			url: '/api/users',
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		processUsers(getUsersResponse.data)
	} catch (error) {
		// Redirect to the Dev page
		navigateBack()
		return
	}

	try {
		let getUserActivitiesResponse = await axios({
			method: 'get',
			url: '/api/user_activities',
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		processUserActivities(getUserActivitiesResponse.data)
	} catch (error) {
		// Redirect to the Dev page
		navigateBack()
		return
	}
}

function setEventListeners() {
	header.addEventListener("backButtonClick", navigateBack)
}

function navigateBack() {
	// Redirect to the Dev page
	window.location.href = "/dev"
}

function processUsers(
	userResponseData: {
		users: {
			id: number,
			confirmed: boolean,
			plan: number,
			lastActive: string,
			createdAt: string,
		}[]
	}
) {
	totalUsersText.innerText = locale.totalUsers.replace('{0}', userResponseData.users.length.toString())

	let currentDate = DateTime.now().startOf("month").minus({ months: 5 }).setLocale(navigator.language)
	let start = currentDate
	let months: Map<string, number> = new Map()
	plansChart.data.datasets[0].data = [0, 0, 0]
	confirmationsChart.data.datasets[0].data = [0, 0]

	// Get the last 6 months
	for (let i = 0; i < 6; i++) {
		months.set(currentDate.toFormat("MMMM yyyy"), 0)
		currentDate = currentDate.plus({ months: 1 })
	}

	for (let user of userResponseData.users) {
		// Add the cumulative user count
		let createdAt = DateTime.fromJSDate(new Date(user.createdAt)).startOf("month").setLocale(navigator.language)
		let createdMonth = createdAt.toFormat("MMMM yyyy")
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
		(plansChart.data.datasets[0].data[user.plan] as number)++

		// Count the email confirmation
		(confirmationsChart.data.datasets[0].data[user.confirmed ? 0 : 1] as number)++
	}

	// Show the number of users
	userChart.data.labels = []
	userChart.data.datasets[0].data = []

	for (let month of months.entries()) {
		userChart.data.labels.push(month[0])
		userChart.data.datasets[0].data.push(month[1])
	}

	plansChart.update()
	confirmationsChart.update()
	userChart.update()
}

function processUserActivities(
	userActivities: {
		days: {
			time: string,
			countDaily: number,
			countWeekly: number,
			countMonthly: number,
			countYearly: number
		}[]
	}
) {
	// Save the days in a separate array with timestamps
	let days: { date: DateTime, daily: number, weekly: number, monthly: number, yearly: number }[] = []

	for (let day of userActivities.days) {
		days.push({
			date: DateTime.fromJSDate(new Date(day.time)).setLocale(navigator.language).minus({ days: 1 }),
			daily: day.countDaily,
			weekly: day.countWeekly,
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
	activeUsersChart.data.datasets[3].data = []

	for (let day of days) {
		activeUsersChart.data.datasets[0].data.push(day.daily)
		activeUsersChart.data.datasets[1].data.push(day.weekly)
		activeUsersChart.data.datasets[2].data.push(day.monthly)
		activeUsersChart.data.datasets[3].data.push(day.yearly)
		activeUsersChart.data.labels.push(day.date.toFormat("DD"))
	}

	activeUsersChart.update()
}