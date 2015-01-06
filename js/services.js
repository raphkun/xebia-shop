var bookshopServices = angular.module('bookshopServices', ['ngResource']);

bookshopServices.factory('Book', ['$resource', function($resource) {
	return $resource('http://henri-potier.xebia.fr/books', {}, {
		query: {
			method: 'GET',
			params: {
				isbn: null
			},
			isArray: true
		}
	});
}
]);

bookshopServices.factory('appServices', function($location, $http, $mdToast, toastPosition, ngCart) {
	return {
		computeBestReduction: function() {

			//console.log(ngCart.getCart().items.map(function(elem) { return elem._id; }).join(","));
			if (ngCart.totalItems() > 0) {
				$http.get('http://henri-potier.xebia.fr/books/' + ngCart.getCart().items.map(function(elem) { return elem._id; }).join(",") + '/commercialOffers').success(function(data) {

					var fMaxReduction = 0.;
					var sReductionType = "amount";
					var iPercentageApplied = 0.;

					for (var i = 0; i < data.offers.length; i++) {
						switch (data.offers[i].type) {

							case "percentage": {
								var fReduction = ngCart.getSubTotal() * (data.offers[i].value / 100);
								sReductionType = (fReduction > fMaxReduction) ? "percentage" : sReductionType;
								iPercentageApplied = data.offers[i].value;
								// console.log(data.offers[i].type+":"+fReduction);
								break;
							}

							case "minus": {
								var fReduction = data.offers[i].value;
								sReductionType = (fReduction > fMaxReduction) ? "amount" : sReductionType;
								// console.log(data.offers[i].type+":"+fReduction);
								break;
							}

							case "slice": {
								var fReduction = Math.floor(ngCart.getSubTotal() / data.offers[i].sliceValue) * data.offers[i].value;
								sReductionType = (fReduction > fMaxReduction) ? "amount" : sReductionType;
								// console.log(data.offers[i].type+":"+fReduction);
								break;
							}
						}
						fMaxReduction = Math.max(fMaxReduction, fReduction);
					}

					switch (sReductionType) {
						case "amount":
							ngCart.setShipping(-fMaxReduction);
							ngCart.setTaxRate(0);
							break;

						case "percentage":
							ngCart.setShipping(0);
							ngCart.setTaxRate(-iPercentageApplied);
							break;
					}

				});
			}
		},
		addToCart: function(book) {

			var item = ngCart.getItemById(book.isbn);
			var message = "";

			if (item == false) {
				ngCart.addItem(book.isbn, book.title, book.price, 1, book);
				message = "Article ajoute au panier";
			} else {
				message = "Quantite maximale atteinte pour cet article !";
			}
			$mdToast.show($mdToast.simple().content(message).position('top right'));
		},
		go: function(sPath) {
			$location.path(sPath);
		}
	};
});
