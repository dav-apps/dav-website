import axios from 'axios'
import { Dav, ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import { Button, Textfield, MessageBar } from 'dav-ui-components'
import { getLocale, showElement, hideElement } from '../../utils'

let locale = getLocale().loginPage
let header = document.getElementById("header") as HTMLHeadingElement
let errorMessageBar = document.getElementById('error-message-bar') as MessageBar
let emailTextfield = document.getElementById('email-textfield') as Textfield
let passwordTextfield = document.getElementById('password-textfield') as Textfield
let loginButton = document.getElementById('login-button') as Button

let email: string = ""
let password: string = ""

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

function setStrings() {
	header.innerText = locale.title
	emailTextfield.setAttribute("label", locale.emailTextfieldLabel)
	emailTextfield.setAttribute("placeholder", locale.emailTextfieldPlaceholder)
	passwordTextfield.setAttribute("label", locale.passwordTextfieldLabel)
	passwordTextfield.setAttribute("placeholder", locale.passwordTextfieldPlaceholder)
	loginButton.innerText = locale.login
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
			}
		})
	} catch (error) {
		showError(error.response.data)
		loginButton.toggleAttribute("disabled")
		return
	}

	await Dav.Login(response.data.accessToken)
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

setStrings()
setEventListeners()