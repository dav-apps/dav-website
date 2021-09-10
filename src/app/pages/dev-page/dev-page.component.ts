import { Component } from '@angular/core'
import { Router } from '@angular/router'
import {
	ApiResponse,
	ApiErrorResponse,
	ErrorCodes,
	App,
	DevsController,
	AppsController,
	GetDevResponseData
} from 'dav-js'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-dev-page',
	templateUrl: './dev-page.component.html'
})
export class DevPageComponent {
	locale = enUS.devPage
	apps: App[] = []
	hoveredAppIndex: number = -1
	addAppHovered: boolean = false
	errorMessage: string = ""
	addAppDialogVisible: boolean = false
	addAppDialogLoading: boolean = false
	addAppDialogName: string = ""
	addAppDialogDescription: string = ""
	addAppDialogNameError: string = ""
	addAppDialogDescriptionError: string = ""

	constructor(
		public dataService: DataService,
		private router: Router
	) {
		this.locale = this.dataService.GetLocale().devPage
	}

	async ngOnInit() {
		await this.dataService.userPromise
		if (!this.dataService.dav.isLoggedIn) {
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage
			this.router.navigate(['/'])
			return
		} else if (!this.dataService.dav.user.Dev) {
			this.dataService.startPageErrorMessage = this.locale.accessNotAllowedMessage
			this.router.navigate(['/'])
			return
		}

		// Get the dev
		let getDevResponse: ApiResponse<GetDevResponseData> | ApiErrorResponse = await DevsController.GetDev()

		if (getDevResponse.status == 200) {
			this.apps = (getDevResponse as ApiResponse<GetDevResponseData>).data.apps
		} else {
			// Show error
			this.errorMessage = this.locale.unexpectedErrorShort.replace('{0}', (getDevResponse as ApiErrorResponse).errors[0].code.toString())
		}
	}

	ShowApp(appId: number) {
		this.router.navigate(['dev', appId])
	}

	ShowStatistics() {
		this.router.navigate(['dev', 'statistics'])
	}

	ShowAddAppDialog() {
		this.addAppDialogName = ""
		this.addAppDialogDescription = ""
		this.addAppDialogNameError = ""
		this.addAppDialogDescriptionError = ""
		this.addAppDialogVisible = true
	}

	async AddApp() {
		this.addAppDialogNameError = ""
		this.addAppDialogDescriptionError = ""
		this.addAppDialogLoading = true

		let response: ApiResponse<App> | ApiErrorResponse = await AppsController.CreateApp({ name: this.addAppDialogName, description: this.addAppDialogDescription })
		this.addAppDialogLoading = false

		if (response.status == 201) {
			this.apps.push((response as ApiResponse<App>).data)
			this.addAppDialogVisible = false
		} else {
			let errors = (response as ApiErrorResponse).errors

			for (let error of errors) {
				let errorCode = error.code

				switch (errorCode) {
					case ErrorCodes.NameMissing:
						this.addAppDialogNameError = this.locale.addAppDialog.errors.nameTooShort
						break
					case ErrorCodes.DescriptionMissing:
						this.addAppDialogDescriptionError = this.locale.addAppDialog.errors.descriptionTooShort
						break
					case ErrorCodes.NameTooShort:
						this.addAppDialogNameError = this.locale.addAppDialog.errors.nameTooShort
						break
					case ErrorCodes.DescriptionTooShort:
						this.addAppDialogDescriptionError = this.locale.addAppDialog.errors.descriptionTooShort
						break
					case ErrorCodes.NameTooLong:
						this.addAppDialogNameError = this.locale.addAppDialog.errors.nameTooLong
						break
					case ErrorCodes.DescriptionTooLong:
						this.addAppDialogDescriptionError = this.locale.addAppDialog.errors.descriptionTooLong
						break
				}
			}
		}
	}
}