import { Component, HostListener, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ReadFile } from 'ngx-file-helpers'
import Stripe from 'stripe'
import * as moment from 'moment'
import {
	ApiResponse,
	ApiErrorResponse,
	ErrorCodes,
	User,
	UsersController,
	ProvidersController,
	ProviderResponseData,
	SubscriptionStatus
} from 'dav-js'
import { DropdownOption, DropdownOptionType } from 'dav-ui-components'
import { PaymentFormComponent } from 'src/app/components/payment-form-component/payment-form.component'
import { BankAccountFormComponent } from 'src/app/components/bank-account-form-component/bank-account-form.component'
import { DataService, SetTextFieldAutocomplete, StripeApiResponse } from 'src/app/services/data-service'
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service'
import { environment } from 'src/environments/environment'
import { enUS } from 'src/locales/locales'

const maxProfileImageFileSize = 2000000
const snackBarDuration = 3000
const plansHash = "plans"
const appsHash = "apps"
const providerHash = "provider"

@Component({
	templateUrl: './user-page.component.html',
	styleUrls: ['./user-page.component.scss']
})
export class UserPageComponent {
	locale = enUS.userPage
	paymentFormDialogLocale = enUS.misc.paymentFormDialog
	pricingLocale = enUS.misc.pricing

	selectedMenu: Menu = Menu.General
	sideNavHidden: boolean = false
	sideNavOpened: boolean = false

	//#region General page
	updatedAttribute: UserAttribute = UserAttribute.FirstName
	profileImageContent: string = this.dataService.dav.user.ProfileImage
	firstName: string = ""
	email: string = ""
	newEmail: string = ""
	password: string = ""
	passwordConfirmation: string = ""
	passwordConfirmationVisible: boolean = false

	successMessage: string = ""
	errorMessage: string = ""
	firstNameErrorMessage: string = ""
	emailErrorMessage: string = ""
	passwordErrorMessage: string = ""

	profileImageLoading: boolean = false
	firstNameLoading: boolean = false
	emailLoading: boolean = false
	passwordLoading: boolean = false
	//#endregion

	//#region Plans page
	paymentMethod: Promise<any> = new Promise((resolve) => this.paymentMethodResolve = resolve)
	paymentMethodResolve: Function
	hasPaymentMethod: boolean = false
	paymentMethodLast4: string
	paymentMethodExpirationMonth: string
	paymentMethodExpirationYear: string
	periodEndDate: string
	continueOrCancelSubscriptionLoading: boolean = false

	selectedPlan: number = -1
	freePlanLoading: boolean = false
	plusPlanLoading: boolean = false
	proPlanLoading: boolean = false

	@ViewChild('paymentForm', { static: false }) paymentForm: PaymentFormComponent
	paymentFormDialogVisible: boolean = false
	paymentFormDialogLoading: boolean = false
	changePlanAfterPaymentMethodUpdated: boolean = false

	changePlanDialogVisible: boolean = false
	changePlanDialogTitle: string = this.pricingLocale.changePlanDialog.upgradePlusTitle
	changePlanDialogDescription: string = this.pricingLocale.changePlanDialog.upgradePlusDescription
	//#endregion

	//#region Apps page
	usedStoragePercent: number = 0
	appsUsedStoragePercent: number[] = []
	//#endregion

	//#region Provider page
	@ViewChild('bankAccountForm', { static: false }) bankAccountForm: BankAccountFormComponent
	providerStripeAccountId: string = null
	providerStripeAccount: Stripe.Account = null
	providerStripeBalance: string
	providerBankAccount: Stripe.BankAccount = null
	startStripeSetupDialogVisible: boolean = false
	startStripeSetupDialogLoading: boolean = false
	startStripeSetupDialogDropdownOptions: DropdownOption[] = []
	startStripeSetupDialogDropdownSelectedKey: string = "us"
	bankAccountDialogVisible: boolean = false
	bankAccountDialogLoading: boolean = false
	//#endregion

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private snackBar: MatSnackBar,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().userPage
		this.paymentFormDialogLocale = this.dataService.GetLocale().misc.paymentFormDialog
		this.pricingLocale = this.dataService.GetLocale().misc.pricing
		moment.locale(this.dataService.locale)

		this.activatedRoute.fragment.subscribe((value) => {
			switch (value) {
				case plansHash:
					this.ShowPlansMenu()
					break
				case appsHash:
					this.ShowAppsMenu()
					break
				case providerHash:
					this.ShowProviderMenu()
					break
				default:
					this.ShowGeneralMenu()
					break
			}
		})
	}

	async ngOnInit() {
		this.setSize()

		await this.dataService.userPromise
		if (!this.dataService.dav.isLoggedIn) {
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage
			this.router.navigate(['/'])
			return
		}

		this.profileImageContent = this.dataService.dav.user.ProfileImage
		this.UpdateValues()
		this.dataService.userDownloadPromise.then(() => this.UpdateValues())
	}

	ngAfterViewInit() {
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('first-name-textfield', 'given-name')
			SetTextFieldAutocomplete('email-textfield', 'email')
			SetTextFieldAutocomplete('password-textfield', 'new-password')
		}, 1)
	}

	@HostListener('window:resize')
	onResize() {
		this.setSize()
	}

	setSize() {
		this.sideNavHidden = window.outerWidth < 576

		if (!this.sideNavHidden) this.sideNavOpened = true
		else this.sideNavOpened = false
	}

	UpdateValues() {
		// Set the values for the text fields
		this.firstName = this.dataService.dav.user.FirstName
		this.email = this.dataService.dav.user.Email

		this.UpdateUsedStoragePercent()
	}

	ShowGeneralMenu() {
		if (this.selectedMenu == Menu.General) return
		this.selectedMenu = Menu.General
		if (this.sideNavHidden) this.sideNavOpened = false

		this.ClearMessages()
		this.firstName = this.dataService.dav.user.FirstName
		this.email = this.dataService.dav.user.Email
		this.password = ""
		this.passwordConfirmation = ""
		this.passwordConfirmationVisible = false

		this.router.navigateByUrl('user')
	}

	ShowPlansMenu() {
		if (this.selectedMenu == Menu.Plans) return
		this.selectedMenu = Menu.Plans
		if (this.sideNavHidden) this.sideNavOpened = false
		this.ClearMessages()

		this.router.navigateByUrl(`user#${plansHash}`)

		this.LoadSubscriptionData()
	}

	ShowAppsMenu() {
		if (this.selectedMenu == Menu.Apps) return
		this.selectedMenu = Menu.Apps
		if (this.sideNavHidden) this.sideNavOpened = false
		this.ClearMessages()

		this.router.navigateByUrl(`user#${appsHash}`)
	}

	async ShowProviderMenu() {
		if (this.selectedMenu == Menu.Provider) return
		this.selectedMenu = Menu.Provider
		if (this.sideNavHidden) this.sideNavOpened = false
		this.ClearMessages()
		this.InitStartStripeSetupDialogCountriesDropdown()

		this.router.navigateByUrl(`user#${providerHash}`)

		await this.dataService.userPromise
		if (!this.dataService.dav.user.Provider) {
			// Wait for the update of the user from the server
			await this.dataService.userDownloadPromise

			// Return if the user is still not a provider
			if (!this.dataService.dav.user.Provider) return
		}

		await this.GetUserProvider()
		await this.GetStripeData()
	}

	async UpdateProfileImage(file: ReadFile) {
		if (file.size > maxProfileImageFileSize) {
			this.errorMessage = this.locale.errors.profileImageFileTooLarge
			return
		}
		this.ClearMessages()

		this.updatedAttribute = UserAttribute.ProfileImage
		this.profileImageLoading = true
		this.profileImageContent = file.content

		// Send the file content to the server
		this.UpdateUserResponse(
			await UsersController.SetProfileImageOfUser({
				file: new Blob([file.underlyingFile], { type: file.type })
			})
		)
	}

	async SaveFirstName() {
		if (!(this.firstName != this.dataService.dav.user.FirstName && this.firstName.length >= 2 && this.firstName.length <= 25)) return

		this.updatedAttribute = UserAttribute.FirstName
		this.firstNameLoading = true
		this.UpdateUserResponse(
			await UsersController.UpdateUser({
				firstName: this.firstName
			})
		)
	}

	async SaveEmail() {
		if (!(this.email != this.dataService.dav.user.Email && this.email != this.newEmail && this.email.length > 3 && this.email.includes('@'))) return

		this.updatedAttribute = UserAttribute.Email
		this.emailLoading = true
		this.UpdateUserResponse(
			await UsersController.UpdateUser({
				email: this.email
			})
		)
	}

	async SavePassword() {
		if (!(this.password.length >= 7 && this.password.length <= 25 && this.password == this.passwordConfirmation)) return

		this.updatedAttribute = UserAttribute.Password
		this.passwordLoading = true
		this.UpdateUserResponse(
			await UsersController.UpdateUser({
				password: this.password
			})
		)
	}

	async LoadSubscriptionData() {
		await this.dataService.userPromise

		// Get the payment method
		if (
			this.dataService.dav.isLoggedIn
			&& this.dataService.dav.user.StripeCustomerId != null
		) {
			this.GetStripePaymentMethodResponse(
				await this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, { customerId: this.dataService.dav.user.StripeCustomerId })
			)
		} else {
			this.paymentMethodResolve()
		}

		if (this.dataService.dav.user.Plan > 0 && this.dataService.dav.user.PeriodEnd) {
			// Show the date of the next payment or the subscription end
			this.periodEndDate = moment(this.dataService.dav.user.PeriodEnd).format('LL')
		}
	}

	SetStripeSubscriptionResponse(message: StripeApiResponse) {
		if (message.success) {
			if (this.selectedPlan == 0) {
				// Set the subscription status of the user
				this.errorMessage = ""
				this.successMessage = this.pricingLocale.cancelSubscriptionSuccessMessage.replace('{0}', this.periodEndDate)
				this.dataService.dav.user.SubscriptionStatus = SubscriptionStatus.Ending
			} else {
				// Set the plan of the user
				this.errorMessage = ""
				this.successMessage = this.pricingLocale.changePlanSuccessMessage
				this.dataService.dav.user.Plan = this.selectedPlan
			}

			// Show the date of the next payment or the subscription end
			this.dataService.dav.user.PeriodEnd = new Date(message.response.current_period_end * 1000)
			this.periodEndDate = moment(this.dataService.dav.user.PeriodEnd).format('LL')
		} else {
			// Show error
			this.successMessage = ""
			this.errorMessage = this.pricingLocale.unexpectedError.replace('{0}', message.response.code)
		}

		this.freePlanLoading = false
		this.plusPlanLoading = false
		this.proPlanLoading = false
	}

	SetStripeSubscriptionCancelledResponse(message: StripeApiResponse) {
		this.continueOrCancelSubscriptionLoading = false

		if (message.success) {
			this.errorMessage = ""
			this.successMessage = (this.dataService.dav.user.SubscriptionStatus == 0 ? this.pricingLocale.cancelSubscriptionSuccessMessage : this.pricingLocale.continueSubscriptionSuccessMessage).replace('{0}', this.periodEndDate)
			this.dataService.dav.user.SubscriptionStatus = this.dataService.dav.user.SubscriptionStatus == 0 ? 1 : 0
		} else {
			this.successMessage = ""
			this.errorMessage = this.pricingLocale.unexpectedError.replace('{0}', message.response.code)
		}
	}

	GetStripePaymentMethodResponse(message: StripeApiResponse) {
		if (message.success) {
			this.paymentMethodResolve(message.response)
			if (message.response == null) return
			this.hasPaymentMethod = true

			// Get last 4 and expiration date to show at the top of the page
			this.paymentMethodLast4 = message.response.card.last4
			this.paymentMethodExpirationMonth = message.response.card.exp_month.toString()
			this.paymentMethodExpirationYear = message.response.card.exp_year.toString().substring(2)

			if (this.paymentMethodExpirationMonth.length == 1) {
				this.paymentMethodExpirationMonth = "0" + this.paymentMethodExpirationMonth
			}
		} else {
			this.successMessage = ""
			this.errorMessage = this.pricingLocale.unexpectedError.replace('{0}', message.response.code)
		}
	}

	async ContinueOrCancelButtonClick() {
		this.continueOrCancelSubscriptionLoading = true

		this.SetStripeSubscriptionCancelledResponse(
			await this.websocketService.Emit(WebsocketCallbackType.SetStripeSubscriptionCancelled, {
				customerId: this.dataService.dav.user.StripeCustomerId,
				cancel: this.dataService.dav.user.SubscriptionStatus == 0
			})
		)
	}

	async PlanButtonClick(plan: number) {
		this.selectedPlan = plan
		await this.paymentMethod

		if (!this.hasPaymentMethod) {
			// Show the payment form
			this.changePlanAfterPaymentMethodUpdated = true
			this.ShowPaymentMethodDialog()
		} else {
			this.changePlanAfterPaymentMethodUpdated = false

			// Update the values of the change plan dialog
			switch (this.selectedPlan) {
				case 2:
					// upgradePro
					this.changePlanDialogTitle = this.pricingLocale.changePlanDialog.upgradeProTitle
					this.changePlanDialogDescription = this.pricingLocale.changePlanDialog.upgradeProDescription
					break
				case 1:
					if (this.dataService.dav.user.Plan == 2) {
						// downgradePlus
						this.changePlanDialogTitle = this.pricingLocale.changePlanDialog.downgradePlusTitle
						this.changePlanDialogDescription = this.pricingLocale.changePlanDialog.downgradePlusDescription
					} else {
						// upgradePlus
						this.changePlanDialogTitle = this.pricingLocale.changePlanDialog.upgradePlusTitle
						this.changePlanDialogDescription = this.pricingLocale.changePlanDialog.upgradePlusDescription
					}
					break
				default:
					// downgradeFree
					this.changePlanDialogTitle = this.pricingLocale.changePlanDialog.downgradeFreeTitle
					this.changePlanDialogDescription = this.pricingLocale.changePlanDialog.downgradeFreeDescription
					break
			}

			// Show the upgrade dialog
			this.changePlanDialogVisible = true
		}
	}

	async SetStripeSubscription() {
		this.changePlanDialogVisible = false
		switch (this.selectedPlan) {
			case 0:
				this.freePlanLoading = true
				this.plusPlanLoading = false
				this.proPlanLoading = false
				break
			case 1:
				this.freePlanLoading = false
				this.plusPlanLoading = true
				this.proPlanLoading = false
				break
			case 2:
				this.freePlanLoading = false
				this.plusPlanLoading = false
				this.proPlanLoading = true
				break
		}

		let planId = null
		if (this.selectedPlan == 1) planId = environment.stripeDavPlusEurPlanId
		else if (this.selectedPlan == 2) planId = environment.stripeDavProEurPlanId

		this.SetStripeSubscriptionResponse(
			await this.websocketService.Emit(WebsocketCallbackType.SetStripeSubscription, {
				customerId: this.dataService.dav.user.StripeCustomerId,
				planId
			})
		)
	}

	ShowPaymentMethodDialog() {
		this.paymentFormDialogVisible = true
		setTimeout(() => this.paymentForm.Init(), 1)
	}

	SavePaymentMethod() {
		this.paymentForm.SaveCard()
	}

	async PaymentMethodChanged() {
		this.paymentFormDialogVisible = false

		if (this.changePlanAfterPaymentMethodUpdated) {
			// Upgrade or downgrade the plan of the user
			await this.SetStripeSubscription()
		} else {
			this.errorMessage = ""
			this.successMessage = this.pricingLocale.changePaymentMethodSuccessMessage
		}

		await this.LoadSubscriptionData()
	}

	SendConfirmationEmail() {
		this.websocketService.Emit(
			WebsocketCallbackType.SendConfirmationEmail,
			{ userId: this.dataService.dav.user.Id }
		).then((response: ApiResponse<{}> | ApiErrorResponse) => {
			this.SendConfirmationEmailResponse(response)
		})

		return false
	}

	InitStartStripeSetupDialogCountriesDropdown() {
		// Add the countries options
		this.startStripeSetupDialogDropdownOptions = []

		for (let key of Object.keys(this.locale.provider.countries)) {
			let value = this.locale.provider.countries[key]
			this.startStripeSetupDialogDropdownOptions.push({
				key,
				value,
				type: DropdownOptionType.option
			})
		}

		// Select the appropriate country
		if (this.dataService.locale.toLowerCase() == "de-at") {
			this.startStripeSetupDialogDropdownSelectedKey = "at"
		} else if (this.dataService.locale.startsWith("de")) {
			this.startStripeSetupDialogDropdownSelectedKey = "de"
		} else {
			this.startStripeSetupDialogDropdownSelectedKey = "us"
		}
	}

	StartStripeSetupDialogDropdownChange(key: string) {
		this.startStripeSetupDialogDropdownSelectedKey = key
	}

	async StartStripeProviderSetup() {
		this.startStripeSetupDialogLoading = true
		await this.CreateUserProvider()
		await this.OpenStripeOnboardingPage()
	}

	StartStripeProviderUpdate() {
		this.OpenStripeOnboardingPage()
		return false
	}

	async CreateUserProvider() {
		// Create the provider
		let providerResponse: ApiResponse<ProviderResponseData> | ApiErrorResponse = await ProvidersController.CreateProvider({ country: this.startStripeSetupDialogDropdownSelectedKey })

		if (providerResponse.status != 201) {
			// Show error
			this.errorMessage = this.locale.errors.unexpectedErrorShort.replace('{0}', (providerResponse as ApiErrorResponse).errors[0].code.toString())
			this.startStripeSetupDialogLoading = false
			return
		}

		let providerResponseData = (providerResponse as ApiResponse<ProviderResponseData>).data
		this.providerStripeAccountId = providerResponseData.stripeAccountId
	}

	async GetUserProvider() {
		// Get the provider
		let providerResponse: ApiResponse<ProviderResponseData> | ApiErrorResponse = await ProvidersController.GetProvider()
		if (providerResponse.status != 200) return;

		let providerResponseData = (providerResponse as ApiResponse<ProviderResponseData>).data;
		this.providerStripeAccountId = providerResponseData.stripeAccountId;
	}

	async GetStripeData() {
		// Get the stripe account
		let stripeAccountResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.RetrieveStripeAccount, { id: this.providerStripeAccountId })
		if (!stripeAccountResponse.success) return

		this.providerStripeAccount = stripeAccountResponse.response
		this.providerBankAccount = this.providerStripeAccount.external_accounts.data[0] as Stripe.BankAccount

		// Get the balance
		let stripeBalanceResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.RetrieveStripeBalance, { account: this.providerStripeAccountId })
		if (!stripeBalanceResponse.success) return

		// Calculate the balance
		let balance = stripeBalanceResponse.response as Stripe.Balance
		if (balance.pending.length == 0) return

		this.providerStripeBalance = `${(balance.pending[0].amount / 100).toFixed(2)} ${this.GetCharForCurrency(balance.pending[0].currency)}`

		if (this.dataService.locale.slice(0, 2) == "de") {
			this.providerStripeBalance = this.providerStripeBalance.replace('.', ',')
		}
	}

	async OpenStripeOnboardingPage(update: boolean = false) {
		// Create stripe account link
		let stripeAccountLinkResponse: StripeApiResponse = await this.websocketService.Emit(
			WebsocketCallbackType.CreateStripeAccountLink,
			{
				account: this.providerStripeAccountId,
				returnUrl: `${environment.baseUrl}/user#provider`,
				type: update ? "custom_account_update" : "custom_account_verification"
			}
		)

		if (!stripeAccountLinkResponse.success) {
			// Show error
			this.errorMessage = this.locale.errors.unexpectedErrorLong
			return
		}

		let stripeAccountLinkResponseData = (stripeAccountLinkResponse.response as Stripe.AccountLink)

		// Redirect to the stripe account link url
		window.location.href = stripeAccountLinkResponseData.url
	}

	GetCharForCurrency(currency: string) {
		switch (currency) {
			case "usd":
				return "$"
			default:
				return "€"
		}
	}

	ShowBankAccountDialog() {
		this.bankAccountDialogVisible = true
		setTimeout(() => this.bankAccountForm.Init(), 1)
	}

	async BankAccountDialogSave() {
		await this.bankAccountForm.SaveBankAccount()
	}

	BankAccountDialogCompleted(stripeAccount: Stripe.Account) {
		this.providerStripeAccount = stripeAccount
		this.providerBankAccount = stripeAccount.external_accounts.data[0] as Stripe.BankAccount
		this.bankAccountDialogVisible = false
		this.successMessage = this.locale.messages.bankAccountUpdateMessage
	}

	UpdateUserResponse(message: ApiResponse<User> | ApiErrorResponse) {
		if (message.status == 200) {
			let userResponse = (message as ApiResponse<User>).data

			if (this.updatedAttribute == UserAttribute.ProfileImage) {
				this.snackBar.open(this.locale.messages.profileImageUpdateMessage, null, { duration: 5000 })
			}
			else if (this.updatedAttribute == UserAttribute.FirstName) {
				this.dataService.dav.user.FirstName = userResponse.FirstName
				this.snackBar.open(this.locale.messages.firstNameUpdateMessage, null, { duration: snackBarDuration })
			} else if (this.updatedAttribute == UserAttribute.Email) {
				this.successMessage = this.locale.messages.emailUpdateMessage
				this.newEmail = this.email
				this.email = this.dataService.dav.user.Email
			} else if (this.updatedAttribute == UserAttribute.Password) {
				this.successMessage = this.locale.messages.passwordUpdateMessage
				this.password = ""
				this.passwordConfirmation = ""
				this.passwordConfirmationVisible = false
			}
		} else {
			let errorCode = (message as ApiErrorResponse).errors[0].code

			if (this.updatedAttribute == UserAttribute.ProfileImage) {
				this.profileImageContent = this.dataService.dav.user.ProfileImage
				this.errorMessage = this.GetProfileImageErrorMessage(errorCode)
			}
			else if (this.updatedAttribute == UserAttribute.FirstName) this.firstNameErrorMessage = this.GetFirstNameErrorMessage(errorCode)
			else if (this.updatedAttribute == UserAttribute.Email) this.emailErrorMessage = this.GetEmailErrorMessage(errorCode)
			else if (this.updatedAttribute == UserAttribute.Password) {
				this.passwordErrorMessage = this.GetPasswordErrorMessage(errorCode)
				this.passwordConfirmation = ""
			}
		}

		// Hide the spinner
		this.profileImageLoading = false
		this.firstNameLoading = false
		this.emailLoading = false
		this.passwordLoading = false
	}

	SendConfirmationEmailResponse(message: ApiResponse<{}> | ApiErrorResponse) {
		if (message.status == 204) {
			this.successMessage = this.locale.messages.sendConfirmationEmailMessage
		} else {
			let errorCode = (message as ApiErrorResponse).errors[0].code
			this.errorMessage = this.GetSendConfirmationEmailErrorMessage(errorCode)
		}
	}

	ClearMessages() {
		this.errorMessage = ""
		this.successMessage = ""
		this.firstNameErrorMessage = ""
		this.emailErrorMessage = ""
		this.passwordErrorMessage = ""
	}

	GetProfileImageErrorMessage(errorCode: number): string {
		return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
	}

	GetFirstNameErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.FirstNameTooShort:
				return this.locale.errors.firstNameTooShort
			case ErrorCodes.FirstNameTooLong:
				return this.locale.errors.firstNameTooLong
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
		}
	}

	GetEmailErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.EmailInvalid:
				return this.locale.errors.emailInvalid
			case ErrorCodes.EmailAlreadyInUse:
				return this.locale.errors.emailTaken
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
		}
	}

	GetPasswordErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.PasswordTooShort:
				return this.locale.errors.passwordTooShort
			case ErrorCodes.PasswordTooLong:
				return this.locale.errors.passwordTooLong
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
		}
	}

	GetSendConfirmationEmailErrorMessage(errorCode: number): string {
		switch (errorCode) {
			case ErrorCodes.UserIsAlreadyConfirmed:
				return this.locale.errors.emailAlreadyConfirmed
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString())
		}
	}

	async FirstNameTextFieldChanged(event: KeyboardEvent) {
		if (event.key == "Enter") {
			event.preventDefault()
			await this.SaveFirstName()
		} else {
			this.ClearMessages()
		}
	}

	async EmailTextFieldChanged(event: KeyboardEvent) {
		if (event.key == "Enter") {
			event.preventDefault()
			await this.SaveEmail()
		} else {
			this.ClearMessages()
		}
	}

	async PasswordTextFieldChanged(event: KeyboardEvent) {
		if (event.key == "Enter") {
			event.preventDefault()
			await this.SavePassword()
		} else {
			this.ClearMessages()
		}

		this.passwordConfirmationVisible = this.password.length >= 7 && this.password.length <= 25

		if (this.passwordConfirmationVisible) {
			// Set the autocomplete attribute of the password confirmation text field
			SetTextFieldAutocomplete('password-confirmation-textfield', 'new-password')
		}
	}

	UpdateUsedStoragePercent() {
		this.usedStoragePercent = (this.dataService.dav.user.UsedStorage / this.dataService.dav.user.TotalStorage) * 100

		this.appsUsedStoragePercent = []
		for (let app of this.dataService.dav.user.Apps) {
			this.appsUsedStoragePercent.push((app.UsedStorage / this.dataService.dav.user.TotalStorage) * 100)
		}
	}

	BytesToGigabytes(bytes: number) {
		let gb = Math.trunc(bytes / 100000000)

		if (gb % 10 == 0) {
			gb = Math.trunc(gb / 10)
		} else {
			gb /= 10
		}

		return gb
	}
}

enum Menu {
	General,
	Plans,
	Apps,
	Provider
}

enum UserAttribute {
	ProfileImage = 0,
	FirstName = 1,
	Email = 2,
	Password = 3
}