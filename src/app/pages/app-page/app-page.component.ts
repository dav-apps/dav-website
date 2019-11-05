import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, App } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-app-page',
	templateUrl: './app-page.component.html'
})
export class AppPageComponent{
	locale = enUS.appPage;
	getAppSubscriptionKey: number;
	app: App = new App(0, "", "", false, null, null, null);
	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}

	constructor(
		public dataService: DataService,
		public websocketService: WebsocketService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().appPage;
		this.getAppSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetApp, (response: ApiResponse<App> | ApiErrorResponse) => this.GetAppResponse(response));
	}

	async ngOnInit(){
		await this.dataService.userPromise;

		let appId = this.activatedRoute.snapshot.paramMap.get('id');
		
		this.websocketService.Emit(WebsocketCallbackType.GetApp, {
			jwt: this.dataService.user.JWT,
			id: appId
		});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(this.getAppSubscriptionKey);
	}

	GoBack(){
		this.router.navigate(['dev']);
	}

	GetAppResponse(response: ApiResponse<App> | ApiErrorResponse){
		if(response.status == 200){
			this.app = (response as ApiResponse<App>).data;
		}else{
			// Redirect to the Dev page
			this.router.navigate(['dev']);
		}
	}
}