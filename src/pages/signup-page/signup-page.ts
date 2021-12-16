import axios from 'axios'
import 'dav-ui-components'
import { Button, Textfield, MessageBar } from 'dav-ui-components'
import { ErrorCodes } from 'dav-js'
import '../../components/navbar-component/navbar-component'
import { getLocale } from '../../locales'
import { getDataService, showElement, hideElement } from '../../utils'

let locale = getLocale().signupPage
let dataService = getDataService()
let errorMessageBar: MessageBar
let firstNameTextfield: Textfield
let emailTextfield: Textfield
let passwordTextfield: Textfield
let passwordConfirmationTextfield: Textfield
let signupButton: Button

let firstName = ""
let email = ""
let password = ""
let passwordConfirmation = ""

window.addEventListener("load", main)

function main() {
	errorMessageBar = document.getElementById('error-message-bar') as MessageBar
	firstNameTextfield = document.getElementById("first-name-textfield") as Textfield
	emailTextfield = document.getElementById("email-textfield") as Textfield
	passwordTextfield = document.getElementById("password-textfield") as Textfield
	passwordConfirmationTextfield = document.getElementById("password-confirmation-textfield") as Textfield
	signupButton = document.getElementById("signup-button") as Button

	setEventListeners()
}

async function signup() {
	if (password != passwordConfirmation) {
		errorMessageBar.innerText = locale.errors.passwordConfirmationNotMatching
		passwordConfirmationTextfield.value = ""
		showElement(errorMessageBar)
		return
	}

	hideError()
	signupButton.toggleAttribute("disabled")
	let response

	try {
		response = await axios({
			method: 'post',
			url: '/signup',
			data: {
				firstName,
				email,
				password
				// TODO: Device info
			}
		})
	} catch (error) {
		showError(error.response.data)
		signupButton.toggleAttribute("disabled")
		return
	}

	await dataService.dav.Login(response.data.accessToken)
	window.location.href = "/"
}

function setEventListeners() {
	firstNameTextfield.addEventListener("change", (event: Event) => {
		firstName = (event as CustomEvent).detail.value
		hideError()
	})
	
	emailTextfield.addEventListener("change", (event: Event) => {
		email = (event as CustomEvent).detail.value
		hideError()
	})
	
	passwordTextfield.addEventListener("change", (event: Event) => {
		password = (event as CustomEvent).detail.value
		hideError()
	})
	
	passwordConfirmationTextfield.addEventListener("change", (event: Event) => {
		passwordConfirmation = (event as CustomEvent).detail.value
		hideError()
	})

	passwordConfirmationTextfield.addEventListener("enter", signup)
	signupButton.addEventListener("click", signup)
}

function showError(errors: { code: number, message: string }[]) {
	let errorCode = errors[0].code
	errorMessageBar.innerText = getSignupErrorMessage(errorCode)

	if (errorCode == ErrorCodes.PasswordTooShort || errorCode == ErrorCodes.PasswordTooLong) {
		passwordTextfield.value = ""
		passwordConfirmationTextfield.value = ""
	}

	showElement(errorMessageBar)
}

function hideError() {
	hideElement(errorMessageBar)
}

function getSignupErrorMessage(errorCode: number): string {
	switch (errorCode) {
		case ErrorCodes.FirstNameMissing:
			return locale.errors.firstNameMissing
		case ErrorCodes.EmailMissing:
			return locale.errors.emailMissing
		case ErrorCodes.PasswordMissing:
			return locale.errors.passwordMissing
		case ErrorCodes.FirstNameTooShort:
			return locale.errors.firstNameTooShort
		case ErrorCodes.PasswordTooShort:
			return locale.errors.passwordTooShort
		case ErrorCodes.FirstNameTooLong:
			return locale.errors.firstNameTooLong
		case ErrorCodes.PasswordTooLong:
			return locale.errors.passwordTooLong
		case ErrorCodes.EmailInvalid:
			return locale.errors.emailInvalid
		case ErrorCodes.EmailAlreadyInUse:
			return locale.errors.emailTaken
		default:
			return locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString())
	}
}