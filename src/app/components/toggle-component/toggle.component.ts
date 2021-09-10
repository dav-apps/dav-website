import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
	selector: "dav-website-toggle",
	templateUrl: "./toggle.component.html",
	styleUrls: ["./toggle.component.scss"]
})
export class ToggleComponent {
	@Input() checked: boolean = false
	@Output() change = new EventEmitter()

	CheckboxClicked(event: Event) {
		event.preventDefault()
		this.change.emit(!(event.target as HTMLInputElement).value)
	}
}