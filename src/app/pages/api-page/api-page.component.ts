import { Component } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { IIconStyles } from 'office-ui-fabric-react'
import {
	ApiResponse,
	ApiErrorResponse,
	Api,
	ApiError,
	ApisController
} from 'dav-npm'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: 'dav-website-api-page',
	templateUrl: './api-page.component.html'
})
export class ApiPageComponent {
	locale = enUS.apiPage
	api: Api = new Api(0, "", [], [], [])
	appId: number = 0
	backButtonIconStyles: IIconStyles = {
		root: {
			fontSize: 19
		}
	}

	constructor(
		public dataService: DataService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.dataService.GetLocale().apiPage
	}

	async ngOnInit() {
		await this.dataService.userPromise
		if (this.dataService.user == null) {
			this.dataService.startPageErrorMessage = this.locale.loginRequiredMessage
			this.router.navigate(['/'])
			return
		} else if (!this.dataService.user.Dev) {
			this.dataService.startPageErrorMessage = this.locale.accessNotAllowedMessage
			this.router.navigate(['/'])
			return
		}

		this.appId = +this.activatedRoute.snapshot.paramMap.get('id')
		let apiId = +this.activatedRoute.snapshot.paramMap.get('apiId')

		// Get the api
		let getApiResponse: ApiResponse<Api> | ApiErrorResponse = await ApisController.GetApi({ id: apiId })

		if (getApiResponse.status == 200) {
			this.api = (getApiResponse as ApiResponse<Api>).data
			this.SortErrors()
		} else {
			// Redirect to the app page
			this.router.navigate(['dev', this.appId])
		}
	}

	GoBack() {
		this.router.navigate(['dev', this.appId])
	}

	SortErrors() {
		// Sort the errors by error code
		this.api.Errors.sort((a: ApiError, b: ApiError) => {
			if (a.Code > b.Code) return 1
			else if (a.Code < b.Code) return -1
			return 0
		})
	}
}