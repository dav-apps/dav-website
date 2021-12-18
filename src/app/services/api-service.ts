import { Injectable } from "@angular/core"
import axios from 'axios'
import {
	ApiResponse,
	ApiErrorResponse,
	SessionResponseData,
	SignupResponseData
} from "dav-js"

@Injectable()
export class ApiService {
	async CreateSession(params: {
		email: string,
		password: string,
		appId: number,
		apiKey: string,
		deviceName: string,
		deviceOs: string
	}): Promise<ApiResponse<SessionResponseData> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/create_session',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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
	}): Promise<ApiResponse<SessionResponseData> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/create_session_from_access_token',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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

	async Signup(params: {
		email: string,
		firstName: string,
		password: string,
		appId: number,
		apiKey: string,
		deviceName: string,
		deviceOs: string
	}): Promise<ApiResponse<SignupResponseData> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/signup',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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

	async ConfirmUser(params: {
		id: number,
		emailConfirmationToken: string
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/confirm_user',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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

	async SaveNewPassword(params: {
		id: number,
		passwordConfirmationToken: string
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/save_new_password',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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

	async SaveNewEmail(params: {
		id: number,
		emailConfirmationToken: string
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/save_new_email',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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

	async ResetEmail(params: {
		id: number,
		emailConfirmationToken: string
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/reset_email',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
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