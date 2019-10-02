import { Component } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';
import { ReadFile } from 'ngx-file-helpers';
import { ApiResponse, ApiErrorResponse, UserResponseData } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
declare var io: any;

const updateUserKey = "updateUser";

@Component({
	selector: 'dav-website-user-page',
	templateUrl: './user-page.component.html',
	styleUrls: [
		'./user-page.component.scss'
	]
})
export class UserPageComponent{
	selectedMenu: Menu = Menu.General;
	messageBarType: MessageBarType = MessageBarType.error;
	socket: any = null;
	updatedAttribute: UserAttribute = UserAttribute.Username;
	newAvatarContent: string = null;
	username: string;
	usedStoragePercent: number = 0;

	errorMessage: string = "";
	usernameErrorMessage: string = "";

	constructor(
		public dataService: DataService
	){}

	async ngOnInit(){
		this.socket = io();
		this.socket.on(updateUserKey, (message: ApiResponse<UserResponseData> | ApiErrorResponse) => this.UpdateUserResponse(message));

		if(!this.dataService.userLoaded){
			// Wait for the user to be loaded
			await new Promise<any>(resolve => {
				this.dataService.userLoadCallbacks.push(resolve);
			});
		}
		this.UpdateUsedStoragePercent();

		// Set the values for the text fields
		this.username = this.dataService.user.Username;
	}

	UpdateUsedStoragePercent(){
		this.usedStoragePercent = (this.dataService.user.UsedStorage / this.dataService.user.TotalStorage) * 100;
	}

	ShowGeneralMenu(){
		this.selectedMenu = Menu.General;

		// Set the content of the avatar image if it was updated
		setTimeout(() => {
			this.UpdateAvatarImageContent();
		}, 1);
	}

	ShowPlansMenu(){
		this.selectedMenu = Menu.Plans;
	}

	ShowAppsMenu(){
		this.selectedMenu = Menu.Apps;
	}

	UpdateAvatar(file: ReadFile){
		this.updatedAttribute = UserAttribute.Avatar;
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
		this.socket.emit(updateUserKey, {
			jwt: this.dataService.user.JWT,
			username: this.username
		});
	}

	UpdateUserResponse(message: ApiResponse<UserResponseData> | ApiErrorResponse){
		if(message.status == 200){
			if(this.updatedAttribute == UserAttribute.Avatar) this.UpdateAvatarImageContent();
			else if(this.updatedAttribute == UserAttribute.Username) this.dataService.user.Username = this.username;
		}else{
			let errorCode = (message as ApiErrorResponse).errors[0].code;

			if(this.updatedAttribute == UserAttribute.Avatar) this.errorMessage = this.GetAvatarErrorMessage(errorCode);
			else if(this.updatedAttribute == UserAttribute.Username) this.usernameErrorMessage = this.GetUsernameErrorMessage(errorCode);
		}
	}

	UpdateAvatarImageContent(){
		if(!this.newAvatarContent) return;
		let imageTag = document.getElementById('avatar-image');
		if(imageTag) imageTag.setAttribute('src', this.newAvatarContent);
	}

	GetAvatarErrorMessage(errorCode: number){
		return `Unexpected error (${errorCode})`;
	}

	GetUsernameErrorMessage(errorCode: number){
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

	UsernameTextFieldChanged(event: KeyboardEvent){
		if(event.keyCode == 13) this.SaveUsername();
		else this.usernameErrorMessage = "";
	}
}

enum Menu{
	General,
	Plans,
	Apps
}

enum UserAttribute{
	Avatar = 0,
	Username = 1
}