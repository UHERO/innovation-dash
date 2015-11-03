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
    .state('econ.regional-price-parities', {
      url: '/regional-price-parities',
      templateUrl: 'app/econ/views/regional-price-parities.html',
      controller: 'RegionalPriceController'
    })
    .state('econ.state-and-local-tax-burden', {
      url: '/state-and-local-tax-burden',
      templateUrl: 'app/econ/views/state-and-local-tax-burden.html',
      controller: 'StateLocalTaxController'
    })
    .state('econ.lf-part-empl', {
      url: '/lf-part-empl',
      templateUrl: 'app/econ/views/lf-part-empl.html',
      controller: 'LFPartEmplController'
    })
    .state('econ.lf-part-empl-rate', {
      url: '/lf-part-empl-rate',
      templateUrl: 'app/econ/views/lf-part-empl-rate.html',
      controller: 'LFPartRateController'
    })
    .state('econ.per-capita-personal-income', {
      url: '/per-capita-personal-income',
      // abstract: true,
      templateUrl: 'app/econ/views/per-capita-personal-income.html',
      controller: 'PerCapitaController'
    })
    .state('econ.per-capita-personal-income-county', {
       url: '/per-capita-personal-income-county',
       templateUrl: 'app/econ/views/per-capita-personal-income-county.html',
       controller: 'PerCapitaHawaiiController'
    })
    
   /* .state('econ.per-capita-personal-income.us', {
      url: '/us',
      templateUrl: 'app/econ/views/per-capita-personal-income.us.html',
      controller: 'PerCapitaController'
    })
    .state('econ.per-capita-personal-income.hawaii', {
      url: '/hawaii',
      templateUrl: 'app/econ/views/per-capita-personal-income.hawaii.html',
      controller: 'PerCapitaHawaiiController'
    }) */
       
    .state('econ.non-farm-jobs', {
      url: '/non-farm-jobs',
      // abstract: true,
      templateUrl: 'app/econ/views/non-farm-jobs.html',
      controller: 'NonFarmController'
    })
    .state('econ.non-farm-jobs-county', {
       url: '/non-farm-jobs-county',
       templateUrl: 'app/econ/views/non-farm-jobs-county.html',
       controller: 'NonFarmHawaiiController'
    })
    
    /* .state('econ.non-farm-jobs.us', {
      url: '/us',
      templateUrl: 'app/econ/views/non-farm-jobs.us.html',
      controller: 'NonFarmController'
    })
    .state('econ.non-farm-jobs.hawaii', {
      url: '/hawaii',
      templateUrl: 'app/econ/views/non-farm-jobs.hawaii.html',
      controller: 'NonFarmHawaiiController'
    }) */
    
    .state('econ.unemployment-rate', {
      url: '/unemployment-rate',
      // abstract: true,
      templateUrl: 'app/econ/views/unemployment-rate.html',
      controller: 'UnemploymentRateController'
    })
    .state('econ.unemployment-rate-county', {
       url: '/unemployment-rate-county',
       templateUrl: 'app/econ/views/unemployment-rate-county.html',
       controller: 'UnemploymentRateHawaiiController'
    })
    
    /* .state('econ.unemployment-rate.us', {
      url: '/us',
      templateUrl: 'app/econ/views/unemployment-rate.us.html',
      controller: 'UnemploymentRateController'
    })
    .state('econ.unemployment-rate.hawaii', {
      url: '/hawaii',
      templateUrl: 'app/econ/views/unemployment-rate.hawaii.html',
      controller: 'UnemploymentRateHawaiiController'
    }) */
    
    .state('econ.average-earnings-per-job', {
      url: '/average-earnings-per-job',
      // abstract: true,
      templateUrl: 'app/econ/views/average-earnings-per-job.html',
      controller: 'AverageEarningsController'
    })
    .state('econ.average-earnings-per-job-county', {
       url: '/average-earnings-per-job-county',
       templateUrl: 'app/econ/views/average-earnings-per-job-county.html',
       controller: 'AverageEarningsHawaiiController'
    });
    
    /* .state('econ.average-earnings-per-job.us', {
      url: '/us',
      templateUrl: 'app/econ/views/average-earnings-per-job.us.html',
      controller: 'AverageEarningsController'
    })
    .state('econ.average-earnings-per-job.hawaii', {
      url: '/hawaii',
      templateUrl: 'app/econ/views/average-earnings-per-job.hawaii.html',
      controller: 'AverageEarningsHawaiiController'
    }); */
  })

  .controller('EconController', require('./EconController'))
  .controller('GdpStateController', require('./GdpStateController'))
  .controller('PerCapitaController', require('./PerCapitaController'))
  .controller('RegionalPriceController', require('./RegionalPriceController'))
  .controller('NonFarmController', require('./NonFarmController'))
  .controller('UnemploymentRateController', require('./UnemploymentRateController'))
  .controller('StateLocalTaxController', require('./StateLocalTaxController'))
  .controller('LFPartEmplController', require('./LFPartEmplController'))
  .controller('LFPartRateController', require('./LFPartRateController'))
  .controller('AverageEarningsController', require('./AverageEarningsController'))
  .controller('AverageEarningsHawaiiController', require('./AverageEarningsHawaiiController'))
  .controller('NonFarmHawaiiController', require('./NonFarmHawaiiController'))
  .controller('UnemploymentRateHawaiiController', require('./UnemploymentRateHawaiiController'))
  .controller('PerCapitaHawaiiController', require('./PerCapitaHawaiiController'));
