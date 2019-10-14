import { Component, HostListener } from '@angular/core';
import { MessageBarType } from 'office-ui-fabric-react';
import { DataService } from 'src/app/services/data-service';
import { enUS } from 'src/locales/locales';

@Component({
	selector: 'dav-website-start-page',
	templateUrl: './start-page.component.html',
	styleUrls: [
		'./start-page.component.scss'
	]
})
export class StartPageComponent{
	locale = enUS.startPage;
	errorMessageBarType: MessageBarType = MessageBarType.error;
	successMessageBarType: MessageBarType = MessageBarType.success;
	height: number = 500;
	width: number = 500;

	constructor(
		public dataService: DataService
	){
		this.locale = this.dataService.GetLocale().startPage;
	}

	ngOnInit(){
		this.setSize();
		this.parallax();
	}

	@HostListener('window:resize')
	onResize(){
		this.setSize();
	}

	setSize(){
		this.height = window.innerHeight;
		this.width = window.outerWidth;
	}

	parallax(){
		const parallaxElements = document.getElementsByClassName('parallax');
		const parallax = function(img: any) {
			var positionInfo = img.getBoundingClientRect();
  
			if (positionInfo.top <= window.innerHeight && positionInfo.bottom > 0 )  {
				const speed = img.getAttribute("data-parallax-speed") ? +img.getAttribute("data-parallax-speed") : 2;
				let pos = ((((positionInfo.top/window.innerHeight) * positionInfo.height) * -1) / speed) + "px";
				img.style.backgroundPosition = `center ${ pos }`;
			}
		}
		window.addEventListener('scroll', function(e) {
			for(let i = 0; i < parallaxElements.length; i++){
				parallax(parallaxElements.item(i));
			}
		});
  
		for(let i = 0; i < parallaxElements.length; i++){
			parallax(parallaxElements.item(i));
		}
	};
}