import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IIconStyles } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, Event } from 'dav-npm';
import { DataService } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-event-page',
	templateUrl: './event-page.component.html'
})
export class EventPageComponent{
	locale = enUS.eventPage;
	getEventByNameSubscriptionKey: number;
	appId: number;
	event: Event = new Event(0, 0, "", []);
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
		this.locale = this.dataService.GetLocale().eventPage;
		this.getEventByNameSubscriptionKey = this.websocketService.Subscribe(WebsocketCallbackType.GetEventByName, (response: ApiResponse<Event> | ApiErrorResponse) => this.GetEventByNameResponse(response));
	}

	async ngOnInit(){
		await this.dataService.userPromise;
		if(!this.dataService.user.IsLoggedIn){
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage;
			this.router.navigate(['/']);
			return;
		}

		this.appId = +this.activatedRoute.snapshot.paramMap.get('id');
		let eventName = this.activatedRoute.snapshot.paramMap.get('name');

		this.websocketService.Emit(WebsocketCallbackType.GetEventByName, {
			jwt: this.dataService.user.JWT,
			name: eventName,
			appId: this.appId
		});
	}

	ngOnDestroy(){
		this.websocketService.Unsubscribe(
			this.getEventByNameSubscriptionKey
		)
	}

	GetEventByNameResponse(response: ApiResponse<Event> | ApiErrorResponse){
		if(response.status == 200){
			this.event = (response as ApiResponse<Event>).data;
		}else{
			this.GoBack();
		}
	}

	GoBack(){
		this.router.navigate(['dev', this.appId]);
	}
}