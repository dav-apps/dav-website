import axios from "axios"
import { MDCSnackbar } from "@material/snackbar"
import Cropper from "cropperjs"
import { ErrorCode, Plan, PromiseHolder } from "dav-js"
import "dav-ui-components"
import {
	Button,
	Dialog,
	MessageBar,
	ProgressRing,
	Sidenav,
	SidenavItem,
	Textfield
} from "dav-ui-components"
import { SidenavMode } from "dav-ui-components/src/types"
import "../../components/navbar-component/navbar-component"
import {
	showElement,
	hideElement,
	handleExpiredSessionError
} from "../../utils"
import { getLocale } from "../../locales"

const maxProfileImageFileSize = 2000000

let sidenav: Sidenav
let sidenavButton: HTMLButtonElement
let generalSidenavItem: SidenavItem
let plansSidenavItem: SidenavItem
let generalContainer: HTMLDivElement
let plansContainer: HTMLDivElement
let snackbarLabel: HTMLDivElement
let expiredSessionDialog: Dialog

let locale = getLocale(navigator.language).userPage
let snackbar: MDCSnackbar
let csrfToken: string

//#region General page variables
let errorMessageBarGeneral: MessageBar
let successMessageBarGeneral: MessageBar
let warningMessageBarGeneral: MessageBar
let sendConfirmationEmailLink: HTMLAnchorElement
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

//#region Plans page variables
let errorMessageBarPlans: MessageBar
let successMessageBarPlans: MessageBar
let paymentMethodCard: HTMLDivElement
let paymentMethodButton: Button
let paymentMethodButtonProgressRing: ProgressRing
let subscriptionCard: HTMLDivElement
let subscriptionCardHeader: HTMLHeadingElement
let subscriptionCardPeriodEndDate: HTMLParagraphElement
let cancelContinueSubscriptionButton: Button
let cancelContinueSubscriptionButtonProgressRing: ProgressRing
let plansTableContainer: HTMLDivElement
let plansTable: HTMLTableElement
let plansTableMobileContainer: HTMLDivElement
let plansTableMobileFree: HTMLTableElement
let plansTableMobilePlus: HTMLTableElement
let plansTableMobilePro: HTMLTableElement
let plansTableFreeButtonProgressRing: ProgressRing
let plansTablePlusButtonProgressRing: ProgressRing
let plansTableProButtonProgressRing: ProgressRing
let plansTableMobileFreeButtonProgressRing: ProgressRing
let plansTableMobilePlusButtonProgressRing: ProgressRing
let plansTableMobileProButtonProgressRing: ProgressRing
let plansTableFreeButtonContainer: HTMLDivElement
let plansTablePlusButtonContainer: HTMLDivElement
let plansTableProButtonContainer: HTMLDivElement
let plansTableMobileFreeButtonContainer: HTMLTableCellElement
let plansTableMobilePlusButtonContainer: HTMLTableCellElement
let plansTableMobileProButtonContainer: HTMLTableCellElement
let plansTableFreeCurrentPlanButton: HTMLButtonElement
let plansTableFreeDowngradeButton: HTMLButtonElement
let plansTablePlusUpgradeButton: HTMLButtonElement
let plansTablePlusCurrentPlanButton: HTMLButtonElement
let plansTablePlusDowngradeButton: HTMLButtonElement
let plansTableProUpgradeButton: HTMLButtonElement
let plansTableProCurrentPlanButton: HTMLButtonElement
let plansTableMobileFreeCurrentPlanButton: HTMLButtonElement
let plansTableMobileFreeDowngradeButton: HTMLButtonElement
let plansTableMobilePlusUpgradeButton: HTMLButtonElement
let plansTableMobilePlusCurrentPlanButton: HTMLButtonElement
let plansTableMobilePlusDowngradeButton: HTMLButtonElement
let plansTableMobileProUpgradeButton: HTMLButtonElement
let plansTableMobileProCurrentPlanButton: HTMLButtonElement
let changePlanDialog: Dialog
let changePlanDialogDescription: HTMLParagraphElement

let changePlanDialogPrimaryButtonClickPromiseHolder: PromiseHolder<boolean> =
	new PromiseHolder()
//#endregion

window.addEventListener("resize", setSize)
window.addEventListener("load", main)

async function main() {
	sidenav = document.getElementById("sidenav") as Sidenav
	sidenavButton = document.getElementById(
		"sidenav-button"
	) as HTMLButtonElement
	generalSidenavItem = document.getElementById(
		"general-sidenav-item"
	) as SidenavItem
	plansSidenavItem = document.getElementById(
		"plans-sidenav-item"
	) as SidenavItem
	generalContainer = document.getElementById(
		"general-container"
	) as HTMLDivElement
	plansContainer = document.getElementById("plans-container") as HTMLDivElement
	snackbarLabel = document.getElementById("snackbar-label") as HTMLDivElement
	expiredSessionDialog = document.getElementById(
		"expired-session-dialog"
	) as Dialog

	errorMessageBarGeneral = document.getElementById(
		"error-message-bar-general"
	) as MessageBar
	successMessageBarGeneral = document.getElementById(
		"success-message-bar-general"
	) as MessageBar
	warningMessageBarGeneral = document.getElementById(
		"warning-message-bar-general"
	) as MessageBar
	sendConfirmationEmailLink = document.getElementById(
		"send-confirmation-email-link"
	) as HTMLAnchorElement
	profileImageProgressRing = document.getElementById(
		"profile-image-progress-ring"
	) as ProgressRing
	profileImage = document.getElementById("profile-image") as HTMLImageElement
	uploadProfileImageButton = document.getElementById(
		"upload-profile-image-button"
	) as Button
	profileImageDialog = document.getElementById(
		"profile-image-dialog"
	) as Dialog
	profileImageDialogImage = document.getElementById(
		"profile-image-dialog-image"
	) as HTMLImageElement
	firstNameTextfield = document.getElementById(
		"first-name-textfield"
	) as Textfield
	firstNameSaveButton = document.getElementById(
		"first-name-save-button"
	) as HTMLButtonElement
	firstNameProgressRing = document.getElementById(
		"first-name-progress-ring"
	) as ProgressRing
	emailTextfield = document.getElementById("email-textfield") as Textfield
	emailSaveButton = document.getElementById(
		"email-save-button"
	) as HTMLButtonElement
	emailProgressRing = document.getElementById(
		"email-progress-ring"
	) as ProgressRing
	passwordTextfield = document.getElementById(
		"password-textfield"
	) as Textfield
	passwordConfirmationTextfield = document.getElementById(
		"password-confirmation-textfield"
	) as Textfield
	passwordSaveButton = document.getElementById(
		"password-save-button"
	) as Button
	passwordProgressRing = document.getElementById(
		"password-progress-ring"
	) as ProgressRing

	errorMessageBarPlans = document.getElementById(
		"error-message-bar-plans"
	) as MessageBar
	successMessageBarPlans = document.getElementById(
		"success-message-bar-plans"
	) as MessageBar
	paymentMethodCard = document.getElementById(
		"payment-method-card"
	) as HTMLDivElement
	paymentMethodButton = document.getElementById(
		"payment-method-button"
	) as Button
	paymentMethodButtonProgressRing = document.getElementById(
		"payment-method-button-progress-ring"
	) as ProgressRing
	subscriptionCard = document.getElementById(
		"subscription-card"
	) as HTMLDivElement
	subscriptionCardHeader = document.getElementById(
		"subscription-card-header"
	) as HTMLHeadingElement
	subscriptionCardPeriodEndDate = document.getElementById(
		"subscription-card-period-end-date"
	) as HTMLParagraphElement
	cancelContinueSubscriptionButton = document.getElementById(
		"cancel-continue-subscription-button"
	) as Button
	cancelContinueSubscriptionButtonProgressRing = document.getElementById(
		"cancel-continue-subscription-button-progress-ring"
	) as ProgressRing
	plansTableContainer = document.getElementById(
		"plans-table-container"
	) as HTMLDivElement
	plansTable = document.getElementById("plans-table") as HTMLTableElement
	plansTableMobileContainer = document.getElementById(
		"plans-table-mobile-container"
	) as HTMLDivElement
	plansTableMobileFree = document.getElementById(
		"plans-table-mobile-free"
	) as HTMLTableElement
	plansTableMobilePlus = document.getElementById(
		"plans-table-mobile-plus"
	) as HTMLTableElement
	plansTableMobilePro = document.getElementById(
		"plans-table-mobile-pro"
	) as HTMLTableElement
	plansTableFreeButtonProgressRing = document.getElementById(
		"plans-table-free-button-progress-ring"
	) as ProgressRing
	plansTablePlusButtonProgressRing = document.getElementById(
		"plans-table-plus-button-progress-ring"
	) as ProgressRing
	plansTableProButtonProgressRing = document.getElementById(
		"plans-table-pro-button-progress-ring"
	) as ProgressRing
	plansTableMobileFreeButtonProgressRing = document.getElementById(
		"plans-table-mobile-free-button-progress-ring"
	) as ProgressRing
	plansTableMobilePlusButtonProgressRing = document.getElementById(
		"plans-table-mobile-plus-button-progress-ring"
	) as ProgressRing
	plansTableMobileProButtonProgressRing = document.getElementById(
		"plans-table-mobile-pro-button-progress-ring"
	) as ProgressRing
	plansTableFreeButtonContainer = document.getElementById(
		"plans-table-free-button-container"
	) as HTMLDivElement
	plansTablePlusButtonContainer = document.getElementById(
		"plans-table-plus-button-container"
	) as HTMLDivElement
	plansTableProButtonContainer = document.getElementById(
		"plans-table-pro-button-container"
	) as HTMLDivElement
	plansTableMobileFreeButtonContainer = document.getElementById(
		"plans-table-mobile-free-button-container"
	) as HTMLTableCellElement
	plansTableMobilePlusButtonContainer = document.getElementById(
		"plans-table-mobile-plus-button-container"
	) as HTMLTableCellElement
	plansTableMobileProButtonContainer = document.getElementById(
		"plans-table-mobile-pro-button-container"
	) as HTMLTableCellElement
	plansTableFreeCurrentPlanButton = document.getElementById(
		"plans-table-free-current-plan-button"
	) as HTMLButtonElement
	plansTableFreeDowngradeButton = document.getElementById(
		"plans-table-free-downgrade-button"
	) as HTMLButtonElement
	plansTablePlusUpgradeButton = document.getElementById(
		"plans-table-plus-upgrade-button"
	) as HTMLButtonElement
	plansTablePlusCurrentPlanButton = document.getElementById(
		"plans-table-plus-current-plan-button"
	) as HTMLButtonElement
	plansTablePlusDowngradeButton = document.getElementById(
		"plans-table-plus-downgrade-button"
	) as HTMLButtonElement
	plansTableProUpgradeButton = document.getElementById(
		"plans-table-pro-upgrade-button"
	) as HTMLButtonElement
	plansTableProCurrentPlanButton = document.getElementById(
		"plans-table-pro-current-plan-button"
	) as HTMLButtonElement
	plansTableMobileFreeCurrentPlanButton = document.getElementById(
		"plans-table-mobile-free-current-plan-button"
	) as HTMLButtonElement
	plansTableMobileFreeDowngradeButton = document.getElementById(
		"plans-table-mobile-free-downgrade-button"
	) as HTMLButtonElement
	plansTableMobilePlusUpgradeButton = document.getElementById(
		"plans-table-mobile-plus-upgrade-button"
	) as HTMLButtonElement
	plansTableMobilePlusCurrentPlanButton = document.getElementById(
		"plans-table-mobile-plus-current-plan-button"
	) as HTMLButtonElement
	plansTableMobilePlusDowngradeButton = document.getElementById(
		"plans-table-mobile-plus-downgrade-button"
	) as HTMLButtonElement
	plansTableMobileProUpgradeButton = document.getElementById(
		"plans-table-mobile-pro-upgrade-button"
	) as HTMLButtonElement
	plansTableMobileProCurrentPlanButton = document.getElementById(
		"plans-table-mobile-pro-current-plan-button"
	) as HTMLButtonElement
	changePlanDialog = document.getElementById("change-plan-dialog") as Dialog
	changePlanDialogDescription = document.getElementById(
		"change-plan-dialog-description"
	) as HTMLParagraphElement

	let snackbarElement = document.querySelector(".mdc-snackbar")
	if (snackbarElement != null) snackbar = new MDCSnackbar(snackbarElement)
	initialProfileImageSrc = profileImage.src
	initialFirstName = firstNameTextfield.value
	initialEmail = emailTextfield.value

	// Get the CSRF token
	csrfToken =
		document
			?.querySelector(`meta[name="csrf-token"]`)
			?.getAttribute("content") ?? ""

	setEventListeners()
	setSize()
	displayPage(true)
}

function setEventListeners() {
	//#region General event listeners
	window.addEventListener("hashchange", () => displayPage())
	sidenav.addEventListener("dismiss", () => (sidenav.open = false))
	sidenavButton.addEventListener("click", sidenavButtonClick)
	generalSidenavItem.addEventListener(
		"click",
		() => (window.location.href = "/user#general")
	)
	plansSidenavItem.addEventListener(
		"click",
		() => (window.location.href = "/user#plans")
	)
	expiredSessionDialog.addEventListener("primaryButtonClick", () =>
		window.location.reload()
	)
	//#endregion

	//#region General page event listeners
	if (sendConfirmationEmailLink != null) {
		sendConfirmationEmailLink.addEventListener(
			"click",
			sendConfirmationEmailLinkClick
		)
	}
	uploadProfileImageButton.addEventListener(
		"click",
		uploadProfileImageButtonClick
	)
	profileImageDialog.addEventListener(
		"dismiss",
		() => (profileImageDialog.visible = false)
	)
	profileImageDialog.addEventListener(
		"primaryButtonClick",
		profileImageDialogPrimaryButtonClick
	)
	profileImageDialog.addEventListener(
		"defaultButtonClick",
		() => (profileImageDialog.visible = false)
	)
	profileImageDialogImage.addEventListener("load", profileImageDialogImageLoad)
	firstNameTextfield.addEventListener("change", firstNameTextfieldChange)
	firstNameTextfield.addEventListener("enter", firstNameSaveButtonClick)
	firstNameSaveButton.addEventListener("click", firstNameSaveButtonClick)
	emailTextfield.addEventListener("change", emailTextfieldChange)
	emailTextfield.addEventListener("enter", emailSaveButtonClick)
	emailSaveButton.addEventListener("click", emailSaveButtonClick)
	passwordTextfield.addEventListener("change", passwordTextfieldChange)
	passwordConfirmationTextfield.addEventListener(
		"change",
		passwordTextfieldChange
	)
	passwordConfirmationTextfield.addEventListener(
		"enter",
		passwordSaveButtonClick
	)
	passwordSaveButton.addEventListener("click", passwordSaveButtonClick)
	//#endregion

	//#region Plans page event listeners
	if (paymentMethodButton != null) {
		paymentMethodButton.addEventListener("click", paymentMethodButtonClick)
	}
	if (cancelContinueSubscriptionButton != null) {
		cancelContinueSubscriptionButton.addEventListener(
			"click",
			cancelContinueSubscriptionButtonClick
		)
	}
	plansTableFreeDowngradeButton.addEventListener(
		"click",
		plansTableFreeDowngradeButtonClick
	)
	plansTableMobileFreeDowngradeButton.addEventListener(
		"click",
		plansTableFreeDowngradeButtonClick
	)
	plansTablePlusUpgradeButton.addEventListener(
		"click",
		plansTablePlusUpgradeButtonClick
	)
	plansTableMobilePlusUpgradeButton.addEventListener(
		"click",
		plansTablePlusUpgradeButtonClick
	)
	plansTablePlusDowngradeButton.addEventListener(
		"click",
		plansTablePlusDowngradeButtonClick
	)
	plansTableMobilePlusDowngradeButton.addEventListener(
		"click",
		plansTablePlusDowngradeButtonClick
	)
	plansTableProUpgradeButton.addEventListener(
		"click",
		plansTableProUpgradeButtonClick
	)
	plansTableMobileProUpgradeButton.addEventListener(
		"click",
		plansTableProUpgradeButtonClick
	)
	changePlanDialog.addEventListener("dismiss", () =>
		hideChangePlanDialog(false)
	)
	changePlanDialog.addEventListener("primaryButtonClick", () =>
		hideChangePlanDialog(true)
	)
	changePlanDialog.addEventListener("defaultButtonClick", () =>
		hideChangePlanDialog(false)
	)
	//#endregion
}

function setSize() {
	let width = window.innerWidth
	let tableFontSize = width < 1000 ? `${1.05}rem` : `${1.15}rem`
	plansTable.style.fontSize = tableFontSize
	plansTableMobileFree.style.fontSize = tableFontSize
	plansTableMobilePlus.style.fontSize = tableFontSize
	plansTableMobilePro.style.fontSize = tableFontSize

	if (width < 706) {
		if (paymentMethodCard != null) paymentMethodCard.classList.add("mb-3")
		if (subscriptionCard != null) subscriptionCard.classList.add("mt-3")
	} else {
		if (paymentMethodCard != null) paymentMethodCard.classList.remove("mb-3")
		if (subscriptionCard != null) subscriptionCard.classList.remove("mt-3")
	}

	if (width < 768) {
		showElement(plansTableMobileContainer)
		hideElement(plansTableContainer)
	} else {
		hideElement(plansTableMobileContainer)
		showElement(plansTableContainer)
	}

	if (width < 576) {
		sidenav.mode = SidenavMode.over
		sidenav.open = false
		showElement(sidenavButton)
	} else {
		sidenav.mode = SidenavMode.side
		sidenav.open = true
		hideElement(sidenavButton)
	}
}

function displayPage(initial: boolean = false) {
	if (window.location.hash == "#plans") {
		// Show the plans page
		hideElement(generalContainer)
		showElement(plansContainer)
	} else {
		// Show general settings page
		hideElement(plansContainer)
		showElement(generalContainer)
	}

	if (!initial) {
		// Hide the message bars
		hideElement(
			successMessageBarGeneral,
			errorMessageBarGeneral,
			successMessageBarPlans,
			errorMessageBarPlans
		)
	}

	if (window.innerWidth < 576) {
		sidenav.open = false
	}
}

function sidenavButtonClick() {
	if (window.innerWidth < 576) {
		sidenav.open = true
	}
}

//#region General page event listeners
async function sendConfirmationEmailLinkClick() {
	try {
		await axios({
			method: "post",
			url: "/api/send_confirmation_email",
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		// Show snackbar with success message
		showSnackbar(locale.messages.sendConfirmationEmailMessage)
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showGeneralErrorMessage(
				getErrorMessage(error.response.data.errors[0] as ErrorCode)
			)
		}
	}

	// Hide the message bar
	hideElement(warningMessageBarGeneral)
}

function uploadProfileImageButtonClick() {
	let input = document.createElement("input")
	input.setAttribute("type", "file")
	input.setAttribute("accept", "image/png, image/jpeg")

	input.addEventListener("change", () => {
		let file = input?.files?.item(0)
		if (file == null) return

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

async function profileImageDialogPrimaryButtonClick() {
	profileImageDialog.visible = false

	let canvas = profileImageCropper.getCroppedCanvas()
	let blob = await new Promise<Blob>((r: Function) => {
		canvas.toBlob((blob: Blob | null) => r(blob), "image/jpeg", 0.8)
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
	let readFilePromise: Promise<ProgressEvent> = new Promise(resolve => {
		let fileReader = new FileReader()
		fileReader.onloadend = resolve
		fileReader.readAsArrayBuffer(blob)
	})
	let readFileResult: ProgressEvent = await readFilePromise
	if (readFileResult == null || readFileResult.currentTarget == null) return

	let data = readFileResult.currentTarget["result"]

	// Send the file content to the server
	try {
		await axios({
			method: "put",
			url: "/api/user/profile_image",
			headers: {
				"X-CSRF-TOKEN": csrfToken,
				"Content-Type": blob.type
			},
			data
		})

		showSnackbar(locale.messages.profileImageUpdateMessage)
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showGeneralErrorMessage(
				getErrorMessage(error.response.data.errors[0] as ErrorCode)
			)
			profileImage.src = initialProfileImageSrc
		}
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
			method: "put",
			url: "/api/user",
			headers: {
				"X-CSRF-TOKEN": csrfToken
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
		let userNavLink = document.getElementById(
			"user-nav-link"
		) as HTMLAnchorElement
		if (userNavLink != null) userNavLink.innerText = firstName
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			firstNameTextfield.errorMessage = getErrorMessage(
				error.response.data.errors[0] as ErrorCode
			)
		}
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
			method: "put",
			url: "/api/user",
			headers: {
				"X-CSRF-TOKEN": csrfToken
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
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			emailTextfield.errorMessage = getErrorMessage(
				error.response.data.errors[0] as ErrorCode
			)
		}
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
		passwordConfirmationTextfield.errorMessage =
			locale.errors.passwordConfirmationMissing
		return
	} else if (passwordTextfield.value != passwordConfirmationTextfield.value) {
		passwordConfirmationTextfield.errorMessage =
			locale.errors.passwordConfirmationNotMatching
		return
	}

	passwordTextfield.disabled = true
	passwordConfirmationTextfield.disabled = true
	passwordSaveButton.disabled = true
	showElement(passwordProgressRing)

	try {
		await axios({
			method: "put",
			url: "/api/user",
			headers: {
				"X-CSRF-TOKEN": csrfToken
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
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			passwordTextfield.errorMessage = getErrorMessage(
				error.response.data.errors[0] as ErrorCode
			)
			passwordConfirmationTextfield.value = ""
		}
	}

	passwordTextfield.disabled = false
	passwordConfirmationTextfield.disabled = false
	passwordSaveButton.disabled = false
	hideElement(passwordProgressRing)
}
//#endregion

//#region Plans page event listeners
async function paymentMethodButtonClick() {
	setPaymentMethodButtonDisabled(true)
	setCancelContinueSubscriptionButtonDisabled(true)
	showElement(paymentMethodButtonProgressRing)

	try {
		let response = await axios({
			method: "post",
			url: "/api/customer_portal_session",
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		window.location.href = response.data.sessionUrl
		return
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showPlansErrorMessage(locale.errors.unexpectedErrorLong)
		}
	}

	setPaymentMethodButtonDisabled(false)
	setCancelContinueSubscriptionButtonDisabled(false)
	hideElement(paymentMethodButtonProgressRing)
}

async function cancelContinueSubscriptionButtonClick() {
	setPaymentMethodButtonDisabled(true)
	setCancelContinueSubscriptionButtonDisabled(true)
	disablePlansTableButtons()
	showElement(cancelContinueSubscriptionButtonProgressRing)

	try {
		let response = await axios({
			method: "put",
			url: "/api/subscription/cancel",
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		// Update the UI & show success message
		if (response.data.cancelAtPeriodEnd) {
			subscriptionCardHeader.innerText = locale.plans.subscriptionEnd
			cancelContinueSubscriptionButton.innerText =
				locale.plans.continueSubscription
			showPlansSuccessMessage(
				locale.plans.cancelSubscriptionSuccessMessage.replace(
					"{0}",
					subscriptionCardPeriodEndDate.innerText
				)
			)

			// Disable the buttons in the plans tables
			disablePlansTableButtons()
		} else {
			subscriptionCardHeader.innerText = locale.plans.nextPayment
			cancelContinueSubscriptionButton.innerText =
				locale.plans.cancelSubscription
			showPlansSuccessMessage(
				locale.plans.continueSubscriptionSuccessMessage.replace(
					"{0}",
					subscriptionCardPeriodEndDate.innerText
				)
			)

			// Enable the buttons in the plans tables
			enablePlansTableButtons()
		}
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showPlansErrorMessage(locale.errors.unexpectedErrorLong)
		}
	}

	setPaymentMethodButtonDisabled(false)
	setCancelContinueSubscriptionButtonDisabled(false)
	hideElement(cancelContinueSubscriptionButtonProgressRing)
}

async function plansTableFreeDowngradeButtonClick() {
	setPaymentMethodButtonDisabled(true)
	setCancelContinueSubscriptionButtonDisabled(true)
	showFreeButtonProgressRing()
	disablePlansTableButtons()

	try {
		let response = await axios({
			method: "put",
			url: "/api/subscription/cancel",
			headers: {
				"X-CSRF-TOKEN": csrfToken
			}
		})

		// Update the UI & show success message
		if (response.data.cancelAtPeriodEnd) {
			subscriptionCardHeader.innerText = locale.plans.subscriptionEnd
			cancelContinueSubscriptionButton.innerText =
				locale.plans.continueSubscription
			showPlansSuccessMessage(
				locale.plans.cancelSubscriptionSuccessMessage.replace(
					"{0}",
					subscriptionCardPeriodEndDate.innerText
				)
			)

			// Disable the buttons in the plans tables
			disablePlansTableButtons()
		} else {
			subscriptionCardHeader.innerText = locale.plans.nextPayment
			cancelContinueSubscriptionButton.innerText =
				locale.plans.cancelSubscription
			showPlansSuccessMessage(
				locale.plans.continueSubscriptionSuccessMessage.replace(
					"{0}",
					subscriptionCardPeriodEndDate.innerText
				)
			)

			// Enable the buttons in the plans tables
			enablePlansTableButtons()
		}
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showPlansErrorMessage(locale.errors.unexpectedErrorLong)
		}
	}

	setPaymentMethodButtonDisabled(false)
	setCancelContinueSubscriptionButtonDisabled(false)
	hideFreeButtonProgressRing()
	disablePlansTableButtons()
}

async function plansTablePlusUpgradeButtonClick() {
	showPlusButtonProgressRing()
	disablePlansTableButtons()

	try {
		let response = await createCheckoutSession(Plan.Plus)
		window.location.href = response.data.url
		return
	} catch (error) {
		// Show error message
		if (!handleExpiredSessionError(error, expiredSessionDialog)) {
			showPlansErrorMessage(locale.errors.unexpectedErrorLong)
		}
	}

	hidePlusButtonProgressRing()
	enablePlansTableButtons()
}

async function plansTablePlusDowngradeButtonClick() {
	changePlanDialog.header = locale.plans.changePlanDialog.downgradePlusHeader
	changePlanDialogDescription.innerText =
		locale.plans.changePlanDialog.downgradePlusDescription
	changePlanDialog.visible = true

	changePlanDialogPrimaryButtonClickPromiseHolder.Setup()
	let result =
		await changePlanDialogPrimaryButtonClickPromiseHolder.AwaitResult()

	if (result) {
		showPlusButtonProgressRing()
		disablePlansTableButtons()

		try {
			let response = await axios({
				method: "put",
				url: "/api/subscription",
				headers: {
					"X-CSRF-TOKEN": csrfToken,
					"Content-Type": "application/json"
				},
				data: {
					plan: "PLUS"
				}
			})

			if (response.data.plan == "PLUS") {
				// Update the UI
				hideElement(
					plansTablePlusDowngradeButton,
					plansTableMobilePlusDowngradeButton,
					plansTablePlusUpgradeButton,
					plansTableMobilePlusUpgradeButton,
					plansTableProCurrentPlanButton,
					plansTableMobileProCurrentPlanButton
				)
				showElement(
					plansTablePlusCurrentPlanButton,
					plansTableMobilePlusCurrentPlanButton,
					plansTableProUpgradeButton,
					plansTableMobileProUpgradeButton
				)

				// Show success message
				showPlansSuccessMessage(locale.plans.changePlanSuccessMessage)
			}
		} catch (error) {
			// Show error message
			if (!handleExpiredSessionError(error, expiredSessionDialog)) {
				showPlansErrorMessage(locale.errors.unexpectedErrorLong)
			}
		}
	}

	hidePlusButtonProgressRing()
	enablePlansTableButtons()
}

async function plansTableProUpgradeButtonClick() {
	// Check if the user is on the free plan
	if (!plansTableFreeCurrentPlanButton.classList.contains("d-none")) {
		showProButtonProgressRing()
		disablePlansTableButtons()

		try {
			let response = await createCheckoutSession(Plan.Pro)
			window.location.href = response.data.url
			return
		} catch (error) {
			// Show error message
			if (!handleExpiredSessionError(error, expiredSessionDialog)) {
				showPlansErrorMessage(locale.errors.unexpectedErrorLong)
			}
		}
	} else {
		// Show dialog for upgrading to Pro
		changePlanDialog.header = locale.plans.changePlanDialog.upgradeProHeader
		changePlanDialogDescription.innerText =
			locale.plans.changePlanDialog.upgradeProDescription
		changePlanDialog.visible = true

		changePlanDialogPrimaryButtonClickPromiseHolder.Setup()
		let result =
			await changePlanDialogPrimaryButtonClickPromiseHolder.AwaitResult()

		if (result) {
			showProButtonProgressRing()
			disablePlansTableButtons()

			try {
				let response = await axios({
					method: "put",
					url: "/api/subscription",
					headers: {
						"X-CSRF-TOKEN": csrfToken,
						"Content-Type": "application/json"
					},
					data: {
						plan: "PRO"
					}
				})

				if (response.data.plan == "PRO") {
					// Update the UI
					hideElement(
						plansTablePlusUpgradeButton,
						plansTableMobilePlusUpgradeButton,
						plansTablePlusCurrentPlanButton,
						plansTableMobilePlusCurrentPlanButton,
						plansTableProUpgradeButton,
						plansTableMobileProUpgradeButton
					)
					showElement(
						plansTablePlusDowngradeButton,
						plansTableMobilePlusDowngradeButton,
						plansTableProCurrentPlanButton,
						plansTableMobileProCurrentPlanButton
					)

					// Show success message
					showPlansSuccessMessage(locale.plans.changePlanSuccessMessage)
				}
			} catch (error) {
				// Show error message
				if (!handleExpiredSessionError(error, expiredSessionDialog)) {
					showPlansErrorMessage(locale.errors.unexpectedErrorLong)
				}
			}
		}
	}

	hideProButtonProgressRing()
	enablePlansTableButtons()
}

function hideChangePlanDialog(result: boolean) {
	changePlanDialogPrimaryButtonClickPromiseHolder.Resolve(result)
	changePlanDialog.visible = false
}

async function createCheckoutSession(plan: Plan): Promise<any> {
	return await axios({
		method: "post",
		url: "/api/checkout_session",
		headers: {
			"X-CSRF-TOKEN": csrfToken,
			"Content-Type": "application/json"
		},
		data: {
			plan,
			successUrl: `${window.location.origin}/user?plan=${plan}#plans`,
			cancelUrl: window.location.href
		}
	})
}
//#endregion

function setPaymentMethodButtonDisabled(value: boolean) {
	if (paymentMethodButton != null) {
		paymentMethodButton.disabled = value
	}
}

function setCancelContinueSubscriptionButtonDisabled(value: boolean) {
	if (cancelContinueSubscriptionButton != null) {
		cancelContinueSubscriptionButton.disabled = value
	}
}

function enablePlansTableButtons() {
	plansTableFreeDowngradeButton.disabled = false
	plansTablePlusUpgradeButton.disabled = false
	plansTablePlusDowngradeButton.disabled = false
	plansTableProUpgradeButton.disabled = false
	plansTableMobileFreeDowngradeButton.disabled = false
	plansTableMobilePlusUpgradeButton.disabled = false
	plansTableMobilePlusDowngradeButton.disabled = false
	plansTableMobileProUpgradeButton.disabled = false
}

function disablePlansTableButtons() {
	plansTableFreeDowngradeButton.disabled = true
	plansTablePlusUpgradeButton.disabled = true
	plansTablePlusDowngradeButton.disabled = true
	plansTableProUpgradeButton.disabled = true
	plansTableMobileFreeDowngradeButton.disabled = true
	plansTableMobilePlusUpgradeButton.disabled = true
	plansTableMobilePlusDowngradeButton.disabled = true
	plansTableMobileProUpgradeButton.disabled = true
}

function showFreeButtonProgressRing() {
	showElement(
		plansTableFreeButtonProgressRing,
		plansTableMobileFreeButtonProgressRing
	)

	plansTableFreeButtonContainer.style.marginLeft = "-30px"
	plansTableMobileFreeButtonContainer.style.marginLeft = "-30px"
}

function hideFreeButtonProgressRing() {
	hideElement(
		plansTableFreeButtonProgressRing,
		plansTableMobileFreeButtonProgressRing
	)

	plansTableFreeButtonContainer.style.marginLeft = "0px"
	plansTableMobileFreeButtonContainer.style.marginLeft = "0px"
}

function showPlusButtonProgressRing() {
	showElement(
		plansTablePlusButtonProgressRing,
		plansTableMobilePlusButtonProgressRing
	)

	plansTablePlusButtonContainer.style.marginLeft = "-30px"
	plansTableMobilePlusButtonContainer.style.marginLeft = "-30px"
}

function hidePlusButtonProgressRing() {
	hideElement(
		plansTablePlusButtonProgressRing,
		plansTableMobilePlusButtonProgressRing
	)

	plansTablePlusButtonContainer.style.marginLeft = "0px"
	plansTableMobilePlusButtonContainer.style.marginLeft = "0px"
}

function showProButtonProgressRing() {
	showElement(
		plansTableProButtonProgressRing,
		plansTableMobileProButtonProgressRing
	)

	plansTableProButtonContainer.style.marginLeft = "-30px"
	plansTableMobileProButtonContainer.style.marginLeft = "-30px"
}

function hideProButtonProgressRing() {
	hideElement(
		plansTableProButtonProgressRing,
		plansTableMobileProButtonProgressRing
	)

	plansTableProButtonContainer.style.marginLeft = "0px"
	plansTableMobileProButtonContainer.style.marginLeft = "0px"
}

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

function showPlansSuccessMessage(message: string) {
	successMessageBarPlans.innerText = message
	showElement(successMessageBarPlans)
}

function showPlansErrorMessage(message: string) {
	errorMessageBarPlans.innerText = message
	showElement(errorMessageBarPlans)
}

function getErrorMessage(errorCode: ErrorCode): string {
	switch (errorCode) {
		case "USER_IS_ALREADY_CONFIRMED":
			return locale.errors.emailAlreadyConfirmed
		case "FIRST_NAME_TOO_SHORT":
			return locale.errors.firstNameTooShort
		case "FIRST_NAME_TOO_LONG":
			return locale.errors.firstNameTooLong
		case "PASSWORD_TOO_SHORT":
			return locale.errors.passwordTooShort
		case "PASSWORD_TOO_LONG":
			return locale.errors.passwordTooLong
		case "EMAIL_INVALID":
			return locale.errors.emailInvalid
		case "EMAIL_ALREADY_IN_USE":
			return locale.errors.emailTaken
		default:
			return locale.errors.unexpectedErrorShort.replace("{0}", errorCode)
	}
}
