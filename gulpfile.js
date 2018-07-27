gulp = require('gulp');
requireDir = require('require-dir');
runSequence = require('run-sequence');

imagemin = require('gulp-imagemin');
sass = require('gulp-sass');
pug = require('gulp-pug');
rimraf = require('rimraf');
concatJs = require('gulp-concat');
concatCss = require('gulp-concat-css');
uglify = require('gulp-uglify-es').default;
cleanCSS = require('gulp-clean-css');
htmlmin = require('gulp-htmlmin');
sourcemaps = require('gulp-sourcemaps');

dir = {
	tasks: './tasks',
	dev: './src',
	build: './build'
}

let tasks = requireDir(dir.tasks);


gulp.task('pug', () => {
	return gulp.src(dir.dev +'/index.pug')
		.pipe(pug())
		.pipe(gulp.dest(dir.build));
});

gulp.task('html-min', () => {
	return gulp.src(dir.build +'/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(dir.build));
});

gulp.task('html-build', (callback) => {
	return runSequence('pug', 'seo', 'generate-favicon', 'favicon', 'html-min', callback);
});

gulp.task('html-rebuild', (callback) => {
	return runSequence('pug', 'seo', 'favicon', 'html-min', callback);
});

gulp.task('scss', () => {
	return gulp.src(dir.dev +'/scss/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		//.pipe(concatCss('main.css'))
		//.pipe(cleanCSS())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dir.build +'/css'));
});

gulp.task('js', () => {
	return gulp.src(dir.dev +'/js/*.js')
		.pipe(sourcemaps.init())
		.pipe(concatJs('main.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dir.build +'/js'));
});

gulp.task('img', () => {
	return gulp.src(dir.dev +'/img/*')
		.pipe(imagemin())
		.pipe(gulp.dest(dir.build +'/img'))
});

gulp.task('clean', (cb) => {
	rimraf(dir.build +'/*', cb);
});

gulp.task('watch', () => {
	gulp.watch(dir.dev +'/**/*.pug', () => {
		runSequence('html-rebuild', 'livereload');
	});
	gulp.watch(dir.dev +'/scss/**/*.scss', () => {
		runSequence('scss', 'livereload');
	});
	gulp.watch(dir.dev +'/js/**/*.js', () => {
		runSequence('js', 'livereload');
	});
	gulp.watch(dir.dev +'/img/*', () => {
		runSequence('img', 'livereload');
	});
	gulp.watch(dir.dev +'/test/test-*.js', () => {
		runSequence('testjsCopy', 'livereload');
	});
});

gulp.task('default', ['clean'], () => {
	return runSequence(['html-build', 'img', 'scss', 'js'], 'watch', 'server');
});
