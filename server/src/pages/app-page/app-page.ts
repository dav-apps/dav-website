import { Dav, ApiResponse, ApiErrorResponse, AppsController, App } from 'dav-js'
import 'dav-ui-components'
import { Button } from 'dav-ui-components/src/button/button'
import { Header } from 'dav-ui-components/src/header/header'
import { Toggle } from 'dav-ui-components/src/toggle/toggle'
import { initDav, userLoadedPromiseHolder, getLocale } from '../../utils'

let locale = getLocale().appPage
let header = document.getElementById("header") as Header
let description = document.getElementById("description") as HTMLParagraphElement
let statisticsButton = document.getElementById("statistics-button") as Button
let editButton = document.getElementById("edit-button") as Button
let publishedHeader = document.getElementById("published-header") as HTMLHeadingElement
let publishedToggle = document.getElementById("published-toggle") as Toggle
let tablesHeader = document.getElementById("tables-header") as HTMLHeadingElement
let tablesList = document.getElementById("tables-list") as HTMLUListElement
let apisHeader = document.getElementById("apis-header") as HTMLHeadingElement
let apisList = document.getElementById("apis-list") as HTMLUListElement

let app: App

async function main() {
	initDav()
	await userLoadedPromiseHolder.AwaitResult()

	if (!Dav.isLoggedIn || !Dav.user.Dev) {
		window.location.href = "/"
		return
	}

	// Get the app id
	let urlPathParts = window.location.pathname.split('/')
	let appId = +urlPathParts[urlPathParts.length - 1]

	// Get the app
	let response: ApiResponse<App> | ApiErrorResponse = await AppsController.GetApp({ id: appId })

	if (response.status == 200) {
		app = (response as ApiResponse<App>).data
	} else {
		// Redirect to the Dev page
		window.location.href = "/dev"
		return
	}

	header.header = app.Name
	description.innerText = app.Description
	publishedToggle.checked = app.Published

	for (let table of app.Tables) {
		let liElement = document.createElement("li") as HTMLLIElement
		liElement.classList.add("list-group-item", "text-center")
		liElement.innerText = table.Name
		tablesList.appendChild(liElement)
	}

	for (let api of app.Apis) {
		let liElement = document.createElement("li") as HTMLLIElement
		liElement.classList.add("list-group-item", "text-center")
		liElement.innerText = api.Name
		apisList.appendChild(liElement)
	}
}

function setEventListeners() {
	header.addEventListener("backButtonClick", goBack)
	
}

function setStrings() {
	statisticsButton.innerText = locale.statistics
	editButton.innerText = locale.edit
	publishedHeader.innerText = locale.published
	tablesHeader.innerText = locale.tables
	apisHeader.innerText = locale.apis
}

function goBack() {
	// Redirect to the Dev page
	window.location.href = "/dev"
}

setStrings()
setEventListeners()
main()