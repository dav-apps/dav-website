import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'dav-website-login-session-page',
	template: ""
})
export class LoginSessionPageComponent{
	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute
	){
		let appId = +this.activatedRoute.snapshot.queryParamMap.get("app_id");
		let apiKey = this.activatedRoute.snapshot.queryParamMap.get("api_key");
		let redirectUrl = decodeURIComponent(this.activatedRoute.snapshot.queryParamMap.get("redirect_url"));

		this.router.navigateByUrl(`login?type=session&app_id=${appId}&api_key=${apiKey}&redirect_url=${redirectUrl}`);
	}
}