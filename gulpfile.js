/*!
 To install, run this from the terminal in the project root folder,
 you MAY have to prefix it with sudo:

 npm install

 To watch files and build them when they change, run:

 gulp watch

 To run the page in the browser and sync your changes automatically, run:

 gulp serve

 To build for deployment (inline styles and scripts)

 gulp deploy

 */

'use strict';

// Load plugins
var gulp = require('gulp'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	minifycss = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync').create(),
	del = require('del'),
	inline = require('gulp-inline-source'),
	path = require('path');

// Styles
gulp.task('styles', function () {
	return gulp.src('app/**/*.scss')
	//.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compact', sourceMap: true}))
		.on('error', function (error) {
			console.log('Style problem: ' + error);
		})
		.pipe(gulp.dest('app'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss())
		.on('error', function (error) {
			console.log('Style minification problem: ' + error);
		})
		.pipe(gulp.dest('app'));
});

// App Scripts
gulp.task('scripts', function (cb) {
	return gulp.src('app/js/**/*.js')
		//.pipe(concat('lib/common.js', 'app.js'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app/js'));
});


// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*'], {dot: true}));

// Copy All Files At The Root Level (app)
gulp.task('deploy', ['clean', 'styles', 'scripts'], function ()
{
	gulp.src(['app/**/*', '!app/**/*.{scss|html}'], {dot: false})
		.pipe(gulp.dest('dist'));

	gulp.src(['app/**/*.html'])
		.pipe(inline())
		.pipe(gulp.dest('dist'))

	return "done";
});

gulp.task('inline', [], function ()
{
	return gulp.src(['app/**/*.html'])
		.pipe(inline())
		//.pipe(gulp.dest('dist'));
		.pipe(gulp.dest('dist'))
        // .pipe(rename({suffix: '.min'}))
		// .pipe(gulp.dest('app'));

});

// Watch
gulp.task('watch', function () {

	// Watch .scss files
	gulp.watch('./app/**/*.scss', ['styles']);

	// Watch site.js file
	gulp.watch('./app/**/*.js', ['scripts']);
});

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'scripts', 'watch'], function ()
{
	//set up browser sync
	//to auto reload and inject css into the open pages!

	browserSync.init({
        server: {
            baseDir: "./app"
        }
    });

	gulp.watch('app/**/*.{html|scss|js|png|gif|jpg|jpeg}', browserSync.reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['buildForDeployment'], function ()
{

	browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
});
