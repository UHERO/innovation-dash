'use strict';

module.exports =
  angular.module('uHero.rnd', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('rnd', {
      url: '/rnd',
      templateUrl: 'app/rnd/layout.html',
      controller: 'RndController'
    });
  })

  .controller('RndController', require('./RndController'));

