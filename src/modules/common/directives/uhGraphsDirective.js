'use strict';

module.exports = /*@ngInject*/
  function uhGraphsDirective() { //uh-map 
    return {

      // require: '^d3Data',
      scope: {
        //get stuff from controller via bi-directional binding
        d3Data: '='
      },
      // template: '<div class="uh-maps">Data goes Here<div>',
      templateUrl: 'common/directives/templates/uhGraphs.html',
      
      controller: ['$scope', '$http', function($scope, $http) {
        $scope.stateData = "DEFAULT!!!!";
        $scope.setStateData = function(url) {

          // $http can be replaced with d3.csv()
          $http.get(url).then(function(result) {
            console.log('result', result);
          $scope.stateData = result.data;
        });
       };
      }],
    
      link: function (scope, element, attrs) {
        // var mapSource = '/assets/images/USA.json';
        var d3Charts = require('../d3/charts');

        // d3Charts('/assets/maps/USA.json',"/assets/csv/per_capita_personal_income.csv", ".uh-maps");

        // d3Charts('/assets/maps/USA.json',"http://10.0.1.8:4567/economics/eco_per_capita_personal_income", "#uh-map");

        console.log(attrs.d3DataUrl);
        
        d3Charts('/assets/maps/USA.json', attrs.d3DataUrl, "#uh-map");
        
      }
    };
  };
