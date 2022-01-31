import axios from 'axios'
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

let generalSidenavItem: SidenavItem
let plansSidenavItem: SidenavItem
let generalContainer: HTMLDivElement
let plansContainer: HTMLDivElement

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
let passwordTextfield: Textfield
let passwordConfirmationTextfield: Textfield

let firstName = ""
let initialFirstName = ""
//#endregion

window.addEventListener("load", main)

async function main() {
	generalSidenavItem = document.getElementById("general-sidenav-item") as SidenavItem
	plansSidenavItem = document.getElementById("plans-sidenav-item") as SidenavItem
	generalContainer = document.getElementById("general-container") as HTMLDivElement
	plansContainer = document.getElementById("plans-container") as HTMLDivElement

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
	passwordTextfield = document.getElementById("password-textfield") as Textfield
	passwordConfirmationTextfield = document.getElementById("password-confirmation-textfield") as Textfield

	initialFirstName = firstNameTextfield.value

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
	firstNameTextfield.addEventListener('change', (event: Event) => {
		firstName = (event as CustomEvent).detail.value

		if (firstName == initialFirstName) {
			// Hide the save button
			hideElement(firstNameSaveButton)
		} else {
			// Show the save button
			showElement(firstNameSaveButton)
		}
	})

	firstNameSaveButton.addEventListener('click', async () => {
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
					firstName: firstName
				}
			})

			// TODO: Show success message

			initialFirstName = firstName
			hideElement(firstNameSaveButton)
		} catch (error) {
			// TODO: Show error message
			console.log(error.response.data)
		}

		hideElement(firstNameProgressRing)
		firstNameTextfield.disabled = false
		firstNameSaveButton.disabled = false
	})
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