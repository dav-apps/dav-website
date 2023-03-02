import "dav-ui-components"
import { Button } from "dav-ui-components"
import "../../components/navbar-component/navbar-component"

let statisticsButton: Button

window.addEventListener("load", main)

async function main() {
	statisticsButton = document.getElementById("statistics-button") as Button

	setEventListeners()
}

function setEventListeners() {
	statisticsButton.addEventListener("click", navigateToStatisticsPage)
}

function navigateToStatisticsPage() {
	window.location.href = "/dev/statistics"
}

window["appCardMouseOver"] = function (appId: number) {
	let appCardElement = document.getElementById(
		`app-card-${appId}`
	) as HTMLDivElement
	if (appCardElement == null) return

	appCardElement.classList.add("shadow")
	appCardElement.classList.remove("shadow-sm")
}

window["appCardMouseOut"] = function (appId: number) {
	let appCardElement = document.getElementById(
		`app-card-${appId}`
	) as HTMLDivElement
	if (appCardElement == null) return

	appCardElement.classList.remove("shadow")
	appCardElement.classList.add("shadow-sm")
}

window["appCardClick"] = function (appId: number) {
	window.location.href = `/dev/${appId}`
}
