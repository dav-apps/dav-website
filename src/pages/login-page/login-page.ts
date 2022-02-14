import axios from 'axios'
import { ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import { Button, Textfield, MessageBar, ProgressRing } from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import {
	showElement,
	hideElement,
	getUserAgentModel,
	getUserAgentPlatform
} from '../../utils'

let locale = getLocale().loginPage
let errorMessageBar: MessageBar
let emailTextfield: Textfield
let passwordTextfield: Textfield
let loginButton: Button
let loginButtonProgressRing: ProgressRing
let forgotPasswordLink: HTMLAnchorElement
let forgotPasswordLinkMobile: HTMLAnchorElement

let email: string = ""
let password: string = ""

window.addEventListener("resize", setSize)
window.addEventListener("load", main)

function main() {
	errorMessageBar = document.getElementById('error-message-bar') as MessageBar
	emailTextfield = document.getElementById('email-textfield') as Textfield
	passwordTextfield = document.getElementById('password-textfield') as Textfield
	loginButton = document.getElementById('login-button') as Button
	loginButtonProgressRing = document.getElementById('login-button-progress-ring') as ProgressRing
	forgotPasswordLink = document.getElementById('forgot-password-link') as HTMLAnchorElement
	forgotPasswordLinkMobile = document.getElementById('forgot-password-link-mobile') as HTMLAnchorElement

	setEventListeners()
	setSize()
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

function setSize() {
	if (window.innerWidth < 360) {
		hideElement(forgotPasswordLink)
		showElement(forgotPasswordLinkMobile)
	} else {
		hideElement(forgotPasswordLinkMobile)
		showElement(forgotPasswordLink)
	}
}

async function login() {
	hideError()
	showElement(loginButtonProgressRing)
	loginButton.toggleAttribute("disabled")

	try {
		await axios({
			method: 'post',
			url: '/login',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")
			},
			data: {
				email,
				password,
				deviceName: await getUserAgentModel(),
				deviceOs: await getUserAgentPlatform()
			}
		})
	} catch (error) {
		showError(error.response.data)
		hideElement(loginButtonProgressRing)
		loginButton.toggleAttribute("disabled")
		return
	}

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