import axios from 'axios'
import { ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import {
	Button,
	Dialog,
	Textfield,
	MessageBar,
	ProgressRing
} from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import { devEnvironment, prodEnvironment } from '../../environments'
import {
	showElement,
	hideElement,
	getUserAgentModel,
	getUserAgentPlatform,
	handleExpiredSessionError
} from '../../utils'

let locale = getLocale().loginPage
let errorMessageBar: MessageBar
let emailTextfield: Textfield
let passwordTextfield: Textfield
let loginButton: Button
let loginButtonProgressRing: ProgressRing
let signupButton: Button
let forgotPasswordLink: HTMLAnchorElement
let forgotPasswordLinkMobile: HTMLAnchorElement
let expiredSessionDialog: Dialog

let websiteLogin = true
let appId = 0
let apiKey = null
let redirectUrl = null
let redirect = null

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
	signupButton = document.getElementById('signup-button') as Button
	forgotPasswordLink = document.getElementById('forgot-password-link') as HTMLAnchorElement
	forgotPasswordLinkMobile = document.getElementById('forgot-password-link-mobile') as HTMLAnchorElement
	expiredSessionDialog = document.getElementById('expired-session-dialog') as Dialog

	let queryString = new URLSearchParams(window.location.search)
	appId = +queryString.get("appId")
	apiKey = queryString.get("apiKey")
	redirectUrl = queryString.get("redirectUrl")
	redirect = queryString.get("redirect")

	websiteLogin = appId == 0 && apiKey == null && redirectUrl == null

	if (websiteLogin) {
		// Set the appId and apiKey
		if (document.querySelector(`meta[name="env"]`).getAttribute("content") == "production") {
			appId = prodEnvironment.appId
			apiKey = prodEnvironment.apiKey
		} else {
			appId = devEnvironment.appId
			apiKey = devEnvironment.apiKey
		}
	}

	setEventListeners()
	setSize()
}

function setEventListeners() {
	emailTextfield.addEventListener("change", (event: Event) => {
		email = (event as CustomEvent).detail.value
		hideError()
	})

	passwordTextfield.addEventListener("change", (event: Event) => {
		password = (event as CustomEvent).detail.value
		hideError()
	})

	passwordTextfield.addEventListener("enter", login)
	loginButton.addEventListener("click", login)
	signupButton.addEventListener("click", signupButtonClick)
	expiredSessionDialog.addEventListener("primaryButtonClick", () => window.location.reload())
}

function setSize() {
	if (!websiteLogin || window.innerWidth < 360) {
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
		let response = await axios({
			method: 'post',
			url: '/api/login',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")
			},
			data: {
				email,
				password,
				appId,
				apiKey,
				deviceName: await getUserAgentModel(),
				deviceOs: await getUserAgentPlatform()
			}
		})

		if (websiteLogin) {
			if (redirect != null) {
				window.location.href = redirect
			} else {
				window.location.href = "/"
			}
		} else {
			window.location.href = `${redirectUrl}?accessToken=${response.data.accessToken}`
		}
	} catch (error) {
		hideElement(loginButtonProgressRing)
		loginButton.toggleAttribute("disabled")

		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showError(error.response.data)
		}
	}
}

function signupButtonClick() {
	if (websiteLogin) return

	window.location.href = `/signup?appId=${appId}&apiKey=${apiKey}&redirectUrl=${encodeURIComponent(redirectUrl)}`
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