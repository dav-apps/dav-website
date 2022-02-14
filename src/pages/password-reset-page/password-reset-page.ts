import axios from 'axios'
import 'dav-ui-components'
import { Button, ProgressRing, Textfield } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'

let emailTextfield: Textfield
let sendButton: Button
let sendButtonProgressRing: ProgressRing

window.addEventListener("load", main)

function main() {
	emailTextfield = document.getElementById("email-textfield") as Textfield
	sendButton = document.getElementById("send-button") as Button
	sendButtonProgressRing = document.getElementById("send-button-progress-ring") as ProgressRing

	setEventListeners()
}

function setEventListeners() {
	emailTextfield.addEventListener("change", emailTextfieldChange)
	emailTextfield.addEventListener("enter", sendButtonClick)
	sendButton.addEventListener("click", sendButtonClick)
}

function emailTextfieldChange() {
	// TODO: Hide error
}

function sendButtonClick() {
	
}