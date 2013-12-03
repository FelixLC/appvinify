'use strict';

angular.module('vinifyApp', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ui.bootstrap'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'MainCtrl'
      })
      .when('/vinibar', {
        templateUrl: 'views/vinibar.html',
        controller: 'VinibarCtrl'
      })
      .when('/winelist', {
        templateUrl: 'views/winelist.html',
        controller: 'MainCtrl'
      })
      .when('/welcome', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
