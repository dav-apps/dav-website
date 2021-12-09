import 'dav-ui-components'
import { Button, Textfield, MessageBar } from 'dav-ui-components'
import { getLocale, showElement, hideElement } from '../../utils'

let locale = getLocale().signupPage
let header = document.getElementById("header") as HTMLHeadingElement
let errorMessageBar = document.getElementById('error-message-bar') as MessageBar
let firstNameTextfield = document.getElementById("first-name-textfield") as Textfield
let emailTextfield = document.getElementById("email-textfield") as Textfield
let passwordTextfield = document.getElementById("password-textfield") as Textfield
let passwordConfirmationTextfield = document.getElementById("password-confirmation-textfield") as Textfield
let signupButton = document.getElementById("signup-button") as Button

let firstName = ""
let email = ""
let password = ""
let passwordConfirmation = ""

function signup() {
	console.log(firstName)
	console.log(email)
	console.log(password)
	console.log(passwordConfirmation)
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

function setStrings() {
	header.innerText = locale.title
	firstNameTextfield.setAttribute("label", locale.firstNameTextfieldLabel)
	firstNameTextfield.setAttribute("placeholder", locale.firstNameTextfieldPlaceholder)
	emailTextfield.setAttribute("label", locale.emailTextfieldLabel)
	emailTextfield.setAttribute("placeholder", locale.emailTextfieldPlaceholder)
	passwordTextfield.setAttribute("label", locale.passwordTextfieldLabel)
	passwordTextfield.setAttribute("placeholder", locale.passwordTextfieldPlaceholder)
	passwordConfirmationTextfield.setAttribute("label", locale.passwordConfirmationTextfieldLabel)
	passwordConfirmationTextfield.setAttribute("placeholder", locale.passwordConfirmationTextFieldPlaceholder)
	signupButton.innerText = locale.signup
}

function hideError() {
	hideElement(errorMessageBar)
}

setStrings()
setEventListeners()