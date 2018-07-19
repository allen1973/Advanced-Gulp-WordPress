/**
 *
 * 步驟＃1：設置變量
 *
 * @since 1.0.0
 * @authors Ahmad Awais, @digisavvy, @desaiuditd, @jb510, @dmassiani and @Maxlopez
 * @package neat
 */


// Project configuration
var project 		= 'neat', // //項目名稱，用於構建zip。
	url 		= 'neat.dev', // localhost的項目URL
	bower 		= './assets/bower_components/'; // Not truly using this yet, more or less playing right now. TO-DO Place in Dev branch
	build 		= './buildtheme/', // 要打包成zip的文件在這裡
	buildInclude 	= [
				// 包含常見文件類型
				'**/*.php',
				'**/*.html',
				'**/*.css',
				'**/*.js',
				'**/*.svg',
				'**/*.ttf',
				'**/*.otf',
				'**/*.eot',
				'**/*.woff',
				'**/*.woff2',

				// 包含特定文件和文件夾
				'screenshot.png',

				// 排除文件和文件夾
				'!node_modules/**/*',
				'!assets/bower_components/**/*',
				'!style.css.map',
				'!assets/js/custom/*',
				'!assets/css/partials/*'

			];

// 加載Gulp插件
	var gulp     = require('gulp'),
		browserSync  = require('browser-sync'), // 驚人的節省時間的同步瀏覽器測試
		reload       = browserSync.reload,
		autoprefixer = require('gulp-autoprefixer'), // 舊版瀏覽器的自動前綴CSS
		minifycss    = require('gulp-uglifycss'), //用於CSS縮小
		filter       = require('gulp-filter'), //通過使用globbing過濾它們，使您能夠處理原始文件的子集。
		uglify       = require('gulp-uglify'),//縮小JS文件
		imagemin     = require('gulp-imagemin'),//縮小PNG，JPEG，GIF和SVG圖像
		newer        = require('gulp-newer'), //僅用於傳遞比相應目標文件更新的源文件。
		rename       = require('gulp-rename'), //輕鬆重命名文件
		concat       = require('gulp-concat'), //連接JS文件
		notify       = require('gulp-notify'), //基於節點通知模塊向OS發送通知
		cmq          = require('gulp-combine-media-queries'), //在Sass或更少之後組合重複媒體查詢
		runSequence  = require('gulp-run-sequence'), //按順序運行一系列從屬gulp任務
		sass         = require('gulp-sass'), //基於libSass的Sass的 Gulp插件
		plugins      = require('gulp-load-plugins')({ camelize: true }), //自動加載gulp插件
		ignore       = require('gulp-ignore'), // 根據文件特徵忽略流中的文件
		rimraf       = require('gulp-rimraf'), // 幫助我們在運行任務中刪除文件和目錄
		zip          = require('gulp-zip'), // 使用將我們打包的主題壓縮成一個可以安裝在WordPress中的美味zip文件！
		plumber      = require('gulp-plumber'), // 修復節點管道，防止它們因錯誤而損壞
		cache        = require('gulp-cache'), //Gulp的緩存代理任務
		sourcemaps   = require('gulp-sourcemaps'); //CSS部分文件的源地圖支持


/**
 * Browser Sync瀏覽器同步
 *
 * 異步瀏覽器跨多個設備同步資產!! 觀看js，圖像和php文件的更改 
*/
gulp.task('browser-sync', function() {
	var files = [
					'**/*.php',
					'**/*.{png,jpg,gif}'
				];
	browserSync.init(files, {

		// Read here http://www.browsersync.io/docs/options/
		proxy: url,

		// port: 8080,

		// Tunnel the Browsersync server through a random Public URL
		// tunnel: true,

		// Attempt to use the URL "http://my-private-site.localtunnel.me"
		// tunnel: "ppress",

		// Inject CSS changes
		injectChanges: true

	});
});



/**
 * 第四步：Gulp Style Task
 *
 * 查看src / sass並將文件編譯為Expanded格式，Autoprefixing並將文件發送到build文件夾
 *
 * Sass輸出樣式：https：//web-design-weekly.com/2014/06/15/different-sass-output-styles/
*/
gulp.task('styles', function () {
	 	gulp.src('./assets/css/*.scss')
				.pipe(plumber())
				.pipe(sourcemaps.init())
				.pipe(sass({
					errLogToConsole: true,

					//outputStyle: 'compressed',
					outputStyle: 'compact',
					// outputStyle: 'nested',
					// outputStyle: 'expanded',
					precision: 10
				}))
				.pipe(sourcemaps.write({includeContent: false}))
				.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(autoprefixer('last 2 version', '> 1%', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
				.pipe(sourcemaps.write('.'))
				.pipe(plumber.stop())
				.pipe(gulp.dest('./'))
				.pipe(filter('**/*.css')) // 將流過濾到只有css文件
				.pipe(cmq()) // Combines Media Queries
				.pipe(reload({stream:true})) // 在創建樣式文件時注入樣式
				.pipe(rename({ suffix: '.min' }))
				.pipe(minifycss({
					maxLineLen: 80
				}))
				.pipe(gulp.dest('./'))
				.pipe(reload({stream:true})) // Inject Styles when min style file is created
				.pipe(notify({ message: 'Styles task complete', onLast: true }))
});


/**
 * 步驟＃5：腳本縮小和連接 Scripts: Vendors
 *
 * 查看src / js並連接這些文件，將它們發送到assets / js，然後我們最小化連接文件。
*/
gulp.task('vendorsJs', function() {
	return 	gulp.src(['./assets/js/vendor/*.js', bower+'**/*.js'])
				.pipe(concat('vendors.js'))
				.pipe(gulp.dest('./assets/js'))
				.pipe(rename( {
					basename: "vendors",
					suffix: '.min'
				}))
				.pipe(uglify())
				.pipe(gulp.dest('./assets/js/'))
				.pipe(notify({ message: 'Vendor scripts task complete', onLast: true }));
});


/**
 * 腳本：自定義 Scripts: Custom
 *
 * 查看src / js並連接這些文件，將它們發送到assets / js，然後我們最小化連接文件。
*/

gulp.task('scriptsJs', function() {
	return 	gulp.src('./assets/js/custom/*.js')
				.pipe(concat('custom.js'))
				.pipe(gulp.dest('./assets/js'))
				.pipe(rename( {
					basename: "custom",
					suffix: '.min'
				}))
				.pipe(uglify())
				.pipe(gulp.dest('./assets/js/'))
				.pipe(notify({ message: 'Custom scripts task complete', onLast: true }));
});


/**
 * 步驟＃6：圖像優化任務 Images
 *
 * 查看src / images，優化圖像並將它們發送到適當的位置
*/
gulp.task('images', function() {

// 添加較新的pipe以僅傳遞較新的圖像
	return 	gulp.src(['./assets/img/raw/**/*.{png,jpg,gif}'])
				.pipe(newer('./assets/img/'))
				.pipe(rimraf({ force: true }))
				.pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
				.pipe(gulp.dest('./assets/img/'))
				.pipe( notify( { message: 'Images task complete', onLast: true } ) );
});


/**
 * 步驟＃7：構建一個乾淨的可安裝主題Zip文件 清理gulp緩存
 */
 gulp.task('clear', function () {
   cache.clearAll();
 });


 /**
  * Clean tasks for zip
  *
  * 有點過分熱心，但我們正在清理build文件夾，codekit-cache目錄和煩人的DS_Store文件。
  * 清除zip中未優化的圖像文件，因為這些文件已被移動和優化
 */

 gulp.task('cleanup', function() {
 	return 	gulp.src(['./assets/bower_components', '**/.sass-cache','**/.DS_Store'], { read: false }) // much faster
		 		.pipe(ignore('node_modules/**')) //Example of a directory to ignore
		 		.pipe(rimraf({ force: true }))
		 		// .pipe(notify({ message: 'Clean task complete', onLast: true }));
 });
 gulp.task('cleanupFinal', function() {
 	return 	gulp.src(['./assets/bower_components','**/.sass-cache','**/.DS_Store'], { read: false }) // much faster
		 		.pipe(ignore('node_modules/**')) //Example of a directory to ignore
		 		.pipe(rimraf({ force: true }))
		 		// .pipe(notify({ message: 'Clean task complete', onLast: true }));
 });

 /**
  * 構建任務，為生產就緒站點移動基本主題文件
  *
  * buildFiles將buildInclude中的所有文件複製到build文件夾 - 檢查頂部的變量值
  * buildImages複製資產中img文件夾中的所有圖像，同時忽略原始文件夾中的圖像（如果有）
  */

  gulp.task('buildFiles', function() {
  	return 	gulp.src(buildInclude)
 		 		.pipe(gulp.dest(build))
 		 		.pipe(notify({ message: 'Copy from buildFiles complete', onLast: true }));
  });


/**
* Images
*
* Look at src/images, optimize the images and send them to the appropriate place
*/
gulp.task('buildImages', function() {
	return 	gulp.src(['assets/img/**/*', '!assets/images/raw/**'])
		 		.pipe(gulp.dest(build+'assets/img/'))
		 		.pipe(plugins.notify({ message: 'Images copied to buildTheme folder', onLast: true }));
});

 /**
  * 壓縮構建目錄以進行分發
  *
  * 獲取已清理的build文件夾，其中包含優化文件並將其壓縮以作為可安裝主題發送
 */
 gulp.task('buildZip', function () {
 	// return 	gulp.src([build+'/**/', './.jshintrc','./.bowerrc','./.gitignore' ])
 	return 	gulp.src(build+'/**/')
		 		.pipe(zip(project+'.zip'))
		 		.pipe(gulp.dest('./'))
		 		.pipe(notify({ message: 'Zip task complete', onLast: true }));
 });


 // ==== TASKS ==== //
 /**
  * Gulp默認任務
  *
  * 編譯樣式，啟動瀏覽器同步，監視js和php文件。注意瀏覽器同步任務監視php文件
  *
 */

 // 包可分發主題
 gulp.task('build', function(cb) {
 	runSequence('styles', 'cleanup', 'vendorsJs', 'scriptsJs',  'buildFiles', 'buildImages', 'buildZip','cleanupFinal', cb);
 });


 // 觀察任務
 gulp.task('default', ['styles', 'vendorsJs', 'scriptsJs', 'images', 'browser-sync'], function () {
 	gulp.watch('./assets/img/raw/**/*', ['images']);
 	gulp.watch('./assets/css/**/*.scss', ['styles']);
 	gulp.watch('./assets/js/**/*.js', ['scriptsJs', browserSync.reload]);

 });
