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

// controller: ['$scope', '$http', function($scope, $http){
      //   $scope.stateData = function () {
      //     return ['cali', 'hi', 'ore'];
      //   }
      //   $scope.stateData = null;
      //   $http.get('assets/eco_gdp_by_state.csv').then(function (result){
      //     $scope.StateData = result.data;
      //   }
      // ],

 // function uhMapDirective() {
  //   return {
  //     // require: '^d3DataUrl',
  //     scope: {
  //       d3DataUrl: '=' // bi-directional binding
  //     },
  //     template: '<div class="uh-map">{{stateData}}</div>',
  //     // templateUrl relative to modules
  //     // templateUrl: 'common/directives/templates/uhMap.html',
      // controller: ['$scope', '$http', function($scope, $http) {
      //   $scope.stateData = "DEFAULT!!!!";
      //   $scope.setStateData = function(url) {

      //     // $http can be replaced with d3.csv()
      //     $http.get(url).then(function(result) {
      //       console.log('result', result);
      //       $scope.stateData = result.data;

            // D3 logic here
  //         });
  //       };
  //     }],
  //     // template: '<p>{{ngModel}}</p>',
  //     link: function (scope, element, attrs) {
  //       // Do something awesome
  //       // scope.drinks = ['scotch', 'vodka', 'scotchka'];
  //       console.log('scope.d3DataUrl', attrs.d3DataUrl);

  //       scope.setStateData(attrs.d3DataUrl);
  //     }
  //   };
  // };

  // //timeline graph
      // controller: ['$scope', '$http', function($scope, $http){
        
      //   //D3 Logic
      // }],

      // //line graph
      // controller: ['$scope', '$http', function($scope, $http){
        
      //   //D3 Logic
      // }],

//each controller will render a different graph
      //Map
      // controller: ['$scope', '$http', function($scope, $http){
      //   // var helloD3 = require('../d3/helloworld');
      //   // helloD3("/assets/eco_gdp_by_state.csv", "div.helloGraph");
      //   //D3 Logic
      // }], 