'use strict';

module.exports = /*@ngInject*/
  function uhMapDirective() { //uh-map 
    return {

      require: '^d3Data',
      scope: {
        //get stuff from controller
        d3Data: '='
      },
      // template: '<div class="uh-map">{{StateData}}<div>',
      templateUrl: 'common/directives/templates/uhMap.html',
      controller: ['$scope', '$http', function($scope, $http){
        $scope.stateData = function () {
          return ['cali', 'hi', 'ore'];
        }
        $scope.stateData = null;
        $http.get('assets/eco_gdp_by_state.csv').then(function (result){
          $scope.StateData = result.data;
        }
      ],
  
      link: function (scope, element, attrs) {
        scope.setStateData( attrs.d3DataUrl );
      }
    };
  };
