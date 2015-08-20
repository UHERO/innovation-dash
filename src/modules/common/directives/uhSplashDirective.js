'use strict';

module.exports = /*@ngInject*/
  function uhSplashDirective() { //uh-map 
    return {

      scope: {},
      template: '<div class="uh-splash">Data Data Goes Here!!!</div>',
    
      link: function (scope, element, attrs) {
        // var mapSource = 'assets/images/USA.json';
        // scope.yUnitMeasure = "Link Scaled Measueremet";
        // console.log('scope.yUnitMeasure',scope.yUnitMeasure);
        var d3Splash = require('../d3/splash');
      
        d3Splash('.d3-graph-edu','.d3-graph-rnd', '.d3-graph-ent', '.d3-graph-econ');

        d3.selectAll('#hover-tooltip')
          .classed('hidden', true);
      }
    };
  };