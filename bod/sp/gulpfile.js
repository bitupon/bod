var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    project = require('./project.json'),
    paths = {
        scss: './src/scss/', 
        scripts:'./src/js/',    
        cssMin: './dist/css/',
        scriptsMin:'./dist/js/',
        lib:'./dist/libs/',
        deploy: '.deploy/'
    };

/*
 * @task: Complier Tasks
 */

gulp.task('sass', require('./tasks/sass')(gulp, plugins,paths));

gulp.task('scripts', require('./tasks/scripts')(gulp, plugins,paths));

//gulp.task('lib', require('./tasks/scripts')(gulp, plugins,paths));

gulp.task('dist', require('./tasks/dist')(gulp, plugins,project));

gulp.task('dist-js', require('./tasks/dist-js')(gulp, plugins,project));

gulp.task('dist-css', require('./tasks/dist-css')(gulp, plugins,project));

gulp.task('dist-lib', require('./tasks/dist-lib')(gulp, plugins,project));

/*
 * @task: Watcher Tasks
 */
gulp.task('serve', ['serve-css', 'serve-js', 'dist-lib', 'dist-css', 'dist-js'], function() {
    gulp.watch(['src/scss/**/*.scss'], ['sass', 'dist-css']);
    gulp.watch(['src/scripts/*.js'], ['scripts', 'dist-js']);
});

gulp.task('serve-css', ['sass', 'dist-css'], function() {
    gulp.watch(['src/scss/**/*.scss'], ['sass', 'dist-css']);
});

gulp.task('serve-js', ['scripts', 'dist-js'], function() {
    gulp.watch(['src/scripts/*.js'], ['scripts', 'dist-js']);    
});

 
gulp.task('deploy', ['serve'], require('./tasks/deploy')(gulp, plugins,project));


gulp.task('default', ['deploy']);
