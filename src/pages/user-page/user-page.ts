import axios from 'axios'
import { MDCSnackbar } from '@material/snackbar'
import Cropper from 'cropperjs'
import { ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import {
	Button,
	Dialog,
	MessageBar,
	ProgressRing,
	SidenavItem,
	Textfield
} from 'dav-ui-components'
import '../../components/navbar-component/navbar-component'
import { showElement, hideElement } from '../../utils'
import { getLocale } from '../../locales'

const maxProfileImageFileSize = 2000000

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
let profileImageDialog: Dialog
let profileImageDialogImage: HTMLImageElement
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

let profileImageCropper: Cropper
let initialProfileImageSrc: string
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
	profileImageDialog = document.getElementById("profile-image-dialog") as Dialog
	profileImageDialogImage = document.getElementById("profile-image-dialog-image") as HTMLImageElement
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
	initialProfileImageSrc = profileImage.src
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
	uploadProfileImageButton.addEventListener('click', uploadProfileImageButtonClick)
	profileImageDialog.addEventListener('dismiss', hideProfileImageDialog)
	profileImageDialog.addEventListener('primaryButtonClick', profileImageDialogPrimaryButtonClick)
	profileImageDialog.addEventListener('defaultButtonClick', hideProfileImageDialog)
	profileImageDialogImage.addEventListener('load', profileImageDialogImageLoad)
	firstNameTextfield.addEventListener('change', firstNameTextfieldChange)
	firstNameTextfield.addEventListener('enter', firstNameSaveButtonClick)
	firstNameSaveButton.addEventListener('click', firstNameSaveButtonClick)
	emailTextfield.addEventListener('change', emailTextfieldChange)
	emailTextfield.addEventListener('enter', emailSaveButtonClick)
	emailSaveButton.addEventListener('click', emailSaveButtonClick)
	passwordTextfield.addEventListener('change', passwordTextfieldChange)
	passwordConfirmationTextfield.addEventListener('change', passwordTextfieldChange)
	passwordConfirmationTextfield.addEventListener('enter', passwordSaveButtonClick)
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
function uploadProfileImageButtonClick() {
	let input = document.createElement("input")
	input.setAttribute("type", "file")
	input.setAttribute("accept", "image/png, image/jpeg")

	input.addEventListener('change', () => {
		if (input.files.length == 0) return

		let file = input.files.item(0)
		let blob = new Blob([file], { type: file.type })

		profileImageDialogImage.src = URL.createObjectURL(blob)
	})

	input.click()
}

function profileImageDialogImageLoad() {
	profileImageCropper = new Cropper(profileImageDialogImage, {
		aspectRatio: 1,
		autoCropArea: 1,
		viewMode: 2
	})

	profileImageDialog.visible = true
}

function hideProfileImageDialog() {
	profileImageDialog.visible = false
}

async function profileImageDialogPrimaryButtonClick() {
	profileImageDialog.visible = false

	let canvas = profileImageCropper.getCroppedCanvas()
	let blob = await new Promise<Blob>((r: Function) => {
		canvas.toBlob((blob: Blob) => r(blob), "image/jpeg", 0.8)
	})
	profileImageCropper.destroy()

	if (blob.size > maxProfileImageFileSize) {
		showGeneralErrorMessage(locale.errors.profileImageFileTooLarge)
		return
	}

	uploadProfileImageButton.disabled = true
	showElement(profileImageProgressRing)
	profileImage.src = canvas.toDataURL("image/png")
	profileImage.style.opacity = "0.4"

	// Read the blob
	let readFilePromise: Promise<ProgressEvent> = new Promise((resolve) => {
		let fileReader = new FileReader()
		fileReader.onloadend = resolve
		fileReader.readAsArrayBuffer(blob)
	})
	let readFileResult: ProgressEvent = await readFilePromise
	let data = readFileResult.currentTarget["result"]

	// Send the file content to the server
	try {
		await axios({
			method: 'put',
			url: '/api/user/profile_image',
			headers: {
				"X-CSRF-TOKEN": document.querySelector(`meta[name="csrf-token"]`).getAttribute("content"),
				"Content-Type": blob.type
			},
			data
		})

		showSnackbar(locale.messages.profileImageUpdateMessage)
	} catch (error) {
		// Show error message
		showGeneralErrorMessage(getErrorMessage(error.response.data.errors[0].code))
		profileImage.src = initialProfileImageSrc
	}

	uploadProfileImageButton.disabled = false
	hideElement(profileImageProgressRing)
	profileImage.style.opacity = "1"
}

function firstNameTextfieldChange() {
	firstNameTextfield.errorMessage = ""

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
	if (firstName == initialFirstName) return

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

		// Update the name on the navbar
		let userNavLink = document.getElementById("user-nav-link") as HTMLAnchorElement
		if (userNavLink != null) userNavLink.innerText = firstName
	} catch (error) {
		// Show error message
		firstNameTextfield.errorMessage = getErrorMessage(error.response.data.errors[0].code)
	}

	hideElement(firstNameProgressRing)
	firstNameTextfield.disabled = false
	firstNameSaveButton.disabled = false
}

function emailTextfieldChange() {
	emailTextfield.errorMessage = ""

	if (emailTextfield.value == initialEmail) {
		// Hide the save button
		hideElement(emailSaveButton)
	} else {
		// Show the save button
		showElement(emailSaveButton)
	}
}

async function emailSaveButtonClick() {
	let email = emailTextfield.value
	if (email == initialEmail) return

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
				email
			}
		})

		// Show success message
		showGeneralSuccessMessage(locale.messages.emailUpdateMessage)

		emailTextfield.value = initialEmail
		hideElement(emailSaveButton)
	} catch (error) {
		// Show error message
		emailTextfield.errorMessage = getErrorMessage(error.response.data.errors[0].code)
	}

	hideElement(emailProgressRing)
	emailTextfield.disabled = false
	emailSaveButton.disabled = false
}

function passwordTextfieldChange() {
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
		// Show error message
		passwordTextfield.errorMessage = getErrorMessage(error.response.data.errors[0].code)
		passwordConfirmationTextfield.value = ""
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

function showGeneralErrorMessage(message: string) {
	errorMessageBarGeneral.innerText = message
	showElement(errorMessageBarGeneral)
}

function getErrorMessage(errorCode: number): string {
	switch (errorCode) {
		case ErrorCodes.ImageFileTooLarge:
			return locale.errors.profileImageFileTooLarge
		case ErrorCodes.FirstNameTooShort:
			return locale.errors.firstNameTooShort
		case ErrorCodes.FirstNameTooLong:
			return locale.errors.firstNameTooLong
		case ErrorCodes.EmailInvalid:
			return locale.errors.emailInvalid
		case ErrorCodes.EmailAlreadyInUse:
			return locale.errors.emailTaken
		case ErrorCodes.PasswordTooShort:
			return locale.errors.passwordTooShort
		case ErrorCodes.PasswordTooLong:
			return locale.errors.passwordTooLong
		case ErrorCodes.UserIsAlreadyConfirmed:
			return locale.errors.emailAlreadyConfirmed
		default:
			return locale.errors.unexpectedErrorShort.replace('{0}', errorCode.toString())
	}
}