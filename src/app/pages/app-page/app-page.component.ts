import { Component } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import {
	ApiResponse,
	ApiErrorResponse,
	ErrorCodes,
	App,
	Table,
	Api,
	AppsController,
	TablesController,
	ApisController
} from 'dav-js'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-app-page',
	templateUrl: './app-page.component.html'
})
export class AppPageComponent {
	locale = enUS.appPage
	app: App = new App(0, "", "", false, null, null, null)
	editAppDialogVisible: boolean = false
	editAppDialogLoading: boolean = false
	publishAppDialogVisible: boolean = false
	publishAppDialogLoading: boolean = false
	addTableDialogVisible: boolean = false
	addTableDialogLoading: boolean = false
	addApiDialogVisible: boolean = false
	addApiDialogLoading: boolean = false
	newName: string = ""
	newDescription: string = ""
	newWebLink: string = ""
	newGooglePlayLink: string = ""
	newMicrosoftStoreLink: string = ""
	editAppDialogNameError: string = ""
	editAppDialogDescriptionError: string = ""
	editAppDialogWebLinkError: string = ""
	editAppDialogGooglePlayLinkError: string = ""
	editAppDialogMicrosoftStoreLinkError: string = ""
	addTableDialogNewTableName: string = ""
	addTableDialogNewTableError: string = ""
	addApiDialogApiName: string = ""
	addApiDialogApiNameError: string = ""

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().appPage
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

		// Get the app
		let appId = +this.activatedRoute.snapshot.paramMap.get('id')

		let getAppResponse: ApiResponse<App> | ApiErrorResponse = await AppsController.GetApp({ id: appId })

		if (getAppResponse.status == 200) {
			this.app = (getAppResponse as ApiResponse<App>).data
		} else {
			// Redirect to the Dev page
			this.router.navigate(['dev'])
		}
	}

	GoBack() {
		this.router.navigate(['dev'])
	}

	ShowAppStatistics() {
		this.router.navigate(['dev', this.app.Id, 'statistics'])
	}

	ShowEditAppDialog() {
		this.ClearEditAppDialogErrors()
		this.newName = this.app.Name
		this.newDescription = this.app.Description
		this.newWebLink = this.app.WebLink
		this.newGooglePlayLink = this.app.GooglePlayLink
		this.newMicrosoftStoreLink = this.app.MicrosoftStoreLink
		this.editAppDialogVisible = true
	}

	async UpdateApp() {
		this.ClearEditAppDialogErrors()

		if (this.newName.length == 0) {
			this.editAppDialogNameError = this.locale.editAppDialog.errors.nameTooShort
			return
		} else if (this.newDescription.length == 0) {
			this.editAppDialogDescriptionError = this.locale.editAppDialog.errors.descriptionTooShort
			return
		}

		this.editAppDialogLoading = true

		this.UpdateAppResponse(
			await AppsController.UpdateApp({
				id: this.app.Id,
				name: this.newName,
				description: this.newDescription,
				webLink: this.newWebLink,
				googlePlayLink: this.newGooglePlayLink,
				microsoftStoreLink: this.newMicrosoftStoreLink
			})
		)
	}

	ShowAddTableDialog() {
		this.addTableDialogNewTableName = ""
		this.addTableDialogNewTableError = ""
		this.addTableDialogVisible = true
	}

	ShowAddApiDialog() {
		this.addApiDialogApiName = ""
		this.addApiDialogApiNameError = ""
		this.addApiDialogVisible = true
	}

	async PublishApp() {
		this.publishAppDialogLoading = true

		this.UpdateAppResponse(
			await AppsController.UpdateApp({
				id: this.app.Id,
				published: !this.app.Published
			})
		)
	}

	async AddTable() {
		this.addTableDialogNewTableError = ""
		this.addTableDialogLoading = true

		this.CreateTableResponse(
			await TablesController.CreateTable({
				appId: this.app.Id,
				name: this.addTableDialogNewTableName
			})
		)
	}

	async AddApi() {
		this.addApiDialogApiNameError = ""
		this.addApiDialogLoading = true

		this.CreateApiResponse(
			await ApisController.CreateApi({
				appId: this.app.Id,
				name: this.addApiDialogApiName
			})
		)
	}

	UpdateAppResponse(response: ApiResponse<App> | ApiErrorResponse) {
		this.editAppDialogLoading = false
		this.publishAppDialogLoading = false

		if (this.editAppDialogVisible) {
			if (response.status == 200) {
				// Update the values of the app object
				let responseData = (response as ApiResponse<App>).data

				this.editAppDialogVisible = false
				this.app.Name = responseData.Name
				this.app.Description = responseData.Description
				this.app.WebLink = responseData.WebLink
				this.app.GooglePlayLink = responseData.GooglePlayLink
				this.app.MicrosoftStoreLink = responseData.MicrosoftStoreLink

				this.newName = ""
				this.newDescription = ""
				this.newWebLink = ""
				this.newGooglePlayLink = ""
				this.newMicrosoftStoreLink = ""
			} else {
				let errors = (response as ApiErrorResponse).errors

				for (let error of errors) {
					let errorCode = error.code

					switch (errorCode) {
						case ErrorCodes.NameTooShort:
							this.editAppDialogNameError = this.locale.editAppDialog.errors.nameTooShort
							break
						case ErrorCodes.DescriptionTooShort:
							this.editAppDialogDescriptionError = this.locale.editAppDialog.errors.descriptionTooShort
							break
						case ErrorCodes.NameTooLong:
							this.editAppDialogNameError = this.locale.editAppDialog.errors.nameTooLong
							break
						case ErrorCodes.DescriptionTooLong:
							this.editAppDialogDescriptionError = this.locale.editAppDialog.errors.descriptionTooLong
							break
						case ErrorCodes.WebLinkInvalid:
							this.editAppDialogWebLinkError = this.locale.editAppDialog.errors.linkInvalid
							break
						case ErrorCodes.GooglePlayLinkInvalid:
							this.editAppDialogGooglePlayLinkError = this.locale.editAppDialog.errors.linkInvalid
							break
						case ErrorCodes.MicrosoftStoreLinkInvalid:
							this.editAppDialogMicrosoftStoreLinkError = this.locale.editAppDialog.errors.linkInvalid
							break
						default:
							if (errors.length == 1) {
								this.editAppDialogNameError = this.locale.editAppDialog.errors.unexpectedError.replace('{0}', errorCode.toString())
							}
							break
					}
				}
			}
		} else if (this.publishAppDialogVisible) {
			if (response.status == 200) {
				this.app.Published = (response as ApiResponse<App>).data.Published
			}

			this.publishAppDialogVisible = false
		}
	}

	CreateTableResponse(response: (ApiResponse<Table> | ApiErrorResponse)) {
		this.addTableDialogLoading = false

		if (response.status == 201) {
			this.app.Tables.push((response as ApiResponse<Table>).data)
			this.addTableDialogVisible = false
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code

			switch (errorCode) {
				case ErrorCodes.NameMissing:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameTooShort
					break
				case ErrorCodes.NameTooShort:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameTooShort
					break
				case ErrorCodes.NameTooLong:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameTooLong
					break
				case ErrorCodes.NameInvalid:
					this.addTableDialogNewTableError = this.locale.addTableDialog.errors.nameInvalid
					break
			}
		}
	}

	CreateApiResponse(response: (ApiResponse<Api> | ApiErrorResponse)) {
		this.addApiDialogLoading = false

		if (response.status == 201) {
			this.app.Apis.push((response as ApiResponse<Api>).data)
			this.addApiDialogVisible = false
		} else {
			let errorCode = (response as ApiErrorResponse).errors[0].code

			switch (errorCode) {
				case ErrorCodes.NameMissing:
					this.addApiDialogApiNameError = this.locale.addApiDialog.errors.nameTooShort
					break
				case ErrorCodes.NameTooShort:
					this.addApiDialogApiNameError = this.locale.addApiDialog.errors.nameTooShort
					break
				case ErrorCodes.NameTooLong:
					this.addApiDialogApiNameError = this.locale.addApiDialog.errors.nameTooLong
					break
			}
		}
	}

	ClearEditAppDialogErrors() {
		this.editAppDialogNameError = ""
		this.editAppDialogDescriptionError = ""
		this.editAppDialogWebLinkError = ""
		this.editAppDialogGooglePlayLinkError = ""
		this.editAppDialogMicrosoftStoreLinkError = ""
	}
}