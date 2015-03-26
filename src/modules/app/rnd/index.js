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
      templateUrl: 'app/rnd/views/layout.html',
      controller: 'RndController'
    })
    .state('rnd.expenditures-by-field', {
      url: '/expenditures-by-field',
      templateUrl: 'app/rnd/views/expenditures-by-field.html',
      controller: 'ExpendituresByFieldController'
    })
    .state('rnd.patents-per-occupation', {
      url: '/patents-per-occupation',
      templateUrl: 'app/rnd/views/patents-per-occupation.html',
      controller: 'PatentsPerOccupationController'
    })
    .state('rnd.utility-patents-by-county', {
      url: '/utility-patents-by-county',
      templateUrl: 'app/rnd/views/utility-patents-by-county.html',
      controller: 'UtilityPatentsByCountyController'
    })
    .state('rnd.sbir', {
      url: '/sbir',
      templateUrl: 'app/rnd/views/sbir.html',
      controller: 'SBIRController'
    })
    .state('rnd.academic-rnd', {
      url: '/academic-rnd',
      templateUrl: 'app/rnd/views/academic-rnd.html',
      controller: 'AcademicRnDController'
    })
    .state('rnd.academic-rnd-by-county', {
      url: '/academic-rnd-by-county',
      templateUrl: 'app/rnd/views/academic-rnd-by-county.html',
      controller: 'AcademicRnDByCountyController'
    })
    .state('rnd.federal-rnd', {
      url: '/federal-rnd',
      templateUrl: 'app/rnd/views/federal-rnd.html',
      controller: 'FederalRnDController'
    })
    .state('rnd.business-rnd', {
      url: '/business-rnd',
      templateUrl: 'app/rnd/views/business-rnd.html',
      controller: 'BusinessRnDController'
    })
    .state('rnd.university-startups', {
      url: '/university-startups',
      templateUrl: 'app/rnd/views/university-startups.html',
      controller: 'UniversityStartupsController'
    })
    .state('rnd.technology-licensing', {
      url: '/technology-licensing',
      templateUrl: 'app/rnd/views/technology-licensing.html',
      controller: 'TechnologyLicensingController'
    })
    .state('rnd.technology-licensing-numbers', {
      url: '/technology-licensing-numbers',
      templateUrl: 'app/rnd/views/technology-licensing-numbers.html',
      controller: 'TechnologyLicensingNumberController'
    });
  })

  .controller('RndController', require('./RndController'))
  .controller('ExpendituresByFieldController', require('./ExpendituresByFieldController'))
  .controller('PatentsPerOccupationController', require('./PatentsPerOccupationController'))
  .controller('UtilityPatentsByCountyController', require('./UtilityPatentsByCountyController'))
  .controller('SBIRController', require('./SBIRController'))
  .controller('AcademicRnDController', require('./AcademicRnDController'))
  .controller('AcademicRnDByCountyController', require('./AcademicRnDByCountyController'))
  .controller('FederalRnDController', require('./FederalRnDController'))
  .controller('BusinessRnDController', require('./BusinessRnDController'))
  .controller('UniversityStartupsController', require('./UniversityStartupsController'))
  .controller('TechnologyLicensingController', require('./TechnologyLicensingController'))
  .controller('TechnologyLicensingNumberController', require('./TechnologyLicensingNumberController'));

