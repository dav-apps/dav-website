//#region en
const enDefaults = {
	lang: "en",
	appComponent: {
		footer: {
			contact: "Contact",
			privacy: "Privacy Policy"
		}
	},
	startPage: {
		title: "dav is a modern platform of connected apps and services",
		pocketlibDescription: `
			PocketLib is a simple and modern ebook reader.<br><br>

			📖 Read any epub file<br>
			Add any local epub file to your library. PocketLib automatically saves your reading progress, so you can go directly to the last page you read when you open the app.<br><br>

			📚 Discover a wide range of literature<br>
			The PocketLib Store contains a large collection of literature in the public domain, carefully selected and produced for the true book lover. Just log in to get free access to all these books.<br><br>

			☁ Save your data and read on any device<br>
			Log in with your dav Account to save your library and reading progress in the cloud. Read on any device, wherever and whenever you want.
		`,
		universalSoundboardDescription: `
			Create your own soundboard with UniversalSoundboard!
			<br>Add and play your sounds or your music collection. Sort your sounds in categories and set your preferred sounds as favourites to keep track of your collection.
			<br><br>You can log in with your dav Account to use the same soundboard on all your devices.
		`,
		calendoDescription: `
			Calendo is a simple app for managing your schedule.
			You can organize your appointments, manage your todos and group todos by topic.
			<br>With Calendo you have always an overview of upcoming events and todos.
			<br><br>You can log in with your dav Account to use the same calendar on all your devices.
		`
	},
	userStartPage: {
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
			header: "Information you provide",
			text1: `
				In our apps you are able to add specific data and files.
				When you log in to our apps, the data and files you've added are automatically uploaded to our servers.
				Your app data is stored securely on our servers and not shared with third parties.
			`,
			text2: `
				When you use our services you will be asked to provide specific information about you, like your email address.
				We only ask you for the information that is necessary to provide our services.
				Metadata like this is the only information that may be shared with third parties to enable certain features.
				The services that have access to such metadata are listed below.
			`
		},
		section2: {
			header: "Third party services",
			text: "In order to provide our services, we use certain third party services. The services with which we share data are listed below."
		},
		section2a: {
			header: "Simple Analytics",
			text: `
				On our websites and web apps, we use <a href="https://simpleanalytics.com" target="blank">Simple Analytics</a>.
				When you visit one of our sites, the country you are in, the pages you visit, your device, and your browser, as well as other information, is stored by Simple Analytics.
				We use this data to better understand how and by whom our apps are used.
				<br>For more information, please refer to the <a href="https://simpleanalytics.com/privacy-policy" target="blank">Privacy Policy of Simple Analytics</a>.
			`
		},
		section2b: {
			header: "AppCenter",
			text: `
				In UniversalSoundboard we use <a href="https://appcenter.ms" target="blank">AppCenter</a>, a service provided by Microsoft for usage statistics and error diagnostics.
				When you use UniversalSoundboard, the app version, your version of Windows, your device, your language, and your app settings, as well as other information, is stored by AppCenter.
				With this data we are able to find and fix errors and crashes.
				<br>For more information, please refer to the <a href="https://privacy.microsoft.com/en-us/privacystatement" target="blank">Privacy Policy of Microsoft</a>.
			`
		},
		section2c: {
			header: "Stripe",
			text: `
				We use <a href="https://stripe.com" target="blank">Stripe</a> for processing payments.
				If you upgrade to Plus or Pro or when you make purchases in our apps, we share your email with Stripe in order to connect your payment information with your account.
				Your payment information will be stored directly by Stripe, which means we do not have access to it.
				For more information, please refer to the <a href="https://stripe.com/privacy" target="blank">Privacy Policy of Stripe</a>.
			`
		},
		endText1: `These rules apply to all our apps and websites, including web apps and our blog. If you have any questions you can always contact us at <a href="mailto:support@dav-apps.tech" class="text-dark">support@dav-apps.tech</a>.`,
		endText2: "We reserve the right to update this privacy policy in the future.",
		endText3: "Last update: December 5, 2021"
	},
	pocketlibTermsPage: {
		title: "Terms of Service for authors",
		intro: "The following conditions apply if you register as an author on PocketLib.",
		section1: {
			title: "Definitions",
			text1: `<a href="https://pocketlib.dav-apps.tech" class="font-weight-bold text-dark" target="blank">PocketLib</a> is an app for reading electronic books (ebooks).`,
			text2: `The <a href="https://pocketlib.dav-apps.tech/store" class="font-weight-bold text-dark" target="blank">PocketLib Store</a> is a digital platform for publishing and purchasing ebooks.`,
			text3: `
				<a href="/" class="font-weight-bold text-dark" target="blank">dav</a> is a digital platform where users can sign up. PocketLib is an app of dav,
				which means users can log in on PocketLib using dav. It is possible to purchase ebooks on the PocketLib Store using
				the payment information stored in the dav account of the user. Furthermore, a user can access all ebooks in the PocketLib Store
				if he is a subscriber of dav Pro.
			`,
			text4: `
				<span class="font-weight-bold">dav Pro</span> is a subscription for users of dav, which is used to access all features and contents
				in PocketLib and all other dav apps for a monthly fee.
			`,
			text5: `The <span>library</span> is a page in PocketLib that lists all ebooks that are stored on the user's device and are available for reading.`,
			text6: `
				<a href="https://stripe.com" class="font-weight-bold text-dark" target="blank">Stripe</a> is a company for online payment systems. dav uses the services of Stripe
				for processing payments. Payments in the PocketLib Store are handled by dav.
			`
		},
		section2: {
			title: "Rights and responsibilities",
			text1: "If you are an author submitting ebooks for publication on PocketLib, you grant us the rights",
			list1: {
				item1: "to offer your uploaded ebooks to users for the specified price or via a subscription",
				item2: "to provide the user with a download of purchased ebooks without copy protection",
				item3: "to use the metadata and cover of your ebooks for promotional purposes",
				item4: "to reject ebooks submitted for publication without giving reasons or to remove already published ebooks from the PocketLib Store",
				item5: "to correct possible errors in the metadata of uploaded ebooks",
				item6: "to present and market your ebooks in the Pocketlib Store"
			},
			text2: "As an author you commit yourself",
			list2: {
				item1: "to submit only ebooks on PocketLib for publication",
				sublist: {
					item1: "of which you are the author",
					item2: "whose content does not violate any legal regulations and does not infringe the rights of third parties"
				},
				item2: "to specify only prices that comply with the specifications of any existing fixed book price system"
			},
			text3: "As an author you are able to remove your published ebooks from the PocketLib Store at any time."
		},
		section3: {
			title: "Publication and royalties",
			text1: "In PocketLib there are two ways for users to access published ebooks.",
			subtitle1: "Purchasing",
			text2: `
				As a user you can purchase ebooks in the PocketLib Store for the specified price. Users can add purchased ebooks
				to their library again and again and download them as files without copy protection.
			`,
			text3: "In the case of a purchase, 80 percent of the purchase price goes to the author, while the remaining 20 percent goes to us.",
			subtitle2: "Access via subscription",
			text4: `
				As a subscriber of dav Pro a user can access all ebooks in the PocketLib Store. The user has access to the content as long
				as he pays the monthly fee. Up to 80 percent of the monthly fee is divided equally among the authors
				from whom the user has ebooks in his library.
			`,
			text5: `
				The following is an example: A user pays 10 € per month for dav Pro and has two ebooks from two different authors
				in his library. Both authors earn 4 € per month from this user.<br>This is only a simplified scenario, since the amount
				that is divided among the authors depends on further factors that are not further described here.
			`,
			subtitle3: "Payout of the earnings",
			text6: `
				In order for the appropriate amount to be paid out to you as an author, it is necessary for you to register as a provider on dav.
				This process is handled through Stripe, where some information about you is collected.
			`,
			text7: "Your information as a provider is accessible in the settings of your account on dav. There you can also specify a bank account for the monthly payout."
		},
		endText1: `We reserve the right to update these terms in the future. If you have any questions you can always contact us at <a href="mailto:support@dav-apps.tech" class="text-dark">support@dav-apps.tech</a>.`,
		endText2: "Last update: December 3, 2020"
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
		firstNameTextfieldLabel: "Your first name",
		firstNameTextfieldPlaceholder: "How should we call you?",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Your email address",
		passwordTextfieldLabel: "Password",
		passwordTextfieldPlaceholder: "Choose a password",
		passwordConfirmationTextfieldLabel: "Password confirmation",
		passwordConfirmationTextFieldPlaceholder: "Repeat your password",
		signup: "Sign up",
		errors: {
			firstNameMissing: "Please enter your name",
			emailMissing: "Please enter your email",
			passwordMissing: "Please enter a password",
			passwordConfirmationNotMatching: "Your password doesn't match the password confirmation",
			firstNameTooShort: "The name is too short",
			passwordTooShort: "Your password is too short",
			firstNameTooLong: "The name is too long",
			passwordTooLong: "Your password is too long",
			emailInvalid: "Your email is invalid",
			emailTaken: "This email address is already in use",
			unexpectedErrorShort: "Unexpected error ({0})",
			unexpectedErrorLong: "An unexpected error occured. Please try it again."
		}
	},
	forgotPasswordPage: {
		title: "Reset your password",
		description: "Enter the email address of your account and we will send you a link to reset your password.",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Your email address",
		send: "Send",
		errors: {
			emailInvalid: "Please enter a valid email address",
			userNotFound: "There is no user with this email address",
			unexpectedErrorShort: "Unexpected error ({0})"
		}
	},
	passwordResetPage: {
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
	purchasePage: {
		loginTitle: "Log in to dav",
		passwordTextfieldLabel: "Password",
		passwordTextfieldPlaceholder: "Your password",
		login: "Log in",
		forgotPassword: "Forgot password?",
		errors: {
			loginFailed: "Login failed",
			passwordMissing: "Please enter your password",
			unexpectedError: "Unexpected error ({0})",
			unexpectedErrorLong: "An unexpected error occured. Please try it again."
		},
		profileImageAlt: "Your profile image",
		paymentMethodCardHeader: "Your payment method",
		cardExpires: "Expires",
		addPaymentMethod: "Add payment method",
		pay: "Pay {0}",
		edit: "Edit"
	},
	userPage: {
		sideNav: {
			general: "General",
			plans: "Plans",
			apps: "Apps",
			provider: "Provider"
		},
		general: {
			title: "General Settings",
			profileImageAlt: "Your profile image",
			uploadProfileImage: "Upload profile image",
			firstNameTextfieldLabel: "Your first name",
			firstNameTextfieldPlaceholder: "How should we call you?",
			emailTextfieldLabel: "Email",
			emailTextfieldPlaceholder: "Your new email address",
			passwordTextfieldLabel: "New Password",
			passwordTextfieldPlaceholder: "Your new password",
			passwordConfirmationTextfieldLabel: "Password confirmation",
			passwordConfirmationTextfieldPlaceholder: "Repeat your new password",
			profileImageDialog: {
				header: "Crop your profile image"
			}
		},
		plans: {
			title: "Plans",
			currentPlan: "Current plan",
			upgrade: "Upgrade",
			downgrade: "Downgrade",
			changePlanSuccessMessage: "Your plan has been successfully changed",
			paymentMethodCardHeader: "Your payment method",
			cardExpires: "Expires",
			edit: "Edit",
			nextPayment: "Next payment",
			subscriptionEnd: "Subscription end",
			continueSubscription: "Continue subscription",
			cancelSubscription: "Cancel subscription",
			continueSubscriptionSuccessMessage: "Your subscription will be renewed after {0}",
			cancelSubscriptionSuccessMessage: "Your subscription will not be renewed after {0}",
			changePlanDialog: {
				upgradePlusHeader: "Upgrade to Plus",
				upgradePlusDescription: "Do you want to upgrade to dav Plus for 3 € per month?",
				upgradeProHeader: "Upgrade to Pro",
				upgradeProDescription: "Do you want to upgrade to dav Pro for 10 € per month?",
				downgradePlusHeader: "Downgrade to Plus",
				downgradePlusDescription: "Do you want to downgrade to dav Plus for 3 € per month?",
				downgradeFreeHeader: "Downgrade to Free",
				downgradeFreeDescription: "Do you want to end your subscription?"
			}
		},
		apps: {
			title: "Your Apps",
			totalStorageUsed: "{0} GB of {1} GB used",
			appStorageUsed: "This app uses {0} GB"
		},
		provider: {
			title: "Become a provider",
			subTitle: "Distribute your digital content on dav platforms and earn money",
			supportedApps: "Supported apps",
			setupExplanation: "To become a provider, we need to collect some information about you.",
			startSetup: "Start setup",
			dashboardTitle: "Provider Dashboard",
			aboutYou: "About you",
			editDetails: "Edit details",
			yourPayoutAccount: "Your payout account",
			noAccountProvided: "No bank account provided",
			nextPayout: "Next payout",
			missingInformationWarningText: "To activate payouts, we need more information from you.",
			missingInformationWarningLink: "Edit details",
			missingBankAccountWarningText: "Don't forget to provide a bank account so that we can transfer your payouts.",
			startStripeSetupDialog: {
				header: "Provider setup",
				text1: "Please specify the country you live in.<br>(Please contact us if your country is not listed.)",
				text2: "For the setup you will be redirected to a page of <a href='https://stripe.com' target='blank'>Stripe</a>."
			},
			bankAccountDialog: {
				header: "Set bank account"
			},
			countries: {
				de: "Germany",
				at: "Austria",
				us: "United States"
			}
		},
		messages: {
			profileImageUpdateMessage: "Your profile image has been updated successfully. It may take some time to update across the site and all apps.",
			firstNameUpdateMessage: "Your name has been updated successfully",
			emailUpdateMessage: "You will receive an email to confirm your new email address",
			passwordUpdateMessage: "You will receive an email to confirm your new password",
			sendConfirmationEmailMessage: "A new confirmation email has been sent",
			bankAccountUpdateMessage: "Your bank account has been updated successfully"
		},
		errors: {
			unexpectedErrorShort: "Unexpected error ({0})",
			unexpectedErrorLong: "An unexpected error occured. Please try it again later.",
			profileImageFileTooLarge: "The image file is too large",
			firstNameTooShort: "The name is too short",
			firstNameTooLong: "The name is too long",
			emailInvalid: "Your new email is invalid",
			emailTaken: "This email address is already in use",
			passwordMissing: "Please enter a password",
			passwordConfirmationMissing: "Please enter your password again",
			passwordConfirmationNotMatching: "Your password doesn't match the password confirmation",
			passwordTooShort: "Your new password is too short",
			passwordTooLong: "Your new password is too long",
			emailAlreadyConfirmed: "Your email address is already confirmed"
		},
		save: "Save",
		edit: "Edit",
		continue: "Continue",
		cancel: "Cancel"
	},
	devPage: {
		title: "Developer Dashboard",
		statistics: "Statistics",
		loginRequiredMessage: "You need to log in to access this page",
		accessNotAllowedMessage: "You can't access this page",
		unexpectedErrorShort: "Unexpected error ({0})",
		save: "Save",
		cancel: "Cancel"
	},
	appPage: {
		statistics: "Statistics",
		edit: "Edit",
		published: "Published",
		tables: "Tables",
		apis: "APIs",
		editAppDialog: {
			header: "Edit app",
			nameTextfieldLabel: "Name",
			nameTextfieldPlaceholder: "The name of your app",
			descriptionTextfieldLabel: "Description",
			descriptionTextfieldPlaceholder: "The description of your app",
			webLinkTextfieldLabel: "Web App",
			webLinkTextfieldPlaceholder: "The link to your web app",
			googlePlayLinkTextfieldLabel: "Google Play",
			googlePlayLinkTextfieldPlaceholder: "Link to the Google Play Store entry",
			microsoftStoreLinkTextfieldLabel: "Microsoft Store",
			microsoftStoreLinkTextfieldPlaceholder: "Link to the Microsoft Store entry",
			errors: {
				nameTooShort: "The name is too short",
				descriptionTooShort: "The description is too short",
				nameTooLong: "The name is too long",
				descriptionTooLong: "The description is too long",
				linkInvalid: "The link is invalid",
				unexpectedError: "Unexpected error ({0})"
			}
		},
		publishAppDialog: {
			publishHeader: "Publish app",
			unpublishHeader: "Unpublish app",
			publishSubtext: "Are you sure you want to publish this app?",
			unpublishSubtext: "Are you sure you want to unpublish this app?",
			confirm: "Confirm"
		},
		save: "Save",
		cancel: "Cancel",
		loginRequiredMessage: "You need to log in to access this page",
		accessNotAllowedMessage: "You can't access this page"
	},
	statisticsPage: {
		title: "General statistics",
		loginRequiredMessage: "You need to log in to access this page",
		accessNotAllowedMessage: "You can't access this page",
		numberOfUsers: "Number of users",
		plans: "Plans",
		confirmations: "Email confirmations",
		confirmed: "Confirmed",
		unconfirmed: "Unconfirmed",
		activeUsers: "Active users",
		currentlyActiveUsers: "Currently active users",
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
		yearly: "Yearly",
		totalUsers: "Total users: {0}"
	},
	appStatisticsPage: {
		title: "Statistics of {0}",
		loginRequiredMessage: "You need to log in to access this page",
		accessNotAllowedMessage: "You can't access this page",
		numberOfUsers: "Number of users",
		activeUsers: "Active users",
		currentlyActiveUsers: "Currently active users",
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
		yearly: "Yearly",
		totalUsers: "Total users: {0}"
	},
	navbarComponent: {
		pricing: "Pricing",
		allApps: "All Apps",
		devDashboard: "Developer Dashboard",
		login: "Log in",
		logout: "Log out",
		signup: "Sign up"
	},
	footerComponent: {
		contact: "Contact",
		privacy: "Privacy Policy"
	},
	paymentFormComponent: {
		header: "Credit or debit card",
		save: "Save",
		unexpectedError: "Unexpected error ({0})"
	},
	bankAccountFormComponent: {
		name: "Name",
		unexpectedError: "An unexpected error occured. Please try it again later.",
		unexpectedErrorWithCode: "Unexpected error ({0})"
	},
	misc: {
		paymentFormDialog: {
			header: "Enter payment information",
			save: "Save",
			cancel: "Cancel"
		},
		expiredSessionDialog: {
			header: "Your session expired",
			description: "Please reload the page and try it again.",
			reload: "Reload page"
		},
		pricing: {
			free: {
				storage: "2 GB"
			},
			plus: {
				price: "3 € per month",
				storage: "15 GB"
			},
			pro: {
				price: "10 € per month",
				storage: "50 GB"
			},
			onlineStorage: "Online storage",
			accessData: "Access your data on any device",
			noAds: "No ads",
			universalsoundboard: {
				hotkeyFeature: "Assign hotkeys to sounds",
				outputDeviceFeature: "Set the output device for each playing sound individually",
				playlistDownloadFeature: "Download entire YouTube playlists"
			}
		},
		messages: {
			passwordResetMessage: "You will receive an email with instructions to reset your password",
			confirmUserMessage: "Your email address has been successfully confirmed",
			saveNewPasswordMessage: "You new password has been saved",
			saveNewEmailMessage: "Your new email address has been saved",
			resetNewEmailMessage: "Your email address has been reset. You can now log in again with your old email address.",
			errorMessage: "An unexpected error occured. Please try it again."
		}
	}
}

export var enUS = {
	...enDefaults,
	lang: "en-US"
}

export var enGB = {
	...enDefaults,
	lang: "en-GB"
}
//#endregion

//#region de
const deDefaults = {
	lang: "de",
	appComponent: {
		footer: {
			contact: "Kontakt",
			privacy: "Datenschutzerklärung"
		}
	},
	startPage: {
		title: "dav ist eine moderne Plattform für vernetzte Apps und Dienste",
		pocketlibDescription: `
			PocketLib ist ein einfacher und moderner Ebook-Reader.<br><br>

			📖 Lese jede epub-Datei<br>
			Füge jede lokale epub-Datei zu deiner Bibliothek hinzu. PocketLib speichert automatisch deinen Fortschritt beim Lesen, so dass du direkt auf die zuletzt gelesene Seite kommst, wenn du die App öffnest.<br><br>

			📚 Entdecke eine große Auswahl an Literatur<br>
			Der PocketLib Store enthält eine umfangreiche Sammlung an freier Literatur, sorgfältig ausgewählt und produziert für wahre Buchliebhaber. Melde dich an, um kostenlosen Zugriff auf all diese Bücher zu bekommen.<br><br>

			☁ Sichere deine Daten und lese auf jedem Gerät<br>
			Melde dich mit deinem dav Account an, um deine Bibliothek und deinen Lese-Fortschritt in der Cloud zu speichern. Lese auf jedem Gerät, wann und wo auch immer du willst.
		`,
		universalSoundboardDescription: `
			Erstelle dein eigenes Soundboard mit UniversalSoundboard!
			<br>Füge deine Sounds oder deine Musiksammlung hinzu. Sortiere deine Sounds in Kategorien und speichere deine Lieblingssounds als Favoriten, um den Überblick über deine Sammlung zu behalten.
			<br><br>Melde dich mit deinem dav Account an, um dein Soundboard auf mehreren Geräten zu nutzen.
		`,
		calendoDescription: `
			Calendo ist eine einfache App, um deinen Zeitplan zu verwalten.
			Organisiere deine Termine, verwalte deine Todos und gruppiere Todos nach Themen.
			<br>Mit Calendo hast du immer den Überblick über bevorstehende Ereignisse und Aufgaben.
			<br><br>Melde dich mit deinem dav Account an, um von allen Geräten auf deinen Kalender zuzugreifen.
		`
	},
	userStartPage: {
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
			header: "Von dir angegebene Informationen",
			text1: `
				In unseren Apps bist du in der Lage, bestimmte Daten und Dateien einzufügen.
				Wenn du dich in unseren Apps anmeldest, werden die Daten und Dateien, die du hinzugefügt hast, automatisch auf unsere Server hochgeladen.
				Deine App-Daten werden sicher auf unseren Servern gespeichert und nicht an Dritte weitergegeben.
			`,
			text2: `
				Wenn du dich registrierst, wird du aufgefordert, bestimmte Informationen über dich anzugeben, wie z.B. deine Email-Adresse.
				Wir fragen nur nach den Daten, die notwendig sind, um unsere Dienste zur Verfügung zu stellen.
				Metadaten wie diese sind die einzigen Informationen, die eventuell mit Dritten geteilt werden, um bestimmte Funktionen zu ermöglichen.
				Die Dienste, die auf solche Metadaten Zugriff haben, sind unten aufgeführt.
			`
		},
		section2: {
			header: "Dienste von Dritten",
			text: "Um unsere Dienste anbieten zu können, nutzen wir bestimmte Dienste von Dritten. Die Dienste, mit denen wir Daten teilen, sind im Folgenden aufgelistet.",
		},
		section2a: {
			header: "Simple Analytics",
			text: `
				Auf unseren Webseiten und Web-Apps nutzen wir <a href="https://simpleanalytics.com" target="blank">Simple Analytics</a>.
				Wenn du eine unserer Seiten besuchst, werden u.a. das Land, in dem du dich befindest, die besuchten Seiten, dein Gerät und dein Browser durch Simple Analytics gespeichert.
				Wir nutzen diese Daten, um besser zu verstehen, wie und von wem unsere Apps genutzt werden.
				<br>Für weitere Informationen verweisen wir auf die <a href="https://simpleanalytics.com/privacy-policy" target="blank">Datenschutzerklärung von Simple Analytics</a>.
			`
		},
		section2b: {
			header: "AppCenter",
			text: `
				In UniversalSoundboard verwenden wir <a href="https://appcenter.ms" target="blank">AppCenter</a>, ein Dienst von Microsoft für Nutzungsstatistiken und zur Fehlerdiagnose.
				Wenn du UniversalSoundboard nutzt, werden u.a. die App-Version, deine Version von Windows, dein Gerät, deine Sprache und deine App-Einstellungen durch AppCenter gespeichert.
				Mit diesen Daten sind wir in der Lage, Fehler und Abstürze zu finden und zu beheben.
				<br>Für weitere Informationen verweisen wir auf die <a href="https://privacy.microsoft.com/en-us/privacystatement" target="blank">Datenschutzerklärung von Microsoft</a>.
			`
		},
		section2c: {
			header: "Stripe",
			text: `
				Wir nutzen <a href="https://stripe.com" target="blank">Stripe</a> zum Bearbeiten von Zahlungen. 
				Wenn du dein Abo auf Plus oder Pro hochstufst oder Käufe innerhalb unserer Apps tätigst, teilen wir deine Email-Adresse mit Stripe, um deine Zahlungsinformationen mit deinem Account zu verknüpfen.
				Deine Zahlungsinformationen werden direkt durch Stripe gespeichert, was bedeutet, dass wir keinen Zugriff darauf haben.
				<br>Für weitere Informationen verweisen wir auf die <a href="https://stripe.com/privacy" target="blank">Datenschutzerklärung von Stripe</a>.
			`
		},
		endText1: `Diese Regeln gelten für all unsere Apps und Webseiten, einschließlich Web-Apps und unseren Blog. Bei Fragen kannst du uns jederzeit über <a href="mailto:support@dav-apps.tech" class="text-dark">support@dav-apps.tech</a> kontaktieren.`,
		endText2: "Wir behalten uns das Recht vor, diese Datenschutzerklärung in Zukunft zu aktualisieren.",
		endText3: "Letzte Aktualisierung: 5. Dezember 2021"
	},
	pocketlibTermsPage: {
		title: "Allgemeine Geschäftsbedingungen für Autoren",
		intro: "Die folgenden Bestimmungen gelten, wenn Du Dich auf PocketLib als Autor registrierst.",
		section1: {
			title: "Begriffserklärungen",
			text1: `<a href="https://pocketlib.dav-apps.tech" class="font-weight-bold text-dark" target="blank">PocketLib</a> ist eine App zum Lesen von elektronischen Büchern (E-Books).`,
			text2: `Der <a href="https://pocketlib.dav-apps.tech/store" class="font-weight-bold text-dark" target="blank">PocketLib Store</a> ist eine digitale Plattform zur Veröffentlichung und zum Verkauf von E-Books.`,
			text3: `
				<a href="/" class="font-weight-bold text-dark" target="blank">dav</a> ist eine digitale Plattform, auf der sich Nutzer registrieren können.
				PocketLib ist eine App von dav, was bedeutet, dass man sich in PocketLib mit dav anmelden kann. Mit den in dav hinterlegten
				Zahlungsinformationen ist es möglich, E-Books im PocketLib Store zu erwerben. Zusätzlich dazu kann man im PocketLib Store
				auf alle E-Books zugreifen, wenn man Abonnent von dav Pro ist.
			`,
			text4: `
				<span class="font-weight-bold">dav Pro</span> ist ein Abonnement für Nutzer von dav, mit dem man für einen monatlichen Betrag auf alle Funktionen
				und veröffentlichten Inhalte in PocketLib und alle anderen Apps von dav zugreifen kann.
			`,
			text5: `
				Die <span class="font-weight-bold">Bibliothek</span> bezeichnet eine Seite in PocketLib, auf der alle E-Books aufgelistet sind,
				die auf dem Gerät des Nutzers gespeichert sind und zum Lesen zur Verfügung stehen.
			`,
			text6: `
				<a href="https://stripe.com" class="font-weight-bold text-dark" target="blank">Stripe</a> ist ein Unternehmen für Online-Bezahlsysteme.
				dav nutzt die Dienste von Stripe für die Abwicklung von Zahlungen. Zahlungen im PocketLib Store werden über dav abgewickelt.

			`
		},
		section2: {
			title: "Rechte und Verpflichtungen",
			text1: "Wenn Du als Autor E-Books auf PocketLib zur Veröffentlichung einreichst, räumst Du uns die Rechte ein,",
			list1: {
				item1: "Deine hochgeladenen E-Books Nutzern für den angegebenen Preis oder über ein Abo anzubieten",
				item2: "dem Nutzer die erworbenen E-Books ohne Kopierschutz als Download zur Verfügung zu stellen",
				item3: "die Metadaten und die Cover Deiner E-Books für Werbezwecke zu nutzen",
				item4: "ohne Angabe von Gründen die zur Veröffentlichung eingereichten E-Books abzulehnen oder bereits veröffentlichte E-Books aus dem PocketLib Store zu entfernen",
				item5: "eventuelle Fehler in den Metadaten der hochgeladenen E-Books zu korrigieren",
				item6: "Deine E-Books im PocketLib Store zu präsentieren und zu vermarkten"
			},
			text2: "Als Autor verpflichtest Du Dich dazu,",
			list2: {
				item1: "nur E-Books auf PocketLib zur Veröffentlichung einzureichen,",
				sublist: {
					item1: "deren Urheber Du selbst bist",
					item2: "deren Inhalte nicht gegen gesetzlichen Bestimmungen verstoßen und keine Rechte Dritter verletzen"
				},
				item2: "mit den von Dir angegebenen Preisen die Vorgaben einer etwaig bestehenden Buchpreisbindung einzuhalten"
			},
			text3: "Als Autor bist Du in der Lage, Deine veröffentlichten E-Books jederzeit aus dem PocketLib Store zu entfernen."
		},
		section3: {
			title: "Veröffentlichung und Honorare",
			text1: "In PocketLib gibt es zwei Arten, um als Nutzer auf veröffentlichte E-Books zuzugreifen.",
			subtitle1: "Käuflicher Erwerb",
			text2: `
				Als Nutzer kann man E-Books im PocketLib Store für den angegebenen Preis erwerben.
				Nutzer können erworbene E-Books immer wieder zu ihrer Bibliothek hinzufügen und ohne Kopierschutz als Datei herunterladen.
			`,
			text3: "Beim käuflichen Erwerb gehen 80 Prozent des Kaufpreises an den Autor, während die restlichen 20 Prozent an uns gehen.",
			subtitle2: "Zugriff über Abonnement",
			text4: `
				Als Abonnent von dav Pro kann man auf alle E-Books im PocketLib Store zugreifen. Dabei hat der Nutzer Zugriff auf die Inhalte,
				solange er den monatlichen Betrag zahlt. Bis zu 80 Prozent des monatlichen Betrages werden gleichmäßig auf die Autoren, von denen
				der Nutzer E-Books in seiner Bibliothek hat, aufgeteilt.
			`,
			text5: `
				Im Folgenden ein Beispiel: Ein Nutzer bezahlt 10 € pro Monat für dav Pro
				und hat zwei E-Books von zwei unterschiedlichen Autoren in seiner Bibliothek.
				Beide Autoren verdienen damit 4 € im Monat an diesem Nutzer.<br>Dies ist nur ein
				vereinfachtes Szenario, da der Betrag, der an die Autoren verteilt wird, von
				weiteren Faktoren abhängt, die an dieser Stelle nicht weiter erläutert werden.
			`,
			subtitle3: "Auszahlung der Einnahmen",
			text6: `
				Damit der entsprechende Betrag an Dich als Autor ausgezahlt werden kann, ist es notwendig, dass Du Dich
				bei dav als Anbieter registrierst. Dieser Prozess läuft über Stripe, wobei einige Informationen von Stripe
				über Dich gesammelt werden.
			`,
			text7: "Deine Informationen als Anbieter sind in den Einstellungen deines Kontos auf dav einsehbar. Dort kannst Du auch ein Bankkonto für die monatliche Auszahlung angeben."
		},
		endText1: `Wir behalten uns das Recht vor, diese Bestimmungen in Zukunft zu aktualisieren. Bei Fragen kannst Du uns jederzeit über <a href="mailto:support@dav-apps.tech" class="text-dark">support@dav-apps.tech</a> kontaktieren.`,
		endText2: "Letzte Aktualisierung: 3. Dezember 2020",
	},
	pricingPage: {
		title: "Abos"
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
		firstNameTextfieldLabel: "Dein Vorname",
		firstNameTextfieldPlaceholder: "Wie sollen wir dich nennen?",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Deine Email-Adresse",
		passwordTextfieldLabel: "Passwort",
		passwordTextfieldPlaceholder: "Wähle ein Passwort",
		passwordConfirmationTextfieldLabel: "Passwortbestätigung",
		passwordConfirmationTextFieldPlaceholder: "Wiederhole dein Passwort",
		signup: "Registrieren",
		errors: {
			firstNameMissing: "Bitte gib deinen Namen ein",
			emailMissing: "Bitte gib deine Email-Adresse ein",
			passwordMissing: "Bitte gib ein Passwort ein",
			passwordConfirmationNotMatching: "Dein Passwort stimmt nicht mit der Passwortbestätigung überein",
			firstNameTooShort: "Der Name ist zu kurz",
			passwordTooShort: "Dein Passwort ist zu kurz",
			firstNameTooLong: "Der Name ist zu lang",
			passwordTooLong: "Dein Passwort ist zu lang",
			emailInvalid: "Deine Email-Adresse ist ungültig",
			emailTaken: "Diese Email-Adresse wird bereits verwendet",
			unexpectedErrorShort: "Unerwarteter Fehler ({0})",
			unexpectedErrorLong: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
		}
	},
	forgotPasswordPage: {
		title: "Passwort zurücksetzen",
		description: "Gib die Email-Adresse deines Accounts ein und wir senden dir einen Link, um dein Passwort zurückzusetzen.",
		emailTextfieldLabel: "Email",
		emailTextfieldPlaceholder: "Deine Email-Adresse",
		send: "Senden",
		errors: {
			emailInvalid: "Bitte gib eine gültige Email-Adresse ein",
			userNotFound: "Es gibt keinen Nutzer mit dieser Email-Adresse",
			unexpectedErrorShort: "Unerwarteter Fehler ({0})"
		}
	},
	passwordResetPage: {
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
	purchasePage: {
		loginTitle: "Bei dav anmelden",
		passwordTextfieldLabel: "Passwort",
		passwordTextfieldPlaceholder: "Dein Passwort",
		login: "Anmelden",
		forgotPassword: "Passwort vergessen?",
		errors: {
			loginFailed: "Anmeldung fehlgeschlagen",
			passwordMissing: "Bitte gib dein Passwort ein",
			unexpectedError: "Unerwarteter Fehler ({0})",
			unexpectedErrorLong: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
		},
		profileImageAlt: "Dein Profilbild",
		paymentMethodCardHeader: "Deine Zahlungsmethode",
		cardExpires: "Ablaufdatum:",
		addPaymentMethod: "Zahlungsmethode hinzufügen",
		pay: "{0} bezahlen",
		edit: "Bearbeiten"
	},
	userPage: {
		sideNav: {
			general: "Allgemein",
			plans: "Abos",
			apps: "Apps",
			provider: "Anbieter"
		},
		general: {
			title: "Allgemeine Einstellungen",
			profileImageAlt: "Dein Profilbild",
			uploadProfileImage: "Profilbild hochladen",
			firstNameTextfieldLabel: "Dein Vorname",
			firstNameTextfieldPlaceholder: "Wie sollen wir dich nennen?",
			emailTextfieldLabel: "Email",
			emailTextfieldPlaceholder: "Deine neue Email-Adresse",
			passwordTextfieldLabel: "Neues Passwort",
			passwordTextfieldPlaceholder: "Dein neues Passwort",
			passwordConfirmationTextfieldLabel: "Passwortbestätigung",
			passwordConfirmationTextfieldPlaceholder: "Wiederhole dein Passwort",
			profileImageDialog: {
				header: "Profilbild zuschneiden"
			}
		},
		plans: {
			title: "Abos",
			currentPlan: "Aktuelles Abo",
			upgrade: "Upgrade",
			downgrade: "Downgrade",
			changePlanSuccessMessage: "Dein Abo wurde erfolgreich geändert",
			paymentMethodCardHeader: "Deine Zahlungsmethode",
			cardExpires: "Ablaufdatum:",
			edit: "Bearbeiten",
			nextPayment: "Nächste Zahlung",
			subscriptionEnd: "Ende deines Abos",
			continueSubscription: "Abo fortführen",
			cancelSubscription: "Abo beenden",
			continueSubscriptionSuccessMessage: "Dein Abo wird nach dem {0} weiter verlängert",
			cancelSubscriptionSuccessMessage: "Dein Abo wird nach dem {0} nicht weiter verlängert",
			changePlanDialog: {
				upgradePlusHeader: "Wechsel auf Plus",
				upgradePlusDescription: "Möchtest du auf dav Plus für 3 € pro Monat wechseln?",
				upgradeProHeader: "Wechsel auf Pro",
				upgradeProDescription: "Möchtest du auf dav Pro für 10 € pro Monat wechseln?",
				downgradePlusHeader: "Wechsel auf Plus",
				downgradePlusDescription: "Möchtest du auf dav Plus für 3 € pro Monat wechseln?",
				downgradeFreeHeader: "Wechsel auf Free",
				downgradeFreeDescription: "Möchtest du dein Abo beenden?"
			}
		},
		apps: {
			title: "Deine Apps",
			totalStorageUsed: "{0} GB von {1} GB verwendet",
			appStorageUsed: "Diese App verwendet {0} GB"
		},
		provider: {
			title: "Werde ein Anbieter",
			subTitle: "Vertreibe deine digitalen Inhalte auf Plattformen von dav und verdiene Geld",
			supportedApps: "Unterstützte Apps",
			setupExplanation: "Um ein Anbieter zu werden, müssen wir einige Informationen über dich sammeln.",
			startSetup: "Einrichtung beginnen",
			dashboardTitle: "Anbieter-Dashboard",
			aboutYou: "Über dich",
			editDetails: "Daten bearbeiten",
			yourPayoutAccount: "Dein Auszahlungskonto",
			noAccountProvided: "Kein Bankkonto angegeben",
			nextPayout: "Nächste Auszahlung",
			missingInformationWarningText: "Um Auszahlungen zu aktivieren, brauchen wir noch weitere Informationen von dir.",
			missingInformationWarningLink: "Informationen bearbeiten",
			missingBankAccountWarningText: "Denk daran, ein Bankkonto anzugeben, damit wir deine Auszahlungen überweisen können.",
			startStripeSetupDialog: {
				header: "Anbieter-Einrichtung",
				text1: "Bitte gebe das Land an, in dem du lebst.<br>(Bitte kontaktiere uns, wenn dein Land nicht aufgeführt ist.)",
				text2: "Du wirst zur Einrichtung auf eine Seite von <a href='https://stripe.com' target='blank'>Stripe</a> weitergeleitet."
			},
			bankAccountDialog: {
				header: "Bankkonto festlegen"
			},
			countries: {
				de: "Deutschland",
				at: "Österreich",
				us: "Vereinigte Staaten"
			}
		},
		messages: {
			profileImageUpdateMessage: "Dein Profilbild wurde erfolgreich aktualisiert. Es kann einige Zeit dauern, bis das neue Profilbild in allen Apps angezeigt wird.",
			firstNameUpdateMessage: "Dein Name wurde erfolgreich aktualisiert",
			emailUpdateMessage: "Du erhältst eine Email zur Bestätigung deiner neuen Email-Adresse",
			passwordUpdateMessage: "Du erhältst eine Email zur Bestätigung deines neuen Passworts",
			sendConfirmationEmailMessage: "Eine neue Bestätigungsemail wurde gesendet",
			bankAccountUpdateMessage: "Dein Bankkonto wurde erfolgreich aktualisiert"
		},
		errors: {
			unexpectedErrorShort: "Unerwarteter Fehler ({0})",
			unexpectedErrorLong: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später nochmal.",
			profileImageFileTooLarge: "Die Bilddatei ist zu groß",
			firstNameTooShort: "Der Name ist zu kurz",
			firstNameTooLong: "Der Name ist zu lang",
			emailInvalid: "Deine neue Email-Adresse ist ungültig",
			emailTaken: "Diese Email-Adresse wird bereits verwendet",
			passwordMissing: "Bitte gib ein Passwort ein",
			passwordConfirmationMissing: "Bitte gib dein Password nochmal ein",
			passwordConfirmationNotMatching: "Dein Passwort stimmt nicht mit der Passwortbestätigung überein",
			passwordTooShort: "Dein neues Passwort ist zu kurz",
			passwordTooLong: "Dein neues Passwort ist zu lang",
			emailAlreadyConfirmed: "Deine Email-Adresse ist bereits bestätigt"
		},
		save: "Speichern",
		edit: "Bearbeiten",
		continue: "Weiter",
		cancel: "Abbrechen"
	},
	devPage: {
		title: "Entwickler-Dashboard",
		statistics: "Statistiken",
		loginRequiredMessage: "Du musst dich anmelden, um auf diese Seite zugreifen zu können",
		accessNotAllowedMessage: "Du kannst nicht auf diese Seite zugreifen",
		unexpectedErrorShort: "Unerwarteter Fehler ({0})",
		save: "Speichern",
		cancel: "Abbrechen"
	},
	appPage: {
		statistics: "Statistiken",
		edit: "Bearbeiten",
		published: "Veröffentlicht",
		tables: "Tabellen",
		apis: "APIs",
		editAppDialog: {
			header: "App bearbeiten",
			nameTextfieldLabel: "Name",
			nameTextfieldPlaceholder: "Der Name deiner App",
			descriptionTextfieldLabel: "Beschreibung",
			descriptionTextfieldPlaceholder: "Die Beschreibung deiner App",
			webLinkTextfieldLabel: "Web App",
			webLinkTextfieldPlaceholder: "Link zu deiner Web App",
			googlePlayLinkTextfieldLabel: "Google Play",
			googlePlayLinkTextfieldPlaceholder: "Link zum Google Play-Eintrag",
			microsoftStoreLinkTextfieldLabel: "Microsoft Store",
			microsoftStoreLinkTextfieldPlaceholder: "Link zum Microsoft Store-Eintrag",
			errors: {
				nameTooShort: "Der Name ist zu kurz",
				descriptionTooShort: "Die Beschreibung ist zu kurz",
				nameTooLong: "Der Name ist zu lang",
				descriptionTooLong: "Die Beschreibung ist zu lang",
				linkInvalid: "Der Link ist ungültig",
				unexpectedError: "Unerwarteter Fehler ({0})"
			}
		},
		publishAppDialog: {
			publishHeader: "App veröffentlichen",
			unpublishHeader: "Veröffentlichung aufheben",
			publishSubtext: "Bist du dir sicher, dass du diese App veröffentlichen willst?",
			unpublishSubtext: "Bist du dir sicher, dass du die Veröffentlichung dieser App aufheben willst?",
			confirm: "Bestätigen"
		},
		save: "Speichern",
		cancel: "Abbrechen",
		loginRequiredMessage: "Du musst dich anmelden, um auf diese Seite zugreifen zu können",
		accessNotAllowedMessage: "Du kannst nicht auf diese Seite zugreifen"
	},
	statisticsPage: {
		title: "Allgemeine Statistiken",
		loginRequiredMessage: "Du musst dich anmelden, um auf diese Seite zugreifen zu können",
		accessNotAllowedMessage: "Du kannst nicht auf diese Seite zugreifen",
		numberOfUsers: "Anzahl Nutzer",
		plans: "Abos",
		confirmations: "Email-Bestätigungen",
		confirmed: "Bestätigt",
		unconfirmed: "Unbestätigt",
		activeUsers: "Aktive Nutzer",
		currentlyActiveUsers: "Aktuell aktive Nutzer",
		daily: "Täglich",
		weekly: "Wöchentlich",
		monthly: "Monatlich",
		yearly: "Jährlich",
		totalUsers: "Nutzer insgesamt: {0}"
	},
	appStatisticsPage: {
		title: "Statistiken von {0}",
		loginRequiredMessage: "Du musst dich anmelden, um auf diese Seite zugreifen zu können",
		accessNotAllowedMessage: "Du kannst nicht auf diese Seite zugreifen",
		numberOfUsers: "Anzahl Nutzer",
		activeUsers: "Aktive Nutzer",
		currentlyActiveUsers: "Aktuell aktive Nutzer",
		daily: "Täglich",
		weekly: "Wöchentlich",
		monthly: "Monatlich",
		yearly: "Jährlich",
		totalUsers: "Nutzer insgesamt: {0}"
	},
	navbarComponent: {
		pricing: "Abos",
		allApps: "Alle Apps",
		devDashboard: "Entwickler-Dashboard",
		login: "Anmelden",
		logout: "Abmelden",
		signup: "Registrieren"
	},
	footerComponent: {
		contact: "Kontakt",
		privacy: "Datenschutzerklärung"
	},
	paymentFormComponent: {
		header: "Kredit- oder Debitkarte",
		save: "Speichern",
		unexpectedError: "Unerwarteter Fehler ({0})"
	},
	bankAccountFormComponent: {
		name: "Name",
		unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später nochmal.",
		unexpectedErrorWithCode: "Unerwarteter Fehler ({0})"
	},
	misc: {
		paymentFormDialog: {
			header: "Zahlungsinformationen eingeben",
			save: "Speichern",
			cancel: "Abbrechen"
		},
		expiredSessionDialog: {
			header: "Deine Sitzung ist abgelaufen",
			description: "Bitte lade die Seite neu und versuche es nochmal.",
			reload: "Seite neu laden"
		},
		pricing: {
			free: {
				storage: "2 GB"
			},
			plus: {
				storage: "15 GB",
				price: "3 € pro Monat"
			},
			pro: {
				storage: "50 GB",
				price: "10 € pro Monat"
			},
			onlineStorage: "Online-Speicher",
			accessData: "Zugriff auf deine Daten von jedem Gerät",
			noAds: "Keine Werbung",
			universalsoundboard: {
				hotkeyFeature: "Ordne Tastenkombinationen zu Sounds zu",
				outputDeviceFeature: "Lege das Ausgabegerät für jeden Sound individuell fest",
				playlistDownloadFeature: "Lade komplette YouTube-Playlisten herunter"
			}
		},
		messages: {
			passwordResetMessage: "Du bekommst eine Email mit Anweisungen, um dein Passwort zurückzusetzen.",
			confirmUserMessage: "Deine Email-Adresse wurde erfolgreich verifiziert",
			saveNewPasswordMessage: "Dein neues Passwort wurde gespeichert",
			saveNewEmailMessage: "Deine neue Email-Adresse wurde gespeichert",
			resetNewEmailMessage: "Deine Email-Adresse wurde zurückgesetzt. Du kannst dich nun wieder mit deiner alten Email-Adresse anmelden.",
			errorMessage: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es nochmal."
		}
	}
}

export var deDE = {
	...deDefaults,
	lang: "de-DE"
}

export var deAT = {
	...deDefaults,
	lang: "de-AT"
}

export var deCH = {
	...deDefaults,
	lang: "de-CH"
}
//#endregion

export const supportedLocales = [
	enDefaults.lang,
	enUS.lang,
	enGB.lang,
	deDefaults.lang,
	deDE.lang,
	deAT.lang,
	deCH.lang
]

export function getLocale(lang?: string) {
	if (lang == null) {
		lang = navigator?.language?.toLowerCase()
	} else {
		lang = lang.toLowerCase()
	}

	if (lang.startsWith("en")) {
		if (lang == "en-gb") return enGB
		else return enUS
	} else if (lang.startsWith("de")) {
		if (lang == "de-at") return deAT
		else if (lang == "de-ch") return deCH
		else return deDE
	}

	return enUS
}