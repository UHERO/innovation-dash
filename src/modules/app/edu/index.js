'use strict';

module.exports =
  angular.module('uHero.edu', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('edu', {
      url: '/edu',
      templateUrl: 'app/edu/layout.html',
      controller: 'EduController'
    });
  })

  .controller('EduController', require('./EduController'));

