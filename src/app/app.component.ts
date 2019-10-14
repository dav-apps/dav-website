import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { enUS } from 'src/locales/locales';
import { DataService } from './services/data-service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	locale = enUS.appComponent;
	width: number = 500;
	offsetTop: number = 0;

	constructor(
		public dataService: DataService,
		public router: Router
	){
		this.locale = this.dataService.GetLocale().appComponent;
	}

	ngOnInit(){
		this.setSize();
		window.onscroll = () => this.offsetTop = window.scrollY;
		initializeIcons();

		this.router.events.subscribe((navigation: any) => {
			if(navigation instanceof NavigationEnd){
				// Clear the success and error messages if the user navigates to a page other than the start page
				if(navigation.url != "/"){
					this.dataService.startPageErrorMessage = "";
					this.dataService.startPageSuccessMessage = "";
				}
			}
		});
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.width = window.outerWidth;
	}

	Logout(){
		this.dataService.user.Logout().then(() => {
			this.router.navigate(['/']);
		});

		return false;
	}
}