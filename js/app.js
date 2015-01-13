var bookshopApp = angular.module('bookshopApp', [
  'ngRoute'
  ,'bookshopControllers'
  ,'bookshopServices'
  ,'bookshopFilters'
  ,'ngCart'
  ,'ngMaterial'
]);

// App-wide values
bookshopApp.value('sEndPointUrl','http://henri-potier.xebia.fr');
bookshopApp.value('GoodReaderApi',{'sEndpointUrl':'../goodreads'});

bookshopApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/books', {
        templateUrl: 'template/partials/book-list.html',
        controller: 'BookListCtrl'
      })
      
      .when('/books/:isbn', {
        templateUrl: 'template/partials/book-detail.html',
        controller: 'BookDetailCtrl'
      })
      
      .when('/cart', {
        templateUrl: 'template/partials/mycart.html'
        ,controller: 'MyCartCtrl'
      })
      
      .otherwise({
        redirectTo: '/books'
      })
    ;
  }
]);