document.addEventListener('DOMContentLoaded', function() {

	// Define localStorage redirect page
	let redirectPageObject = JSON.parse(localStorage.getItem('redirectPage'))
	let redirectPage = redirectPageObject.redirectPage

  // TODO: Implement getParameterByName()

  getParameterByName = (name) => {
  	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
      return null;
    }
    else{
      return decodeURI(results[1]) || 0;
    }
  }

  // Get the action to complete.
  var mode = decodeURIComponent(getParameterByName('mode'));
  console.log(mode)
  // Get the one-time code from the query parameter.
  var actionCode = getParameterByName('oobCode');
  // (Optional) Get the API key from the query parameter.
  var apiKey = getParameterByName('apiKey');
  // (Optional) Get the continue URL from the query parameter if available.
  var continueUrl = getParameterByName('continueUrl');

  // Configure the Firebase SDK.
  // This is the minimum configuration required for the API to be used.
  var config = {
    apiKey: apiKey  // This key could also be copied from the web
  };
  var app = firebase.initializeApp(config);
  var auth = app.auth();

  // Handle password reset UI
  passwordResetUi = () => {
  	$('#mainContainer').html(`
      <div class="card" style="text-align: center">
        <div class="card-header">
          Reset your Password
        </div>
        <div class="card-body">
          <p class="card-text">Click here to reset your password</p>
          <a id="btnResetPassword" href="#" class="btn btn-primary">RESET PASSWORD</a>
        </div>
      </div>
  	`)
  }

  // Handle recover email UI
  recoverEmailUi = () => {
  	$('#mainContainer').html(`
      <div class="card" style="text-align: center">
        <div class="card-header">
          Recover your Email
        </div>
        <div class="card-body">
          <p class="card-text">Click here to recover your email</p>
          <a id="btnRecoverEmail" href="#" class="btn btn-primary">RECOVER EMAIL</a>
        </div>
      </div>
  	`)
  }

  // Handle email verification UI
  emailVerificationUi = () => {
  	$('#mainContainer').html(`
      <div class="card" style="text-align: center">
        <div class="card-header">
          Verify you Email
        </div>
        <div class="card-body">
          <p class="card-text">Click here to verify your email address</p>
          <a id="btnVerifyEmail" href="#" class="btn btn-primary">VERIFY EMAIL</a>
        </div>
      </div>
  	`)
  }

  // Handle password reset
  function handleResetPassword(auth, actionCode, continueUrl) {
	  var accountEmail;
	  // Verify the password reset code is valid.
	  auth.verifyPasswordResetCode(actionCode).then(function(email) {
	    var accountEmail = email;
	    // Add event listener on button reset password click
		  $('#btnResetPassword').click((e) => {
		  	e.preventDefault()
		  	swal({
		    	title: 'Reset password',
		    	content: 'input',
		    	button : {
		    		text: 'Reset',
		    	}
		    })
		    .then((password) => {
		    	if (!password) {
		    		swal.close()
		    	} else if (pasword === "") {
		    		swal('Password cannot be empty', 'Please fill the password', 'warning')
		    		.then(() => {
		    			swal.close()
		    		})
		    	} else {
		    		auth.confirmPasswordReset(actionCode, newPassword).then(function(resp) {
			      // Password reset has been confirmed and new password updated.
			      // Login with new password
			      auth.signInWithEmailAndPassword(accountEmail, newPassword)
			      .then(() => {
			      	// Success confirmation
			      	swal('Success', 'Your password has been reset', 'success')
			      })
			      // TODO: If a continue URL is available, display a button which on
			      // click redirects the user back to the app via continueUrl with
			      // additional state determined from that URL's parameters.
			    }).catch(function(error) {
			    	console.log(error)
			      // Error occurred during confirmation. The code might have expired or the
			      // password is too weak.
			      // Error confirmation
			      swal('Your password is to short', 'Please input minimum of 6 digits password', 'error')
			    });
		    	}
		    })
		  })
	  }).catch(function(error, accountEmail) {
	    // Invalid or expired action code. Ask user to try to reset the password
	    // again.
	    // Expired action code confirmation
	    swal({
		  title: "Access expired",
		  text: "Please click REQUEST to request new access code to reset your password",
		  icon: "warning",
		  buttons: ["No", "Request"]
			})
			.then((willRequest) => {
			  if (willRequest) {
			  	// Resend the access code link
			  	auth.sendPasswordResetEmail(email)
			  	.then(() => {
			  		// Send new password reset success confirmation
			  		swal('Success', 'Please check your inbox for password reset link', 'success')
			  	})
			  } else {
			    swal.close();
			  }
			})
	  })
	}

	// Handle recover email
	function handleRecoverEmail(auth, actionCode) {
	  var restoredEmail = null;
	  // Confirm the action code is valid.
	  auth.checkActionCode(actionCode).then(function(info) {
	    // Get the restored email address.
	    restoredEmail = info['data']['email'];

	    // Revert to the old email.
	    return auth.applyActionCode(actionCode);
	  }).then(function() {
	    // Account email reverted to restoredEmail

	    // TODO: Display a confirmation message to the user.

	    // You might also want to give the user the option to reset their password
	    // in case the account was compromised:
	    auth.sendPasswordResetEmail(restoredEmail).then(function() {
	      // Password reset confirmation sent. Ask user to check their email.
	    }).catch(function(error) {
	      // Error encountered while sending password reset code.
	    });
	  }).catch(function(error) {
	    // Invalid code.
	  });
	}

	// Handle email verification
	function handleVerifyEmail(auth, actionCode, continueUrl) {
		// Add event listener on verify email click
		$('#btnVerifyEmail').click((e) => {
			e.preventDefault()
			// Try to apply the email verification code.
		  auth.applyActionCode(actionCode).then(function(resp) {
		    // Email address has been verified.
		    swal('Success', 'Your email has been verified', 'success')
		    .then(() => {
		    	// Redirect to the last page user is looking
		    	window.location.replace(redirectPage)
		    })
		  }).catch(function(error) {
		    // Code is invalid or expired. Ask the user to verify their email address
		    // again.
		    swal('Access expired', 'Please click REQUEST to request new access code to verify your email')
		    .then(() => {
		    	// Redirect back 
		    	window.location.replace(redirectPage)
		    })
		  });
		})
	}

  // Handle the user management action.
  switch (mode) {
    case 'resetPassword':
      // Display reset password handler and UI.
      passwordResetUi()
      handleResetPassword(auth, actionCode, continueUrl);
      break;
    case 'recoverEmail':
      // Display email recovery handler and UI.
      recoverEmailUi()
      handleRecoverEmail(auth, actionCode);
      break;
    case 'verifyEmail':
      // Display email verification handler and UI.
      emailVerificationUi()
      handleVerifyEmail(auth, actionCode, continueUrl);
      break;
    default:
      // Error: invalid mode.
  }

}, false);
