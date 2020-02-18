import { Component, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { DataService, StripeApiResponse } from 'src/app/services/data-service';
import { WebsocketService, WebsocketCallbackType } from 'src/app/services/websocket-service';
import { environment } from 'src/environments/environment';
import { enUS } from 'src/locales/locales';
declare var Stripe: any;

@Component({
	selector: 'dav-website-bank-account-form',
	templateUrl: './bank-account-form.component.html',
	styleUrls: ['./bank-account-form.component.scss']
})
export class BankAccountFormComponent{
	locale = enUS.bankAccountFormComponent;
	@Input() stripeCustomAccountId: string;
	@Output() completed = new EventEmitter();
	@Output() loadingStart = new EventEmitter();
	@Output() loadingEnd = new EventEmitter();
	stripe: any;
	elements: any;
	iban: any;
	ibanHandler = this.onChange.bind(this);
	name: string = "";
	errorMessage: string = "";
	bankName: string = "";
	loading: boolean = false;

	constructor(
		public dataService: DataService,
		private websocketService: WebsocketService,
		private cd: ChangeDetectorRef
	){
		this.locale = this.dataService.GetLocale().bankAccountFormComponent;
	}

	ngOnDestroy(){
		if(this.iban){
			this.iban.removeEventListener('change', this.ibanHandler);
			this.iban.destroy();
		}
	}

	Init(){
		this.stripe = Stripe(environment.stripePublishableKey);
		this.elements = this.stripe.elements();

		this.iban = this.elements.create('iban', {supportedCountries: ['SEPA']});
		this.iban.mount("#iban-element");

		this.iban.addEventListener('change', this.ibanHandler);

		// Reset name and messages
		this.errorMessage = "";
		this.bankName = "";
		this.name = "";
		document.getElementById('name')["value"] = "";
	}

	onChange(event: any){
		if(event.error){
			this.errorMessage = event.error.message;
		}else{
			this.errorMessage = "";
		}

		if(event.bankName){
			this.bankName = event.bankName;
		}else{
			this.bankName = "";
		}

		this.cd.detectChanges();
	}

	NameChange(event: Event){
		// Get the value of the name input
		this.name = event.target["value"];
	}

	async SaveBankAccount(){
		if(this.errorMessage.length > 0 || this.name.length == 0) return;
		this.loadingStart.emit(null);

		// Create the token
		let tokenResult = await this.stripe.createToken(this.iban, {
			currency: "eur",
			account_holder_name: this.name,
			account_holder_type: "individual"
		});

		// Save the token on the server
		let updateStripeCustomAccountResponse: StripeApiResponse = await this.websocketService.Emit(WebsocketCallbackType.UpdateStripeCustomAccount, {
			id: this.stripeCustomAccountId,
			bankAccountToken: tokenResult.token.id
		});
		this.loadingEnd.emit(null);

		if(!updateStripeCustomAccountResponse.success){
			// Show error message
			this.errorMessage = this.locale.unexpectedError;
		}else{
			this.completed.emit(updateStripeCustomAccountResponse.response);
		}
	}
}