connect = require('gulp-connect');
open = require('gulp-open');

gulp.task('server', () => {
	let server = connect.server({
		root: dir.build,
		livereload: true
	});

	return gulp.src('./')
		.pipe(open({
			uri: 'http://' + server.host + ':' + server.port
		}))
});

gulp.task('livereload', () => {
	gulp.src(dir.build)
	.pipe(connect.reload());
});