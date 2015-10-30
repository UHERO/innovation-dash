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
        // var mapSource = 'assets/images/USA.json';
        // scope.yUnitMeasure = "Link Scaled Measueremet";
        // console.log('scope.yUnitMeasure',scope.yUnitMeasure);
        var d3Charts = require('../d3/charts');

      
        d3Charts(scope, attrs.mapUrl, attrs.d3DataUrl, ".d3-graph", ".uh-current-year", ".uh-previous-year", ".uh-percent", ".uh-summary-measurement", ".uh-value-change", "#uh-map", "#uh-graph", "#uh-key", "#uh-histogram", "#uh-brush", attrs.colorScheme, attrs.d3YUnitMeasure, attrs.legendText, attrs.measurementUnit);

        d3.selectAll('#hover-tooltip')
          .classed('hidden', false);
      }
    };
  };
