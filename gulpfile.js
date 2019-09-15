var gulp = require('gulp'),

// jade
    jade = require('gulp-jade'),
    changed = require('gulp-changed'),
    cached = require('gulp-cached'),
    jadeInheritance = require('gulp-jade-inheritance'),
    filter = require('gulp-filter'),

// stylus
    stylus = require('gulp-stylus'),
    prefix = require('gulp-autoprefixer'),
    uncss = require('gulp-uncss-sp'),
    cssoptimize = require('gulp-csso'),
    shrthnd = require('gulp-shorthand'),

// sprite
    spritesmith = require('gulp.spritesmith'),
    svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin'),
    path = require('path'),
    imagemin = require('gulp-image'),
    webp = require('gulp-webp'),

// other
    gutil = require('gulp-util'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    webserver = require('gulp-webserver'),
    replace = require('gulp-replace'),
    gulpDeployFtp = require('gulp-deploy-ftp'),
    fs = require('fs');

// Set defaults
var isDev = true;
var isProd = false;

// Projects_data
var projects = {
    'test': {
        'folder': 'test',
        'scripts': [
            'vendor/vendor_scripts/jquery/jquery-3.3.1.min.js',
            'vendor/vendor_scripts/nouislider/nouislider.js',
            'vendor/vendor_scripts/malihuscrollbar/malihuscrollbar.js',
            'vendor/vendor_scripts/formstyler/formstyler.js'
        ]
    }
};

// Set current project
var active_project = projects['test'];

if (gutil.env.project) {
    active_project = projects[gutil.env.project];
}

// If "production" is passed from the command line then update the defaults
if (gutil.env.type === 'production') {
    isDev = false;
    isProd = true;
}

// Webserver

gulp.task('setWatch', function () {
    global.isWatching = true;
});

gulp.task('webserver', function () {
    gulp.src('./build/' + active_project['folder'] + '/')
        .pipe(webserver({
            livereload: false,
            directoryListing: false,
            open: false
        }));
});

// HTML

var current_time = Math.random().toFixed(5) * 100000;

gulp.task('version', function () {
    gulp.src(['build/' + active_project['folder'] + '/**/*.html'])
        .pipe(replace('.css"', '.css?v=' + current_time + '"'))
        .pipe(replace('.js"', 'p.js?v=' + current_time + '"'))
        .pipe(gulp.dest('build/' + active_project['folder'] + '/'));
});

gulp.task('jade', function () {
    gulp.src(['projects_source/' + active_project['folder'] + '/source/jade/**/**/*.jade'])
        .pipe(changed('html', {extension: '.html'}))
        .pipe(gulpif(global.isWatching, cached('jade')))
        .pipe(jadeInheritance({basedir: 'projects_source/' + active_project['folder'] + '/source/jade'}))
        .pipe(filter(function (file) {
            return !/partials/.test(file.path);
        }))
        .pipe(jade({
            pretty: true
        })
            .on('error', console.log))
        .pipe(gulp.dest('build/' + active_project['folder'] + '/'));
});

// CSS

gulp.task('stylus', function () {
    gulp.src(['projects_source/' + active_project['folder'] + '/source/stylus/*.styl'])
        .pipe(stylus())
        .pipe(prefix())
        /*.pipe(shrthnd())*/
        .pipe(cssoptimize({
            restructure: true,
            sourceMap: true,
            debug: false,
            clone: true
        }))
        .pipe(gulp.dest('build/' + active_project['folder'] + '/css'));
});

// IMAGES

gulp.task('spritesmith', function () {
    return gulp
        .src('projects_source/' + active_project['folder'] + '/source/assets/icons/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '../../stylus/ui/sprite/sprite.styl',
            padding: 2,
            imgPath: '../img/sprite.png',
            algorithm: 'binary-tree',
            cssFormat: 'stylus'
        }))
        .pipe(gulp.dest('projects_source/' + active_project['folder'] + '/source/assets/img_opt'));
});

// gulp.task('webp', function () {
//     return gulp
//         .src('projects_source/' + active_project['folder'] + '/source/assets/img_opt/**')
//         .pipe(imagemin())
//         .pipe(gulp.dest('projects_source/' + active_project['folder'] + '/source/assets/img_opt'));
// });

// gulp.task('webp', () =>
//     gulp.src('projects_source/' + active_project['folder'] + '/source/assets/img_opt/**')
//         .pipe(webp())
//         .pipe(gulp.dest('projects_source/' + active_project['folder'] + '/source/assets/img_opt_webp'))
// );

gulp.task('imagemin', function () {
    return gulp
        .src('projects_source/' + active_project['folder'] + '/source/assets/img_opt/**')
        .pipe(imagemin())
        .pipe(gulp.dest('build/' + active_project['folder'] + '/img'));
});

gulp.task('spritesvg', function () {
    return gulp
        .src('projects_source/' + active_project['folder'] + '/source/assets/svg/**')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('build/' + active_project['folder'] + '/img/svg'));
});

// JS

gulp.task('js', function () {
    gulp.src(['projects_source/' + active_project['folder'] + '/source/app/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulpif(isProd, uglify({
            mangle: false,
            compress: {
                drop_console: true
            }
        })))
        .pipe(gulp.dest('build/' + active_project['folder'] + '/js/'));
});

gulp.task('vendor', function () {
    gulp.src(
        active_project['scripts']
    )
    .pipe(concat('common-app.js'))
    .pipe(gulpif(isProd, uglify({
        mangle: false,
        compress: {
            drop_console: true
        }
    })))
    .pipe(gulp.dest('build/' + active_project['folder'] + '/js'));
});

// TASKS

gulp.task('watch', function () {
    gulp.watch('projects_source/' + active_project['folder'] + '/source/app/**/**/**/*.+(js)', ['js']);
    gulp.watch('projects_source/' + active_project['folder'] + '/source/stylus/**/*.styl', ['stylus']);
    gulp.watch('projects_source/' + active_project['folder'] + '/source/assets/icons/*.png', ['spritesmith']);
    gulp.watch('projects_source/' + active_project['folder'] + '/source/assets/img_opt/**', ['imagemin']);
    //gulp.watch('projects_source/' + active_project['folder'] + '/source/assets/img_opt/**', ['webp']);
    gulp.watch('projects_source/' + active_project['folder'] + '/source/assets/svg/*.svg', ['spritesvg']);
    gulp.watch('projects_source/' + active_project['folder'] + '/source/jade/**/**/*.jade', ['setWatch', 'jade']);
    //gulp.watch('build/' + active_project['folder'] + '/**/*.html', ['version']);
});

gulp.task('build', ['jade', 'stylus', 'spritesmith', 'spritesvg', 'js', 'vendor']);
gulp.task('default', ['build', 'watch', 'webserver']);