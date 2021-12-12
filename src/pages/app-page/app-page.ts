import { Dav, ApiResponse, ApiErrorResponse, AppsController, App, ErrorCodes } from 'dav-js'
import 'dav-ui-components'
import { Button, Dialog, Header, Textarea, Textfield, Toggle } from 'dav-ui-components'
import { initDav, userLoadedPromiseHolder, getLocale } from '../../utils'

let locale = getLocale().appPage
let header = document.getElementById("header") as Header
let description = document.getElementById("description") as HTMLParagraphElement
let statisticsButton = document.getElementById("statistics-button") as Button
let editButton = document.getElementById("edit-button") as Button
let publishedHeader = document.getElementById("published-header") as HTMLHeadingElement
let publishedToggle = document.getElementById("published-toggle") as Toggle
let tablesHeader = document.getElementById("tables-header") as HTMLHeadingElement
let tablesList = document.getElementById("tables-list") as HTMLUListElement
let apisHeader = document.getElementById("apis-header") as HTMLHeadingElement
let apisList = document.getElementById("apis-list") as HTMLUListElement
let editAppDialog = document.getElementById("edit-app-dialog") as Dialog
let editAppDialogNameTextfield = document.getElementById("edit-app-dialog-name-textfield") as Textfield
let editAppDialogDescriptionTextarea = document.getElementById("edit-app-dialog-description-textarea") as Textarea
let editAppDialogWebLinkTextfield = document.getElementById("edit-app-dialog-weblink-textfield") as Textfield
let editAppDialogGooglePlayLinkTextfield = document.getElementById("edit-app-dialog-googleplaylink-textfield") as Textfield
let editAppDialogMicrosoftStoreLinkTextfield = document.getElementById("edit-app-dialog-microsoftstorelink-textfield") as Textfield
let publishAppDialog = document.getElementById("publish-app-dialog") as Dialog
let publishAppDialogText = document.getElementById("publish-app-dialog-text") as HTMLParagraphElement

let app: App
let editAppDialogName = ""
let editAppDialogDescription = ""
let editAppDialogWebLink = ""
let editAppDialogGooglePlayLink = ""
let editAppDialogMicrosoftStoreLink = ""

async function main() {
	initDav()
	await userLoadedPromiseHolder.AwaitResult()

	if (!Dav.isLoggedIn || !Dav.user.Dev) {
		window.location.href = "/"
		return
	}

	// Get the app id
	let urlPathParts = window.location.pathname.split('/')
	let appId = +urlPathParts[urlPathParts.length - 1]

	// Get the app
	let response: ApiResponse<App> | ApiErrorResponse = await AppsController.GetApp({ id: appId })

	if (response.status == 200) {
		app = (response as ApiResponse<App>).data
	} else {
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

	editAppDialogDescriptionTextarea.addEventListener("change", (event: Event) => {
		editAppDialogDescription = (event as CustomEvent).detail.value
		hideEditAppDialogErrors()
	})

	editAppDialogWebLinkTextfield.addEventListener("change", (event: Event) => {
		editAppDialogWebLink = (event as CustomEvent).detail.value
		hideEditAppDialogErrors()
	})

	editAppDialogGooglePlayLinkTextfield.addEventListener("change", (event: Event) => {
		editAppDialogGooglePlayLink = (event as CustomEvent).detail.value
		hideEditAppDialogErrors()
	})

	editAppDialogMicrosoftStoreLinkTextfield.addEventListener("change", (event: Event) => {
		editAppDialogMicrosoftStoreLink = (event as CustomEvent).detail.value
		hideEditAppDialogErrors()
	})
}

function setStrings() {
	statisticsButton.innerText = locale.statistics
	editButton.innerText = locale.edit
	publishedHeader.innerText = locale.published
	tablesHeader.innerText = locale.tables
	apisHeader.innerText = locale.apis
	editAppDialogNameTextfield.label = locale.editAppDialog.nameTextfieldLabel
	editAppDialogNameTextfield.placeholder = locale.editAppDialog.nameTextfieldPlaceholder
	editAppDialogDescriptionTextarea.label = locale.editAppDialog.descriptionTextfieldLabel
	editAppDialogDescriptionTextarea.placeholder = locale.editAppDialog.descriptionTextfieldPlaceholder
	editAppDialogWebLinkTextfield.label = locale.editAppDialog.webLinkTextfieldLabel
	editAppDialogWebLinkTextfield.placeholder = locale.editAppDialog.webLinkTextfieldPlaceholder
	editAppDialogGooglePlayLinkTextfield.label = locale.editAppDialog.googlePlayLinkTextfieldLabel
	editAppDialogGooglePlayLinkTextfield.placeholder = locale.editAppDialog.googlePlayLinkTextfieldPlaceholder
	editAppDialogMicrosoftStoreLinkTextfield.label = locale.editAppDialog.microsoftStoreLinkTextfieldLabel
	editAppDialogMicrosoftStoreLinkTextfield.placeholder = locale.editAppDialog.microsoftStoreLinkTextfieldPlaceholder
}

function navigateBack() {
	// Redirect to the Dev page
	window.location.href = "/dev"
}

function navigateToStatisticsPage() {
	window.location.href = `/dev/${app.Id}/statistics`
}

function showEditAppDialog() {
	editAppDialog.header = locale.editAppDialog.header
	editAppDialog.primaryButtonText = locale.save
	editAppDialog.defaultButtonText = locale.cancel

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
		editAppDialogNameTextfield.errorMessage = locale.editAppDialog.errors.nameTooShort
		return
	} else if (editAppDialogDescription.length == 0) {
		editAppDialogDescriptionTextarea.errorMessage = locale.editAppDialog.errors.descriptionTooShort
		return
	}

	editAppDialog.loading = true

	let response = await AppsController.UpdateApp({
		id: app.Id,
		name: editAppDialogName,
		description: editAppDialogDescription,
		webLink: editAppDialogWebLink,
		googlePlayLink: editAppDialogGooglePlayLink,
		microsoftStoreLink: editAppDialogMicrosoftStoreLink
	})

	editAppDialog.loading = false

	if (response.status == 200) {
		let responseData = (response as ApiResponse<App>).data

		app.Name = responseData.Name
		app.Description = responseData.Description
		app.WebLink = responseData.WebLink
		app.GooglePlayLink = responseData.GooglePlayLink
		app.MicrosoftStoreLink = responseData.MicrosoftStoreLink

		header.header = responseData.Name
		description.innerText = responseData.Description

		editAppDialog.visible = false
	} else {
		let errors = (response as ApiErrorResponse).errors

		for (let error of errors) {
			let errorCode = error.code

			switch (errorCode) {
				case ErrorCodes.NameTooShort:
					editAppDialogNameTextfield.errorMessage = locale.editAppDialog.errors.nameTooShort
					break
				case ErrorCodes.DescriptionTooShort:
					editAppDialogDescriptionTextarea.errorMessage = locale.editAppDialog.errors.descriptionTooShort
					break
				case ErrorCodes.NameTooLong:
					editAppDialogNameTextfield.errorMessage = locale.editAppDialog.errors.nameTooLong
					break
				case ErrorCodes.DescriptionTooLong:
					editAppDialogDescriptionTextarea.errorMessage = locale.editAppDialog.errors.descriptionTooLong
					break
				case ErrorCodes.WebLinkInvalid:
					editAppDialogWebLinkTextfield.errorMessage = locale.editAppDialog.errors.linkInvalid
					break
				case ErrorCodes.GooglePlayLinkInvalid:
					editAppDialogGooglePlayLinkTextfield.errorMessage = locale.editAppDialog.errors.linkInvalid
					break
				case ErrorCodes.MicrosoftStoreLinkInvalid:
					editAppDialogMicrosoftStoreLinkTextfield.errorMessage = locale.editAppDialog.errors.linkInvalid
					break
				default:
					if (errors.length == 1) {
						editAppDialogNameTextfield.errorMessage = locale.editAppDialog.errors.unexpectedError.replace('{0}', errorCode.toString())
					}
					break
			}
		}
	}
}

function showPublishAppDialog() {
	publishAppDialog.header = app.Published ? locale.publishAppDialog.unpublishHeader : locale.publishAppDialog.publishHeader
	publishAppDialog.primaryButtonText = locale.publishAppDialog.confirm
	publishAppDialog.defaultButtonText = locale.cancel
	publishAppDialogText.innerText = app.Published ? locale.publishAppDialog.unpublishSubtext : locale.publishAppDialog.publishSubtext
	publishAppDialog.visible = true
}

function hidePublishAppDialog() {
	publishAppDialog.visible = false
}

async function publishUnpublishApp() {
	publishAppDialog.loading = true

	let response = await AppsController.UpdateApp({
		id: app.Id,
		published: !app.Published
	})

	if (response.status == 200) {
		let responseData = (response as ApiResponse<App>).data
		app.Published = responseData.Published
		publishedToggle.checked = responseData.Published
	}

	publishAppDialog.loading = false
	publishAppDialog.visible = false
}

setStrings()
setEventListeners()
main()