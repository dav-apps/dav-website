import { Component, Input, Output, EventEmitter } from '@angular/core'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: "dav-website-dropdown",
	templateUrl: "./dropdown.component.html",
	styleUrls: ["./dropdown.component.scss"]
})
export class DropdownComponent {
	locale = enUS.dropdownComponent
	@Input() options: { key: string, value: string }[] = []
	@Input() selectedKey: string = ""
	@Input() width: number = 160
	@Output() change = new EventEmitter()
	showItems: boolean = false
	buttonText: string = this.locale.defaultDropdownButtonText

	constructor(
		public dataService: DataService
	) { }

	ngOnInit() {
		this.locale = this.dataService.GetLocale().dropdownComponent
		this.UpdateButtonText()

		window.onclick = (event: PointerEvent) => {
			if (!(event.target as HTMLElement).matches(".dropdown *")) {
				this.showItems = false
			}
		}
	}

	ngOnDestroy() {
		window.onclick = null
	}

	UpdateButtonText() {
		// Get the selected item and set the button text
		let i = this.options.findIndex(option => option.key == this.selectedKey)
		if (i != -1) this.buttonText = this.options[i].value
		else this.buttonText = this.locale.defaultDropdownButtonText
	}

	OptionClick(key: string) {
		this.selectedKey = key
		this.change.emit(key)

		this.showItems = false
		this.UpdateButtonText()
	}
}