'use strict';

module.exports =
  angular.module('uHero.ent', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('ent', {
      url: '',
      templateUrl: 'app/ent/layout.html',
      controller: 'EntController'
    });
  })

  .controller('EntController', require('./EntController'));

