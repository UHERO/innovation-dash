'use strict';

module.exports = /*@ngInject*/
  function uhGraphsDirective() { //uh-map 
    return {

      // require: '^d3Data',
      scope: {},
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

        d3Charts(attrs.mapUrl, attrs.d3DataUrl, "#uh-map", "#uh-graph");
        
      }
    };
  };
