'use strict';

module.exports =
  angular.module('uHero.common.directives', [])
  .directive('uhGraphs', require('./uhGraphsDirective'))
  .directive('uhSplash', require('./uhSplashDirective'));



