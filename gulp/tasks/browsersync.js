'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');

module.exports = gulp.task('browser-sync', function() {
   browserSync.init({
      server: {
         baseDir: "../build"
      }
   });

   gulp.watch("src/sass/*.scss", ['sass']).on('change', browserSync.reload);
   gulp.watch("src/**/*.html").on('change', browserSync.reload);
   gulp.watch("src/modules/**/*.js").on('change', browserSync.reload);
});
