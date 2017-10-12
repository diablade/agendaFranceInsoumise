angular.module('MyApp', ['ngRoute', 'ngProgress', 'ui.calendar'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        templateUrl: 'views/404.html',
        controller: '',
        title: 'Not Found'
      });
  }]);
