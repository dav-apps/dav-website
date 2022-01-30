import { DateTime } from 'luxon'

export interface CsrfToken {
	creationDate: DateTime
	context: CsrfTokenContext
}

export enum CsrfTokenContext {
	LoginPage,
	SignupPage,
	DevPages
}