import "../../components/navbar-component/navbar-component"
import "../../components/footer-component/footer-component"
import { showElement, hideElement } from "../../utils"

let plansTableContainer: HTMLDivElement
let plansTable: HTMLTableElement
let plansTableMobileContainer: HTMLDivElement
let plansTableMobileFree: HTMLTableElement
let plansTableMobilePlus: HTMLTableElement
let plansTableMobilePro: HTMLTableElement

window.addEventListener("resize", setSize)
window.addEventListener("load", main)

function main() {
	plansTableContainer = document.getElementById(
		"plans-table-container"
	) as HTMLDivElement
	plansTable = document.getElementById("plans-table") as HTMLTableElement
	plansTableMobileContainer = document.getElementById(
		"plans-table-mobile-container"
	) as HTMLDivElement
	plansTableMobileFree = document.getElementById(
		"plans-table-mobile-free"
	) as HTMLTableElement
	plansTableMobilePlus = document.getElementById(
		"plans-table-mobile-plus"
	) as HTMLTableElement
	plansTableMobilePro = document.getElementById(
		"plans-table-mobile-pro"
	) as HTMLTableElement

	setSize()
}

function setSize() {
	let width = window.innerWidth
	let fontSize = width < 1000 ? `${1.05}rem` : `${1.15}rem`
	plansTable.style.fontSize = fontSize
	plansTableMobileFree.style.fontSize = fontSize
	plansTableMobilePlus.style.fontSize = fontSize
	plansTableMobilePro.style.fontSize = fontSize

	if (width < 768) {
		showElement(plansTableMobileContainer)
		hideElement(plansTableContainer)
	} else {
		hideElement(plansTableMobileContainer)
		showElement(plansTableContainer)
	}
}
