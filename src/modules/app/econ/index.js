'use strict';

module.exports =
  angular.module('uHero.econ', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('econ', {
      url: '/econ',
      templateUrl: 'app/econ/views/layout.html',
      controller: 'EconController'
    })
    .state('econ.gdp-by-state', {
      url: '/gdp-by-state',
      templateUrl: 'app/econ/views/gdp-by-state.html',
      controller: 'GdpStateController'
    })
    .state('econ.per-capita-personal-income', {
      url: '/per-capita-personal-income',
      templateUrl: 'app/econ/views/per-capita-personal-income.html',
      controller: 'PerCapitaController'
    })
    .state('econ.regional-price-parities', {
      url: '/regional-price-parities',
      templateUrl: 'app/econ/views/regional-price-parities.html',
      controller: 'RegionalPriceController'
    })
    .state('econ.non-farm-jobs', {
      url: '/non-farm-jobs',
      templateUrl: 'app/econ/views/non-farm-jobs.html',
      controller: 'NonFarmController'
    })
    .state('econ.unemployment-rate', {
      url: '/unemployment-rate',
      templateUrl: 'app/econ/views/unemployment-rate.html',
      controller: 'UnemploymentRateController'
    })
    .state('econ.state-and-local-tax-burden', {
      url: '/state-and-local-tax-burden',
      templateUrl: 'app/econ/views/state-and-local-tax-burden.html',
      controller: 'StateLocalTaxController'
    })
    .state('econ.lf-part-empl-rate', {
      url: '/lf-part-empl-rate',
      templateUrl: 'app/econ/views/lf-part-empl-rate.html',
      controller: 'LFPartEmplController'
    })
    .state('econ.average-earnings-per-job', {
      url: '/average-earnings-per-job',
      abstract: true,
      templateUrl: 'app/econ/views/average-earnings-per-job.html',
      controller: 'AverageEarningsController'
    })
    .state('econ.average-earnings-per-job-hawaii', {
      url: '/average-earnings-per-job-hawaii',
      templateUrl: 'app/econ/views/average-earnings-per-job-hawaii.html',
      controller: 'AverageEarningsHawaiiController'
    });
  })

  .controller('EconController', require('./EconController'))
  .controller('GdpStateController', require('./GdpStateController'))
  .controller('PerCapitaController', require('./PerCapitaController'))
  .controller('RegionalPriceController', require('./RegionalPriceController'))
  .controller('NonFarmController', require('./NonFarmController'))
  .controller('UnemploymentRateController', require('./UnemploymentRateController'))
  .controller('StateLocalTaxController', require('./StateLocalTaxController'))
  .controller('LFPartEmplController', require('./LFPartEmplController'))
  .controller('AverageEarningsController', require('./AverageEarningsController'))
  .controller('AverageEarningsHawaiiController', require('./AverageEarningsHawaiiController'));

