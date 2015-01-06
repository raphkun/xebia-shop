angular.module('bookshopFilters', [])
  .filter('getByISBN', function() {
    return function(input, isbn) {
        for (var i=0; i < input.length; i++) {
          if (input[i].isbn.indexOf(isbn) > -1) {
            return input[i];
          }
        }
        return null;
      }
  })
;