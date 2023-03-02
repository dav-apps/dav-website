import axios from "axios"
import "dav-ui-components"
import { Button, Dialog, ProgressRing, Textfield } from "dav-ui-components"
import "../../components/navbar-component/navbar-component"
import { getLocale } from "../../locales"
import {
	handleExpiredSessionError,
	hideElement,
	showElement
} from "../../utils"

let locale = getLocale(navigator.language).passwordResetPage
let passwordTextfield: Textfield
let passwordConfirmationTextfield: Textfield
let saveButton: Button
let saveButtonProgressRing: ProgressRing
let expiredSessionDialog: Dialog

let userId = 0
let passwordConfirmationToken = ""

window.addEventListener("load", main)

function main() {
	passwordTextfield = document.getElementById(
		"password-textfield"
	) as Textfield
	passwordConfirmationTextfield = document.getElementById(
		"password-confirmation-textfield"
	) as Textfield
	saveButton = document.getElementById("save-button") as Button
	saveButtonProgressRing = document.getElementById(
		"save-button-progress-ring"
	) as ProgressRing
	expiredSessionDialog = document.getElementById(
		"expired-session-dialog"
	) as Dialog

	let queryString = new URLSearchParams(window.location.search)
	userId = +(queryString.get("userId") as string)
	passwordConfirmationToken = queryString.get(
		"passwordConfirmationToken"
	) as string

	setEventListeners()
}

function setEventListeners() {
	passwordTextfield.addEventListener("change", clearErrorMessages)
	passwordConfirmationTextfield.addEventListener("change", clearErrorMessages)
	passwordConfirmationTextfield.addEventListener("enter", saveButtonClick)
	saveButton.addEventListener("click", saveButtonClick)
	expiredSessionDialog.addEventListener("primaryButtonClick", () =>
		window.location.reload()
	)
}

function clearErrorMessages() {
	passwordTextfield.errorMessage = ""
	passwordConfirmationTextfield.errorMessage = ""
}

async function saveButtonClick() {
	if (
		passwordTextfield.value.length == 0 &&
		passwordConfirmationTextfield.value.length == 0
	) {
		passwordTextfield.errorMessage = locale.errors.passwordMissing
		return
	}

	if (passwordTextfield.value != passwordConfirmationTextfield.value) {
		passwordConfirmationTextfield.errorMessage =
			locale.errors.passwordConfirmationNotMatching
		return
	}

	if (passwordTextfield.value.length < 7) {
		passwordTextfield.errorMessage = locale.errors.passwordTooShort
		return
	}

	if (passwordTextfield.value.length > 25) {
		passwordTextfield.errorMessage = locale.errors.passwordTooLong
		return
	}

	clearErrorMessages()
	showElement(saveButtonProgressRing)
	saveButton.disabled = true
	passwordTextfield.disabled = true
	passwordConfirmationTextfield.disabled = true

	try {
		await axios({
			method: "post",
			url: "/api/set_password",
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			},
			data: {
				id: userId,
				password: passwordTextfield.value,
				passwordConfirmationToken
			}
		})

		window.location.href = "/?message=changePassword"
	} catch (error) {
		if (handleExpiredSessionError(error, expiredSessionDialog)) {
			hideElement(saveButtonProgressRing)
			saveButton.disabled = false
			passwordTextfield.disabled = false
			passwordConfirmationTextfield.disabled = false
		} else {
			window.location.href = "/?message=error"
		}
	}
}
