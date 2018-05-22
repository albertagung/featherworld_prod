$(document).ready(() => {

	// Get value contact form
	getContactFormValue = () => {
		// Define contact form obj
		let contactForm = {
			name: $('#name').val(),
			email: $('#email').val(),
			message: $('#message').val()
		}
		// Return object
		return contactForm
	}

	// Send data to email with nodemailer (to admin)
	sendContactForm = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			// Define url nodemailer send contact form
			const urlSendContactForm = 'https://featherworld.cloudxier.com/email/contactForm'
			// Send email with axios
			axios({
				method: 'post',
				url: urlSendContactForm,
				data: getContactFormValue()
			})
			.then((response) => {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				resolve(response.data)
			})
			.catch((err) => {
				console.log(err)
				reject(err)
			})
		})
	}

	// On button submit click
	$('#btnSubmitContactForm').click((e) => {
		e.preventDefault()
		// Check contact form validity
		if ($('#contactForm')[0].checkValidity()) {
			// If pass
			sendContactForm().then((response) => {
				console.log(response)
				// Swal confirmation success
				swal('Success', 'Thank you for asking us questions', 'success')
				.then(() => {
					// Reload the page
					window.location.replace('')
				})
			})
		} else {
			// Swal confirmation missing fields
			swal('Alert', 'Please fill all the form fields!', 'warning')
		}
	})

})