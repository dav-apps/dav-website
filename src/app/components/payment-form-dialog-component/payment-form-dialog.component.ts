import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { SpinnerSize, IDialogContentProps, IButtonStyles } from 'office-ui-fabric-react';
import { PaymentFormComponent } from 'src/app/components/payment-form-component/payment-form.component';
import { DataService } from 'src/app/services/data-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-payment-form-dialog',
	templateUrl: './payment-form-dialog.component.html'
})
export class PaymentFormDialogComponent{
	locale = enUS.paymentFormDialogComponent;
	@Output() complete = new EventEmitter();
	@ViewChild('paymentForm', {static: true}) paymentForm: PaymentFormComponent;
	paymentFormVisible: boolean = false;
	paymentFormLoading: boolean = false;
	spinnerSize: SpinnerSize = SpinnerSize.small;

	dialogContentProps: IDialogContentProps = {
		title: this.locale.title
	}
	dialogPrimaryButtonStyles: IButtonStyles = {
		root: {
			marginLeft: 10
		}
	}

	constructor(
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().paymentFormDialogComponent;
	}

	public ShowDialog(){
		this.dialogContentProps.title = this.locale.title;
		this.paymentFormVisible = true;
		setTimeout(() => this.paymentForm.Init(), 1);
	}

	HideDialog(){
		this.paymentFormVisible = false;
	}

	Save(){
		this.paymentForm.SaveCard();
	}

	PaymentMethodInputCompleted(){
		this.paymentFormVisible = false;
		this.complete.emit();
	}
}