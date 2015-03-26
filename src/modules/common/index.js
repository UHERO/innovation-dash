'use strict';

module.exports =
  angular.module('uHero.common', [
    require('./directives').name,
    require('./filters').name,
    require('./services').name
  ]);
