'use strict';

angular.module('vinifyApp')
  .factory('WinesVinibar',function($resource){
    return $resource('http://devinify1.herokuapp.com/wines/');    
    })
  .controller('GetWinesVinibarCtrl', function($scope, WinesVinibar){
    $scope.WINES = WinesVinibar.query();
    $scope.mytitle = 'Vinify';
  })
  .controller("WineInfoCtrl", function (WinesVinibar, $scope, $routeParams) {
	  $scope.id = $routeParams.id -1;
	  $scope.WINE = WinesVinibar.query();
    // $scope.mytitle = WinesVinibar.query()[$routeParams.id].domaine; COMMENT LE PASSER EN ARGUMENT?
	});	