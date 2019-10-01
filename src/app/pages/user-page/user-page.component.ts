import { Component } from '@angular/core';
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
	usedStoragePercent: number = 0;
	socket: any = null;
	newAvatarContent: string = null;

	constructor(
		public dataService: DataService
	){}

	ngOnInit(){
		this.socket = io();
		this.socket.on(updateUserKey, (message: ApiResponse<UserResponseData> | ApiErrorResponse) => this.UpdateUserResponse(message));

		// Todo: Wait for the user to be loaded
		this.UpdateUsedStoragePercent();
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
		this.newAvatarContent = file.content;
		let content = file.content.substring(file.content.indexOf(',') + 1);

		// Send the file content to the server
		this.socket.emit(updateUserKey, {
			jwt: this.dataService.user.JWT,
			avatar: content
		});
	}

	UpdateUserResponse(message: ApiResponse<UserResponseData> | ApiErrorResponse){
		if(message.status == 200){
			this.UpdateAvatarImageContent();
		}
	}

	UpdateAvatarImageContent(){
		if(!this.newAvatarContent) return;
		let imageTag = document.getElementById('avatar-image');
		if(imageTag) imageTag.setAttribute('src', this.newAvatarContent);
	}
}

enum Menu{
	General,
	Plans,
	Apps
}