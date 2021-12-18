import { Injectable } from "@angular/core"
import axios from 'axios'
import { ApiResponse, ApiErrorResponse } from "dav-js"

@Injectable()
export class ApiService {
	async CreateSession(params: {
		email: string,
		password: string,
		appId: number,
		apiKey: string,
		deviceName: string,
		deviceOs: string
	}): Promise<ApiResponse<any> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/create_session',
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					email: params.email,
					password: params.password,
					appId: params.appId,
					apiKey: params.apiKey,
					deviceName: params.deviceName,
					deviceOs: params.deviceOs
				}
			})

			return {
				status: response.status,
				data: response.data
			}
		} catch (error) {
			return {
				status: error.response.status,
				errors: error.response.data
			}
		}
	}

	async CreateSessionFromAccessToken(params: {
		accessToken: string,
		appId: number,
		apiKey: string,
		deviceName: string,
		deviceOs: string
	}): Promise<ApiResponse<any> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/create_session_from_access_token',
				headers: {
					'Content-Type': 'application/json'
				},
				data: {
					accessToken: params.accessToken,
					appId: params.appId,
					apiKey: params.apiKey,
					deviceName: params.deviceName,
					deviceOs: params.deviceOs
				}
			})

			return {
				status: response.status,
				data: response.data
			}
		} catch (error) {
			return {
				status: error.response.status,
				errors: error.response.data
			}
		}
	}
}