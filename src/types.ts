import { DateTime } from "luxon"

export interface CsrfToken {
	creationDate: DateTime
	context: CsrfTokenContext
}

export enum CsrfTokenContext {
	LoginPage,
	SignupPage,
	UserPage,
	DevPages,
	ForgotPasswordPage,
	PasswordResetPage
}
