import axios from 'axios'
import { ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import { Button, ProgressRing, Textfield } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import { hideElement, showElement } from '../../utils'

let locale = getLocale().forgotPasswordPage
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
	emailTextfield.errorMessage = ""
}

async function sendButtonClick() {
	if (
		emailTextfield.value.length < 3
		|| !emailTextfield.value.includes('@')
	) {
		emailTextfield.errorMessage = locale.errors.emailInvalid
		return
	}

	showElement(sendButtonProgressRing)
	emailTextfield.errorMessage = ""
	emailTextfield.disabled = true
	sendButton.disabled = true

	try {
		await axios({
			method: 'post',
			url: '/api/send_password_reset_email',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")
			},
			data: {
				email: emailTextfield.value
			}
		})
	} catch (error) {
		hideElement(sendButtonProgressRing)
		emailTextfield.errorMessage = getErrorMessage(error.response.data.errors[0].code)
		emailTextfield.disabled = false
		sendButton.disabled = false
		return
	}

	window.location.href = "/?message=passwordReset"
}

function getErrorMessage(code: number): string {
	switch (code) {
		case ErrorCodes.UserDoesNotExist:
			return locale.errors.userNotFound
		default:
			return locale.errors.unexpectedErrorShort.replace('{0}', code.toString())
	}
}