import { Component, Input } from '@angular/core'

@Component({
	selector: "dav-website-message-bar",
	templateUrl: "./message-bar.component.html"
})
export class MessageBarComponent {
	@Input() message: string = ""
}