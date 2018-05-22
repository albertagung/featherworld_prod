$(document).ready(() => {

	// Cart init
	// Check if no cartArray yet on the browser local storage
	if (!JSON.parse(localStorage.getItem('cartArray'))) {
		var cartArray = []
		cartArray.push(JSON.parse(localStorage.getItem('cartArray')))
		localStorage.setItem('cartArray', JSON.stringify(cartArray))
	}

	// Get cart data
	getCartData = () => {
		// Define data cart from localStorage
		let dataCart = JSON.parse(localStorage.getItem('cartArray'))
		// Check if cart is not null
		if (dataCart) {
			// Check if data cart not null
			if (dataCart[0]) {
				console.log(dataCart.length)
				// Empty cart for further changes
				$('#shoppingCart').empty()
				// Populate cart item quantity
				$('#cartItemQty').text(dataCart.length)
				// Show cart control
				$('#cartControl').show()
				// Empty shopping cart
				$('#shoppingCart').empty()
				// Define cartTotalPrice
				let cartTotalPrice = 0
				dataCart.forEach((cartItems) => {
					// Populate cart items to shopping cart
					$('#shoppingCart').append(`
						<li>
		          <a href="#">
		            <img alt="Product" src="${cartItems.cartProductImages[0].imageUrl}" />
		            <div class="description">
		              <span class="product-title">${cartItems.cartProductName}</span>
		              <span>${cartItems.cartProductQty} pcs</span>
		              <span class="price number">${'IDR' + ' ' + cartItems.cartProductPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
		            </div>
		          </a>
		        </li>
					`)
					// Sum all the cart items price
					cartTotalPrice += cartItems.cartProductPrice
				})
				// Populate the total price
				$('#cartTotalPrice').text('IDR' + ' ' + cartTotalPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
			} else {
				$('#shoppingCart').append(`
					<li>
            <span class="product-title">No item yet</span>
					</li>
				`)
				$('#cartControl').hide()
			}
		}
	}

	// On load
	getCartData()
})