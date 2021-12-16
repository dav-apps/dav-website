import axios from 'axios'
import { ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import { Button, Textfield, MessageBar } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import { getDataService, showElement, hideElement } from '../../utils'

let locale = getLocale().loginPage
let dataService = getDataService()
let errorMessageBar: MessageBar
let emailTextfield: Textfield
let passwordTextfield: Textfield
let loginButton: Button

let email: string = ""
let password: string = ""

window.addEventListener("load", main)

function main() {
	errorMessageBar = document.getElementById('error-message-bar') as MessageBar
	emailTextfield = document.getElementById('email-textfield') as Textfield
	passwordTextfield = document.getElementById('password-textfield') as Textfield
	loginButton = document.getElementById('login-button') as Button

	setEventListeners()
}

function setEventListeners() {
	emailTextfield.addEventListener('change', (event: Event) => {
		email = (event as CustomEvent).detail.value
		hideError()
	})

	passwordTextfield.addEventListener('change', (event: Event) => {
		password = (event as CustomEvent).detail.value
		hideError()
	})

	passwordTextfield.addEventListener('enter', login)
	loginButton.addEventListener('click', login)
}

async function login() {
	hideError()
	loginButton.toggleAttribute("disabled")
	let response

	try {
		response = await axios({
			method: 'post',
			url: '/login',
			data: {
				email,
				password
				// TODO: Device info
			}
		})
	} catch (error) {
		showError(error.response.data)
		loginButton.toggleAttribute("disabled")
		return
	}

	await dataService.dav.Login(response.data.accessToken)
	window.location.href = "/"
}

function showError(errors: {code: number, message: string}[]) {
	let errorCode = errors[0].code
	errorMessageBar.innerText = getLoginErrorMessage(errorCode)

	if (errorCode != ErrorCodes.EmailMissing) {
		passwordTextfield.value = ""
	}

	showElement(errorMessageBar)
}

function hideError() {
	hideElement(errorMessageBar)
}

function getLoginErrorMessage(errorCode: number): string {
	switch (errorCode) {
		case ErrorCodes.IncorrectPassword:
			return locale.errors.loginFailed
		case ErrorCodes.EmailMissing:
			return locale.errors.emailMissing
		case ErrorCodes.PasswordMissing:
			return locale.errors.passwordMissing
		case ErrorCodes.UserDoesNotExist:
			return locale.errors.loginFailed
		default:
			return locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
	}
}