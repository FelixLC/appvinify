'use strict';

angular.module('vinifyApp', ['ionic', 'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngAnimate',
  'ui.bootstrap',
])
  .config(function ($compileProvider){
  // Needed for routing to work
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
  })

  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'MainCtrl'
      })
      .when('/vinibar', {
        templateUrl: 'views/vinibar.html',
        controller: 'GetWinesVinibarCtrl'
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
        controller: 'GetWinesVinibarCtrl'
      })
      .when('/welcome', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
