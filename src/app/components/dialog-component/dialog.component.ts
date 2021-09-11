import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
	selector: "dav-website-dialog",
	templateUrl: "./dialog.component.html"
})
export class DialogComponent {
	@Input() title: string = ""
	@Input() primaryButtonText: string = ""
	@Input() defaultButtonText: string = ""
	@Input() isLoading: boolean = false
	@Input() maxWidth: number = 600
	@Output() dismiss = new EventEmitter()
	@Output() primaryButtonClick = new EventEmitter()
	@Output() defaultButtonClick = new EventEmitter()

	OverlayClick() {
		if (!this.isLoading) {
			this.dismiss.emit()
		}
	}

	PrimaryButtonClick() {
		this.primaryButtonClick.emit()
	}

	DefaultButtonClick() {
		this.defaultButtonClick.emit()
	}
}