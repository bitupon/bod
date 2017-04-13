/*
 * @task: scripts
 * Concatenates all javascripts file provided into scriptArr and puts them into DIST file.
 */

 module.exports = function (gulp, plugins,paths) {
    var scriptsArr = [
        paths.scripts + 'scripts1.js',    
        paths.scripts + 'scripts2.js',     
    ];

   
    return function () {
        gulp.src(scriptsArr)
            .pipe(plugins.concat('scripts-all.js'))
            .pipe(plugins.uglify())
            .on('error', plugins.notify.onError(function (error) {
                return 'An error occurred while concatenating scripts.\nLook in the console for details.\n' + error;
            }))
            .pipe(gulp.dest(paths.scriptsMin))
            .pipe(plugins.notify({
                message: "Scripts Concatenation Successful"
            }));
     
    };
};
