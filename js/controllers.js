var bookshopControllers = angular.module('bookshopControllers', []);

bookshopControllers.controller('BookListCtrl', ['$scope', '$mdToast', 'BookCollection', 'appServices', function($scope, $mdToast, BookCollection, appServices) {

    var collection = new BookCollection();
    collection.getBooks().then(function(){
	    $scope.books = collection.books;
    });
	
	$scope.goToCart = function() {
		appServices.goToUrl('/cart');
	};

	$scope.addToCart = function(book) {
		var sMessage = appServices.addToCart(book);
		$mdToast.show($mdToast.simple().content(sMessage).position('top right'));
		//appServices.goToUrl('/cart'); // none of my testers liked to be redirected to the cart :(
	};
}]);

bookshopControllers.controller('BookDetailCtrl', ['$scope', '$routeParams', '$mdToast', 'BookCollection', 'BookReview','appServices', function($scope, $routeParams, $mdToast, BookCollection, BookReview, appServices) {
    
    appServices.getTranslation($scope, navigator.language || navigator.userLanguage || "fr");
    
    var collection = new BookCollection();
    collection.getBooks().then(function(){
        $scope.book = collection.getBook($routeParams.isbn);
        $scope.mainImageUrl = ($scope.book === null) ? 'img/cover.png' : $scope.book.cover;
        
        var reviewer = new BookReview($scope.book);
        reviewer.getReview().then(function(review) {
            
            $scope.average_rating = review.average_rating;
			$scope.author = review.author_fullname;
			$scope.original_publication_year = review.original_publication_year;
        });
    });
    
	$scope.goToCart = function() {
		appServices.goToUrl('/cart');
	};

	$scope.addToCart = function(book) {
		var sMessage = appServices.addToCart(book);
		$mdToast.show($mdToast.simple().content(sMessage).position('top right'));
		//appServices.goToUrl('/cart'); // none of my testers liked to be redirected to the cart :(
	};
}]);

bookshopControllers.controller('MyCartCtrl', ['$scope', '$http', '$mdDialog', '$mdToast', 'appServices', 'ngCart', function($scope, $http, $mdDialog, $mdToast, appServices, ngCart) {
	
	appServices.computeCartReduction(); // (re)compute at arrival
	
	appServices.getTranslation($scope, navigator.language || navigator.userLanguage || "fr");

	$scope.backToShop = function() {
		appServices.goToUrl('/books');
	};

	$scope.checkout = function(ev) {

		if (ngCart.totalItems() > 0) {
			var mdDialogConfirm = $mdDialog.confirm()
				.title($scope.translation.CHECKOUT_DIALOG_TITLE)
				.content(ngCart.totalItems() + $scope.translation.CHECKOUT_DIALOG_ITEMS_NUMBER + ngCart.totalCost() + $scope.translation.CURRENCY_SYM)
				.ok($scope.translation.PAY)
				.cancel($scope.translation.CANCEL)
				.targetEvent(ev)
			;

			$mdDialog
				.show(mdDialogConfirm)
				.then(function() {
					$scope.alert = $scope.translation.ORDER_COMPLETE;
					ngCart.empty();
				},
				function() {
					$scope.alert = '';
				})
			;
		}
		else {
			$mdToast.show($mdToast.simple().content($scope.translation.YOUR_CART_EMPTY).position('top right'));
		}
	};
}]);

bookshopControllers.controller('NgCartCtrl', ['$scope', 'appServices', 'ngCart', function($scope, appServices, ngCart) {
    
    appServices.getTranslation($scope, navigator.language || navigator.userLanguage || "fr");
    
    $scope.removeFromCart = function(sISBN) {
		ngCart.removeItemById(sISBN);
		appServices.computeCartReduction();
	};
}]);