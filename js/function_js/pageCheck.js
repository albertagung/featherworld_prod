$(document).ready(() => {

	// Get data user by email from database (promise)
	getUserByEmail = (email) => {
		return new Promise  ((resolve, reject) => {
			const urlGetUserByEmail = `https://featherworld.cloudxier.com/users/email/${email}`
			// Get user by email from database
			axios({
				method: 'get',
				url: urlGetUserByEmail
			})
			.then((response) => {
				let dataUser = response.data[0]
				console.log(dataUser)
				// Resolve dataUser
				resolve(dataUser)
			})
		})
	}

	// Resend verification link
	resendVerificationLink = () => {
		// Email verification alert
  	swal({
		  title: "Verify Email",
		  text: "Please check your inbox and click the email verification link. Do you want to resend the verification link?",
		  icon: "warning",
		  buttons: ["No", "Resend"]
		})
		.then((willDelete) => {
		  if (willDelete) {
		  	// Resend the verification link
		  	// Get the current user
				let user = firebase.auth().currentUser
				// Send email verification to user
				user.sendEmailVerification()
				.then(() => {
					// Verification email has been sent
					console.log('email sent')
				})
				.catch((err) => {
					reject('sending verification error', err)
				})
		    swal("Please check your new verification link", {
		      icon: "success",
		    });
		    // Check if the path is from shop-checkout
		  } else if (window.location.pathname === '/shop-checkout.html') {
		    // Redirect to index.html
		    window.location.replace('index.html')
		  } else {
		  	swal.close()
		  }
		})
	}

	// Check if user is exist
	checkIfUserExist = () => {
		firebase.auth().onAuthStateChanged((user) => {
		  if (user) {
		  	// Define user
		  	let user = firebase.auth().currentUser
		  	// Check if user email is verified
		    if (user.emailVerified) {
		    	// Get user by email request to database
		    	getUserByEmail(user.email)
		    	.then((dataUser) => {
		    		// Set dataUser to localStorage
		    		localStorage.setItem('dataUser', JSON.stringify(dataUser))
		    	})
		    } else {
		    	// If not, have to verify email first
		    	// TODO: If email is not verified, then swal('Waring', 'you need to verify your email first!', 'warning')
		  		// then redirect to login page / swal ==> "Didn't get the email? send new verification email"
		    	resendVerificationLink()
		    }
		  } else {
		    console.log('no user signed in')
		    swal('Sign in required', 'Please sign in to continue', 'warning')
		    .then(() => {
		    	// Set last visited page to redirectPage localStorage
		    	localStorage.setItem('redirectPage', JSON.stringify({redirectPage: window.location.href}))
		    	//  Redirect to sign in page
		    	window.location.replace('page-login.html')
		    })
		  }
		})
	}

	// On load
	checkIfUserExist()

})