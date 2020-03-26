import { Component, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IButtonStyles, IIconStyles, SpinnerSize } from 'office-ui-fabric-react';
import { ApiResponse, ApiErrorResponse, LoginResponseData, Log } from 'dav-npm';
import { PaymentFormDialogComponent } from 'src/app/components/payment-form-dialog-component/payment-form-dialog.component';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { enUS } from 'src/locales/locales';
import { environment } from 'src/environments/environment';

const loginEventName = "login";

@Component({
	selector: 'dav-website-purchase-page',
	templateUrl: './purchase-page.component.html'
})
export class PurchasePageComponent{
	locale = enUS.purchasePage;
	@ViewChild('paymentFormDialog', {static: true}) paymentFormDialog: PaymentFormDialogComponent;
	purchase: {
		id: number,
		userId: number,
		tableObjectId: number,
		price: number,
		currency: string,
		paid: boolean,
		completed: boolean
	} = {id: 0, userId: 0, tableObjectId: 0, price: 0, currency: "eur", paid: false, completed: false};
	price: string = "";
	loginUser: {id: number, username: string, email: string, avatar: string};
	loginPromise: Promise<null> = new Promise(resolve => this.loginPromiseResolve = resolve);
	loginPromiseResolve: Function;
	password: string = "";
	loginErrorMessage: string = "";
	loginLoading: boolean = false;
	spinnerSize: SpinnerSize = SpinnerSize.small;
	addPaymentMethodHover: boolean = false;
	hasPaymentMethod: boolean = false;
	paymentMethodLast4: string;
	paymentMethodExpirationMonth: string;
	paymentMethodExpirationYear: string;
	mobileView: boolean = false;
	paymentLoading: boolean = false;
	
	loginButtonStyles: IButtonStyles = {
		root: {
			marginTop: 24
		}
	}
	backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 13
		}
	}
	editPaymentMethodButtonStyles: IButtonStyles = {
		root: {
			float: 'right',
			marginBottom: 16
		}
	}

	constructor(
		public dataService: DataService,
		private websocketService: WebsocketService,
		private activatedRoute: ActivatedRoute
	){
		this.locale = this.dataService.GetLocale().purchasePage;
		this.dataService.hideNavbarAndFooter = true;
	}

	async ngOnInit(){
		this.setSize();
		await this.dataService.userPromise;

		// Get the id from the url
		let purchaseId = this.activatedRoute.snapshot.paramMap.get('id');

		// Get the purchase from the server
		let response = await this.websocketService.Emit(WebsocketCallbackType.GetPurchase, {id: +purchaseId});

		if(response.status == 200){
			this.purchase = response.data;
			this.price = (this.purchase.price / 100).toFixed(2) + " €";

			if(this.dataService.locale.slice(0, 2) == "de"){
				this.price = this.price.replace('.', ',');
			}
		}else{
			// TODO: Redirect back with error
			return;
		}

		// Show the Login form if the user is not logged in or if the logged in user is not the user of the purchase
		if(
			!this.dataService.user.IsLoggedIn || 
			(this.dataService.user.IsLoggedIn && this.dataService.user.Id != this.purchase.userId)
		){
			// Get the user of the purchase
			let getUserByAuthResponse = await this.websocketService.Emit(WebsocketCallbackType.GetUserByAuth, {id: response.data.userId});

			if(getUserByAuthResponse.status == 200){
				this.loginUser = {
					id: getUserByAuthResponse.data.id,
					username: getUserByAuthResponse.data.username,
					email: getUserByAuthResponse.data.email,
					avatar: getUserByAuthResponse.data.avatar
				}
			}else{
				// TODO: Redirect back with error
				return;
			}
		}else{
			this.loginPromiseResolve();
		}

		await this.loginPromise;

		// Get the payment method of the user
		await this.GetPaymentMethod();
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.mobileView = window.outerWidth < 768;
	}

	async Login(){
		this.loginErrorMessage = "";
		this.loginLoading = true;
		let response = await this.websocketService.Emit(WebsocketCallbackType.Login, {email: this.loginUser.email, password: this.password});

		if(response.status == 200){
			// Save the jwt
			await this.dataService.user.Login((response as ApiResponse<LoginResponseData>).data.jwt);

			// Log the event
			await Log(environment.apiKey, loginEventName);

			this.loginUser = null;
			this.loginPromiseResolve();
		}else{
			let errorCode = (response as ApiErrorResponse).errors[0].code;
			
			switch(errorCode){
				case 1201:
					this.loginErrorMessage = this.locale.errors.loginFailed;
					break;
				case 2107:
					this.loginErrorMessage = this.locale.errors.passwordMissing;
					break;
				default:
					this.loginErrorMessage = this.locale.errors.unexpectedError.replace('{0}', errorCode.toString())
					break;
			}

			this.password = "";
		}

		this.loginLoading = false;
	}

	async GetPaymentMethod(){
		if(this.dataService.user.StripeCustomerId){
			let paymentMethodResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.GetStripePaymentMethod, {customerId: this.dataService.user.StripeCustomerId})
			this.hasPaymentMethod = paymentMethodResponse.success;

			if(paymentMethodResponse.success){
				this.paymentMethodLast4 = paymentMethodResponse.response.card.last4;
				this.paymentMethodExpirationMonth = paymentMethodResponse.response.card.exp_month.toString();
				this.paymentMethodExpirationYear = paymentMethodResponse.response.card.exp_year.toString().substring(2);

				if(this.paymentMethodExpirationMonth.length == 1){
					this.paymentMethodExpirationMonth = "0" + this.paymentMethodExpirationMonth;
				}
			}
		}
	}

	ShowPaymentMethodDialog(){
		this.paymentFormDialog.ShowDialog();
	}

	async PaymentMethodChanged(){
		await this.GetPaymentMethod();
	}

	Pay(){
		this.paymentLoading = true;
	}
}