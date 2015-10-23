'use strict';

module.exports =
  angular.module('uHero.ent', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('ent', {
      url: '/ent',
      templateUrl: 'app/ent/views/layout.html',
      controller: 'EntController'
    })
    .state('ent.startup-employment-share', {
      url: '/startup-employment-share',
      templateUrl: 'app/ent/views/startup-employment-share.html',
      controller: 'StartupEmploymentShareController'
    })
    .state('ent.young-firm-employment-share', {
      url: '/young-firm-employment-share',
      templateUrl: 'app/ent/views/young-firm-employment-share.html',
      controller: 'YoungFirmEmploymentShareController'
    })
    .state('ent.mature-firm-employment-share', {
      url: '/mature-firm-employment-share',
      templateUrl: 'app/ent/views/mature-firm-employment-share.html',
      controller: 'MatureFirmEmploymentController'
    })
    .state('ent.one-yr-startup-survival-rate', {
      url: '/one-yr-startup-survival-rate',
      templateUrl: 'app/ent/views/one-yr-startup-survival-rate.html',
      controller: 'OneYearStartupController'
    })
    .state('ent.five-yr-startup-survival-rate', {
      url: '/five-yr-startup-survival-rate',
      templateUrl: 'app/ent/views/five-yr-startup-survival-rate.html',
      controller: 'FiveYearStartupController'
    })
    .state('ent.percent-sne-occupations', {
      url: '/percent-sne-occupations',
      templateUrl: 'app/ent/views/percent-sne-occupations.html',
      controller: 'PercentSnEController'
    })
    .state('ent.kauffman-index', {
      url: '/kauffman-index',
      templateUrl: 'app/ent/views/kauffman-index.html',
      controller: 'KauffmanIndexController'
    })
    .state('ent.vc-investment', {
      url: '/vc-investment',
      templateUrl: 'app/ent/views/vc-investment.html',
      controller: 'VcInvestmentController'
    });
  })

  .controller('EntController', require('./EntController'))
  .controller('StartupEmploymentShareController', require('./StartupEmploymentShareController'))
  .controller('YoungFirmEmploymentShareController', require('./YoungFirmEmploymentShareController'))
  .controller('MatureFirmEmploymentController', require('./MatureFirmEmploymentController'))
  .controller('OneYearStartupController', require('./OneYearStartupController'))
  .controller('FiveYearStartupController', require('./FiveYearStartupController'))
  .controller('PercentSnEController', require('./PercentSnEController'))
  .controller('KauffmanIndexController', require('./KauffmanIndexController'))
  .controller('VcInvestmentController', require('./VcInvestmentController'));

