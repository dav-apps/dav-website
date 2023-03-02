import axios from "axios"
import { App, ErrorCodes } from "dav-js"
import "dav-ui-components"
import {
	Button,
	Dialog,
	Header,
	Textarea,
	Textfield,
	Toggle
} from "dav-ui-components"
import "../../components/navbar-component/navbar-component"
import { getLocale } from "../../locales"

let locale = getLocale(navigator.language).appPage
let header: Header
let description: HTMLParagraphElement
let statisticsButton: Button
let editButton: Button
let publishedToggle: Toggle
let tablesList: HTMLUListElement
let apisList: HTMLUListElement
let editAppDialog: Dialog
let editAppDialogNameTextfield: Textfield
let editAppDialogDescriptionTextarea: Textarea
let editAppDialogWebLinkTextfield: Textfield
let editAppDialogGooglePlayLinkTextfield: Textfield
let editAppDialogMicrosoftStoreLinkTextfield: Textfield
let publishAppDialog: Dialog
let publishAppDialogText: HTMLParagraphElement

let app: App
let editAppDialogName = ""
let editAppDialogDescription = ""
let editAppDialogWebLink = ""
let editAppDialogGooglePlayLink = ""
let editAppDialogMicrosoftStoreLink = ""

window.addEventListener("load", main)

async function main() {
	header = document.getElementById("header") as Header
	description = document.getElementById("description") as HTMLParagraphElement
	statisticsButton = document.getElementById("statistics-button") as Button
	editButton = document.getElementById("edit-button") as Button
	publishedToggle = document.getElementById("published-toggle") as Toggle
	tablesList = document.getElementById("tables-list") as HTMLUListElement
	apisList = document.getElementById("apis-list") as HTMLUListElement
	editAppDialog = document.getElementById("edit-app-dialog") as Dialog
	editAppDialogNameTextfield = document.getElementById(
		"edit-app-dialog-name-textfield"
	) as Textfield
	editAppDialogDescriptionTextarea = document.getElementById(
		"edit-app-dialog-description-textarea"
	) as Textarea
	editAppDialogWebLinkTextfield = document.getElementById(
		"edit-app-dialog-weblink-textfield"
	) as Textfield
	editAppDialogGooglePlayLinkTextfield = document.getElementById(
		"edit-app-dialog-googleplaylink-textfield"
	) as Textfield
	editAppDialogMicrosoftStoreLinkTextfield = document.getElementById(
		"edit-app-dialog-microsoftstorelink-textfield"
	) as Textfield
	publishAppDialog = document.getElementById("publish-app-dialog") as Dialog
	publishAppDialogText = document.getElementById(
		"publish-app-dialog-text"
	) as HTMLParagraphElement

	setEventListeners()

	// Get the app id
	let urlPathParts = window.location.pathname.split("/")
	let appId = +urlPathParts[urlPathParts.length - 1]

	// Get the app
	try {
		let getAppResponse = await axios({
			method: "get",
			url: `/api/app/${appId}`,
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			}
		})

		app = getAppResponse.data
	} catch (error) {
		// Redirect to the Dev page
		window.location.href = "/dev"
		return
	}

	header.header = app.Name
	description.innerText = app.Description
	publishedToggle.checked = app.Published

	for (let table of app.Tables) {
		let liElement = document.createElement("li") as HTMLLIElement
		liElement.classList.add("list-group-item", "text-center")
		liElement.innerText = table.Name
		tablesList.appendChild(liElement)
	}

	for (let api of app.Apis) {
		let liElement = document.createElement("li") as HTMLLIElement
		liElement.classList.add("list-group-item", "text-center")
		liElement.innerText = api.Name
		apisList.appendChild(liElement)
	}
}

function setEventListeners() {
	header.addEventListener("backButtonClick", navigateBack)
	statisticsButton.addEventListener("click", navigateToStatisticsPage)
	editButton.addEventListener("click", showEditAppDialog)
	publishedToggle.addEventListener("change", showPublishAppDialog)
	editAppDialog.addEventListener("dismiss", hideEditAppDialog)
	editAppDialog.addEventListener("primaryButtonClick", updateApp)
	editAppDialog.addEventListener("defaultButtonClick", hideEditAppDialog)
	publishAppDialog.addEventListener("dismiss", hidePublishAppDialog)
	publishAppDialog.addEventListener("primaryButtonClick", publishUnpublishApp)
	publishAppDialog.addEventListener("defaultButtonClick", hidePublishAppDialog)

	editAppDialogNameTextfield.addEventListener("change", (event: Event) => {
		editAppDialogName = (event as CustomEvent).detail.value
		hideEditAppDialogErrors()
	})

	editAppDialogDescriptionTextarea.addEventListener(
		"change",
		(event: Event) => {
			editAppDialogDescription = (event as CustomEvent).detail.value
			hideEditAppDialogErrors()
		}
	)

	editAppDialogWebLinkTextfield.addEventListener("change", (event: Event) => {
		editAppDialogWebLink = (event as CustomEvent).detail.value
		hideEditAppDialogErrors()
	})

	editAppDialogGooglePlayLinkTextfield.addEventListener(
		"change",
		(event: Event) => {
			editAppDialogGooglePlayLink = (event as CustomEvent).detail.value
			hideEditAppDialogErrors()
		}
	)

	editAppDialogMicrosoftStoreLinkTextfield.addEventListener(
		"change",
		(event: Event) => {
			editAppDialogMicrosoftStoreLink = (event as CustomEvent).detail.value
			hideEditAppDialogErrors()
		}
	)
}

function navigateBack() {
	// Redirect to the Dev page
	window.location.href = "/dev"
}

function navigateToStatisticsPage() {
	window.location.href = `/dev/${app.Id}/statistics`
}

function showEditAppDialog() {
	editAppDialogName = app.Name
	editAppDialogNameTextfield.value = app.Name
	editAppDialogDescription = app.Description
	editAppDialogDescriptionTextarea.value = app.Description
	editAppDialogWebLink = app.WebLink
	editAppDialogWebLinkTextfield.value = app.WebLink
	editAppDialogGooglePlayLink = app.GooglePlayLink
	editAppDialogGooglePlayLinkTextfield.value = app.GooglePlayLink
	editAppDialogMicrosoftStoreLink = app.MicrosoftStoreLink
	editAppDialogMicrosoftStoreLinkTextfield.value = app.MicrosoftStoreLink

	editAppDialog.visible = true
}

function hideEditAppDialog() {
	editAppDialog.visible = false
}

function hideEditAppDialogErrors() {
	editAppDialogNameTextfield.errorMessage = ""
	editAppDialogDescriptionTextarea.errorMessage = ""
	editAppDialogWebLinkTextfield.errorMessage = ""
	editAppDialogGooglePlayLinkTextfield.errorMessage = ""
	editAppDialogMicrosoftStoreLinkTextfield.errorMessage = ""
}

async function updateApp() {
	hideEditAppDialogErrors()

	if (editAppDialogName.length == 0) {
		editAppDialogNameTextfield.errorMessage =
			locale.editAppDialog.errors.nameTooShort
		return
	} else if (editAppDialogDescription.length == 0) {
		editAppDialogDescriptionTextarea.errorMessage =
			locale.editAppDialog.errors.descriptionTooShort
		return
	}

	editAppDialog.loading = true

	try {
		let response = await axios({
			method: "put",
			url: `/api/app/${app.Id}`,
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			},
			data: {
				name: editAppDialogName,
				description: editAppDialogDescription,
				webLink: editAppDialogWebLink,
				googlePlayLink: editAppDialogGooglePlayLink,
				microsoftStoreLink: editAppDialogMicrosoftStoreLink
			}
		})

		let responseData = response.data

		app.Name = responseData.Name
		app.Description = responseData.Description
		app.WebLink = responseData.WebLink
		app.GooglePlayLink = responseData.GooglePlayLink
		app.MicrosoftStoreLink = responseData.MicrosoftStoreLink

		header.header = responseData.Name
		description.innerText = responseData.Description

		editAppDialog.visible = false
	} catch (error) {
		let errors = error.response.data.errors

		for (let error of errors) {
			let errorCode = error.code

			switch (errorCode) {
				case ErrorCodes.NameTooShort:
					editAppDialogNameTextfield.errorMessage =
						locale.editAppDialog.errors.nameTooShort
					break
				case ErrorCodes.DescriptionTooShort:
					editAppDialogDescriptionTextarea.errorMessage =
						locale.editAppDialog.errors.descriptionTooShort
					break
				case ErrorCodes.NameTooLong:
					editAppDialogNameTextfield.errorMessage =
						locale.editAppDialog.errors.nameTooLong
					break
				case ErrorCodes.DescriptionTooLong:
					editAppDialogDescriptionTextarea.errorMessage =
						locale.editAppDialog.errors.descriptionTooLong
					break
				case ErrorCodes.WebLinkInvalid:
					editAppDialogWebLinkTextfield.errorMessage =
						locale.editAppDialog.errors.linkInvalid
					break
				case ErrorCodes.GooglePlayLinkInvalid:
					editAppDialogGooglePlayLinkTextfield.errorMessage =
						locale.editAppDialog.errors.linkInvalid
					break
				case ErrorCodes.MicrosoftStoreLinkInvalid:
					editAppDialogMicrosoftStoreLinkTextfield.errorMessage =
						locale.editAppDialog.errors.linkInvalid
					break
				default:
					if (errors.length == 1) {
						editAppDialogNameTextfield.errorMessage =
							locale.editAppDialog.errors.unexpectedError.replace(
								"{0}",
								errorCode.toString()
							)
					}
					break
			}
		}
	}

	editAppDialog.loading = false
}

function showPublishAppDialog() {
	publishAppDialog.header = app.Published
		? locale.publishAppDialog.unpublishHeader
		: locale.publishAppDialog.publishHeader
	publishAppDialog.primaryButtonText = locale.publishAppDialog.confirm
	publishAppDialog.defaultButtonText = locale.cancel
	publishAppDialogText.innerText = app.Published
		? locale.publishAppDialog.unpublishSubtext
		: locale.publishAppDialog.publishSubtext
	publishAppDialog.visible = true
}

function hidePublishAppDialog() {
	publishAppDialog.visible = false
}

async function publishUnpublishApp() {
	publishAppDialog.loading = true

	try {
		let response = await axios({
			method: "put",
			url: `/api/app/${app.Id}`,
			headers: {
				"X-CSRF-TOKEN":
					document
						?.querySelector(`meta[name="csrf-token"]`)
						?.getAttribute("content") ?? ""
			},
			data: {
				published: !app.Published
			}
		})

		let responseData = response.data
		app.Published = responseData.Published
		publishedToggle.checked = responseData.Published
	} catch (error) {}

	publishAppDialog.loading = false
	publishAppDialog.visible = false
}
