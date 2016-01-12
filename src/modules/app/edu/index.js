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
      url: '/sne-grad-student-profile',
      templateUrl: 'app/edu/views/sne-grad-student-profile.html',
      controller: 'SnEGradStudentProfileController'
    })
    .state('edu.sne-grad-student-funding', {
      url: '/sne-grad-student-funding',
      templateUrl: 'app/edu/views/sne-grad-student-funding.html',
      controller: 'SnEGradStudentFundingController'
    })
    .state('edu.stem-majors', {
      url: '/stem-majors',
      templateUrl: 'app/edu/views/stem-majors.html',
      controller: 'StemMajorsController'
    })
    .state('edu.post-sec-degree', {
      url: '/post-sec-degree',
      templateUrl: 'app/edu/views/post-sec-degree.html',
      controller: 'PostSecDegreeController'
    })
    .state('edu.sne-bachelors', {
      url: '/sne-bachelors',
      templateUrl: 'app/edu/views/sne-bachelors.html',
      controller: 'SnEBachelorsController'
   })
    .state('edu.sne-grad-students', {
      url: '/sne-grad-students',
      templateUrl: 'app/edu/views/sne-grad-students.html',
      controller: 'SnEGradStudentsController'
    })
    .state('edu.post-docs', {
      url: '/post-docs',
      templateUrl: 'app/edu/views/post-docs.html',
      controller: 'PostDocsController'
    })
    .state('edu.fourth-grade-math', {
      url: '/fourth-grade-math',
      templateUrl: 'app/edu/views/fourth-grade-math.html',
      controller: 'FourthGradeMathController'
    })
    .state('edu.fourth-grade-reading', {
      url: '/fourth-grade-reading',
      templateUrl: 'app/edu/views/fourth-grade-reading.html',
      controller: 'FourthGradeReadingController'
    })
    .state('edu.eight-grade-math', {
      url: '/eight-grade-math',
      templateUrl: 'app/edu/views/eight-grade-math.html',
      controller: 'EightGradeMathController'
    })
    .state('edu.eight-grade-reading', {
      url: '/eight-grade-reading',
      templateUrl: 'app/edu/views/eight-grade-reading.html',
      controller: 'EightGradeReadingController'
    })
    .state('edu.education-attainment', {
      url: '/education-attainment',
      abstract: true,
      views : {
        'top-nav' : {
          templateUrl: 'common/partials/top-nav.html'
        },
        'footer' : {
          templateUrl: 'common/partials/footer.html'
        },
        '@' : {
          templateUrl: 'app/edu/views/education-attainment.html',
        }
      }
      // controller: 'EducationAttainmentController'
    })
    .state('edu.education-attainment.us', {
      url: '/us',
      templateUrl: 'app/edu/views/education-attainment.us.html',
      controller: 'EducationAttainmentController'
    })
    .state('edu.education-attainment.hawaii', {
      url: '/hawaii',
      views : {
        '@' : {
          templateUrl: 'app/edu/views/education-attainment.hawaii.html',
          controller: 'EducationAttainmentHawaiiController'
        }
      }
    })
    .state('edu.attainment-highschool', {
      url: '/education-attainment-highschool',
      abstract: true,
      templateUrl: 'app/edu/views/attainment-highschool.html',
      // controller: 'EducationAttainmentController'
    })
    .state('edu.attainment-highschool.us', {
      url: '/us',
      templateUrl: 'app/edu/views/attainment-highschool.us.html',
      controller: 'EduAttainmentHSController'
    })
    .state('edu.attainment-highschool.hawaii', {
      url: '/hawaii',
      templateUrl: 'app/edu/views/attainment-highschool.hawaii.html',
      controller: 'EduAttainmentHSHawaiiController'
    });
  })

  .controller('EduController', require('./EduController'))
  .controller('SnEGradStudentProfileController', require('./SnEGradStudentProfileController'))
  .controller('SnEGradStudentFundingController', require('./SnEGradStudentFundingController'))
  .controller('StemMajorsController', require('./StemMajorsController'))
  .controller('EducationAttainmentController', require('./EducationAttainmentController'))
  .controller('EducationAttainmentHawaiiController', require('./EducationAttainmentHawaiiController'))
  .controller('EduAttainmentHSHawaiiController', require('./EduAttainmentHSHawaiiController'))
  .controller('EduAttainmentHSController', require('./EduAttainmentHSController'))
  .controller('PostSecDegreeController', require('./PostSecDegreeController'))
  .controller('SnEBachelorsController', require('./SnEBachelorsController'))
  .controller('SnEGradStudentsController', require('./SnEGradStudentsController'))
  .controller('PostDocsController', require('./PostDocsController'))
  .controller('FourthGradeMathController', require('./FourthGradeMathController'))
  .controller('FourthGradeReadingController', require('./FourthGradeReadingController'))
  .controller('EightGradeMathController', require('./EightGradeMathController'))
  .controller('EightGradeReadingController', require('./EightGradeReadingController'));
