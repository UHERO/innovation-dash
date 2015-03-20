'use strict';

module.exports = /*@ngInject*/
  function uhGraphsDirective() { //uh-map 
    return {

      // require: '^d3Data',
      scope: {
        //get stuff from controller via bi-directional binding
        d3Data: '='
      },
      template: '<div class="uh-graphs">Data goes Here<div>',
      // templateUrl: 'common/directives/templates/uhGraphs.html',
    
      link: function (scope, element, attrs) {
        var mapSource = '/assets/images/USA.json'
        var helloD3 = require('../d3/charts');
        helloD3("/assets/per_capita_personal_income.csv", ".uh-graphs");
       // scope.names = ['jackie', 'jon', 'jesse'];
       // console.log('scope.names', scope.names);
      }
    };
  };

 