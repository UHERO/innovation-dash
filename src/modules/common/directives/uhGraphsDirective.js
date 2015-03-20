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
      
      //each controller will render a different graph
      //Map
      controller: ['$scope', '$http', function($scope, $http){
        // var helloD3 = require('../d3/helloworld');
        // helloD3("/assets/eco_gdp_by_state.csv", "div.helloGraph");
        //D3 Logic
      }],


      link: function (scope, element, attrs) {
        var helloD3 = require('../d3/helloworld');
        helloD3("/assets/eco_gdp_by_state.csv", ".uh-graphs");
       // scope.names = ['jackie', 'jon', 'jesse'];
       // console.log('scope.names', scope.names);
      }
    };
  };

 