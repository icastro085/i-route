var gulp = require('gulp');
var mocha = require('gulp-mocha');
var util = require('gulp-util');
var fs = require('fs');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var concat = require('gulp-concat-util');
var sequence = require('gulp-sequence');

require('gulp-release-it')(gulp);

var chai = require('chai');

//define a global function for use in test
global.expect = chai.expect;
global.assert = chai.assert;
global.should = chai.should;


gulp.task('default', [
    'build'
]);

gulp.task('build', sequence(
    [
        'jshint',
        'mocha',
    ],
    'concat',
    'uglify'
));

gulp.task('watch', function() {
    gulp.watch(['test/**/*.js'], ['mocha']);
    gulp.watch(['src/**/*.js'], ['jshint']);
});

gulp.task('mocha', function() {

    return gulp.src(['test/**/*.js'], { read: false })
        .pipe(mocha({
            reporter: 'list',
            require: [],
            globals: ['setTimeout']
        }))
        .on('error', util.log);
});

gulp.task('jshint', function() {
    return gulp.src(['src/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', function() {

    var options = {
        preserveComments: 'license'
    };

    return gulp.src(['dist/i-promise.js'])
        .pipe(uglify(options))
        .pipe(rename(function(path){
            path.basename += '.min';
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('concat', function() {
    return gulp.src(['src/**/*.js'])
        .pipe(concat('i-promise.js'))
        .pipe(concat.header(readLicense() + '!function(){\n'))
        .pipe(concat.footer('}();'))
        .pipe(gulp.dest('dist'));
});

function readLicense(){
    return '/**\n\n' + fs.readFileSync('LICENSE', 'utf8') + '\n*/\n';
}
