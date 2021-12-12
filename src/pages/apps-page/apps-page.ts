import { getLocale } from '../../utils'

let locale = getLocale().appsPage
let header = document.getElementById("header") as HTMLHeadingElement

function setStrings() {
	header.innerText = locale.title
}

setStrings()