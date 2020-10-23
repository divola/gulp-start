const gulp         = require('gulp'),
      sass         = require('gulp-sass'),
      rename       = require('gulp-rename'),
      browserSync  = require('browser-sync'),
      reload       = browserSync.reload,
      uglify       = require('gulp-uglify-es').default,
      concat       = require('gulp-concat'),
      del          = require('del'),
      autoprefixer = require('gulp-autoprefixer'),
      cleanCSS     = require('gulp-clean-css'),
      gcmq         = require('gulp-group-css-media-queries'),
      kit          = require('gulp-kit-2'),
      prompt       = require('gulp-prompt');

gulp.task('kit', function() {
  return gulp.src('app/kit/index.kit')
        .pipe(kit())
        .pipe(gulp.dest('app'));
});

// Compile SCSS into CSS, set prefixes, rename into .min,
// sass can have outputStyle: 'compressed' for minify on the fly,
// but minification will be performed when we will making build.
gulp.task('scss', function() {
  return gulp.src('app/scss/*.scss')
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer({cascade: true, grid: "autoplace"}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/css'))
        .pipe(reload({stream: true}));
});

gulp.task('css', function() {
  return gulp.src([
    'node_modules/slick-carousel/slick/slick.css',
    // 'app/_source/video.js/video-js-cdn.min.css'
  ])
        .pipe(concat('_libs.scss'))
        .pipe(gulp.dest('app/scss'))
        .pipe(reload({stream: true}));
});

gulp.task('js', function() {
  return gulp.src([
    'app/_source/dynamic_adapt/dynamic.js',
    'node_modules/unfocus/dist/unfocus.js',
    'node_modules/slick-carousel/slick/slick.js',
    // 'app/_source/video.js/video.core.novtt.min.js'
  ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify({output:{comments:false}}))
        .pipe(gulp.dest('app/js'))
        .pipe(reload({stream: true}));
});

gulp.task('script', function() {
  return gulp.src('app/js/*.js')
        .pipe(reload({stream: true}));
});

// run server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './app'
    }
  });
});

// watch task
gulp.task('watch', function() {
  gulp.watch('app/kit/*.kit', gulp.parallel('kit'));
  gulp.watch('app/scss/*.scss', gulp.parallel('scss'));
  gulp.watch('app/js/*.js', gulp.parallel('script'));
  gulp.watch('app/*.html').on('change', reload);
});

// the build task
gulp.task('export', function () {
  return gulp.src('*')
    .pipe(prompt.prompt({
          type: 'input',
          name: 'type',
          message: 'Unminify[1] / Minify[2]?'
    }, function (res) {
      if (res.type === '1') {
        gulp.src('app/css/**/*.css')
          .pipe(gcmq())
          .pipe(gulp.dest('dist/css'));

        gulp.src('app/js/**/*.js')
          .pipe(gulp.dest('dist/js'));
      } else {
        gulp.src('app/css/**/*.css')
          .pipe(cleanCSS({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
          }))
          .pipe(gulp.dest('dist/css'));

        gulp.src('app/js/**/*.js')
          .pipe(uglify({output:{comments:false}}))
          .pipe(gulp.dest('dist/js'));
      }
      // Copy remaining files
      gulp.src('app/fonts/**/*.{woff,woff2,svg,eot}')
        .pipe(gulp.dest('dist/fonts'));

      gulp.src('app/images/**/*.{jpg,png,svg,gif,webp}')
        .pipe(gulp.dest('dist/images'));

      gulp.src('app/**/*.html')
        .pipe(gulp.dest('dist'));

      gulp.src('app/favicon.ico')
        .pipe(gulp.dest('dist'));
    }));
});

gulp.task('clean', async function() {
  del.sync('dist')
});

// main task to run main functions
gulp.task('default', gulp.parallel('kit', 'css', 'scss', 'js', 'browser-sync', 'watch'));
gulp.task('build', gulp.series('clean', 'export'));