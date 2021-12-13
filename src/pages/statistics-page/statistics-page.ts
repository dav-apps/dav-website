import {
	Chart,
	LineController,
	PieController,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement
} from 'chart.js'
import { DateTime } from 'luxon'
import {
	ApiResponse,
	Dav,
	GetUsersResponseData,
	GetUserActivitiesResponseData,
	UsersController,
	UserActivitiesController
} from 'dav-js'
import 'dav-ui-components'
import { Header } from 'dav-ui-components'
import { getLocale } from '../../locales'
import { initDav, userLoadedPromiseHolder } from '../../utils'

let locale = getLocale().statisticsPage
let header = document.getElementById("header") as Header
let userChartCanvas = document.getElementById("user-chart") as HTMLCanvasElement
let totalUsersText = document.getElementById("total-users-text") as HTMLParagraphElement
let plansHeader = document.getElementById("plans-header") as HTMLHeadingElement
let plansChartCanvas = document.getElementById("plans-chart") as HTMLCanvasElement
let confirmationsHeader = document.getElementById("confirmations-header") as HTMLHeadingElement
let confirmationsChartCanvas = document.getElementById("confirmations-chart") as HTMLCanvasElement
let activeUsersHeader = document.getElementById("active-users-header") as HTMLHeadingElement
let activeUsersChartCanvas = document.getElementById("active-users-chart") as HTMLCanvasElement

Chart.register(
	LineController,
	PieController,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	ArcElement
)

let userChart = new Chart(userChartCanvas, {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			label: locale.numberOfUsers,
			data: [],
			borderColor: 'rgb(255, 99, 132)'
		}]
	}
})

let plansChart = new Chart(plansChartCanvas, {
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

let confirmationsChart = new Chart(confirmationsChartCanvas, {
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

let activeUsersChart = new Chart(activeUsersChartCanvas, {
	type: 'line',
	data: {
		labels: [],
		datasets: [
			{ label: locale.daily, data: [], borderColor: 'rgb(255, 99, 132)' },
			{ label: locale.monthly, data: [], borderColor: 'rgb(54, 162, 235)' },
			{ label: locale.yearly, data: [], borderColor: 'rgb(255, 205, 86)' }
		]
	}
})

async function main() {
	initDav()
	await userLoadedPromiseHolder.AwaitResult()

	if (!Dav.isLoggedIn || !Dav.user.Dev) {
		window.location.href = "/"
		return
	}

	let getUsersResponse = await UsersController.GetUsers()

	if (getUsersResponse.status == 200) {
		processUsers((getUsersResponse as ApiResponse<GetUsersResponseData>).data)
	} else {
		// Redirect to the Dev page
		navigateBack()
		return
	}

	let start = DateTime.now().startOf("day").minus({ months: 6 }).toSeconds()
	let getUserActivitiesResponse = await UserActivitiesController.GetUserActivities({ start })

	if (getUserActivitiesResponse.status == 200) {
		processUserActivities((getUserActivitiesResponse as ApiResponse<GetUserActivitiesResponseData>).data)
	} else {
		// Redirect to the Dev page
		navigateBack()
		return
	}
}

function setEventListeners() {
	header.addEventListener("backButtonClick", navigateBack)
}

function setStrings(){
	header.header = locale.title
	plansHeader.innerText = locale.plans
	confirmationsHeader.innerText = locale.confirmations
	activeUsersHeader.innerText = locale.activeUsers
}

function navigateBack() {
	// Redirect to the Dev page
	window.location.href = "/dev"
}

function processUsers(userResponseData: GetUsersResponseData) {
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
		let createdAt = DateTime.fromJSDate(user.createdAt).startOf("month")
		let createdMonth = createdAt.toFormat("MMMM yyyy")
		let createdBeforeStart = createdAt > start
		
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
		plansChart.data.datasets[0].data[user.plan]++

		// Count the email confirmation
		confirmationsChart.data.datasets[0].data[user.confirmed ? 0 : 1]++
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

function processUserActivities(userActivities: GetUserActivitiesResponseData) {
	// Save the days in a separate array with timestamps
	let days: { date: DateTime, daily: number, monthly: number, yearly: number }[] = []

	for (let day of userActivities.days) {
		//let timestamp = DateTime.fromJSDate(day.time).minus({ days: 1 }).toMillis()

		days.push({
			date: DateTime.fromJSDate(day.time).minus({ days: 1 }),
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

setEventListeners()
setStrings()
main()