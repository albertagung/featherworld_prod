$(document).ready(() => {
	
	// Define sign up url
	const signUpUrl = 'http://localhost:3000/auth/signup'

	// Datepicker init for birthday field
	$('#birthdayInput').datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: '1900:2018',
		minDate: new Date(1900, 10 - 1, 25),
		maxDate: new Date()
	})

	// Check form to be not null
	checkFormNotNull = () => {
		let registerForm = $('#registerForm')[0]
		if (registerForm.checkValidity()) {
			return true
		} else {
			swal('Warning', 'Please fill all the fields!', 'warning')
			return false
		}
	}

	// Confirm password init
	confirmPasswordInit = () => {
		// Check if password === confirm password
		let originalPassword = $('#passwordInput').val()
		let confirmPassword = $('#confirmPasswordInput').val()
		if (originalPassword === confirmPassword) {
			return true
		} else {
			swal('Warning', 'Your password did not match!', 'warning')
			return false
		}
	}

	// Check password should be 6 character
	sixDigitPasswordValidation = () => {
		let originalPassword = $('#passwordInput').val()
		if (originalPassword.length >= 6) {
			return true
		} else {
			swal('Warning', 'Password must be at least 6 characters long!', 'warning')
			return false
		}
	}

	// Combining all form validator
	checkFormValidity = () => {
		if (checkFormNotNull() && confirmPasswordInit() && sixDigitPasswordValidation()) {
			return true
		} else {
			return false
		}
	}

	// Get data user and credentials (called in insertUserToDatabase function)
	getDataUser = () => {
		let email = $('#emailInput').val()
		let password = $('#passwordInput').val()
		let firstName = $('#firstNameInput').val()
		let middleName = $('#middleNameInput').val()
		let lastName = $('#lastNameInput').val()
		let phoneNumber = $('#phoneNumberInput').val()
		let birthday = $('#birthdayInput').val()
		// Creating obj user
		let objUser = {
			email: email,
			password: password,
			firstName: firstName,
			middleName: middleName,
			lastName: lastName,
			phoneNumber: phoneNumber,
			birthday: birthday,
			registerDate: new Date()
		}
		return objUser
	}

	// Insert registered user to database (called in firebaseSignUp function)
	insertUserToDatabase = () => {
		// Define url post new user
		const urlPostNewUser = 'http://localhost:3000/users'
		axios({
			method: 'post',
			url: urlPostNewUser,
			data: getDataUser()
		})
		.then((response) => {
			console.log(response.data)
		})
	}

	// Sign up user using firebase
	firebaseSignUp = (email, password) => {
		return new Promise ((resolve, reject) => {
			firebase.auth().createUserWithEmailAndPassword(email, password)
			.then(() => {
				console.log('sign up success')
				// If success, then insert user data to database
				resolve(insertUserToDatabase())
			})
			.catch((err) => {
				reject(err)
			})
		})
	}

	// Sign in user to firebase (before verification)
	firebaseEmailVerification = (email, password) => {
		return new Promise ((resolve, reject) => {
			// Before sending verification email, we must first sign in the user
			firebase.auth().signInWithEmailAndPassword(email, password)
			.then(() => {
				// Get the current user
				let user = firebase.auth().currentUser
				// Send email verification to user
				user.sendEmailVerification()
				.then(() => {
					// Verification email has been sent
					resolve('email sent')
				})
				.catch((err) => {
					reject('sending verification error', err)
				})
			})
			.catch((err) => {
				reject('sign in error', err)
			})
		})
	}

	// Send email signup with nodemailer (to admin and customer)
	sendEmailSignup = (customerEmail, customerFirstName, customerLastName, customerDOB, customerPhoneNumber) => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define url send signup email to admin
			const urlEmailSignupAdmin = 'http://localhost:3000/email/adminNewSignup'
			// Define url send signup email to customer
			const urlEmailSignupCustomer = 'http://localhost:3000/email/customerNewSignup'
			// Axios send to admin
			axios({
				method: 'post',
				url: urlEmailSignupAdmin,
				data: {
					emailSenderName: 'Feather World Team',
					customerEmail: customerEmail,
					customerFirstName: customerFirstName,
					customerLastName: customerLastName,
					customerDOB: customerDOB,
					customerPhoneNumber: customerPhoneNumber,
					emailText: 'New customer sign up'
				}
			})
			.then((responseAdmin) => {
				// Axios send to customer
				axios({
					method: 'post',
					url: urlEmailSignupCustomer,
					data: {
						emailSender: 'Feather World Team',
						emailReceiver: customerEmail,
						emailText: 'Thank you for signing up',
						customerFirstName: customerFirstName,
						customerLastName: customerLastName,
						emailPicture: 'https://storage.googleapis.com/image_props_featherworld/cloudxier-featherworld-mainbanner.png', // Hardcoded and have to change manually
						shopNowButtonLink: 'http://localhost:8080/product-page.html' // Hardcoded and have to change manually
					}
				})
				.then((responseCustomer) => {
					// Loading overlay stop
					$.LoadingOverlay('hide')
					// Resolve
					resolve(responseCustomer.data)
				})
				.catch((errCustomer) => {
					console.log(errCustomer)
					reject(errCustomer)
				})
			})
			.catch((errAdmin) => {
				console.log(errAdmin)
				reject(errAdmin)
			})
		})
	}

	// Sign up user
	$('#btnSignUp').click((e) => {
		e.preventDefault()
		// If form validity == true
		if (checkFormValidity()) {
			console.log(true)
			// Loading overlay start
			$.LoadingOverlay('show')
			// Send signup data to firebase
			let userEmail = getDataUser().email
			let userPassword = getDataUser().password
			firebaseSignUp(userEmail, userPassword)
			.then(() => {
				// Send email verification to user
				firebaseEmailVerification(userEmail, userPassword)
				.then(() => {
					// Define data user
					let dataEmail = getDataUser().email
					let dataFirstName = `${getDataUser().firstName} ${getDataUser().middleName}`
					let dataLastName = getDataUser().lastName
					let dataBirthday = getDataUser().birthday
					let dataPhoneNumber = getDataUser().phoneNumber
					// Send email signup function
					sendEmailSignup(dataEmail, dataFirstName, dataLastName, dataBirthday, dataPhoneNumber)
					.then((responseSendEmail) => {
						console.log(responseSendEmail)
						// Loading overlay stop
						$.LoadingOverlay('hide')
						swal("Sucess", "Thanks for signing up, please check in your inbox for email verification", "success")
						.then(() => {
							// Loading overlay start
							$.LoadingOverlay('show')
							// Check if there is any redirect page needed
							let redirectPage = JSON.parse(localStorage.getItem('redirectPage'))
							if (redirectPage) {
								// Loading overlay stop
								$.LoadingOverlay('hide')
								// Redirect page as requested
								window.location.replace(redirectPage.redirectPage)
							} else {
								// Loading overlay stop
								$.LoadingOverlay('hide')
								// Redirect page to products
								window.location.replace('product-page.html')
							}
						})
					})
				})
			})
			.catch((err) => {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				swal('Warning', 'Your email has been registered, please use different email account or login with your previous account', 'warning')
			})
		}
	})

	// Redirect login button
	// $('#btnRedirectLogin').click((e) => {
	// 	e.preventDefault()
	// 	// Redirect to login page
	// 	window.location.replace('page-login.html')
	// })

})