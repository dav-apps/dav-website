import 'bootstrap'
import { showElement, hideElement } from '../../utils'

let plansTableContainer = document.getElementById("plans-table-container") as HTMLDivElement
let plansTable = document.getElementById("plans-table") as HTMLTableElement
let plansTableMobileContainer = document.getElementById("plans-table-mobile-container") as HTMLDivElement
let plansTableMobileFree = document.getElementById("plans-table-mobile-free") as HTMLTableElement
let plansTableMobilePlus = document.getElementById("plans-table-mobile-plus") as HTMLTableElement
let plansTableMobilePro = document.getElementById("plans-table-mobile-pro") as HTMLTableElement

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

window.addEventListener("resize", setSize)

setSize()