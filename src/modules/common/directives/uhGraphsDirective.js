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
    
      link: function (scope, element, attrs) {
        // var mapSource = '/assets/images/USA.json';
        var d3Charts = require('../d3/charts');
        // d3Charts('/assets/maps/USA.json',"/assets/csv/per_capita_personal_income.csv", ".uh-maps");
        d3Charts('/assets/maps/USA.json',"http://10.0.1.8:4567/economics/eco_per_capita_personal_income", "#uh-map");
        console.log(d3Charts);
        
      }
    };
  };
