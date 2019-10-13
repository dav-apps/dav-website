import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageBarType, IDialogContentProps, IButtonStyles, SpinnerSize } from 'office-ui-fabric-react';
import { ReadFile } from 'ngx-file-helpers';
import { ApiResponse, ApiErrorResponse, UserResponseData, App } from 'dav-npm';
import { DataService, SetTextFieldAutocomplete } from 'src/app/services/data-service';
declare var io: any;

const updateUserKey = "updateUser";
const sendVerificationEmailKey = "sendVerificationEmail";
const sendDeleteAccountEmailKey = "sendDeleteAccountEmail";
const sendRemoveAppEmailKey = "sendRemoveAppEmail";
const maxAvatarFileSize = 5000000;
const snackBarDuration = 3000;
const dangerButtonBackgroundColor = "#dc3545";
const dangerButtonHoverBackgroundColor = "#c82333";
const buttonTransition = "all 0.15s";
const plansHash = "plans";
const appsHash = "apps";

@Component({
	selector: 'dav-website-user-page',
	templateUrl: './user-page.component.html',
	styleUrls: [
		'./user-page.component.scss'
	]
})
export class UserPageComponent{
	selectedMenu: Menu = Menu.General;
	sideNavHidden: boolean = false;
	sideNavOpened: boolean = false;

	//#region General page
	successMessageBarType: MessageBarType = MessageBarType.success;
	errorMessageBarType: MessageBarType = MessageBarType.error;
	socket: any = null;
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

	spinnerSize: SpinnerSize = SpinnerSize.small;
	textFieldStyles = {
		root: {
			width: 200
		}
	}
	deleteAccountDialogContent: IDialogContentProps = {
		title: "Deleting your Account",
		subText: "Are your absolutely sure that you want to delete your account? All your data will be irreversibly deleted.",
		styles: {
			subText: {
				fontSize: 14
			}
		}
	}
	removeAppDialogContent: IDialogContentProps = {
		title: `Removing appName from your Account`,
		subText: "All app data will be irreversibly deleted. Are you sure you want to remove this app?",
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
	sendRemoveAppEmailLoading: boolean = false;
	//#endregion

	constructor(
		public dataService: DataService,
		private snackBar: MatSnackBar,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.activatedRoute.fragment.subscribe((value) => {
			switch (value) {
				case plansHash:
					this.ShowPlansMenu();
					break;
				case appsHash:
					this.ShowAppsMenu();
					break;
				default:
					this.ShowGeneralMenu();
					break;
			}
		});
	}

	async ngOnInit(){
		this.setSize();
		this.socket = io();
		this.socket.on(updateUserKey, (message: ApiResponse<UserResponseData> | ApiErrorResponse) => this.UpdateUserResponse(message));
		this.socket.on(sendVerificationEmailKey, (message: ApiResponse<{}> | ApiErrorResponse) => this.SendVerificationEmailResponse(message));
		this.socket.on(sendDeleteAccountEmailKey, (message: ApiResponse<{}> | ApiErrorResponse) => this.SendDeleteAccountEmailResponse(message));
		this.socket.on(sendRemoveAppEmailKey, (message: ApiResponse<{}> | ApiErrorResponse) => this.SendRemoveAppEmailResponse(message));

		if(!this.dataService.userLoaded){
			// Wait for the user to be loaded
			await new Promise<any>(resolve => {
				this.dataService.userLoadCallbacks.push(resolve);
			});
		}
		this.UpdateUsedStoragePercent();

		// Set the values for the text fields
		this.username = this.dataService.user.Username;
		this.email = this.dataService.user.Email;
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

	ShowGeneralMenu(){
		if(this.selectedMenu == Menu.General) return;
		this.selectedMenu = Menu.General;
		if(this.sideNavHidden) this.sideNavOpened = false;
		
		this.ClearMessages();
		this.successMessage = "";
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

	UpdateAvatar(file: ReadFile){
		if(file.size > maxAvatarFileSize){
			this.errorMessage = "The image file is too large";
			return;
		}
		this.ClearMessages();

		this.updatedAttribute = UserAttribute.Avatar;
		this.avatarLoading = true;
		this.newAvatarContent = file.content;
		let content = file.content.substring(file.content.indexOf(',') + 1);

		// Send the file content to the server
		this.socket.emit(updateUserKey, {
			jwt: this.dataService.user.JWT,
			avatar: content
		});
	}

	SaveUsername(){
		if(!(this.username != this.dataService.user.Username && this.username.length >= 2 && this.username.length <= 25)) return;

		this.updatedAttribute = UserAttribute.Username;
		this.usernameLoading = true;
		this.socket.emit(updateUserKey, {
			jwt: this.dataService.user.JWT,
			username: this.username
		});
	}

	SaveEmail(){
		if(!(this.email != this.dataService.user.Email && this.email != this.newEmail && this.email.length > 3 && this.email.includes('@'))) return;

		this.updatedAttribute = UserAttribute.Email;
		this.emailLoading = true;
		this.socket.emit(updateUserKey, {
			jwt: this.dataService.user.JWT,
			email: this.email
		});
	}

	SavePassword(){
		if(!(this.password.length >= 7 && this.password.length <= 25 && this.password == this.passwordConfirmation)) return;

		this.updatedAttribute = UserAttribute.Password;
		this.passwordLoading = true;
		this.socket.emit(updateUserKey, {
			jwt: this.dataService.user.JWT,
			password: this.password
		});
	}

	SendVerificationEmail(){
		this.socket.emit(sendVerificationEmailKey, {
			jwt: this.dataService.user.JWT
		});
		return false;
	}

	DeleteAccount(){
		this.deleteAccountDialogVisible = false;
		this.sendDeleteAccountEmailLoading = true;
		this.socket.emit(sendDeleteAccountEmailKey, {
			jwt: this.dataService.user.JWT
		});
	}

	RemoveApp(){
		this.removeAppDialogVisible = false;
		this.sendRemoveAppEmailLoading = true;
		this.socket.emit(sendRemoveAppEmailKey, {
			jwt: this.dataService.user.JWT,
			appId: this.selectedAppToRemove.Id
		});
	}

	UpdateUserResponse(message: ApiResponse<UserResponseData> | ApiErrorResponse){
		if(message.status == 200){
			if(this.updatedAttribute == UserAttribute.Avatar){
				this.UpdateAvatarImageContent();
				this.snackBar.open("Your profile picture was updated successfully. It may take some time to update across the site and apps.", null, {duration: 5000});
			}
			else if(this.updatedAttribute == UserAttribute.Username){
				this.dataService.user.Username = this.username;
				this.snackBar.open("Your username was updated successfully.", null, {duration: snackBarDuration});
			}else if(this.updatedAttribute == UserAttribute.Email){
				this.successMessage = "You will receive an email to confirm your new email address. After that, you can log in with your new email address.";
				this.newEmail = this.email;
				this.email = this.dataService.user.Email;
			}else if(this.updatedAttribute == UserAttribute.Password){
				this.successMessage = "You will receive an email to confirm your new password. After that, you can log in with your new password.";
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
			this.successMessage = "A new confirmation email was sent";
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendVerificationEmailErrorMessage(errorCode);
		}
	}

	SendDeleteAccountEmailResponse(message: ApiResponse<{}> | ApiErrorResponse){
		if(message.status == 200){
			this.successMessage = "You will receive an email to confirm the deletion of your account.";
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendDeleteAccountEmailErrorMessage(errorCode);
		}

		// Hide the spinner
		this.sendDeleteAccountEmailLoading = false;
	}

	SendRemoveAppEmailResponse(message: ApiResponse<{}> | ApiErrorResponse){
		if(message.status == 200){
			this.successMessage = `You will receive an email to confirm the removal of the app.`;
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;
			this.errorMessage = this.GetSendRemoveAppEmailErrorMessage(errorCode);
		}

		// Hide the spinner
		this.sendRemoveAppEmailLoading = false;
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
		return `Unexpected error (${errorCode})`;
	}

	GetUsernameErrorMessage(errorCode: number) : string{
		switch(errorCode){
			case 2201:
				return "Your username is too short";
			case 2301:
				return "Your username is too long";
			case 2701:
				return "This username is already taken";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}

	GetEmailErrorMessage(errorCode: number) : string{
		switch(errorCode){
			case 2401:
				return "The email address is invalid";
			case 2702:
				return "The email address is already taken";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}

	GetPasswordErrorMessage(errorCode: number) : string{
		switch(errorCode){
			case 2202:
				return "Your new password is too short";
			case 2302:
				return "Your new password is too long";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}

	GetSendVerificationEmailErrorMessage(errorCode: number) : string{
		switch (errorCode) {
			case 1106:
				return "Your email address is already confirmed";
			default:
				return `Unexpected error (${errorCode})`;
		}
	}

	GetSendDeleteAccountEmailErrorMessage(errorCode: number) : string{
		return `Unexpected error (${errorCode})`;
	}

	GetSendRemoveAppEmailErrorMessage(errorCode: number) : string{
		return `Unexpected error (${errorCode})`;
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
		this.removeAppDialogContent.title = `Removing ${app.Name} from your Account`;

		this.removeAppDialogVisible = true;
	}
}

enum Menu{
	General,
	Plans,
	Apps
}

enum UserAttribute{
	Avatar = 0,
	Username = 1,
	Email = 2,
	Password = 3
}