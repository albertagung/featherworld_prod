$(document).ready(() => {

	// Loading overlay start
	$.LoadingOverlay('show')

	// Define url get all products
	const urlGetAllProducts = 'http://localhost:3000/products'

	// Populate category (to be placed in category selection)
	populateCategorySelector = (unfilterCategories) => {
		// Beacuse there will be multiple duplicate categories,
		// then we need to filter only one every each of them
		let filteredCategories = unfilterCategories.filter((eachData, i, self) => {
			return i === self.indexOf(eachData)
		})
		// For each category, it will be populated
		filteredCategories.forEach((eachDataCategories) => {
			// Populate the filtered categories into category selection
		$('#categorySelector').append(`
				<option value="${eachDataCategories}">${eachDataCategories}</option>
			`)
		})
	}

	// Filter by category
	filterByCategory = (dataProducts) => {
		// Check if query category is available
		if (getQueryValue().category) {
			// Call the query getter value
			queryCategoryGetter(dataProducts)
		}
		// Add event listener on selector change
		// everytime the selector changed, then it will be refreshed with new data
		$('#categorySelector').change(() => {
			// Change the height of previous products component div to auto (front end issues)
			$('#productsComponent').css('height', '100%')
			// Empty previous div of products
			$('#productsComponent').empty()
			// Define category selector input
			let selectorValue = $('#categorySelector').val()
			// Iterate through dataProducts to find match
			dataProducts.forEach((eachData) => {
				// Filter the products by selected category
				if (eachData.productCategory === selectorValue) {
					// Append all the filtered category to div products
					$('#productsComponent').append(`
						<div class="col-md-4 col-sm-4 masonry-item col-xs-12">
		          <div class="image-tile outer-title text-center">
		            <a id="productLink${eachData._id}" href="#">
		              <img alt="Pic" class="product-thumb" src="${eachData.productImages[0].imageUrl}" />
		            </a>
		            <div class="title">
		              <h5 class="mb0">${eachData.productName}</h5>
		              <span class="display-block mb16">${'IDR' + ' ' + eachData.productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
		            </div>
		          </div>
		        </div>
					`)
					// Set product id on click
					setProductId(eachData)
				} else if (selectorValue === 'All') {
					// Else populate all the products
					$('#productsComponent').append(`
					<div class="col-md-4 col-sm-4 masonry-item col-xs-12">
	          <div class="image-tile outer-title text-center">
	            <a id="productLink${eachData._id}" href="#">
	              <img alt="Pic" class="product-thumb" src="${eachData.productImages[0].imageUrl}" />
	            </a>
	            <div class="title">
	              <h5 class="mb0">${eachData.productName}</h5>
	              <span class="display-block mb16">${'IDR' + ' ' + eachData.productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
	            </div>
	          </div>
	        </div>
				`)
					// Set product id on click
					setProductId(eachData)
				}
			})
		})
	}

	// Get value from query
	getQueryValue = () => {
    let arrQuery = [], hash;
    let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(let i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      arrQuery.push(hash[0]);
      arrQuery[hash[0]] = hash[1];
    }
    // Return object query, but have to called per key. ex: getQueryValue().name
    return arrQuery;
	}

	// If there are query from url, then must be filtered based on query category
	queryCategoryGetter = (dataProducts) => {
		// Change the height of previous products component div to auto (front end issues)
		$('#productsComponent').css('height', '100%')
		// Empty previous div of products
		$('#productsComponent').empty()
		// Iterate through dataProducts to find match
		dataProducts.forEach((eachData) => {
			// Check if query category match dataProducts category
			if (decodeURIComponent(getQueryValue().category) === eachData.productCategory.toLowerCase()) {
				// Set selector value to be the same as query
				$('#categorySelector').val(eachData.productCategory)
				// Append all the filtered category to div products
				$('#productsComponent').append(`
					<div class="col-md-4 col-sm-4 masonry-item col-xs-12">
	          <div class="image-tile outer-title text-center">
	            <a id="productLink${eachData._id}" href="#">
	              <img alt="Pic" class="product-thumb" src="${eachData.productImages[0].imageUrl}" />
	            </a>
	            <div class="title">
	              <h5 class="mb0">${eachData.productName}</h5>
	              <span class="display-block mb16">${'IDR' + ' ' + eachData.productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
	            </div>
	          </div>
	        </div>
				`)
				// Set product id on click
				setProductId(eachData)
			}
		})
	}

	// Populate products
	populateProducts = () => {
		// Get products from db
		axios({
			method: 'get',
			url: urlGetAllProducts
		})
		.then((response) => {
			let arrCategories = []
			// Populate data to products component
			response.data.data.forEach((dataProducts) => {
				$('#productsComponent').append(`
					<div class="col-md-4 col-sm-4 masonry-item col-xs-12">
	          <div class="image-tile outer-title text-center">
	            <a id="productLink${dataProducts._id}" href="#">
	              <img alt="Pic" class="product-thumb" src="${dataProducts.productImages[0].imageUrl}" />
	            </a>
	            <div class="title">
	              <h5 class="mb0">${dataProducts.productName}</h5>
	              <span class="display-block mb16">${'IDR' + ' ' + dataProducts.productPrice.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")}</span>
	            </div>
	          </div>
	        </div>
				`)
				// Loading overlay stop
				$.LoadingOverlay('hide')
				// Push categories to arrCategories
				arrCategories.push(dataProducts.productCategory)
				// Set product id on click
				setProductId(dataProducts)
			})
			// Populate product category selector
			populateCategorySelector(arrCategories)
			// Filter by category
			filterByCategory(response.data.data)
		})
	}

	// Set product id on click
	setProductId = (dataProduct) => {
		// Add event listener to product div component
		$(`#productLink${dataProduct._id}`).click((e) => {
			e.preventDefault()
			// Set product id to localStorage
			localStorage.setItem('dataProduct', JSON.stringify(dataProduct))
			window.location.replace('product-detail.html')
		})
	}

	// On load
	populateProducts()

})