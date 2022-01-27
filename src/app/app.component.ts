import { Component, HostListener, ViewChild, ElementRef } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons'
import { Dav, Environment } from 'dav-js'
import * as DavUIComponents from 'dav-ui-components'
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
	faTwitter = faTwitter
	faGithub = faGithub
	@ViewChild('navbarResponsive', { static: false }) navbar: ElementRef<HTMLDivElement>
	width: number = 500
	offsetTop: number = 0
	year = (new Date()).getFullYear()

	constructor(
		public dataService: DataService,
		public router: Router
	) {
		this.locale = this.dataService.GetLocale().appComponent
		DavUIComponents.setLocale(this.dataService.locale)
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

		// Set the lang attribute of the html element
		let htmlElement = document.getElementsByTagName("html")[0] as HTMLHtmlElement
		if (htmlElement) htmlElement.setAttribute("lang", this.dataService.locale)
	}

	@HostListener('window:resize')
	setSize() {
		this.width = window.outerWidth
	}

	Logout() {
		this.navbar.nativeElement.classList.remove("show")
		Dav.Logout().then(() => this.router.navigate(['/']))
		return false
	}

	NavbarLinkClick() {
		this.navbar.nativeElement.classList.remove("show")
	}

	FooterLinkClick() {
		window.scrollTo(0, 0)
	}
}