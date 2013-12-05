'use strict';

angular.module('vinifyApp')
  .controller('WineRatingCtrl', function ($scope) {
    $scope.rate = 7;
      $scope.max = 5;
      $scope.isReadonly = false;

      $scope.hoveringOver = function(value) {
        $scope.overStar = value;
        $scope.percent = 100 * (value / $scope.max);
      };

      $scope.ratingStates = [
        {stateOn: 'icon-ok-sign', stateOff: 'icon-ok-circle'},
        {stateOn: 'icon-star', stateOff: 'icon-star-empty'},
        {stateOn: 'icon-heart', stateOff: 'icon-ban-circle'},
        {stateOn: 'icon-heart'},
        {stateOff: 'icon-off'}
      ];

    $scope.selected = undefined;
    $scope.states = ['Sucré', 'Acide', 'Tannique'];
  });