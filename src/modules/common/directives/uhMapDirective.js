'use strict';

module.exports = /*@ngInject*/
  function uhMapDirective() {
    return {
      // require: '^d3Data',
      scope: {
        d3Data: '='
        //get stuff from controller
      },
      template: '<div class="uh-map">{{StateData}}<div>',
      // templateUrl: 'common/directives/templates/uhMap.html',
      // controller: ['$scope', '$http', function($scope, $http){
      //     $scope.stateData = function () {
      //       return ['cali', 'hi', 'ore'];
      //     }
      //     $scope.stateData = null;
      //     $http.get('/jon.csv').then(function (result){
      //       $scope.StateData = result.data;
      // }];
      controller: ['$scope', '$http', function($scope, $http){
          $scope.stateData = "Default";
          $scope.setStateData = function (url) {
          $http.get( url ).then(function (result){
            $scope.StateData = result.data;
            
          };
        };
      }],
      link: function (scope, element, attrs) {
        // Do something awesome
        scope.setStateData( attrs.d3DataUrl );
      }
    };
  };
