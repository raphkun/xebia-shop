var bookshopControllers = angular.module('bookshopControllers', []);

bookshopControllers.controller('BookListCtrl', ['$scope', 'Book', 'appServices', 'ngCart', function($scope, Book, appServices, ngCart) {

	$scope.books = Book.query();
	//$scope.orderProp = 'title';

	$scope.goToCart = function() {
		appServices.go('/cart');
	};

	$scope.addToCart = function(book) {
		appServices.addToCart(book);
		appServices.go('/cart');
	};

}]);

bookshopControllers.controller('BookDetailCtrl', ['$scope', '$http', '$filter', '$routeParams', 'appServices', 'ngCart', function($scope, $http, $filter, $routeParams, appServices, ngCart) {

	$http.get('http://henri-potier.xebia.fr/books').success(function(data) {
		$scope.book = $filter('getByISBN')(data, $routeParams.isbn);
		$scope.mainImageUrl = ($scope.book === null) ? 'img/cover.png' : $scope.book.cover;
	});
	
	$scope.goToCart = function() {
		appServices.go('/cart');
	};
	
	$scope.addToCart = function(book) {
		appServices.addToCart(book);
		appServices.go('/cart');
	};
}]);

bookshopControllers.controller('CartCtrl', ['$scope', 'appServices', '$http', '$mdDialog', 'ngCart', function($scope, appServices, $http, $mdDialog, ngCart) {
	appServices.computeBestReduction();

	$scope.removeFromCart = function(isbn) {
		ngCart.removeItemById(isbn);
		appServices.computeBestReduction();
	};

	$scope.backToShop = function() {
		appServices.go('/books');
	};

	$scope.checkout = function(ev) {
		var confirm = $mdDialog.confirm()
			.title('Confirmation de la commande')
			.content(ngCart.totalItems() + ' article(s) pour un total de ' + ngCart.totalCost() + '\u20AC')
			.ok('Acheter')
			.cancel('Annuler')
			.targetEvent(ev)
		;

		$mdDialog
			.show(confirm)
			.then(function() {
				$scope.alert = 'Commande effectuee.';
			},
			function() {
				$scope.alert = '';
			});
	};
}]);
