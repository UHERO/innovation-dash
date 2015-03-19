'use strict';

module.exports = /*@ngInject*/
  function fooDirective(/* inject dependencies here, i.e. : $rootScope */) {
    return {
      link: function (scope, element) {
        // Do something awesome
      }
    };
  };

// controller: ['$scope', '$http', function($scope, $http){
      //     $scope.stateData = "Default";
      //     $scope.setStateData = function (url) {
      //     $http.get( url ).then(function (result){
      //       $scope.StateData = result.data;
            
      //     };
      //   };
      // }],