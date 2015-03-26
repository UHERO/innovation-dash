'use strict';

module.exports =
  angular.module('uHero.splash', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('splash', {
      url: '/',
      templateUrl: 'app/splash/views/splash.html',
      controller: 'SplashController'
    });
  })
  .controller('SplashController', require('./SplashController'));