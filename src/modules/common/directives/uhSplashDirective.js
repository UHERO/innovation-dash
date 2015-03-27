'use strict';

module.exports = /*@ngInject*/
  function uhSplashDirective() { //uh-map 
    return {

      scope: {},
      template: '<div class="uh-splash">Data Data Goes Here!!!</div>',
    
      link: function (scope, element, attrs) {
        // var mapSource = '/assets/images/USA.json';
        // scope.yUnitMeasure = "Link Scaled Measueremet";
        // console.log('scope.yUnitMeasure',scope.yUnitMeasure);
        var d3Splash = require('../d3/splash');
        console.log('".d3-graph"',".d3-graph");
      
        d3Splash('.d3-graph');
      }
    };
  };