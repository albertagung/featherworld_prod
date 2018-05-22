$(document).ready(() => {

	// Loading overlay start
	$.LoadingOverlay('show')

	// Populate product banner name
	populateProductBannerName = (dataProduct) => {
		$('#productBannerName').text(dataProduct.productName)
	}

	// Populate product li name
	populateProductLiName = (dataProduct) => {
		$('#productLiName').text(dataProduct.productName)
	} 

	// Populate product images
	populateProductImages = async (dataProduct) => {
		// Iterate through array of immages
		await dataProduct.productImages.forEach((dataImages) => {
			// Populate the images
			$('#productImages').append(`
				<li>
	        <img alt="Image" src="${dataImages.imageUrl}" />
	      </li>
			`)
		})
		// Add class attributes
		$('#productImagesDiv').addClass('image-slider slider-thumb-controls controls-inside')
		$('#productImages').addClass('slides')
	}

	// Populate product name
	populateProductName = (dataProduct) => {
		$('#productName').text(dataProduct.productName)
	}

	// Populate product description
	populateProductDescription = (dataProduct) => {
		$('#productDescription').html(dataProduct.productDescription)
	}

	// Populate product price
	populateProductPrice = (dataProduct) => {
		// Check if product discount price not 0
		if (dataProduct.productDiscountPrice !== 0) {
			// Show the sale label
			$('#saleLabel').text('Sale')
			// Show the discounted price
			$('#productDiscountPrice').text('IDR' + ' ' + dataProduct.productDiscountPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
			// Show the original price
			$('#productPrice').text('IDR' + ' ' + dataProduct.productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
		} else {
			// Show the original price only
			$('#productPrice').text('IDR' + ' ' + dataProduct.productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
		}
	}

	// Populate product SKU
	populateProductSKU = (dataProduct) => {
		$('#productSKU').html(`
			<strong>PRODUCT SKU:</strong> ${dataProduct.productSKU}
		`)
	}

	// Populate product stock
	populateProductStock = (dataProduct) => {
		$('#productQty').text(dataProduct.productQty).html(`
			<strong>QTY AVAILABLE:</strong> ${dataProduct.productQty}
		`)
		// On focus out qty input
		$('#qtyInput').focusout(() => {
			// Check if number input exceeding stock qty
			if (parseInt($('#qtyInput').val()) > parseInt(dataProduct.productQty)) {
				// Display error message
				$('#errMsgQtyInput').html("Input lower quantity").show()
				$('#qtyInput').val('')
			} else {
				$('#errMsgQtyInput').fadeOut('slow')
			}
		})
	}

	// Populate product variants
	populateProductVariants = (dataProduct) => {
		// Check if there are variants
		if (dataProduct.productVariance.length >= 1) {
			// Iterate through the array of variants
			dataProduct.productVariance.forEach((dataVariants) => {
				// Populate variants name
				$('#productExtraData').append(`
					<li>
						<label>
							${dataVariants.variantName}
						</label>
						<div class="select-option">
		          <i class="ti-angle-down"></i>
		          <select id="variantOption${dataVariants.variantName}" required>
		            <option selected value="">Select An Option</option>
		          </select>
			      </div>
					</li>
				`)
				dataVariants.variantOption.forEach((dataOptions) => {
					// Populate variant options
					$(`#variantOption${dataVariants.variantName}`).append(`
						<option value="${dataOptions}">${dataOptions}</option>
					`)
				})
			})
		}
	}

	// Get product variants value
	getProductVariantsValue = (dataProduct) => {
		// Define variant selection array
		let variantSelection = []
		// Define variant options array from dataProduct
		let variantOptions = dataProduct.productVariance
		// Iterate through variantOptions
		variantOptions.forEach((dataVariants) => {
			// Define selectedVariants
			let selectedOptions = $(`#variantOption${dataVariants.variantName}`).val()
			// Push selected variant options into variantSelection array
			variantSelection.push(selectedOptions)
		})
		// Define join variable
		let joinVariants = variantSelection.join('-')
		return joinVariants
	}

	// Populate product recommendation
	populateProductRecommendation = (dataProduct) => {
		// Loading overlay start
		$('#productRecommendation').LoadingOverlay('show')
		// Define url get products by category
		let urlGetProductByCategory = `http://localhost:3000/products/category/${dataProduct.productCategory}`
		// Get data from db
		axios({
			method: 'get',
			url: urlGetProductByCategory
		})
		.then((response) => {
			let dataProducts = response.data
			// Iterate through array of data product
			// using for loop restrict to 4 products only
			for (let i = 0; i < 4; i++) {
				// Populate the data to product recommendation div
				$('#productRecommendation').append(`
					<div class="col-md-3 col-sm-4">
	          <div class="image-tile outer-title text-center">
	            <a id="productRecommendationButton${dataProducts[i]._id}">
	              <img alt="Pic" class="product-thumb" src="${dataProducts[i].productImages[0].imageUrl}" />
	            </a>
	            <div class="title">
	              <h5 class="mb0">${dataProducts[i].productName}</h5>
	              <span class="display-block mb16">${'IDR' + ' ' + dataProducts[i].productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
	            </div>
	          </div>
	        </div>
				`)
				// Trigger on click recommended product link
				$(`#productRecommendationButton${dataProducts[i]._id}`).click(() => {
					onProductRecommendationClick(dataProducts[i])
				})
			}
			// Loading overlay stop
			$('#productRecommendation').LoadingOverlay('hide')
		})
	}

	// Validate select variants (if any)
	validateProductVariants = () => {
		let productVariantsValidity = $('#formVariants')[0].checkValidity()
		if (!productVariantsValidity) {
			return false
		} else {
			return true
		}
	}

	// Add same item to cart (called in addToCart function)
	// if there are match item id, then add the new item qty
	// to the previous cart
	addSameItemToCart = (cartArray, dataPreviousCartItem, dataProduct) => {
		// Assign new value to previous item qty
		dataPreviousCartItem['cartProductQty'] = parseInt(dataPreviousCartItem.cartProductQty) + parseInt($('#qtyInput').val())
		// Assign new value to previous item total price
		let newProductCartPrice = parseInt(dataProduct.productDiscountPrice) || parseInt(dataProduct.productPrice)
		dataPreviousCartItem['cartProductPrice'] = parseInt(dataPreviousCartItem.cartProductPrice) + (newProductCartPrice * parseInt($('#qtyInput').val()))
		// Assign new value to previous item weight
		let newProductWeight = parseInt(dataPreviousCartItem.cartProductWeight) + (parseInt(dataProduct.productWeight) * parseInt($('#qtyInput').val()))
		dataPreviousCartItem['cartProductWeight'] = newProductWeight
		// Add new value to previous item variants
		let newProductVariant = dataPreviousCartItem.cartProductVariantOptions.concat(getProductVariantsValue(dataProduct))
		dataPreviousCartItem['cartProductVariantOptions'] = newProductVariant
		// Serialize the data back to string and store in localStorage
		localStorage.setItem('cartArray', JSON.stringify(cartArray))
		// Swal success
		swal('Success', 'Your item has been added', 'success')
		.then(() => {
			// Reload the page to refresh the cart state
			window.location.replace('')
		})
	}

	// Add different item to cart (called in addToCart function)
	addDifferentItemToCart = (cartArray, dataProduct) => {
		let cartItem = {
			cartProductId: dataProduct._id,
			cartProductName: dataProduct.productName,
			cartProductQty: parseInt($('#qtyInput').val()),
			cartProductImages: dataProduct.productImages,
			cartProductPrice: dataProduct.productDiscountPrice * parseInt($('#qtyInput').val()) || dataProduct.productPrice * parseInt($('#qtyInput').val()),
			cartProductPricePerItem: dataProduct.productDiscountPrice || dataProduct.productPrice,
			cartProductWeight: dataProduct.productWeight * parseInt($('#qtyInput').val()),
			cartProductVariantOptions: [getProductVariantsValue(dataProduct)]
		}
		// Push cart items into localStorage
		cartArray.push(cartItem)
		// Serialize the data back to string and store in localStorage
		localStorage.setItem('cartArray', JSON.stringify(cartArray))
		// Swal success
		swal('Success', 'Your item has been added', 'success')
		.then(() => {
			// Reload the page to refresh the cart state
			window.location.replace('')
		})
	}

	// Add to cart function (called in populateProductDetails function)
	addToCart = (dataProduct) => {
		$('#btnAddToCart').click((e) => {
			e.preventDefault()
			// Validate product variants (if any)
			if (!validateProductVariants()) {
				swal('Alert', 'Please choose your product options', 'warning')
			} else {
				// Validate qty not null
				if (!$('#qtyInput').val()) {
					swal('Alert', 'Please input item QTY', 'warning')
				} else {
					// Swal confirmation
					swal({
						title: 'Do you want to add this item to cart?',
						text: 'If you click OK, than the item will automaticly added to your cart',
						icon: 'info',
						buttons: true
					})
					.then((willAdd) => {
						if (willAdd) {
							// Iterate through localStorage cartArray
							let cartArray = JSON.parse(localStorage.getItem('cartArray'))
							// Iterate through cartArray	
							// Check if cart init still have null value
							if (cartArray[0] === null) {
								// Remove null item in array
								cartArray.splice(0,1)
								// Add new item to cart
								addDifferentItemToCart(cartArray, dataProduct)
							}	else {
								// Define array for product id from cart
								let arrIdProduct = []
								// Iterate through cartArray to push the product id
								cartArray.forEach((searchIdProduct) => {
									arrIdProduct.push(searchIdProduct.cartProductId)
								})
								// Filter ONLY ONE the same product id (from previous cart)
								// cannot use forEach the data will be doubled
								if (arrIdProduct.indexOf(dataProduct._id) >= 0) {
									// Iterate through cartArray to populate the previous cart item
									cartArray.forEach((dataPreviousCartItem) => {
										// Filter ONLY the same product id to be used in addSameItemCart function
										if (dataPreviousCartItem.cartProductId === dataProduct._id) {
											// If found match, then add the qty with the new same item
											addSameItemToCart(cartArray, dataPreviousCartItem, dataProduct)
										}
									})
								} else {
									// If not the same, then add new item
									// Add new item to cart
									addDifferentItemToCart(cartArray, dataProduct)
								}
							}
						}
					})
				}
			}
		})
	}

	// Populate product details (called inside set timeout)
	populateProductDetails = (dataProduct) => {
		populateProductBannerName(dataProduct)
		populateProductLiName(dataProduct)
		populateProductImages(dataProduct)
		populateProductName(dataProduct)
		populateProductDescription(dataProduct)
		populateProductPrice(dataProduct)
		populateProductSKU(dataProduct)
		populateProductStock(dataProduct)
		populateProductVariants(dataProduct)
		populateProductRecommendation(dataProduct)
		addToCart(dataProduct)
	}

	// On click product recommendation (called in populateProductRecommendation)
	onProductRecommendationClick = (dataProduct) => {
		// If user click one of the product recommendation,
		// then it will trigger a local storage event, then
		// reload the page with new data
		// Set product id to localStorage
		localStorage.setItem('dataProduct', JSON.stringify(dataProduct))
		// Reload the window to re-load the product data
		window.location.replace('')
	}

	// Define dataProduct
	// Wait for data product to be load
	setTimeout(() => {
		let dataProduct = JSON.parse(localStorage.getItem('dataProduct'))
		// Populate data
		populateProductDetails(dataProduct)
		// Loading overlay stop
		$.LoadingOverlay('hide')
	}, 1000)

	// 

})