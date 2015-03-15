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
    .state('edu.sne-grad-student-profile', {
      url: '/edu/sne-grad-student-profile',
      templateUrl: 'app/edu/views/sne-grad-student-profile.html',
      controller: 'SnEGradStudentProfileController'
    })
    .state('edu.sne-grad-student-funding', {
      url: '/edu/sne-grad-student-funding',
      templateUrl: 'app/edu/views/sne-grad-student-funding.html',
      controller: 'SnEGradStudentFundingController'
    })
    .state('edu.stem-majors', {
      url: '/edu/stem-majors',
      templateUrl: 'app/edu/views/stem-majors.html',
      controller: 'StemMajorsController'
    })
    .state('edu.education-attainment', {
      url: '/edu/education-attainment',
      templateUrl: 'app/edu/views/education-attainment.html',
      controller: 'EducationAttainmentController'
    })
    .state('edu.post-sec-degree', {
      url: '/edu/post-sec-degree',
      templateUrl: 'app/edu/views/post-sec-degree.html',
      controller: 'PostSecDegreeController'
    })
    .state('edu.sne-grad-students', {
      url: '/edu/sne-grad-students',
      templateUrl: 'app/edu/views/sne-grad-students.html',
      controller: 'SnEGradStudentsController'
    })
    .state('edu.post-docs', {
      url: '/edu/post-docs',
      templateUrl: 'app/edu/views/post-docs.html',
      controller: 'PostDocsController'
    })
    .state('edu.fourth-grade-math', {
      url: '/edu/fourth-grade-math',
      templateUrl: 'app/edu/views/fourth-grade-math.html',
      controller: 'FourthGradeMathController'
    })
    .state('edu.fourth-grade-reading', {
      url: '/edu/fourth-grade-reading',
      templateUrl: 'app/edu/views/fourth-grade-reading.html',
      controller: 'FourthGradeReadingController'
    })
    .state('edu.eight-grade-math', {
      url: '/edu/eight-grade-math',
      templateUrl: 'app/edu/views/eight-grade-math.html',
      controller: 'EightGradeMathController'
    })
    .state('edu.eight-grade-reading', {
      url: '/edu/eight-grade-reading',
      templateUrl: 'app/edu/views/eight-grade-reading.html',
      controller: 'EightGradeReadingController'
    });
  })

  .controller('EduController', require('./EduController'))
  .controller('SnEGradStudentProfileController', require('./SnEGradStudentProfileController'))
  .controller('SnEGradStudentFundingController', require('./SnEGradStudentFundingController'))
  .controller('StemMajorsController', require('./StemMajorsController'))
  .controller('EducationAttainmentController', require('./EducationAttainmentController'))
  .controller('PostSecDegreeController', require('./PostSecDegreeController'))
  .controller('SnEGradStudentsController', require('./SnEGradStudentsController'))
  .controller('PostDocsController', require('./PostDocsController'))
  .controller('FourthGradeMathController', require('./FourthGradeMathController'))
  .controller('FourthGradeReadingController', require('./FourthGradeReadingController'))
  .controller('EightGradeMathController', require('./EightGradeMathController'))
  .controller('EightGradeReadingController', require('./EightGradeReadingController'));