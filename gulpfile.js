'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');

gulp.task('sass', () => {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./public/styles'));
});
 
gulp.task('watch', () => {
  gulp.watch('./sass/**/*.scss', ['sass']);
  nodemon({
    restartable: "rs",
    ignore: [
      ".git",
      ".gitignore",
      ".env-example",
      ".eslintrc",
      "node_modules/**/node_modules",
      "public/",
      "README.MD",
      "yarn.lock",
      "sass/"
    ]
  })
});