var bookshopServices = angular.module('bookshopServices', []);

bookshopServices.factory('BookCollection', ['$http','sEndPointUrl','$filter', function($http, sEndPointUrl, $filter) {
	
   /**
   * Constructor, with class name
   */
    var BookCollection = function() {
		// Public properties, assigned to the instance ('this')
        this.books = [];
    };
    
	/**
   * Public methods, assigned to prototype
   */
   
    // define the getBooks method which will fetch books
    // from back-end and *returns* a promise
    BookCollection.prototype.getBooks = function() {
        
        // Generally, javascript callbacks, like here the $http.get callback,
        // change the value of the "this" variable inside it
        // so we need to keep a reference to the current instance "this" :
        var self = this;

        return $http.get(sEndPointUrl + '/books/').then(function(response) {
            
            self.books = response.data; // when we get the results we store the data in BookCollection.books
            return response; // promises success should always return something in order to allow chaining
        });
    };
    
    // Find a book in the current collection
    BookCollection.prototype.getBook = function (sISBN) {
        return $filter('getByISBN')(this.books, sISBN); // intended use of "$filter"
    };
    
	/**
   * Return the constructor function
   */
    return BookCollection;

}]);

bookshopServices.factory('Deal', ['$http', 'sEndPointUrl', function($http, sEndPointUrl) {
	
    var Deal = function(arrayISBN, fSubTotal) {
        this.ISBNs = arrayISBN; // "fake" ISBNs
        this.subTotal = fSubTotal;
        
        // "default" reduction
        this.offers = [];
        this.reductionType = "amount";
        this.reductionValue = 0.0;
    };
    
    // fetch commercial offers from back-end and *returns* a promise
    Deal.prototype.getOffers = function() {
        var self = this;

        return $http.get(sEndPointUrl + '/books/' + this.ISBNs.map(function(elem){ return elem._id; }).join(',') + '/commercialOffers').then(function(response) {
            self.offers = response.data.offers;
            return response;

        });
    };
    
    Deal.prototype.computeBestOffer = function () {
        var self = this;
        
        var fMaxReduction = 0.0, fReduction = 0.0;
		var sReductionType = "", fReductionValue = 0.0;

		for (var i = 0; i < this.offers.length; i++) {
			
			// "if else"has better performance than "switch" but the latter is easier to read
			switch (this.offers[i].type) {

				case "percentage": {
					fReduction = this.subTotal * (this.offers[i].value / 100);
					sReductionType = (fReduction > fMaxReduction) ? "percentage" : sReductionType;
					break;
				}

				case "minus": {
					fReduction = this.offers[i].value;
					sReductionType = (fReduction > fMaxReduction) ? "amount" : sReductionType;
					break;
				}

				case "slice": {
					fReduction = Math.floor(this.subTotal / this.offers[i].sliceValue) * this.offers[i].value;
					sReductionType = (fReduction > fMaxReduction) ? "amount" : sReductionType;
					break;
				}
			}
			fReductionValue = (fReduction > fMaxReduction) ? this.offers[i].value : fReductionValue;
			fMaxReduction = Math.max(fMaxReduction, fReduction);
		}

        this.reductionType = sReductionType;
        this.reductionValue = fReductionValue;
    }
    
    return Deal;

}]);

bookshopServices.factory('BookReview', ['$http','GoodReaderApi', function($http, GoodReaderApi) {
	
	var BookReview = function(oBook) {
        this.id = oBook.isbn;
        this.isbn = ""; // real ISBN
        this.title = oBook.title;
        this.average_rating = "0.0";
        this.author_fullname = "";
        this.original_publication_year = "";
    };
    
	// "private" function
    // replace fake names in given title with real names
    // and escape space with plus sign
    var fSanitizeTitle = function (sTitle) {
	    return sTitle.replace(/Henri/g, 'Harry').replace(/Potier/g, 'Potter').replace(/ /g, '+');
	};
	
	BookReview.prototype.getReview = function() {
        var self = this;
        // https://www.goodreads.com/api/
        return $http.get(GoodReaderApi.sEndpointUrl + '/book.php?title=' + fSanitizeTitle(this.title)).then(function(response) {
            self.average_rating = response.data.book.average_rating;
            self.author_fullname = (typeof(response.data.book.authors.author) === Array) ? response.data.book.authors.author[0].name : response.data.book.authors.author.name;
            self.original_publication_year = (typeof(response.data.book.work.original_publication_year) === "object") ? self.original_publication_year : response.data.book.work.original_publication_year;
            return self;
        });
    };
    
    return BookReview;
    
}]);

bookshopServices.factory('appServices', function($location, $http, sEndPointUrl, ngCart, Deal) {
	
	return {
		
		// modify ngCart's tax rate / shipping amount based on the best commercial offer
		computeCartReduction: function() {

			if (ngCart.totalItems() > 0) {
				var bigDeal = new Deal(ngCart.getCart().items, ngCart.getSubTotal());
				bigDeal.getOffers().then(function() {
				    bigDeal.computeBestOffer();
				    switch (bigDeal.reductionType) {
						case "amount":
							ngCart.setShipping(-bigDeal.reductionValue); // using ngCart's "shipping amount" as reduction amount
							ngCart.setTaxRate(0);
							break;

						case "percentage":
							ngCart.setShipping(0);
							ngCart.setTaxRate(-bigDeal.reductionValue); // using ngCart's "tax rate" as reduction percentage
							break;
					}
				});
			}
		},
		
		// Add given book (JavaScript Object) to ngCart's cart
		addToCart: function(book) {

			var cartItem = ngCart.getItemById(book.isbn); // return ngCart's item object or false if "id" not found
			if (cartItem === false) {
				ngCart.addItem(book.isbn, book.title, book.price, 1, book);
				return "Article ajout\u00e9 au panier";
			} 
			else {
				return "Quantit\u00e9 maximale atteinte pour cet article !";
			}
		},
		
		// redicted browser to given URL
		goToUrl: function(sPath) {
			$location.path(sPath);
		},
		
		getTranslation: function($scope, sLanguage) {
            var languageFilePath = 'lang/' + sLanguage + '.json';
            return $http.get(languageFilePath).then(function (response) {
                $scope.translation = response.data;
            });
        }
	};
});