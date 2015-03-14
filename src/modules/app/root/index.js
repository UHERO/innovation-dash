'use strict';

module.exports =
  angular.module('uHero.root', [
    //load your root submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('rootState', {
      url: '/root',
      templateUrl: 'app/root/layout.html',
      controller: 'rootController'
    });
  })
  .controller('rootController', require('./rootController'));
