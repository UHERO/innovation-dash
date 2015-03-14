'use strict';

module.exports =
  angular.module('uHero.econ', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('econ', {
      url: '',
      templateUrl: 'app/econ/layout.html',
      controller: 'EconController'
    });
  })

  .controller('EconController', require('./EconController'));

