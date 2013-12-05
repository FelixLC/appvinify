'use strict';

angular.module('vinifyApp')
	.factory('Wines', function(){
        var WineList = [
			 {
                "url": "http://192.168.9.184:8000/wines/1/", 
                "couleur": "Rouge", 
                "region": "Bordeaux", 
                "appellation": "Pauillac", 
                "domaine": "Mouton Rotschild", 
                "cuvee": "", 
                "millesime": 1982, 
                "prix": 1350, 
                "description": "Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment."
            }, 
			  {
                "url": "http://192.168.9.184:8000/wines/2/", 
                "couleur": "Rouge", 
                "region": "Bordeaux", 
                "appellation": "Pauillac", 
                "domaine": "Mouton Rotschild", 
                "cuvee": "", 
                "millesime": 1982, 
                "prix": 1350, 
                "description": "Today, with an average price of $1,307 per bottle, Mouton 1982 is selling for more than 40 times its futures price\u2014a fabulous return on an investment."
            }, 
			  {
                "url": "http://192.168.9.184:8000/wines/3/", 
                "couleur": "Rouge", 
                "region": "Bordeaux", 
                "appellation": "Pauillac", 
                "domaine": "De La Rochiere", 
                "cuvee": "", 
                "millesime": 2012, 
                "prix": 15, 
                "description": "Un bon rouge qui tache"
            }
          ];

       return {
       		getwines: function (id) {
       			return WineList[id];
   			},
		};
       
      })

   .controller("WineInfoCtrl", function (Wines, $scope, $routeParams) {
		var vino = $routeParams.id;
	  $scope.vin =  Wines.getwines($routeParams.id - 1);
	});