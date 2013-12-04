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
      .when('/vinibar/wines/:id', {
        templateUrl: 'views/wine-info.html',
        controller: 'WineInfoCtrl'
      })
      .when('/vinibar/rating/:id', {
        templateUrl: 'views/wine-rating.html',
        controller: 'WineInfoCtrl'
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
