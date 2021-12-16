import {
	App,
	ApiResponse,
	ApiErrorResponse,
	GetDevResponseData,
	DevsController
} from 'dav-js'
import 'dav-ui-components'
import { Button, MessageBar } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import { getDataService, showElement } from '../../utils'

let locale = getLocale().devPage
let dataService = getDataService()
let errorMessageBar = document.getElementById("error-message-bar") as MessageBar
let appsContainer = document.getElementById("apps-container") as HTMLDivElement
let statisticsButton = document.getElementById("statistics-button") as Button

window.addEventListener("load", main)

async function main() {
	setEventListeners()
	await dataService.userLoadedPromiseHolder.AwaitResult()

	if (!dataService.dav.isLoggedIn || !dataService.dav.user.Dev) {
		window.location.href = "/"
		return
	}

	// Get the dev
	let response = await DevsController.GetDev()

	if (response.status == 200) {
		let apps: App[] = (response as ApiResponse<GetDevResponseData>).data.apps

		for (let app of apps) {
			let appCardElement = document.createElement("div") as HTMLDivElement
			appCardElement.id = `app-card-${app.Id}`
			appCardElement.classList.add("card", "app-card", "text-center", "m-3", "cursor", "shadow-sm")
			appCardElement.addEventListener("mouseover", () => appCardMouseOver(app))
			appCardElement.addEventListener("mouseout", () => appCardMouseOut(app))
			appCardElement.addEventListener("click", () => appCardClick(app))

			let appCardBodyElement = document.createElement("div") as HTMLDivElement
			appCardBodyElement.classList.add("card-body")

			let appCardBodyTextElement = document.createElement("p") as HTMLParagraphElement
			appCardBodyTextElement.classList.add("card-text")
			appCardBodyTextElement.innerText = app.Name

			appCardBodyElement.appendChild(appCardBodyTextElement)
			appCardElement.appendChild(appCardBodyElement)
			appsContainer.appendChild(appCardElement)
		}
	} else {
		errorMessageBar.innerText = locale.unexpectedErrorShort.replace('{0}', (response as ApiErrorResponse).errors[0].code.toString())
		showElement(errorMessageBar)
	}
}

function setEventListeners() {
	statisticsButton.addEventListener("click", navigateToStatisticsPage)
}

function appCardMouseOver(app: App) {
	let appCardElement = document.getElementById(`app-card-${app.Id}`) as HTMLDivElement
	if (appCardElement == null) return

	appCardElement.classList.add("shadow")
	appCardElement.classList.remove("shadow-sm")
}

function appCardMouseOut(app: App) {
	let appCardElement = document.getElementById(`app-card-${app.Id}`) as HTMLDivElement
	if (appCardElement == null) return

	appCardElement.classList.remove("shadow")
	appCardElement.classList.add("shadow-sm")
}

function appCardClick(app: App) {
	window.location.href = `/dev/${app.Id}`
}

function navigateToStatisticsPage() {
	window.location.href = "/dev/statistics"
}