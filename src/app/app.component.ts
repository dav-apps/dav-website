import { Component, HostListener } from '@angular/core';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { DataService } from './services/data-service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	width: number = 500;
	offsetTop: number = 0;

	constructor(
		public dataService: DataService
	){}

	ngOnInit(){
		this.setSize();
		window.onscroll = () => this.offsetTop = window.scrollY;
		initializeIcons();
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.width = window.outerWidth;
	}
}