import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data-service';

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

	constructor(
		public dataService: DataService
	){}

	ngOnInit(){
		// Todo: Wait for the user to be loaded
		this.UpdateUsedStoragePercent();
	}

	UpdateUsedStoragePercent(){
		this.usedStoragePercent = (this.dataService.user.UsedStorage / this.dataService.user.TotalStorage) * 100;
	}

	ShowGeneralMenu(){
		this.selectedMenu = Menu.General;
	}

	ShowPlansMenu(){
		this.selectedMenu = Menu.Plans;
	}

	ShowAppsMenu(){
		this.selectedMenu = Menu.Apps;
	}
}

enum Menu{
	General,
	Plans,
	Apps
}