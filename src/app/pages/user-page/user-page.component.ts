import { Component, HostListener, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageBarType, IDialogContentProps, IButtonStyles, SpinnerSize, IDropdownOption } from 'office-ui-fabric-react';
import { ReadFile } from 'ngx-file-helpers';
import Stripe from 'stripe';
import {
	ApiResponse,
	ApiErrorResponse,
	UpdateUser,
	UserResponseData,
	App,
	SendVerificationEmail,
	SendDeleteAccountEmail,
	SendRemoveAppEmail,
	CreateProvider,
	GetProvider,
	ProviderResponseData
} from 'dav-npm';
import { DataService, SetTextFieldAutocomplete, StripeApiResponse } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
import { BankAccountFormComponent } from 'src/app/components/bank-account-form-component/bank-account-form.component';

const maxAvatarFileSize = 5000000;
const snackBarDuration = 3000;
const dangerButtonBackgroundColor = "#dc3545";
const dangerButtonHoverBackgroundColor = "#c82333";
const buttonTransition = "all 0.15s";
const plansHash = "plans";
const appsHash = "apps";
const providerHash = "provider";

@Component({
	selector: 'dav-website-user-page',
	templateUrl: './user-page.component.html',
	styleUrls: [
		'./user-page.component.scss'
	]
})
export class UserPageComponent{
	locale = enUS.userPage;

	selectedMenu: Menu = Menu.General;
	sideNavHidden: boolean = false;
	sideNavOpened: boolean = false;

	successMessageBarType: MessageBarType = MessageBarType.success;
	warningMessageBarType: MessageBarType = MessageBarType.warning;
	errorMessageBarType: MessageBarType = MessageBarType.error;
	spinnerSize: SpinnerSize = SpinnerSize.small;

	//#region General page
	updatedAttribute: UserAttribute = UserAttribute.Username;
	newAvatarContent: string = null;
	username: string = "";
	email: string = "";
	newEmail: string = "";
	password: string = "";
	passwordConfirmation: string = "";
	passwordConfirmationVisible: boolean = false;
	deleteAccountDialogVisible: boolean = false;
	removeAppDialogVisible: boolean = false;
	selectedAppToRemove: App = null;

	successMessage: string = "";
	errorMessage: string = "";
	usernameErrorMessage: string = "";
	emailErrorMessage: string = "";
	passwordErrorMessage: string = "";

	avatarLoading: boolean = false;
	usernameLoading: boolean = false;
	emailLoading: boolean = false;
	passwordLoading: boolean = false;
	sendDeleteAccountEmailLoading: boolean = false;

	textFieldStyles = {
		root: {
			width: 200
		}
	}
	deleteAccountDialogContent: IDialogContentProps = {
		title: this.locale.general.deleteAccountDialog.title,
		subText: this.locale.general.deleteAccountDialog.subText,
		styles: {
			subText: {
				fontSize: 14
			}
		}
	}
	removeAppDialogContent: IDialogContentProps = {
		title: this.locale.apps.removeAppDialog.title,
		subText: this.locale.apps.removeAppDialog.subText,
		styles: {
			subText: {
				fontSize: 14
			}
		}
	}
	deleteAccountButtonStyles: IButtonStyles = {
		root: {
			backgroundColor: dangerButtonBackgroundColor,
			transition: buttonTransition
		},
		rootHovered: {
			backgroundColor: dangerButtonHoverBackgroundColor
		},
		rootPressed: {
			backgroundColor: dangerButtonHoverBackgroundColor
		}
	}
	deleteAccountDialogButtonStyles: IButtonStyles = {
		root: {
			backgroundColor: dangerButtonBackgroundColor,
			transition: buttonTransition,
			marginLeft: 10
		},
		rootHovered: {
			backgroundColor: dangerButtonHoverBackgroundColor
		},
		rootPressed: {
			backgroundColor: dangerButtonHoverBackgroundColor
		}
	}
	removeAppButtonStyles: IButtonStyles = {
		root: {
			backgroundColor: dangerButtonBackgroundColor,
			transition: buttonTransition
		},
		rootHovered: {
			backgroundColor: dangerButtonHoverBackgroundColor
		},
		rootPressed: {
			backgroundColor: dangerButtonHoverBackgroundColor
		}
	}
	removeAppDialogButtonStyles: IButtonStyles = {
		root: {
			backgroundColor: dangerButtonBackgroundColor,
			transition: buttonTransition,
			marginLeft: 10
		},
		rootHovered: {
			backgroundColor: dangerButtonHoverBackgroundColor
		},
		rootPressed: {
			backgroundColor: dangerButtonHoverBackgroundColor
		}
	}
	//#endregion

	//#region Apps page
	usedStoragePercent: number = 0;
	appsUsedStoragePercent: number[] = [];
	sendRemoveAppEmailLoading: boolean = false;
	//#endregion

	//#region Provider page
	@ViewChild('bankAccountForm', {static: true}) bankAccountForm: BankAccountFormComponent;
	providerStripeAccountId: string = null;
	providerStripeAccount: Stripe.Account = null;
	providerStripeBalance: Stripe.Balance = null;
	providerBankAccount: Stripe.BankAccount = null;
	startStripeSetupDialogVisible: boolean = false;
	startStripeSetupDialogDropdownOptions: IDropdownOption[] = [];
	startStripeSetupDialogDropdownSelectedKey: string = "us";
	bankAccountDialogVisible: boolean = false;
	bankAccountDialogLoading: boolean = false;

	cardActionButtonStyles: IButtonStyles = {
		root: {
			float: 'right',
			marginBottom: 16
		}
	}
	startStripeSetupDialogContent: IDialogContentProps = {
		title: this.locale.provider.startStripeSetupDialog.title
	}
	bankAccountDialogContent: IDialogContentProps = {
		title: this.locale.provider.bankAccountDialog.title
	}
	dialogPrimaryButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}
	//#endregion

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private snackBar: MatSnackBar,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().userPage;
		this.UpdateDialogTexts();

		this.activatedRoute.fragment.subscribe((value) => {
			switch (value) {
				case plansHash:
					this.ShowPlansMenu();
					break;
				case appsHash:
					this.ShowAppsMenu();
					break;
				case providerHash:
					this.ShowProviderMenu();
					break;
				default:
					this.ShowGeneralMenu();
					break;
			}
		});
	}

	async ngOnInit(){
		this.setSize();

		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}

		this.UpdateValues();
		this.dataService.userDownloadPromise.then(() => this.UpdateValues());
	}

	ngAfterViewInit(){
		// Set the autocomplete attribute of the input elements
		setTimeout(() => {
			SetTextFieldAutocomplete('username-text-field', 'username');
			SetTextFieldAutocomplete('email-text-field', 'email');
			SetTextFieldAutocomplete('password-text-field', 'new-password');
		}, 1);
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.sideNavHidden = window.outerWidth < 576;

		if(!this.sideNavHidden) this.sideNavOpened = true;
		else this.sideNavOpened = false;
	}

	UpdateValues(){
		// Set the values for the text fields
		this.username = this.dataService.user.Username;
		this.email = this.dataService.user.Email;

		this.UpdateUsedStoragePercent();
	}

	ShowGeneralMenu(){
		if(this.selectedMenu == Menu.General) return;
		this.selectedMenu = Menu.General;
		if(this.sideNavHidden) this.sideNavOpened = false;
		
		this.ClearMessages();
		this.username = this.dataService.user.Username;
		this.email = this.dataService.user.Email;
		this.password = "";
		this.passwordConfirmation = "";
		this.passwordConfirmationVisible = false;

		// Set the content of the avatar image if it was updated
		setTimeout(() => {
			this.UpdateAvatarImageContent();
		}, 1);

		this.router.navigateByUrl('user');
	}

	ShowPlansMenu(){
		if(this.selectedMenu == Menu.Plans) return;
		this.selectedMenu = Menu.Plans;
		if(this.sideNavHidden) this.sideNavOpened = false;
		this.ClearMessages();

		this.router.navigateByUrl(`user#${plansHash}`);
	}

	ShowAppsMenu(){
		if(this.selectedMenu == Menu.Apps) return;
		this.selectedMenu = Menu.Apps;
		if(this.sideNavHidden) this.sideNavOpened = false;
		this.ClearMessages();

		this.router.navigateByUrl(`user#${appsHash}`);
	}

	async ShowProviderMenu(){
		if(this.selectedMenu == Menu.Provider) return;
		this.selectedMenu = Menu.Provider;
		if(this.sideNavHidden) this.sideNavOpened = false;
		this.ClearMessages();
		this.InitStartStripeSetupDialogCountriesDropdown();

		this.router.navigateByUrl(`user#${providerHash}`);

		await this.dataService.userPromise;
		if(!this.dataService.user.Provider){
			// Wait for the update of the user from the server
			await this.dataService.userDownloadPromise;
			
			// Return if the user is still not a provider
			if(!this.dataService.user.Provider) return;
		}

		await this.GetUserProvider();
		await this.GetStripeData();
	}

	async UpdateAvatar(file: ReadFile){
		if(file.size > maxAvatarFileSize){
			this.errorMessage = this.locale.errors.avatarFileTooLarge;
			return;
		}
		this.ClearMessages();

		this.updatedAttribute = UserAttribute.Avatar;
		this.avatarLoading = true;
		this.newAvatarContent = file.content;
		let content = file.content.substring(file.content.indexOf(',') + 1);

		// Send the file content to the server
		this.UpdateUserResponse(
			await UpdateUser(this.dataService.user.JWT, {avatar: content})
		)
	}

	async SaveUsername(){
		if(!(this.username != this.dataService.user.Username && this.username.length >= 2 && this.username.length <= 25)) return;

		this.updatedAttribute = UserAttribute.Username;
		this.usernameLoading = true;
		this.UpdateUserResponse(
			await UpdateUser(this.dataService.user.JWT, {username: this.username})
		)
	}

	async SaveEmail(){
		if(!(this.email != this.dataService.user.Email && this.email != this.newEmail && this.email.length > 3 && this.email.includes('@'))) return;

		this.updatedAttribute = UserAttribute.Email;
		this.emailLoading = true;
		this.UpdateUserResponse(
			await UpdateUser(this.dataService.user.JWT, {email: this.email})
		)
	}

	async SavePassword(){
		if(!(this.password.length >= 7 && this.password.length <= 25 && this.password == this.passwordConfirmation)) return;

		this.updatedAttribute = UserAttribute.Password;
		this.passwordLoading = true;
		this.UpdateUserResponse(
			await UpdateUser(this.dataService.user.JWT, {password: this.password})
		)
	}

	SendVerificationEmail(){
		SendVerificationEmail(this.dataService.user.JWT).then((response: ApiResponse<{}> | ApiErrorResponse) => {
			this.SendVerificationEmailResponse(response);
		});

		return false;
	}

	async DeleteAccount(){
		this.deleteAccountDialogVisible = false;
		this.sendDeleteAccountEmailLoading = true;
		this.SendDeleteAccountEmailResponse(
			await SendDeleteAccountEmail(this.dataService.user.JWT)
		)
	}

	async RemoveApp(){
		this.removeAppDialogVisible = false;
		this.sendRemoveAppEmailLoading = true;
		this.SendRemoveAppEmailResponse(
			await SendRemoveAppEmail(this.dataService.user.JWT, this.selectedAppToRemove.Id)
		)
	}

	InitStartStripeSetupDialogCountriesDropdown(){
		// Add the countries options
		this.startStripeSetupDialogDropdownOptions = [];

		for(let key of Object.keys(this.locale.provider.countries)){
			let value = this.locale.provider.countries[key];
			this.startStripeSetupDialogDropdownOptions.push({key, text: value});
		}

		// Select the appropriate option
		let lang = this.dataService.locale.slice(0, 2);
		if(lang == "de"){
			this.startStripeSetupDialogDropdownSelectedKey = "de";
		}else{
			this.startStripeSetupDialogDropdownSelectedKey = "us";
		}
	}

	StartStripeSetupDialogDropdownChange(e: {event: MouseEvent, option: IDropdownOption, index: number}){
		this.startStripeSetupDialogDropdownSelectedKey = e.option.key as string;
	}

	ShowStartStripeSetupDialog(){
		this.startStripeSetupDialogContent.title = this.locale.provider.startStripeSetupDialog.title;
		this.startStripeSetupDialogVisible = true;
	}

	async StartStripeProviderSetup(){
		await this.CreateUserProvider();
		await this.OpenStripeOnboardingPage();
	}

	StartStripeProviderUpdate(){
		this.OpenStripeOnboardingPage();
		return false;
	}

	async CreateUserProvider(){
		// Create the provider
		let providerResponse: ApiResponse<ProviderResponseData> | ApiErrorResponse = await CreateProvider(this.dataService.user.JWT, this.startStripeSetupDialogDropdownSelectedKey);
		
		if(providerResponse.status != 201){
			// Show error
			this.errorMessage = this.locale.errors.unexpectedErrorShort.replace('{0}', (providerResponse as ApiErrorResponse).errors[0].code.toString());
			return;
		}

		let providerResponseData = (providerResponse as ApiResponse<ProviderResponseData>).data;
		this.providerStripeAccountId = providerResponseData.stripeAccountId;
	}

	async GetUserProvider(){
		// Get the provider
		let providerResponse: ApiResponse<ProviderResponseData> | ApiErrorResponse = await GetProvider(this.dataService.user.JWT);
		if(providerResponse.status != 200) return;

		let providerResponseData = (providerResponse as ApiResponse<ProviderResponseData>).data;
		this.providerStripeAccountId = providerResponseData.stripeAccountId;
	}

	async GetStripeData(){
		// Get the stripe account
		let stripeAccountResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.RetrieveStripeAccount, {id: this.providerStripeAccountId});
		if(!stripeAccountResponse.success) return;

		this.providerStripeAccount = stripeAccountResponse.response;
		this.providerBankAccount = this.providerStripeAccount.external_accounts.data[0] as Stripe.BankAccount;

		// Get the balance
		let stripeBalanceResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.RetrieveStripeBalance, {account: this.providerStripeAccountId});
		if(!stripeBalanceResponse.success) return;

		this.providerStripeBalance = stripeBalanceResponse.response;
	}

	async OpenStripeOnboardingPage(update: boolean = false){
		// Create stripe account link
		let stripeAccountLinkResponse: StripeApiResponse = await this.websocketService.Emit(
			WebsocketCallbackType.CreateStripeAccountLink,
			{
				account: this.providerStripeAccountId,
				successUrl: `${environment.baseUrl}/user#provider`,
				failureUrl: `${environment.baseUrl}/user#provider`,
				type: update ? "custom_account_update" : "custom_account_verification"
			}
		)

		if(!stripeAccountLinkResponse.success){
			// Show error
			this.errorMessage = this.locale.errors.unexpectedErrorLong;
			return;
		}

		let stripeAccountLinkResponseData = (stripeAccountLinkResponse.response as Stripe.AccountLink);

		// Redirect to the stripe account link url
		window.location.href = stripeAccountLinkResponseData.url;
	}

	GetCharForCurrency(currency: string){
		switch (currency) {
			case "usd":
				return "$";
			default:
				return "€";
		}
	}

	ShowBankAccountDialog(){
		this.bankAccountDialogContent.title = this.locale.provider.bankAccountDialog.title;
		this.bankAccountDialogVisible = true;
		setTimeout(() => this.bankAccountForm.Init(), 1);
	}

	async BankAccountDialogSave(){
		await this.bankAccountForm.SaveBankAccount();
	}

	BankAccountDialogCompleted(stripeAccount: Stripe.Account){
		this.providerStripeAccount = stripeAccount;
		this.bankAccountDialogVisible = false;
	}

	UpdateUserResponse(message: ApiResponse<UserResponseData> | ApiErrorResponse){
		if(message.status == 200){
			if(this.updatedAttribute == UserAttribute.Avatar){
				this.UpdateAvatarImageContent();
				this.snackBar.open(this.locale.messages.avatarUpdateMessage, null, {duration: 5000});
			}
			else if(this.updatedAttribute == UserAttribute.Username){
				this.dataService.user.Username = this.username;
				this.snackBar.open(this.locale.messages.usernameUpdateMessage, null, {duration: snackBarDuration});
			}else if(this.updatedAttribute == UserAttribute.Email){
				this.successMessage = this.locale.messages.emailUpdateMessage;
				this.newEmail = this.email;
				this.email = this.dataService.user.Email;
			}else if(this.updatedAttribute == UserAttribute.Password){
				this.successMessage = this.locale.messages.passwordUpdateMessage;
				this.password = "";
				this.passwordConfirmation = "";
				this.passwordConfirmationVisible = false;
			}
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;

			if(this.updatedAttribute == UserAttribute.Avatar) this.errorMessage = this.GetAvatarErrorMessage(errorCode);
			else if(this.updatedAttribute == UserAttribute.Username) this.usernameErrorMessage = this.GetUsernameErrorMessage(errorCode);
			else if(this.updatedAttribute == UserAttribute.Email) this.emailErrorMessage = this.GetEmailErrorMessage(errorCode);
			else if(this.updatedAttribute == UserAttribute.Password){
				this.passwordErrorMessage = this.GetPasswordErrorMessage(errorCode);
				this.passwordConfirmation = "";
			}
		}

		// Hide the spinner
		this.avatarLoading = false;
		this.usernameLoading = false;
		this.emailLoading = false;
		this.passwordLoading = false;
	}

	SendVerificationEmailResponse(message: ApiResponse<{}> | ApiErrorResponse){
		if(message.status == 200){
			this.successMessage = this.locale.messages.sendVerificationEmailMessage;
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendVerificationEmailErrorMessage(errorCode);
		}
	}

	SendDeleteAccountEmailResponse(message: ApiResponse<{}> | ApiErrorResponse){
		if(message.status == 200){
			this.successMessage = this.locale.messages.sendDeleteAccountEmailMessage;
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendDeleteAccountEmailErrorMessage(errorCode);
		}

		// Hide the spinner
		this.sendDeleteAccountEmailLoading = false;
	}

	SendRemoveAppEmailResponse(message: ApiResponse<{}> | ApiErrorResponse){
		if(message.status == 200){
			this.successMessage = this.locale.messages.sendRemoveAppEmailMessage;
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendRemoveAppEmailErrorMessage(errorCode);
		}

		// Hide the spinner
		this.sendRemoveAppEmailLoading = false;
	}

	UpdateDialogTexts(){
		this.deleteAccountDialogContent.title = this.locale.general.deleteAccountDialog.title;
		this.deleteAccountDialogContent.subText = this.locale.general.deleteAccountDialog.subText;
		this.removeAppDialogContent.title = this.locale.apps.removeAppDialog.title.replace("{0}", this.selectedAppToRemove ? this.selectedAppToRemove.Name : "");
		this.removeAppDialogContent.subText = this.locale.apps.removeAppDialog.subText;
	}

	UpdateAvatarImageContent(){
		if(!this.newAvatarContent) return;
		let imageTag = document.getElementById('avatar-image');
		if(imageTag) imageTag.setAttribute('src', this.newAvatarContent);
	}

	ClearMessages(){
		this.errorMessage = "";
		this.successMessage = "";
		this.usernameErrorMessage = "";
		this.emailErrorMessage = "";
		this.passwordErrorMessage = "";
	}

	GetAvatarErrorMessage(errorCode: number) : string{
		return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
	}

	GetUsernameErrorMessage(errorCode: number) : string{
		switch(errorCode){
			case 2201:
				return this.locale.errors.usernameTooShort;
			case 2301:
				return this.locale.errors.usernameTooLong;
			case 2701:
				return this.locale.errors.usernameTaken;
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
		}
	}

	GetEmailErrorMessage(errorCode: number) : string{
		switch(errorCode){
			case 2401:
				return this.locale.errors.emailInvalid;
			case 2702:
				return this.locale.errors.emailTaken;
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
		}
	}

	GetPasswordErrorMessage(errorCode: number) : string{
		switch(errorCode){
			case 2202:
				return this.locale.errors.passwordTooShort;
			case 2302:
				return this.locale.errors.passwordTooLong;
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
		}
	}

	GetSendVerificationEmailErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 1106:
				return this.locale.errors.emailAlreadyConfirmed;
			default:
				return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
		}
	}

	GetSendDeleteAccountEmailErrorMessage(errorCode: number) : string{
		return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
	}

	GetSendRemoveAppEmailErrorMessage(errorCode: number) : string{
		return this.locale.errors.unexpectedErrorShort.replace("{0}", errorCode.toString());
	}

	UsernameTextFieldChanged(event: KeyboardEvent){
		if(event.keyCode == 13) this.SaveUsername();
		else this.ClearMessages();
	}

	EmailTextFieldChanged(event: KeyboardEvent){
		if(event.keyCode == 13) this.SaveEmail();
		else this.ClearMessages();
	}

	PasswordTextFieldChanged(event: KeyboardEvent){
		if(event.keyCode == 13) this.SavePassword();
		else this.ClearMessages();

		this.passwordConfirmationVisible = this.password.length >= 7 && this.password.length <= 25;

		if(this.passwordConfirmationVisible){
			// Set the autocomplete attribute of the password confirmation text field
			SetTextFieldAutocomplete('password-confirmation-text-field', 'new-password');
		}
	}

	UpdateUsedStoragePercent(){
		this.usedStoragePercent = (this.dataService.user.UsedStorage / this.dataService.user.TotalStorage) * 100;

		this.appsUsedStoragePercent = [];
		for(let app of this.dataService.user.Apps){
			this.appsUsedStoragePercent.push((app.UsedStorage / this.dataService.user.TotalStorage) * 100);
		}
	}

	BytesToGigabytes(bytes: number){
		let gb = Math.trunc(bytes / 100000000);

		if(gb % 10 == 0){
			gb = Math.trunc(gb / 10);
		}else{
			gb /= 10;
		}

		return gb;
	}

	ShowRemoveAppDialog(app: App){
		this.selectedAppToRemove = app;
		this.UpdateDialogTexts();

		this.removeAppDialogVisible = true;
	}
}

enum Menu{
	General,
	Plans,
	Apps,
	Provider
}

enum UserAttribute{
	Avatar = 0,
	Username = 1,
	Email = 2,
	Password = 3
}