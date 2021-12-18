import { Injectable } from "@angular/core"
import axios from 'axios'
import {
	ApiResponse,
	ApiErrorResponse,
	SessionResponseData,
	SignupResponseData
} from "dav-js"
import { StripeApiResponse } from "./data-service"

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

	async SendConfirmationEmail(params: {
		id: number
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/send_confirmation_email',
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

	async SendPasswordResetEmail(params: {
		email: string
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/send_password_reset_email',
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

	async SetPassword(params: {
		id: number,
		password: string,
		passwordConfirmationToken: string
	}): Promise<ApiResponse<{}> | ApiErrorResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/set_password',
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

	async SaveStripePaymentMethod(params: {
		paymentMethodId: string,
		customerId: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/save_stripe_payment_method',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async GetStripePaymentMethod(params: {
		customerId: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/get_stripe_payment_method',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async SetStripeSubscriptionCancelled(params: {
		customerId: string,
		cancel: boolean
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/set_stripe_subscription_cancelled',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async SetStripeSubscription(params: {
		customerId: string,
		planId: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/set_stripe_subscription',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async RetrieveStripeAccount(params: {
		id: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/retrieve_stripe_account',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async RetrieveStripeBalance(params: {
		account: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/retrieve_stripe_balance',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async CreateStripeAccountLink(params: {
		account: string,
		returnUrl: string,
		type: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/create_stripe_account_link',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}

	async UpdateStripeCustomAccount(params: {
		id: string,
		bankAccountToken: string
	}): Promise<StripeApiResponse> {
		try {
			let response = await axios({
				method: 'post',
				url: '/update_stripe_custom_account',
				headers: {
					'Content-Type': 'application/json'
				},
				data: params
			})

			return {
				success: true,
				response: response.data
			}
		} catch (error) {
			return {
				success: false,
				response: error.response.data
			}
		}
	}
}