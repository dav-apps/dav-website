import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { Init, DavEnvironment } from 'dav-npm';
import { enUS } from 'src/locales/locales';
import { DataService } from './services/data-service';
import { environment } from 'src/environments/environment';
import { WebsocketService, WebsocketCallbackType } from './services/websocket-service';
declare var deviceAPI: any;

const visitEventName = "visit";

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	locale = enUS.appComponent;
	width: number = 500;
	offsetTop: number = 0;

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		public router: Router
	){
		this.locale = this.dataService.GetLocale().appComponent;
	}

	ngOnInit(){
		this.setSize();
		window.onscroll = () => this.offsetTop = window.scrollY;
		initializeIcons();

		this.router.events.subscribe((navigation: any) => {
			if(navigation instanceof NavigationEnd){
				// Clear the success and error messages if the user navigates to a page other than the start page
				if(navigation.url != "/"){
					this.dataService.startPageErrorMessage = "";
					this.dataService.startPageSuccessMessage = "";
				}
			}
		});

		Init(
			environment.production ? DavEnvironment.Production : DavEnvironment.Development,
			environment.appId,
			[],
			[],
			true,
			{icon: "", badge: ""},
			{
				UpdateAllOfTable: () => {},
				UpdateTableObject: () => {},
				DeleteTableObject: () => {},
				UserDownloadFinished: () => this.dataService.userDownloadPromiseResolve(),
				SyncFinished: () => {}
			}
		)

		// Log the visit
		this.LogVisit();
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.width = window.outerWidth;
	}

	Logout(){
		this.dataService.user.Logout().then(() => {
			this.router.navigate(['/']);
		});

		return false;
	}

	HideNavbar(){
		let navbar = document.getElementById('navbar-responsive');
		if(navbar) navbar.classList.remove('show');
	}

	LogVisit(){
		// Get the device info
		this.websocketService.Emit(WebsocketCallbackType.CreateEventLog, {
			name: visitEventName,
			appId: environment.appId,
			saveCountry: true,
			properties: {
				browser_name: deviceAPI.browserName,
				browser_version: deviceAPI.browserVersion,
				os_name: deviceAPI.osCodeName,
				os_version: deviceAPI.osVersion
			}
		});
	}
}