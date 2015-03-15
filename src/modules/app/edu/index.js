'use strict';

module.exports =
  angular.module('uHero.edu', [
    //load your foo submodules here, e.g.:
    //require('./bar').name
  ])
  .config(function ($stateProvider) {
    $stateProvider
    .state('edu', {
      url: '/edu',
      templateUrl: 'app/edu/views/layout.html',
      controller: 'EduController'
    })
    .state('edu.sne-grad-student-funding', {
      url: '/edu/sne-grad-student-funding',
      templateUrl: 'app/edu/views/sne-grad-student-funding.html',
      controller: 'SnEGradStudentFundingController'
    })
    .state('edu.sne-grad-student-profile', {
      url: '/edu/sne-grad-student-profile',
      templateUrl: 'app/edu/views/sne-grad-student-profile.html',
      controller: 'SnEGradStudentProfileController'
    });

  })

  .controller('EduController', require('./EduController'))
  .controller('SnEGradStudentFundingController', require('./SnEGradStudentFundingController'))
  .controller('SnEGradStudentProfileController', require('./SnEGradStudentProfileController'));