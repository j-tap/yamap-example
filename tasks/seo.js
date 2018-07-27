let gulpSeo = require('gulp-seo');
let fs = require('fs');
 
gulp.task('seo', () => {
	let data = JSON.parse(fs.readFileSync('package.json'));

	return gulp.src(dir.build +'/*.html')
		.pipe(gulpSeo({
			list: ['og', 'se', 'schema', 'twitter'],
			meta: {
				title: data.name,
				description: data.description,
				author: data.author,
				site_name: data.name,
				type: 'website',
				locale: 'ru_RU',
				contact: 'j-tap@ya.ru'
				/*copyright: '© all right reserved',
				rating: 'mature', // general | mature | restricted | 14 years | safe for kids
				image: 'http://sitename.com/img.jpg',
				video: 'http://sitename.com/video.mp4',
				audio: 'http://sitename.com/audio.mp3',
				url: 'http://sitename.com',
				keywords: ['website', 'with', 'meta', 'tags'],
	 			robots: {
					index: false,
					follow: false
				},
				revisitAfter: '1 month'*/
			}
		}))
		.pipe(gulp.dest(dir.build));
});