import axios from "axios"
import { ErrorCode } from "dav-js"
import "dav-ui-components"
import {
	Button,
	Dialog,
	Textfield,
	MessageBar,
	ProgressRing
} from "dav-ui-components"
import "../../components/navbar-component/navbar-component"
import { getLocale } from "../../locales"
import {
	devEnvironment,
	stagingEnvironment,
	prodEnvironment
} from "../../environments"
import {
	showElement,
	hideElement,
	getUserAgentModel,
	getUserAgentPlatform,
	handleExpiredSessionError
} from "../../utils"

let locale = getLocale(navigator.language).loginPage
let errorMessageBar: MessageBar
let emailTextfield: Textfield
let passwordTextfield: Textfield
let loginButton: Button
let loginButtonProgressRing: ProgressRing
let signupButton: Button
let forgotPasswordLink: HTMLAnchorElement
let forgotPasswordLinkMobile: HTMLAnchorElement
let loginAsButtonContainer: HTMLDivElement
let loginAsButton: HTMLButtonElement
let loginAsButtonProgressRing: ProgressRing
let expiredSessionDialog: Dialog

let websiteLogin = true
let appId = 0
let apiKey = ""
let redirectUrl = ""
let redirect = ""

window.addEventListener("resize", setSize)
window.addEventListener("load", main)

function main() {
	errorMessageBar = document.getElementById("error-message-bar") as MessageBar
	emailTextfield = document.getElementById("email-textfield") as Textfield
	passwordTextfield = document.getElementById(
		"password-textfield"
	) as Textfield
	loginButton = document.getElementById("login-button") as Button
	loginButtonProgressRing = document.getElementById(
		"login-button-progress-ring"
	) as ProgressRing
	signupButton = document.getElementById("signup-button") as Button
	forgotPasswordLink = document.getElementById(
		"forgot-password-link"
	) as HTMLAnchorElement
	forgotPasswordLinkMobile = document.getElementById(
		"forgot-password-link-mobile"
	) as HTMLAnchorElement
	loginAsButtonContainer = document.getElementById(
		"login-as-button-container"
	) as HTMLDivElement
	loginAsButton = document.getElementById(
		"login-as-button"
	) as HTMLButtonElement
	loginAsButtonProgressRing = document.getElementById(
		"login-as-button-progress-ring"
	) as ProgressRing
	expiredSessionDialog = document.getElementById(
		"expired-session-dialog"
	) as Dialog

	let queryString = new URLSearchParams(window.location.search)
	appId = +(queryString.get("appId") as string)
	apiKey = queryString.get("apiKey") as string
	redirectUrl = queryString.get("redirectUrl") as string
	redirect = queryString.get("redirect") as string

	websiteLogin = appId == 0 && !apiKey && !redirectUrl

	if (websiteLogin) {
		// Set the appId and apiKey
		let env = document
			?.querySelector(`meta[name="env"]`)
			?.getAttribute("content")

		switch (env) {
			case "production":
				appId = prodEnvironment.appId
				apiKey = prodEnvironment.apiKey
				break
			case "staging":
				appId = stagingEnvironment.appId
				apiKey = stagingEnvironment.apiKey
				break
			default:
				appId = devEnvironment.appId
				apiKey = devEnvironment.apiKey
				break
		}
	}

	setEventListeners()
	setSize()
}

function setEventListeners() {
	emailTextfield.addEventListener("change", () => hideErrors())
	passwordTextfield.addEventListener("change", () => hideErrors())
	passwordTextfield.addEventListener("enter", login)
	loginButton.addEventListener("click", login)
	signupButton.addEventListener("click", signupButtonClick)
	if (loginAsButton != null)
		loginAsButton.addEventListener("click", loginAsButtonClick)
	expiredSessionDialog.addEventListener("primaryButtonClick", () =>
		window.location.reload()
	)
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
	if (emailTextfield.value.length == 0) {
		emailTextfield.errorMessage = locale.errors.emailMissing
		return
	} else if (passwordTextfield.value.length == 0) {
		passwordTextfield.errorMessage = locale.errors.passwordMissing
		return
	}

	hideErrors()
	showElement(loginButtonProgressRing)
	loginButton.disabled = true
	if (signupButton != null) signupButton.disabled = true
	if (loginAsButton != null) loginAsButton.toggleAttribute("disabled")
	emailTextfield.disabled = true
	passwordTextfield.disabled = true

	try {
		let response = await axios({
			method: "post",
			url: "/api/login",
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			},
			data: {
				email: emailTextfield.value,
				password: passwordTextfield.value,
				appId,
				apiKey,
				deviceName: await getUserAgentModel(),
				deviceOs: await getUserAgentPlatform()
			}
		})

		if (websiteLogin) {
			if (redirect != null) {
				window.location.href = redirect + window.location.hash
			} else {
				window.location.href = "/"
			}
		} else {
			let url = new URL(redirectUrl)
			url.searchParams.append("accessToken", response.data.accessToken)
			window.location.href = url.toString()
		}
	} catch (error) {
		hideElement(loginButtonProgressRing)
		loginButton.disabled = false
		if (signupButton != null) signupButton.disabled = false
		if (loginAsButton != null) loginAsButton.toggleAttribute("disabled")
		emailTextfield.disabled = false
		passwordTextfield.disabled = false

		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showError(error.response.data.errors)
		}
	}
}

function signupButtonClick() {
	if (websiteLogin) return

	window.location.href = `/signup?appId=${appId}&apiKey=${apiKey}&redirectUrl=${encodeURIComponent(
		redirectUrl
	)}`
}

async function loginAsButtonClick() {
	hideErrors()
	showElement(loginAsButtonProgressRing)
	loginButton.disabled = true
	if (signupButton != null) signupButton.disabled = true
	loginAsButton.disabled = true
	loginAsButtonContainer.style.paddingLeft = "44px"
	emailTextfield.disabled = true
	passwordTextfield.disabled = true

	try {
		let response = await axios({
			method: "post",
			url: "/api/create_session_from_access_token",
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			},
			data: {
				appId,
				apiKey,
				deviceName: await getUserAgentModel(),
				deviceOs: await getUserAgentPlatform()
			}
		})

		let url = new URL(redirectUrl)
		url.searchParams.append("accessToken", response.data.accessToken)
		window.location.href = url.toString()
	} catch (error) {
		hideElement(loginAsButtonProgressRing)
		loginButton.disabled = false
		if (signupButton != null) signupButton.disabled = false
		loginAsButton.disabled = false
		loginAsButtonContainer.style.paddingLeft = "0"
		emailTextfield.disabled = false
		passwordTextfield.disabled = false

		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showError(error.response.data.errors)
		}
	}
}

function showError(errorCodes: ErrorCode[]) {
	if (errorCodes == null || errorCodes.length == 0) {
		errorMessageBar.innerText = locale.errors.unexpectedErrorLong
		showElement(errorMessageBar)
		return
	}

	if (
		errorCodes.includes("PASSWORD_INCORRECT") ||
		errorCodes.includes("USER_DOES_NOT_EXIST")
	) {
		errorMessageBar.innerText = locale.errors.loginFailed
	} else {
		errorMessageBar.innerText = locale.errors.unexpectedErrorShort.replace(
			"{0}",
			errorCodes[0]
		)
	}

	showElement(errorMessageBar)
}

function hideErrors() {
	emailTextfield.errorMessage = ""
	passwordTextfield.errorMessage = ""
	hideElement(errorMessageBar)
}
