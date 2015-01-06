var bookshopApp = angular.module('bookshopApp', [
  'ngRoute'
  ,'bookshopControllers'
  ,'bookshopFilters'
  ,'bookshopServices'
  ,'ngMaterial'
  ,'ngCart'
]);

bookshopApp.value('toastPosition',{bottom:false,top:true,left:false,right:true});

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
        // ,controller: 'CartCtrl'
      })
            
      .otherwise({
        redirectTo: '/books'
      })
    ;
  }]);