//#region en
const enDefaults = {
	appComponent: {
		navbar: {
			pricing: "Pricing",
			allApps: "All Apps",
			login: "Log in",
			logout: "Log out",
			signup: "Sign up"
		},
		footer: {
			contact: "Contact",
			privacy: "Privacy Policy"
		}
	},
	startPage: {
		title: "dav is a new platform of connected apps and services",
		calendoDescription: `
			Calendo is a simple app for managing your schedule.
			You can organize your appointments, manage your todos and group todos by topic.
			<br>With Calendo you have always an overview of upcoming events and todos.
			<br><br>You can log in with your dav Account to use the same calendar on all your devices.
		`,
		universalSoundboardDescription: `
			Create your own soundboard with UniversalSoundboard!
			<br>Add and play your sounds or your music collection. Sort your sounds in categories and set your preferred sounds as favourites to keep track of your collection.
			<br><br>You can log in with your dav Account to use the same soundboard on all your devices.
		`,
		loggedInTitle: "Your Apps",
		welcomeTitle: "Hi, {0}",
		welcomeMessage: "You're not using any app right now. Check out the All Apps page to find your first app!",
		welcomeButton: "Find apps"
	},
	appsPage: {
		title: "All Apps"
	},
	contactPage: {
		title: "Contact",
		germany: "Germany"
	},
	privacyPage: {
		title: "Privacy Policy",
		intro: "The protection of your privacy is very important for us. This is the reason why we collect as less data as possible. This page is intended to inform you what information we collect and how we use that information.",
		section1: {
			header: "Data collection",
			text1: "We save the following information when you visit one of our websites or web apps:",
			listItemTime: "The time",
			listItemCountry: "The country of your IP address",
			listItemBrowser: "The name and version of your browser",
			listItemOs: "The name and version of your operating system",
			text2: "However, we do not save the IP address, so the saved data cannot be associated with certain users."
		},
		section2: {
			header: "Information you provide",
			text1: "When you use our services you will be asked to provide specific information about you, like your email address. We only ask you for the information that is really necessary to provide our services.",
			text2: "All information you provide us within our apps is securely stored and can be accessed from the appropriate apps."
		},
		section3: {
			header: "Data shared with third parties",
			text1: "In order to be able to offer our services, it is necessary that we use certain services from third parties. The services with which data is shared are listed below.",
			text2: "However, these services are only used when it is necessary for our services to work. Your data will not be sold or otherwise disclosed to third parties.",
			text3: "You can delete all of your data in the settings of your account. If you delete your account, all your data shared with third parties will also be deleted."
		},
		section3a: {
			header: "Payments",
			text1: `
				We use <a href="https://stripe.com" target="blank">Stripe</a> for processing payments. 
				If you upgrade to Plus or Pro, we share your email with Stripe in order to connect your payment information with your account.
				Your payment information will be stored directly by Stripe, which means we do not have access to your payment information.
				For more information, we reference to the <a href="https://stripe.com/privacy" target="blank">Privacy Policy of Stripe</a>.
			`
		},
		endText1: "These rules apply to all our apps and our websites, including web apps and our blog. If specific cases apply to certain apps or services, they will be listed below. If you have any questions, feel free to email us at support@dav-apps.tech",
		endText2: "We reserve the right to change this privacy policy in the future.<br>Last updated: 14 Oktober 2019"
	},
	pricingPage: {
		title: "Pricing"
	},
	loginPage: {
		title: "Log in to dav",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Your email address",
		passwordTextfieldLabel: "Password",
		passwordTextfieldPlaceholder: "Your password",
		login: "Log in",
		signup: "Sign up",
		loginAs: "Log in as {0}",
		forgotPassword: "Forgot password?",
		deviceInfoUnknown: "Unknown",
		errors: {
			loginFailed: "Login failed",
			emailMissing: "Please enter your email",
			passwordMissing: "Please enter your password",
			unexpectedErrorShort: "Unexpected error ({0})",
			unexpectedErrorLong: "An unexpected error occured. Please try it again."
		}
	},
	signupPage: {
		title: "Sign up for dav",
		usernameTextfieldLabel: "Username",
		usernameTextfieldPlaceholder: "Pick a username",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Your email address",
		passwordTextfieldLabel: "Password",
		passwordTextfieldPlaceholder: "Choose a password",
		passwordConfirmationTextfieldLabel: "Password confirmation",
		passwordConfirmationTextFieldPlaceholder: "Repeat your password",
		signup: "Sign up",
		deviceInfoUnknown: "Unknown",
		errors: {
			usernameMissing: "Please enter a username",
			emailMissing: "Please enter your email",
			passwordMissing: "Please enter a password",
			passwordConfirmationNotMatching: "Your password doesn't match your password confirmation",
			usernameTooShort: "Your username is too short",
			passwordTooShort: "Your password is too short",
			usernameTooLong: "Your username is too long",
			passwordTooLong: "Your password is too long",
			emailInvalid: "Your email is invalid",
			usernameTaken: "The username is already taken",
			emailTaken: "This email address is already in use",
			unexpectedErrorShort: "Unexpected error ({0})",
			unexpectedErrorLong: "An unexpected error occured. Please try it again."
		}
	},
	passwordResetPage: {
		title: "Reset your password",
		description: "Enter the email address of your account and we will send you a link to reset your password.",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Your email address",
		send: "Send",
		successMessage: "You will receive an email with instructions to reset your password",
		errors: {
			userNotFound: "There is no user with this email address",
			unexpectedErrorShort: "Unexpected error ({0})"
		}
	},
	resetPasswordPage: {
		title: "Create a new password",
		passwordTextfieldLabel: "Password",
		passwordTextfieldPlaceholder: "Choose a new password",
		passwordConfirmationTextfieldLabel: "Password confirmation",
		passwordConfirmationTextfieldPlaceholder: "Repeat your new password",
		save: "Save",
		successMessage: "Your new password has been saved",
		errors: {
			unexpectedErrorLong: "An unexpected error occured. Please try it again."
		}
	},
	emailLinkPage: {
		deleteUserMessage: "Your account has been successfully deleted",
		removeAppMessage: "The app has been successfully removed from your account",
		confirmUserMessage: "Your email address has been successfully confirmed",
		saveNewPasswordMessage: "You new password has been saved",
		saveNewEmailMessage: "Your new email address has been saved",
		resetNewEmailMessage: "Your email address has been reset. You can now log in again with your old email address.",
		errorMessage: "An unexpected error occured. Please try it again."
	},
	userPage: {
		sideNav: {
			general: "General",
			plans: "Plans",
			apps: "Apps"
		},
		general: {
			title: "General Settings",
			avatarAlt: "Your Profile image",
			uploadAvatar: "Upload profile image",
			usernameTextfieldLabel: "Username",
			usernameTextfieldPlaceholder: "Your new username",
			emailTextfieldLabel: "Email",
			emailTextfieldPlaceholder: "Your new email address",
			passwordTextfieldLabel: "New Password",
			passwordTextfieldPlaceholder: "Your new password",
			passwordConfirmationTextfieldLabel: "Password confirmation",
			passwordConfirmationTextfieldPlaceholder: "Repeat your new password",
			save: "Save",
			deleteAccount: "Delete Account",
			deleteAccountDialog: {
				title: "Deleting your Account",
				subText: "Are your absolutely sure that you want to delete your account? All your data will be irreversibly deleted."
			}
		},
		plans: {
			title: "Plans",
			confirmEmailText: "Confirm your email address to change your plan and get more storage.",
			confirmEmailLink: "Resend confirmation email"
		},
		apps: {
			title: "Your Apps",
			totalStorageUsed: "{0} GB of {1} GB used",
			appStorageUsed: "This app uses {0} GB",
			removeApp: "Remove App",
			removeAppDialog: {
				title: "Removing {0}",
				subText: "Are you sure you want to remove this app from your account? All app data will be irreversibly deleted."
			}
		},
		messages: {
			avatarUpdateMessage: "Your profile image has been updated successfully. It may take some time to update across the site and all apps.",
			usernameUpdateMessage: "Your username has been updated successfully",
			emailUpdateMessage: "You will receive an email to confirm your new email address",
			passwordUpdateMessage: "You will receive an email to confirm your new password",
			sendVerificationEmailMessage: "A new confirmation email has been sent",
			sendDeleteAccountEmailMessage: "You will receive an email to confirm the deletion of your account",
			sendRemoveAppEmailMessage: "You will receive an email to confirm the removal of the app"
		},
		errors: {
			unexpectedErrorShort: "Unexpected error ({0})",
			avatarFileTooLarge: "The image file is too large",
			usernameTooShort: "Your new username is too short",
			usernameTooLong: "Your new username is too long",
			usernameTaken: "The username is already taken",
			emailInvalid: "Your new email is invalid",
			emailTaken: "This email address is already in use",
			passwordTooShort: "Your new password is too short",
			passwordTooLong: "Your new password is too long",
			emailAlreadyConfirmed: "Your email address is already confirmed"
		},
		cancel: "Cancel",
		loginRequiredMessage: "You need to log in to access this page"
	},
	devPage: {
		loginRequiredMessage: "You need to log in to access this page",
		unexpectedErrorShort: "Unexpected error ({0})"
	},
	appPage: {
		statistics: "Statistics",
		edit: "Edit",
		published: "Published",
		tables: "Tables",
		events: "Events"
	},
	pricingComponent: {
		free: {
			storage: "2 GB of storage"
		},
		plus: {
			price: "3 € per month",
			storage: "15 GB of storage",
			features: "Use all Plus features in our apps"
		},
		pro: {
			price: "10 € per month",
			storage: "50 GB of storage",
			features: "Use all Pro features in our apps"
		},
		useAllApps: "Use all our apps",
		accessData: "Access your data on any device",
		noAds: "No ads",
		signup: "Sign up",
		currentPlan: "Current plan",
		upgrade: "Upgrade",
		downgrade: "Downgrade",
		save: "Save",
		cancel: "Cancel",
		paymentFormDialogTitle: "Enter payment information",
		unexpectedError: "Unexpected error ({0})",
		changePlanSuccessMessage: "Your plan has been successfully changed",
		paymentMethodCardHeader: "Your payment method",
		cardExpires: "Expires",
		edit: "Edit",
		changePaymentMethodSuccessMessage: "Your payment method has been successfully updated",
		nextPayment: "Next payment",
		subscriptionEnd: "Subscription end",
		continueSubscription: "Continue subscription",
		cancelSubscription: "Cancel subscription",
		continueSubscriptionSuccessMessage: "Your subscription will be renewed after {0}",
		cancelSubscriptionSuccessMessage: "Your subscription will not be renewed after {0}",
		upgradePlusDialogTitle: "Upgrade to Plus",
		upgradeProDialogTitle: "Upgrade to Pro",
		upgradePlusDialogSubtext: "Do you want to upgrade to dav Plus for 3 € per month?",
		upgradeProDialogSubtext: "Do you want to upgrade to dav Pro for 10 € per month?",
		continue: "Continue"
	},
	paymentFormComponent: {
		header: "Credit or debit card",
		save: "Save",
		unexpectedError: "Unexpected error ({0})"
	}
}

export var enUS = enDefaults;

export var enGB = enDefaults;
//#endregion

//#region de
const deDefaults = {
	appComponent: {
		navbar: {
			pricing: "Pläne",
			allApps: "Alle Apps",
			login: "Anmelden",
			logout: "Abmelden",
			signup: "Registrieren"
		},
		footer: {
			contact: "Kontakt",
			privacy: "Datenschutzerklärung"
		}
	},
	startPage: {
		title: "dav ist eine neue Plattform für vernetzte Apps und Dienste",
		calendoDescription: `
			Calendo ist eine einfache App, um deinen Zeitplan zu verwalten.
			Organisiere deine Termine, verwalte deine Todos und gruppiere Todos nach Themen.
			<br>Mit Calendo hast du immer den Überblick über bevorstehende Ereignisse und Aufgaben.
			<br><br>Melde dich mit deinem dav-Account an, um von allen Geräten auf deinen Kalender zuzugreifen.
		`,
		universalSoundboardDescription: `
			Erstelle dein eigenes Soundboard mit UniversalSoundboard!
			<br>Füge deine Sounds oder deine Musiksammlung hinzu. Sortiere deine Sounds in Kategorien und speichere deine Lieblingssounds als Favoriten, um den Überblick über deine Sammlung zu behalten.
			<br><br>Melde dich mit deinem dav-Account an, um dein Soundboard auf mehreren Geräten zu nutzen.
		`,
		loggedInTitle: "Deine Apps",
		welcomeTitle: "Hi, {0}",
		welcomeMessage: "Im Moment benutzt du keine App. Sieh dir alle Apps an, um deine erste App zu finden!",
		welcomeButton: "Apps finden"
	},
	appsPage: {
		title: "Alle Apps"
	},
	contactPage: {
		title: "Kontakt",
		germany: "Deutschland"
	},
	privacyPage: {
		title: "Datenschutzerklärung",
		intro: "Der Schutz deiner Privatsphäre ist uns sehr wichtig. Aus diesem Grund erheben wir so wenig Daten wie möglich. Diese Seite dient dazu, dich darüber zu informieren, welche Informationen wir sammeln und wie wir diese Informationen verwenden.",
		section1: {
			header: "Datenerhebung",
			text1: "Wir speichern die folgenden Daten, wenn du eine unserer Webseiten oder Web-Apps besuchst:",
			listItemTime: "Die Zeit",
			listItemCountry: "Das Land deiner IP-Adresse",
			listItemBrowser: "Den Namen und die Version deines Browsers",
			listItemOs: "Den Namen und die Version deines Betriebssystems",
			text2: "Allerdings speichern wir nicht die IP-Adresse, so dass die gespeicherten Daten nicht mit bestimmten Nutzern in Verbindung gebracht werden können."
		},
		section2: {
			header: "Von dir angegebene Informationen",
			text1: "Wenn du unsere Dienste nutzt, wird du aufgefordert, bestimmte Informationen über dich anzugeben, wie z.B. deine Email-Adresse. Wir fragen nur nach den Informationen, die notwendig sind, um unsere Dienst anbieten zu können.",
			text2: "Alle Informationen, die du in unseren Apps angibst, werden sicher gespeichert und können von den entsprechenden Apps aus zugegriffen werden."
		},
		section3: {
			header: "An Dritte weitergegebene Daten",
			text1: "Um unsere Dienste anbieten zu können, ist es notwendig, dass wir bestimmte Dienste von Dritten nutzen. Die Dienste, mit denen wir Daten teilen, sind unten aufgelistet.",
			text2: "Allerdings werden diese Dienste nur in Anspruch genommen, wenn es notwendig ist. Deine Daten werden nicht verkauft oder anderweitig and Dritte weitergegeben.",
			text3: "Du kannst all deine Daten in den Einstellungen deines Account löschen. Wenn du dein Account löscht, werden auch alle Daten gelöscht, die mit Dritten geteilt wurden."
		},
		section3a: {
			header: "Zahlungen",
			text1: `
				Wir nutzen <a href="https://stripe.com" target="blank">Stripe</a> zum Bearbeiten von Zahlungen. 
				Wenn du dein Abo auf Plus oder Pro hochstufst, teilen wir deine Email-Adresse mit Stripe, um deine Zahlungsinformationen mit deinem Account zu verknüpfen.
				Deine Zahlungsinformationen werden direkt durch Stripe gespeichert, was bedeutet, dass wir keinen Zugriff auf deine Zahlungsinformationen haben. 
				Für mehr Informationen verweisen wir auf die <a href="https://stripe.com/privacy" target="blank">Datenschutzerklärung von Stripe</a>.
			`
		},
		endText1: "Diese Regeln gelten für all unsere Apps und Webseiten, einschließlich Web-Apps und unseren Blog. Falls spezielle Fälle auf bestimmte Apps oder Dienste zutreffen, werden sie im Folgenden aufgeführt. Falls du Fragen hast, kannst du uns jederzeit eine Email an support@dav-apps.tech schreiben.",
		endText2: "Wir behalten uns das Recht vor, diese Datenschutzerklärung in Zukunft zu ändern.<br>Zuletzt geändert: 14. Oktober 2019"
	},
	pricingPage: {
		title: "Pläne"
	},
	loginPage: {
		title: "Bei dav anmelden",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Deine Email-Adresse",
		passwordTextfieldLabel: "Passwort",
		passwordTextfieldPlaceholder: "Dein Passwort",
		login: "Anmelden",
		signup: "Registrieren",
		loginAs: "Als {0} anmelden",
		forgotPassword: "Passwort vergessen?",
		deviceInfoUnknown: "Unbekannt",
		errors: {
			loginFailed: "Anmeldung fehlgeschlagen",
			emailMissing: "Bitte gib deine Email-Adresse ein",
			passwordMissing: "Bitte gib dein Passwort ein",
			unexpectedErrorShort: "Unerwarteter Fehler ({0})",
			unexpectedErrorLong: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
		}
	},
	signupPage: {
		title: "Für dav registrieren",
		usernameTextfieldLabel: "Nutzername",
		usernameTextfieldPlaceholder: "Wähle einen Nutzernamen",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Deine Email-Adresse",
		passwordTextfieldLabel: "Passwort",
		passwordTextfieldPlaceholder: "Wähle ein Passwort",
		passwordConfirmationTextfieldLabel: "Passwortbestätigung",
		passwordConfirmationTextFieldPlaceholder: "Wiederhole dein Passwort",
		signup: "Registrieren",
		deviceInfoUnknown: "Unbekannt",
		errors: {
			usernameMissing: "Bitte gib einen Nutzernamen ein",
			emailMissing: "Bitte gib deine Email-Adresse ein",
			passwordMissing: "Bitte gib ein Passwort ein",
			passwordConfirmationNotMatching: "Dein Passwort stimmt nicht mit der Passwortbestätigung überein",
			usernameTooShort: "Dein Nutzername ist zu kurz",
			passwordTooShort: "Dein Passwort ist zu kurz",
			usernameTooLong: "Dein Nutzername ist zu lang",
			passwordTooLong: "Dein Passwort ist zu lang",
			emailInvalid: "Deine Email-Adresse ist ungültig",
			usernameTaken: "Der Nutzername ist bereits vergeben",
			emailTaken: "Diese Email-Adresse wird bereits verwendet",
			unexpectedErrorShort: "Unerwarteter Fehler ({0})",
			unexpectedErrorLong: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
		}
	},
	passwordResetPage: {
		title: "Passwort zurücksetzen",
		description: "Gib die Email-Adresse deines Accounts ein und wir senden dir einen Link, um dein Passwort zurückzusetzen.",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Deine Email-Adresse",
		send: "Senden",
		successMessage: "Du bekommst eine Email mit Anweisungen, um dein Passwort zurückzusetzen.",
		errors: {
			userNotFound: "Es gibt keinen Nutzer mit dieser Email-Adresse",
			unexpectedErrorShort: "Unerwarteter Fehler ({0})"
		}
	},
	resetPasswordPage: {
		title: "Neues Passwort erstellen",
		passwordTextfieldLabel: "Passwort",
		passwordTextfieldPlaceholder: "Wähle ein neues Passwort",
		passwordConfirmationTextfieldLabel: "Passwortbestätigung",
		passwordConfirmationTextfieldPlaceholder: "Wiederhole dein neues Passwort",
		save: "Speichern",
		successMessage: "Dein neues Passwort wurde gespeichert",
		errors: {
			unexpectedErrorLong: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
		}
	},
	emailLinkPage: {
		deleteUserMessage: "Dein Account wurde erfolgreich gelöscht",
		removeAppMessage: "Die App wurde erfolgreich von deinem Account entfernt",
		confirmUserMessage: "Deine Email-Adresse wurde erfolgreich verifiziert",
		saveNewPasswordMessage: "Dein neues Passwort wurde gespeichert",
		saveNewEmailMessage: "Deine neue Email-Adresse wurde gespeichert",
		resetNewEmailMessage: "Deine Email-Adresse wurde zurückgesetzt. Du kannst dich nun wieder mit deiner alten Email-Adresse anmelden.",
		errorMessage: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
	},
	userPage: {
		sideNav: {
			general: "Allgemein",
			plans: "Pläne",
			apps: "Apps"
		},
		general: {
			title: "Allgemeine Einstellungen",
			avatarAlt: "Dein Profilbild",
			uploadAvatar: "Profilbild hochladen",
			usernameTextfieldLabel: "Nutzername",
			usernameTextfieldPlaceholder: "Dein neuer Nutzername",
			emailTextfieldLabel: "Email",
			emailTextfieldPlaceholder: "Deine neue Email-Adresse",
			passwordTextfieldLabel: "Neues Passwort",
			passwordTextfieldPlaceholder: "Dein neues Passwort",
			passwordConfirmationTextfieldLabel: "Passwortbestätigung",
			passwordConfirmationTextfieldPlaceholder: "Wiederhole dein Passwort",
			save: "Speichern",
			deleteAccount: "Account löschen",
			deleteAccountDialog: {
				title: "Löschen deines Accounts",
				subText: "Bist du dir absolut sicher, dass du deinen Account löschen willst? All deine Daten werden unwiderruflich gelöscht."
			}
		},
		plans: {
			title: "Pläne",
			confirmEmailText: "Bestätige deine Email-Adresse, um deinen Plan zu ändern und mehr Speicherplatz zu bekommen.",
			confirmEmailLink: "Bestätigungsemail senden"
		},
		apps: {
			title: "Deine Apps",
			totalStorageUsed: "{0} GB von {1} GB verwendet",
			appStorageUsed: "Diese App verwendet {0} GB",
			removeApp: "App entfernen",
			removeAppDialog: {
				title: "{0} entfernen",
				subText: "Bist du dir sicher, dass du diese App von deinem Account entfernen willst? Alle App-Daten werden unwiderruflich gelöscht."
			}
		},
		messages: {
			avatarUpdateMessage: "Dein Profilbild wurde erfolgreich aktualisiert. Es kann einige Zeit dauern, bis das neue Profilbild in allen Apps angezeigt wird.",
			usernameUpdateMessage: "Dein Nutzername wurde erfolgreich aktualisiert",
			emailUpdateMessage: "Du erhältst eine Email zur Bestätigung deiner neuen Email-Adresse",
			passwordUpdateMessage: "Du erhältst eine Email zur Bestätigung deines neuen Passworts",
			sendVerificationEmailMessage: "Eine neue Bestätigungsemail wurde gesendet",
			sendDeleteAccountEmailMessage: "Du erhältst eine Email, um die Löschung deines Accounts zu bestätigen",
			sendRemoveAppEmailMessage: "Du erhältst eine Email, um die Entfernung der App zu bestätigen"
		},
		errors: {
			unexpectedErrorShort: "Unerwarteter Fehler ({0})",
			avatarFileTooLarge: "Die Bilddatei ist zu groß",
			usernameTooShort: "Dein neuer Nutzername ist zu kurz",
			usernameTooLong: "Dein neuer Nutzername ist zu lang",
			usernameTaken: "Der Nutzername ist bereits vergeben",
			emailInvalid: "Deine neue Email-Adresse ist ungültig",
			emailTaken: "Diese Email-Adresse wird bereits verwendet",
			passwordTooShort: "Dein neues Passwort ist zu kurz",
			passwordTooLong: "Dein neues Passwort ist zu lang",
			emailAlreadyConfirmed: "Deine Email-Adresse ist bereits bestätigt"
		},
		cancel: "Abbrechen",
		loginRequiredMessage: "Du musst dich anmelden, um auf diese Seite zugreifen zu können"
	},
	devPage: {
		loginRequiredMessage: "Du musst dich anmelden, um auf diese Seite zugreifen zu können",
		unexpectedErrorShort: "Unerwarteter Fehler ({0})"
	},
	appPage: {
		statistics: "Statistiken",
		edit: "Bearbeiten",
		published: "Veröffentlicht",
		tables: "Tabellen",
		events: "Events"
	},
	pricingComponent: {
		free: {
			storage: "2 GB Speicherplatz"
		},
		plus: {
			storage: "15 GB Speicherplatz",
			price: "3 € pro Monat",
			features: "Zugriff auf alle Plus-Funktionen"
		},
		pro: {
			storage: "50 GB Speicherplatz",
			price: "10 € pro Monat",
			features: "Zugriff auf alle Pro-Funktionen"
		},
		useAllApps: "Benutze all unsere Apps",
		accessData: "Zugriff auf deine Daten von jedem Gerät",
		noAds: "Keine Werbung",
		signup: "Registrieren",
		currentPlan: "Aktueller Plan",
		upgrade: "Upgrade",
		downgrade: "Downgrade",
		save: "Speichern",
		cancel: "Abbrechen",
		paymentFormDialogTitle: "Zahlungsinformationen eingeben",
		unexpectedError: "Unerwarteter Fehler ({0})",
		changePlanSuccessMessage: "Dein Plan wurde erfolgreich geändert",
		paymentMethodCardHeader: "Deine Zahlungsmethode",
		cardExpires: "Ablaufdatum:",
		edit: "Bearbeiten",
		changePaymentMethodSuccessMessage: "Deine Zahlungsmethode wurde erfolgreich aktualisiert",
		nextPayment: "Nächste Zahlung",
		subscriptionEnd: "Ende deines Abos",
		continueSubscription: "Abo fortführen",
		cancelSubscription: "Abo beenden",
		continueSubscriptionSuccessMessage: "Dein Abo wird nach dem {0} weiter verlängert",
		cancelSubscriptionSuccessMessage: "Dein Abo wird nach dem {0} nicht weiter verlängert",
		upgradePlusDialogTitle: "Upgrade auf Plus",
		upgradeProDialogTitle: "Upgrade auf Pro",
		upgradePlusDialogSubtext: "Möchtest du auf dav Plus für 3 € pro Monat wechseln?",
		upgradeProDialogSubtext: "Möchtest du auf dav Pro für 10 € pro Monat wechseln?",
		continue: "Weiter"
	},
	paymentFormComponent: {
		header: "Kredit- oder Debitkarte",
		save: "Speichern",
		unexpectedError: "Unerwarteter Fehler ({0})"
	}
}

export var deDE = deDefaults;

export var deAT = deDefaults;

export var deCH = deDefaults;
//#endregion