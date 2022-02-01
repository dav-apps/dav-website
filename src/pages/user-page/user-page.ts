import axios from 'axios'
import { MDCSnackbar } from '@material/snackbar'
import 'dav-ui-components'
import {
	Button,
	MessageBar,
	ProgressRing,
	SidenavItem,
	Textfield
} from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { showElement, hideElement } from '../../utils'
import { getLocale } from '../../locales'

let generalSidenavItem: SidenavItem
let plansSidenavItem: SidenavItem
let generalContainer: HTMLDivElement
let plansContainer: HTMLDivElement
let snackbarLabel: HTMLDivElement

let locale = getLocale().userPage
let snackbar: MDCSnackbar

//#region General page variables
let errorMessageBarGeneral: MessageBar
let successMessageBarGeneral: MessageBar
let profileImageProgressRing: ProgressRing
let profileImage: HTMLImageElement
let uploadProfileImageButton: Button
let firstNameTextfield: Textfield
let firstNameSaveButton: HTMLButtonElement
let firstNameProgressRing: ProgressRing
let emailTextfield: Textfield
let emailSaveButton: HTMLButtonElement
let emailProgressRing: ProgressRing
let passwordTextfield: Textfield
let passwordConfirmationTextfield: Textfield
let passwordSaveButton: Button
let passwordProgressRing: ProgressRing

let initialFirstName = ""
let initialEmail = ""
//#endregion

window.addEventListener("load", main)

async function main() {
	generalSidenavItem = document.getElementById("general-sidenav-item") as SidenavItem
	plansSidenavItem = document.getElementById("plans-sidenav-item") as SidenavItem
	generalContainer = document.getElementById("general-container") as HTMLDivElement
	plansContainer = document.getElementById("plans-container") as HTMLDivElement
	snackbarLabel = document.getElementById("snackbar-label") as HTMLDivElement

	errorMessageBarGeneral = document.getElementById("error-message-bar-general") as MessageBar
	successMessageBarGeneral = document.getElementById("success-message-bar-general") as MessageBar
	profileImageProgressRing = document.getElementById("profile-image-progress-ring") as ProgressRing
	profileImage = document.getElementById("profile-image") as HTMLImageElement
	uploadProfileImageButton = document.getElementById("upload-profile-image-button") as Button
	firstNameTextfield = document.getElementById("first-name-textfield") as Textfield
	firstNameSaveButton = document.getElementById("first-name-save-button") as HTMLButtonElement
	firstNameProgressRing = document.getElementById("first-name-progress-ring") as ProgressRing
	emailTextfield = document.getElementById("email-textfield") as Textfield
	emailSaveButton = document.getElementById("email-save-button") as HTMLButtonElement
	emailProgressRing = document.getElementById("email-progress-ring") as ProgressRing
	passwordTextfield = document.getElementById("password-textfield") as Textfield
	passwordConfirmationTextfield = document.getElementById("password-confirmation-textfield") as Textfield
	passwordSaveButton = document.getElementById("password-save-button") as Button
	passwordProgressRing = document.getElementById("password-progress-ring") as ProgressRing

	snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'))
	initialFirstName = firstNameTextfield.value
	initialEmail = emailTextfield.value

	setEventListeners()
	displayPage()
}

function setEventListeners() {
	window.addEventListener('hashchange', displayPage)

	generalSidenavItem.addEventListener('click', () => {
		window.location.href = "/user#general"
	})

	plansSidenavItem.addEventListener('click', () => {
		window.location.href = "/user#plans"
	})

	//#region General page event listeners
	firstNameTextfield.addEventListener('change', firstNameTextfieldChange)
	firstNameSaveButton.addEventListener('click', firstNameSaveButtonClick)
	emailTextfield.addEventListener('change', emailTextfieldChange)
	emailSaveButton.addEventListener('click', emailSaveButtonClick)
	passwordTextfield.addEventListener('change', passwordTextfieldChange)
	passwordConfirmationTextfield.addEventListener('change', passwordConfirmationTextfieldChange)
	passwordSaveButton.addEventListener('click', passwordSaveButtonClick)
	//#endregion
}

function displayPage() {
	if (window.location.hash == "#plans") {
		// Show the plans page
		hideElement(generalContainer)
		showElement(plansContainer)
	} else {
		// Show general settings page
		hideElement(plansContainer)
		showElement(generalContainer)
	}
}

//#region General page event listeners
function firstNameTextfieldChange() {
	if (firstNameTextfield.value == initialFirstName) {
		// Hide the save button
		hideElement(firstNameSaveButton)
	} else {
		// Show the save button
		showElement(firstNameSaveButton)
	}
}

async function firstNameSaveButtonClick() {
	let firstName = firstNameTextfield.value

	showElement(firstNameProgressRing)
	firstNameTextfield.disabled = true
	firstNameSaveButton.disabled = true

	try {
		await axios({
			method: 'put',
			url: '/api/user',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")
			},
			data: {
				firstName
			}
		})

		// Show success message
		showSnackbar(locale.messages.firstNameUpdateMessage)

		initialFirstName = firstName
		hideElement(firstNameSaveButton)
	} catch (error) {
		// TODO: Show error message
		console.log(error.response.data)
	}

	hideElement(firstNameProgressRing)
	firstNameTextfield.disabled = false
	firstNameSaveButton.disabled = false
}

function emailTextfieldChange() {
	if (emailTextfield.value == initialEmail) {
		// Hide the save button
		hideElement(emailSaveButton)
	} else {
		// Show the save button
		showElement(emailSaveButton)
	}
}

async function emailSaveButtonClick() {
	showElement(emailProgressRing)
	emailTextfield.disabled = true
	emailSaveButton.disabled = true

	try {
		await axios({
			method: 'put',
			url: '/api/user',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")
			},
			data: {
				email: emailTextfield.value
			}
		})

		// Show success message
		showGeneralSuccessMessage(locale.messages.emailUpdateMessage)

		emailTextfield.value = initialEmail
		hideElement(emailSaveButton)
	} catch (error) {
		// TODO: Show error message
		console.log(error.response.data)
	}

	hideElement(emailProgressRing)
	emailTextfield.disabled = false
	emailSaveButton.disabled = false
}

function passwordTextfieldChange() {
	passwordTextfield.errorMessage = ""
	passwordConfirmationTextfield.errorMessage = ""
}

function passwordConfirmationTextfieldChange() {
	passwordTextfield.errorMessage = ""
	passwordConfirmationTextfield.errorMessage = ""
}

async function passwordSaveButtonClick() {
	if (passwordTextfield.value.length == 0) {
		passwordTextfield.errorMessage = locale.errors.passwordMissing
		return
	} else if (passwordConfirmationTextfield.value.length == 0) {
		passwordConfirmationTextfield.errorMessage = locale.errors.passwordConfirmationMissing
		return
	} else if (passwordTextfield.value != passwordConfirmationTextfield.value) {
		passwordConfirmationTextfield.errorMessage = locale.errors.passwordConfirmationNotMatching
		return
	}

	passwordTextfield.disabled = true
	passwordConfirmationTextfield.disabled = true
	passwordSaveButton.disabled = true
	showElement(passwordProgressRing)

	try {
		await axios({
			method: 'put',
			url: '/api/user',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content")
			},
			data: {
				password: passwordTextfield.value
			}
		})

		// Show success message
		showGeneralSuccessMessage(locale.messages.passwordUpdateMessage)

		passwordTextfield.value = ""
		passwordConfirmationTextfield.value = ""
	} catch (error) {
		// TODO: Show error message
		console.log(error.response.data)
	}

	passwordTextfield.disabled = false
	passwordConfirmationTextfield.disabled = false
	passwordSaveButton.disabled = false
	hideElement(passwordProgressRing)
}
//#endregion

function showSnackbar(message: string) {
	snackbarLabel.innerText = message
	snackbar.open()
}

function showGeneralSuccessMessage(message: string) {
	successMessageBarGeneral.innerText = message
	showElement(successMessageBarGeneral)
}