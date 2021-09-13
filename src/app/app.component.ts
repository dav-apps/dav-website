import { Component, HostListener } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { Dav, Environment } from 'dav-js'
import { enUS } from 'src/locales/locales'
import { DataService } from './services/data-service'
import { environment } from 'src/environments/environment'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	locale = enUS.appComponent
	width: number = 500
	offsetTop: number = 0
	year = (new Date()).getFullYear()

	constructor(
		public dataService: DataService,
		public router: Router
	) {
		this.locale = this.dataService.GetLocale().appComponent
	}

	async ngOnInit() {
		this.setSize()
		window.onscroll = () => this.offsetTop = window.scrollY

		this.router.events.subscribe((navigation: any) => {
			if (navigation instanceof NavigationEnd) {
				// Clear the success and error messages if the user navigates to a page other than the start page
				if (navigation.url != "/") {
					this.dataService.startPageErrorMessage = ""
					this.dataService.startPageSuccessMessage = ""
				}
			}
		})

		// Initialize dav
		new Dav({
			environment: environment.production ? Environment.Production : Environment.Development,
			appId: environment.appId,
			tableIds: [],
			parallelTableIds: [],
			callbacks: {
				UserLoaded: () => this.dataService.userPromiseResolve(),
				UserDownloaded: () => this.dataService.userDownloadPromiseResolve()
			}
		})
	}

	@HostListener('window:resize')
	onResize() {
		this.setSize()
	}

	setSize() {
		this.width = window.outerWidth
	}

	Logout() {
		this.HideNavbar()
		Dav.Logout().then(() => this.router.navigate(['/']))
		return false
	}

	HideNavbar() {
		let navbar = document.getElementById('navbar-responsive')
		if (navbar) navbar.classList.remove('show')
	}
}