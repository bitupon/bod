/*
 * @task: sass
 * Compile all SCSS files to CSS, put in DIST/CSS folder.
 */



module.exports = function (gulp, plugins,paths) {
    var scssArr = [
        paths.scss + 'main.scss'
    ];
    
    return function () {
    
        gulp.src(scssArr)
            .pipe(plugins.sass())
            .on('error', plugins.notify.onError(function (error) {
                return 'An error occurred while compiling sass.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest(paths.cssMin))
            .pipe(plugins.notify({
                message: "SCSS Compilation Successful"
            }));
    };
};