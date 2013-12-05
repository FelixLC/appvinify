'use strict';
angular.module('vinifyApp', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ui.bootstrap'
]).config([
  '$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/login.html',
      controller: 'MainCtrl'
    }).when('/vinibar', {
      templateUrl: 'views/vinibar.html',
      controller: 'VinibarCtrl'
    }).when('/vinibar/wines/:id', {
      templateUrl: 'views/wine-info.html',
      controller: 'WineInfoCtrl'
    }).when('/vinibar/rating/:id', {
      templateUrl: 'views/wine-rating.html',
      controller: 'WineInfoCtrl'
    }).when('/winelist', {
      templateUrl: 'views/winelist.html',
      controller: 'MainCtrl'
    }).when('/welcome', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    }).otherwise({ redirectTo: '/' });
  }
]);
'use strict';
angular.module('vinifyApp').controller('MainCtrl', [
  '$scope',
  function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }
]);
'use strict';
angular.module('vinifyApp').controller('VinibarCtrl', [
  '$scope',
  function ($scope) {
    $scope.items = [
      'The first choice!',
      'And another choice for you.',
      'but wait! A third!'
    ];
    $scope.isCollapsed = false;
    $scope.choices = [
      {
        name: 'Noter',
        link: 'appv1/note'
      },
      {
        name: 'Informations',
        link: 'appv1/infos'
      }
    ];
    $scope.Wines = [
      {
        'url': 'http://192.168.9.184:8000/wines/1/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/2/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/3/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'De La Rochiere',
        'cuvee': '',
        'millesime': 2012,
        'prix': 15,
        'description': 'Un bon rouge qui tache'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/1/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/2/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/3/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'De La Rochiere',
        'cuvee': '',
        'millesime': 2012,
        'prix': 15,
        'description': 'Un bon rouge qui tache'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/1/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/2/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/3/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'De La Rochiere',
        'cuvee': '',
        'millesime': 2012,
        'prix': 15,
        'description': 'Un bon rouge qui tache'
      }
    ];
  }
]);
'use strict';
angular.module('vinifyApp').controller('WinelistCtrl', [
  '$scope',
  function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }
]);
'use strict';
angular.module('vinifyApp').controller('LoginCtrl', [
  '$scope',
  function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }
]);
'use strict';
angular.module('vinifyApp').controller('ModalInstanceCtrl', [
  '$scope',
  '$modalInstance',
  'items',
  function ($scope, $modalInstance, items) {
    $scope.items = items;
    $scope.selected = { item: $scope.items[0] };
    $scope.ok = function () {
      $modalInstance.close($scope.selected.item);
    };
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }
]).controller('ModalDemoCtrl', [
  '$scope',
  '$modal',
  '$log',
  function ($scope, $modal, $log) {
    $scope.items = [
      'item1',
      'item2',
      'item3'
    ];
    $scope.open = function () {
      var modalInstance = $modal.open({
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            items: function () {
              return $scope.items;
            }
          }
        });
      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  }
]);
'use strict';
angular.module('vinifyApp').factory('WinesREST', [
  '$resource',
  function ($resource) {
    return $resource('http://devinify1.herokuapp.com/wines/');
  }
]).controller('GetWinesRESTCtrl', [
  '$scope',
  'WinesREST',
  function ($scope, WinesREST) {
    $scope.WINES = WinesREST.query();
  }
]).controller('GetWinesCtrl', [
  '$scope',
  'Wines',
  function ($scope, Wines) {
    $scope.Wines = [
      {
        'id': 1,
        'url': 'http://192.168.9.184:8000/wines/1/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'id': 2,
        'url': 'http://192.168.9.184:8000/wines/2/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'id': 3,
        'url': 'http://192.168.9.184:8000/wines/3/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'De La Rochiere',
        'cuvee': '',
        'millesime': 2012,
        'prix': 15,
        'description': 'Un bon rouge qui tache'
      }
    ];
    $scope.Users = [
      {
        domaine: 'Felix',
        region: '18',
        millesime: 'M',
        prix: '12'
      },
      {
        domaine: 'Benjamin',
        region: '12',
        millesime: 'F',
        prix: '12'
      },
      {
        domaine: 'Estelle',
        region: '18',
        millesime: 'F',
        prix: '12'
      },
      {
        domaine: 'Delphine',
        region: '18',
        millesime: 'F',
        prix: '12'
      }
    ];
    $scope.greeting = { text: 'place' };
  }
]);
'use strict';
angular.module('vinifyApp').factory('RatedWines', function () {
  var meaningOfLife = 42;
  return {
    someMethod: function () {
      return meaningOfLife;
    }
  };
});
'use strict';
angular.module('vinifyApp').controller('WineRatingCtrl', [
  '$scope',
  function ($scope) {
    $scope.rate = 7;
    $scope.max = 5;
    $scope.isReadonly = false;
    $scope.hoveringOver = function (value) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / $scope.max);
    };
    $scope.ratingStates = [
      {
        stateOn: 'icon-ok-sign',
        stateOff: 'icon-ok-circle'
      },
      {
        stateOn: 'icon-star',
        stateOff: 'icon-star-empty'
      },
      {
        stateOn: 'icon-heart',
        stateOff: 'icon-ban-circle'
      },
      { stateOn: 'icon-heart' },
      { stateOff: 'icon-off' }
    ];
    $scope.selected = undefined;
    $scope.states = [
      'Sucr\xe9',
      'Acide',
      'Tannique'
    ];
  }
]);
'use strict';
angular.module('vinifyApp').factory('Wines', function () {
  var WineList = [
      {
        'url': 'http://192.168.9.184:8000/wines/1/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/2/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'Mouton Rotschild',
        'cuvee': '',
        'millesime': 1982,
        'prix': 1350,
        'description': 'Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment.'
      },
      {
        'url': 'http://192.168.9.184:8000/wines/3/',
        'couleur': 'Rouge',
        'region': 'Bordeaux',
        'appellation': 'Pauillac',
        'domaine': 'De La Rochiere',
        'cuvee': '',
        'millesime': 2012,
        'prix': 15,
        'description': 'Un bon rouge qui tache'
      }
    ];
  return {
    getwines: function (id) {
      return WineList[id];
    }
  };
}).controller('WineInfoCtrl', [
  'Wines',
  '$scope',
  '$routeParams',
  function (Wines, $scope, $routeParams) {
    var vino = $routeParams.id;
    $scope.vin = Wines.getwines($routeParams.id - 1);
  }
]);