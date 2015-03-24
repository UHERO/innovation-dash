'use strict';

module.exports = /*@ngInject*/
  function uhGraphsDirective() { //uh-map 
    return {

      // require: '^yUnitMeasure',
      scope: {
        // d3YUnitMeasure : '='
      },
      // template: '<div class="uh-maps">Data goes Here<div>',
      templateUrl: 'common/directives/templates/uhGraphs.html',
      
      // controller: ['$scope', '$http', function($scope, $http) {
      //   };
      // }],
    
      link: function (scope, element, attrs) {
        // var mapSource = '/assets/images/USA.json';
        // scope.yUnitMeasure = "Link Scaled Measueremet";
        // console.log('scope.yUnitMeasure',scope.yUnitMeasure);
        var d3Charts = require('../d3/charts');

        // console.log('colorScheme',attrs.colorScheme);
        console.log('attrs.yUnitMeasure',attrs.d3YUnitMeasure, attrs.measurementUnit);
        d3Charts(attrs.mapUrl, attrs.d3DataUrl, "#uh-map", "#uh-graph", "#uh-histogram", '#uh-brush', attrs.colorScheme, attrs.d3YUnitMeasure, attrs.legendText, attrs.measurementUnit);
        // d3Charts(attrs.mapUrl, attrs.d3DataUrl, "#uh-map", "#uh-graph", '#uh-brush', attrs.colorScheme);
      }
    };
  };
