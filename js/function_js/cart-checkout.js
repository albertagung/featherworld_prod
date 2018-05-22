$(document).ready(() => {

	// validate cart not null, if null then redirect
	validateCart = () => {
		// Loading overlay start
		$.LoadingOverlay('show')
		return new Promise ((resolve, reject) => {
			let cartArrayCheck = JSON.parse(localStorage.getItem('cartArray'))
			if (cartArrayCheck[0] === null || !cartArrayCheck) {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				// Resolve no cart
				resolve(false)
			} else {
				// Loading overlay stop
				$.LoadingOverlay('hide')
				// Resolve cart available
				resolve(true)
			}
		})
	}

	// Populate product table
	populateProductTable = (cartItems) => {
		$('#productTable').append(`
			<tr>
				<th scope="row">
		      <a id="removeItem${cartItems.cartProductId}" href="#" class="remove-item" data-toggle="tooltip" data-placement="top" title="" data-original-title="Remove from cart">
		        <i class="ti-close"></i>
		      </a>
		    </th>
		    <td>
		      <a href="#">
		        <img alt="Product" class="product-thumb" src="${cartItems.cartProductImages[0].imageUrl}" />
		      </a>
		    </td>
		    <td>
		      <span>${cartItems.cartProductName}</span>
		    </td>
		    <td>
		      <span><input id="qtyInput${cartItems.cartProductId}" type="number" value="${cartItems.cartProductQty}"/></span>
		    </td>
		    <td>
		      <span id="productPrice${cartItems.cartProductId}">${'IDR' + ' ' + cartItems.cartProductPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
		    </td>
			</tr>
		`)
	}

	// Populate cart subtotal
	populateCartSubtotal = (cartArray) => {
		// Make total price zero
		let totalPrice = 0
		// Iterate through the cartArray
		cartArray.forEach((cartItems) => {
			// Calculate cart items subtotal
			totalPrice += cartItems.cartProductPrice
			// Populate to cart subtotal
			$('#cartSubtotal').text('IDR' + ' ' + totalPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
			// Populate order total
			$('#orderTotal').text('IDR' + ' ' + totalPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) 
		})
	}

	// Splice item from cart array localstorage (called in removeItemFromCart function)
	spliceItem = (cartArray, arrProductId, itemWillRemove) => {
		// Find the index of item in cart array
		let indexToRemove = arrProductId.indexOf(itemWillRemove)
		console.log(indexToRemove)
		if (indexToRemove > -1) {
			console.log('masuk')
			// If index is found, then splice the array
			cartArray.splice(indexToRemove, 1)
			// Put back the arrProductId to localStorage
			localStorage.setItem('cartArray', JSON.stringify(cartArray))
			// Swal success delete item
			swal('Success', 'Your item has been removed', 'success')
			.then(() => {
				// Reload the page to refresh cart state
				window.location.replace('')
			})
		}
	}

	// Remove item from cart
	removeItemFromCart = (cartArray, cartItems) => {
		// Add event listener for remove item button
		$(`#removeItem${cartItems.cartProductId}`).click((e) => {
			e.preventDefault()
			// Swal confirmation
			swal({
				title: 'Do you want to remove this item?',
				text: 'Once you click OK, we cannot recover your item',
				icon: 'warning',
				buttons: true
			})
			.then((willRemove) => {
				if (willRemove) {
					// Seperate product id from cart array
					let arrProductId = []
					// Iterate through cart array to get the product id
					cartArray.forEach((eachDataCart) => {
						arrProductId.push(eachDataCart.cartProductId)
					})
					// Check if the item === indexOf cartArray
					if (arrProductId.indexOf(cartItems.cartProductId) > -1) {
						// Filter ONLY product id
						// Call splice function
						spliceItem(cartArray, arrProductId, cartItems.cartProductId)
					}
				}
			})
		})
	}

	// Request to server to check weather the quantity has been changed or not
	// (called in changeItemQty function)
	checkItemInServer = (cartItems, newQty) => {
		// Need to be promise to wait for the request to be done
		return new Promise ((resolve, reject) => {
			// Define url get item in server
			const urlGetProductById = `https://featherworld.cloudxier.com/products/${cartItems.cartProductId}`
			// Axios get the item from database
			axios({
				method: 'get',
				url: urlGetProductById
			})
			.then((response) => {
				// Define product
				let product = response.data[0]
				// Check if newQty met the current stock or not
				if (newQty > product.productQty) {
					resolve(false)
				} else {
					resolve(true) 
				}
			})
		})
	}

	// Change the item qty and price
	changeItemQty = (cartArray, cartItems) => {
		// On change event, edit the respected cart item qty
		$(`#qtyInput${cartItems.cartProductId}`).change(() => {
			// Loading Overlay Start
			$.LoadingOverlay('show')
			// Define new qty in variable
			let newQty = $(`#qtyInput${cartItems.cartProductId}`).val()
			// Define new price in variable
			let newPrice = newQty * cartItems.cartProductPricePerItem
			// Check stock from database
			checkItemInServer(cartItems, newQty)
			.then((response) => {
				if (response) {
					// Assign new value to item qty in cart
					cartItems['cartProductQty'] = newQty
					// Assign new value to item price in cart
					cartItems['cartProductPrice'] = newQty * cartItems.cartProductPricePerItem
					// Put back the cart array to localStorage
					localStorage.setItem('cartArray', JSON.stringify(cartArray))
					// Change the price in client side
					$(`#productPrice${cartItems.cartProductId}`).text('IDR' + ' ' + newPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
					// Change the cart subtotal in client side
					populateCartSubtotal(cartArray)
					// Re-get cart data (from cart.js)
					getCartData()
					// Loading overlay stop
					$.LoadingOverlay('hide')
				} else {
					// Loading overlay stop
					$.LoadingOverlay('hide')
					swal('Out of stock', 'Please input lower quantity', 'warning')
				}
			})
		})
	}

	// Get data user by email from database (user checking purpose)
	getUserByEmail = (email) => {
		return new Promise ((resolve, reject) => {
			const urlGetUserByEmail = `https://featherworld.cloudxier.com/users/email/${email}`
			// Get user by email from database
			axios({
				method: 'get',
				url: urlGetUserByEmail
			})
			.then((response) => {
				let dataUser = response.data[0]
				console.log(dataUser)
				resolve(dataUser)
			})
		})
	}

	// Resend verification link
	reseondVerificationLink = () => {
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
		  } else {
		    swal.close();
		  }
		})
	}

	// Redirect to sign up if user is not exist (user checking purpose)
	checkUserState = () => {
		$('#btnProceedToCheckout').click((e) => {
			e.preventDefault()
			// Get user status from localStorage
			// Check if user is exist
			firebase.auth().onAuthStateChanged((user) => {
			  if (user) {
			  	// Define user
			  	let user = firebase.auth().currentUser
			  	// Check if user email is verified
			    if (user.emailVerified) {
			    	// Get user by email request to database
			    	getUserByEmail(user.email).then((dataUser) => {
			    		// Redirect page to shop-checkout
			    		window.location.replace('shop-checkout.html')
			    	})
			    } else {
			    	// If not, have to verify email first
			    	// TODO: If email is not verified, then swal('Waring', 'you need to verify your email first!', 'warning')
			  		// then redirect to login page / swal ==> "Didn't get the email? send new verification email"
			  		reseondVerificationLink()
			    }
			  } else {
			    console.log('no user signed in')
			    swal('Sign in required', 'Please sign in to continue', 'warning')
			    .then(() => {
			    	// Send redirect page data to be redirect
			    	localStorage.setItem('redirectPage', JSON.stringify({redirectPage: 'shop-cart.html'}))
			    	// Trigger button modal on click
			    	$('#modalSignInTrigger').trigger('click')
			    })
			  }
			});
		})
	}

	// On load
	// Define localStorage cart array
	let cartArray = JSON.parse(localStorage.getItem('cartArray'))
	// Validate cart function
	validateCart().then((response) => {
		if (response) {
			// Populate cart subtotal (cannot be inside for loop)
			populateCartSubtotal(cartArray)
			// Check user state
			checkUserState()
			// Iterate through cart array
			cartArray.forEach((cartItems) => {
				// Call populate function here
				populateProductTable(cartItems)
				// Call actions function here
				removeItemFromCart(cartArray, cartItems)
				changeItemQty(cartArray, cartItems)
			})
		} else {
			swal('No Item Selected', 'Please add some items to cart first', 'warning')
			.then(() => {
				window.location.replace('product-page.html')
			})
		}
	})


})