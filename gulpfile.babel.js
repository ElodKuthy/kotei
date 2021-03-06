var gulp = require('gulp')
var sass = require('gulp-sass')
var nodemon = require('gulp-nodemon')
var concat = require('gulp-concat')
var babel = require('gulp-babel')
var templateCache = require('gulp-angular-templatecache')
var uglify = require('gulp-uglify')
var cssnano = require('gulp-cssnano')
var git = require('gulp-git')
var bump = require('gulp-bump')
var filter = require('gulp-filter')
var tag_version = require('gulp-tag-version')

const incrementVersion = (importance) => {
    return gulp.src(['./package.json', './bower.json'])
        .pipe(bump({type: importance}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('Change the version number'))
        .pipe(filter('package.json'))
        .pipe(tag_version())
}

gulp.task('fonts', () => {
    return gulp.src([
            './bower_components/fontawesome/fonts/*',
            './bower_components/bootstrap-sass/assets/fonts/**/*'
            ])
        .pipe(gulp.dest('./public/fonts'))
})

gulp.task('html', () => {
    return gulp.src('./client/**/*.html')
        .pipe(templateCache())
        .pipe(gulp.dest('public'))
})

gulp.task('html.superadmin', () => {
    return gulp.src('./superadmin/**/*.html')
        .pipe(templateCache('templates.superadmin.js'))
        .pipe(gulp.dest('public'))
})

gulp.task('sass', () => {
    return gulp.src('./client/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('kotei.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('./public/'))
})

gulp.task('sass.superadmin', () => {
    return gulp.src('./superadmin/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('kotei.superadmin.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('./public/'))
})


gulp.task('vendor', () => {
    return gulp.src([
            './bower_components/jquery/dist/jquery.js',
            './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js',
            './bower_components/moment/moment.js',
            './bower_components/ramda/dist/ramda.js',
            './bower_components/chartist/dist/chartist.js',
            './bower_components/angular/angular.js',
            './bower_components/angular-i18n/angular-locale_hu-hu.js',
            './bower_components/angular-route/angular-route.js',
            './bower_components/angular-messages/angular-messages.js',
            './bower_components/angular-filter/dist/angular-filter.js',
            './bower_components/angular-ui-router/release/angular-ui-router.js',
            './bower_components/angular-jwt/dist/angular-jwt.js',
            './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            './bower_components/bootstrap-ui-datetime-picker/dist/datetime-picker.js',
            './bower_components/angular-momentjs/angular-momentjs.js',
            './bower_components/ngSmoothScroll/lib/angular-smooth-scroll.js',
            './bower_components/angular-sanitize/angular-sanitize.js',
            './bower_components/ng-csv/build/ng-csv.js'
        ])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
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

gulp.task('js.superadmin', () => {
    return gulp.src('./superadmin/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('kotei.superadmin.js'))
        .pipe(gulp.dest('./public/'));
});

gulp.task('watch', ['html', 'sass', 'js'], () => {
    gulp.watch('./client/**/*.html', ['html'])
    gulp.watch('./client/**/*.scss', ['sass'])
    gulp.watch('./client/**/*.js', ['js'])
})

gulp.task('watch.superadmin', ['html.superadmin', 'sass.superadmin', 'js.superadmin'], () => {
    gulp.watch('./superadmin/**/*.html', ['html.superadmin'])
    gulp.watch('./superadmin/**/*.scss', ['sass.superadmin'])
    gulp.watch('./superadmin/**/*.js', ['js.superadmin'])
})

gulp.task('build', ['vendor', 'fonts', 'html', 'sass', 'js'])

gulp.task('build.superadmin', ['vendor', 'fonts', 'html.superadmin', 'sass.superadmin', 'js.superadmin'])

gulp.task('nodemon', ['fonts', 'watch'], () => {
    nodemon({
        script: 'app.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' }
    })
})

gulp.task('nodemon.superadmin', ['fonts', 'watch.superadmin'], () => {
    nodemon({
        script: 'app.superadmin.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' }
    })
})

gulp.task('patch', () => incrementVersion('patch'))
gulp.task('minor', () => incrementVersion('minor'))
gulp.task('major', () => incrementVersion('major'))

gulp.task('default', ['build'])
