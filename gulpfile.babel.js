import gulp from 'gulp'
import sass from 'gulp-sass'
import nodemon from 'gulp-nodemon'
import concat from 'gulp-concat'
import babel from 'gulp-babel'
import templateCache from 'gulp-angular-templatecache'

gulp.task('fonts', () => {
    return gulp.src('./bower_components/fontawesome/fonts/*.*')
        .pipe(gulp.dest('./public/fonts'))
})

gulp.task('html', () => {
    return gulp.src('./client/**/*.html')
        .pipe(templateCache())
        .pipe(gulp.dest('public'))
})

gulp.task('sass', () => {
    return gulp.src('./client/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('kotei.css'))
        .pipe(gulp.dest('./public/'))
})

gulp.task('vendor', () => {
    return gulp.src([
            //'./bower_components/jquery/dist/jquery.js',
            //'./bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
            './bower_components/angular/angular.js',
            './bower_components/angular-route/angular-route.js',
            './bower_components/angular-messages/angular-messages.js',
            './bower_components/angular-ui-router/release/angular-ui-router.js',
            './bower_components/angular-jwt/dist/angular-jwt.js',
            './bower_components/angular-bootstrap/ui-bootstrap-tpls.js'
        ])
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('./public/'))
})


gulp.task('js', () => {
    return gulp.src('./client/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('kotei.js'))
        .pipe(gulp.dest('./public/'));
});

gulp.task('watch', ['html', 'sass', 'js'], () => {
    gulp.watch('./client/**/*.html', ['html'])
    gulp.watch('./client/**/*.scss', ['sass'])
    gulp.watch('./client/**/*.js', ['js'])
})

gulp.task('nodemon', ['fonts', 'watch'], () => {
    nodemon({
        script: 'app.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' }
    })
})

gulp.task('default', ['nodemon'])