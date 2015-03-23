'use strict';

module.exports = /*@ngInject*/
  function uhGraphsDirective() { //uh-map 
    return {

      scope: {},
      // template: '<div class="uh-maps">Data goes Here<div>',
      templateUrl: 'common/directives/templates/uhGraphs.html',
      
      // controller: ['$scope', '$http', function($scope, $http) {
      //   };
      // }],
    
      link: function (scope, element, attrs) {
        // var mapSource = '/assets/images/USA.json';
        var d3Charts = require('../d3/charts');
        console.log('colorScheme',attrs.colorScheme);
        d3Charts(attrs.mapUrl, attrs.d3DataUrl, "#uh-map", "#uh-graph", '#uh-brush', attrs.colorScheme);
        
      }
    };
  };
