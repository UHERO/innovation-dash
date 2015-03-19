'use strict';

module.exports = /*@ngInject*/
  function uhGraphsDirective() { //uh-map 
    return {

      require: '^d3Data',
      scope: {
        //get stuff from controller via bi-directional binding
        d3Data: '='
      },
      template: '<div class="uh-graphs">{{d3Data}}<div>',
      // templateUrl: 'common/directives/templates/uhGraphs.html',
      
      //each controller will render a different graph
      //Map
      // controller: ['$scope', '$http', function($scope, $http){
      //   $scope.stateData = function(){
      //     return ['cali', 'hi', 'ore'];
      //   };

      //   //D3 Logic
      // }],


      link: function (scope, element, attrs) {
       scope.names = ['jackie', 'jon', 'jesse'];
       console.log('scope.names', scope.names);
      }
    };
  };

 