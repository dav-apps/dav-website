import { Component, Input } from '@angular/core';
import { App } from 'dav-npm';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faAndroid, faWindows } from '@fortawesome/free-brands-svg-icons';

@Component({
	selector: "dav-website-app-card",
	templateUrl: './app-card.component.html'
})
export class AppCardComponent{
	faGlobe = faGlobe;
	faAndroid = faAndroid;
	faWindows = faWindows;
	@Input() app: App;
}