import axios from "axios"
import "dav-ui-components"
import {
	Button,
	Textfield,
	MessageBar,
	ProgressRing,
	Dialog
} from "dav-ui-components"
import { ErrorCode } from "dav-js"
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

let locale = getLocale(navigator.language).signupPage
let errorMessageBar: MessageBar
let firstNameTextfield: Textfield
let emailTextfield: Textfield
let passwordTextfield: Textfield
let passwordConfirmationTextfield: Textfield
let signupButton: Button
let signupProgressRing: ProgressRing
let loginButton: Button
let expiredSessionDialog: Dialog

let websiteSignup = true
let appId = 0
let apiKey = ""
let redirectUrl = ""

window.addEventListener("load", main)

function main() {
	errorMessageBar = document.getElementById("error-message-bar") as MessageBar
	firstNameTextfield = document.getElementById(
		"first-name-textfield"
	) as Textfield
	emailTextfield = document.getElementById("email-textfield") as Textfield
	passwordTextfield = document.getElementById(
		"password-textfield"
	) as Textfield
	passwordConfirmationTextfield = document.getElementById(
		"password-confirmation-textfield"
	) as Textfield
	signupButton = document.getElementById("signup-button") as Button
	signupProgressRing = document.getElementById(
		"signup-progress-ring"
	) as ProgressRing
	loginButton = document.getElementById("login-button") as Button
	expiredSessionDialog = document.getElementById(
		"expired-session-dialog"
	) as Dialog

	let queryString = new URLSearchParams(window.location.search)
	appId = +(queryString.get("appId") as string)
	apiKey = queryString.get("apiKey") as string
	redirectUrl = queryString.get("redirectUrl") as string

	websiteSignup = appId == 0 && !apiKey && !redirectUrl

	if (websiteSignup) {
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
}

function setEventListeners() {
	firstNameTextfield.addEventListener("change", () => hideErrors())
	emailTextfield.addEventListener("change", () => hideErrors())
	passwordTextfield.addEventListener("change", () => hideErrors())
	passwordConfirmationTextfield.addEventListener("change", () => hideErrors())
	passwordConfirmationTextfield.addEventListener("enter", signup)
	signupButton.addEventListener("click", signup)
	loginButton.addEventListener("click", loginButtonClick)
	expiredSessionDialog.addEventListener("primaryButtonClick", () =>
		window.location.reload()
	)
}

async function signup() {
	if (firstNameTextfield.value.length == 0) {
		firstNameTextfield.errorMessage = locale.errors.firstNameMissing
		return
	} else if (emailTextfield.value.length == 0) {
		emailTextfield.errorMessage = locale.errors.emailMissing
		return
	} else if (passwordTextfield.value.length == 0) {
		passwordTextfield.errorMessage = locale.errors.passwordMissing
		return
	} else if (passwordTextfield.value != passwordConfirmationTextfield.value) {
		passwordConfirmationTextfield.errorMessage =
			locale.errors.passwordConfirmationNotMatching
		return
	}

	hideErrors()
	showElement(signupProgressRing)
	signupButton.disabled = true
	if (loginButton != null) loginButton.disabled = true
	firstNameTextfield.disabled = true
	emailTextfield.disabled = true
	passwordTextfield.disabled = true
	passwordConfirmationTextfield.disabled = true

	try {
		let response = await axios({
			method: "post",
			url: "/api/signup",
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			},
			data: {
				firstName: firstNameTextfield.value,
				email: emailTextfield.value,
				password: passwordTextfield.value,
				appId,
				apiKey,
				deviceName: await getUserAgentModel(),
				deviceOs: await getUserAgentPlatform()
			}
		})

		if (websiteSignup) {
			window.location.href = "/"
		} else {
			let url = new URL(redirectUrl)
			url.searchParams.append("accessToken", response.data.accessToken)
			window.location.href = url.toString()
		}
	} catch (error) {
		hideElement(signupProgressRing)
		signupButton.disabled = false
		if (loginButton != null) loginButton.disabled = false
		firstNameTextfield.disabled = false
		emailTextfield.disabled = false
		passwordTextfield.disabled = false
		passwordConfirmationTextfield.disabled = false

		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showError(error.response.data.errors)
		}
	}
}

function loginButtonClick() {
	if (websiteSignup) return

	window.location.href = `/login?appId=${appId}&apiKey=${apiKey}&redirectUrl=${encodeURIComponent(
		redirectUrl
	)}`
}

function showError(errors: ErrorCode[]) {
	if (errors == null) {
		showErrorMessageBar(locale.errors.unexpectedErrorLong)
		return
	}

	for (let errorCode of errors) {
		switch (errorCode) {
			case "FIRST_NAME_TOO_SHORT":
				firstNameTextfield.errorMessage = locale.errors.firstNameTooShort
				break
			case "PASSWORD_TOO_SHORT":
				passwordTextfield.errorMessage = locale.errors.passwordTooShort
				break
			case "FIRST_NAME_TOO_LONG":
				firstNameTextfield.errorMessage = locale.errors.firstNameTooLong
				break
			case "PASSWORD_TOO_LONG":
				passwordTextfield.errorMessage = locale.errors.passwordTooLong
				break
			case "EMAIL_INVALID":
				emailTextfield.errorMessage = locale.errors.emailInvalid
				break
			case "EMAIL_ALREADY_IN_USE":
				emailTextfield.errorMessage = locale.errors.emailTaken
				break
			default:
				showErrorMessageBar(
					locale.errors.unexpectedErrorShort.replace("{0}", errorCode)
				)
				break
		}
	}
}

function showErrorMessageBar(message: string) {
	errorMessageBar.innerText = message
	showElement(errorMessageBar)
}

function hideErrors() {
	firstNameTextfield.errorMessage = ""
	emailTextfield.errorMessage = ""
	passwordTextfield.errorMessage = ""
	passwordConfirmationTextfield.errorMessage = ""
	hideElement(errorMessageBar)
}
