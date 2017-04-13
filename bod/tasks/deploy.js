
/*
 * @task: deploy
 * Copies "App" folder under "deploy" folder
 */

module.exports = function (gulp, plugins,project) {
    return function () {
        gulp.src([
                './app/**/**/**/**/**/*.*', '!./app/settings.xml'             
                ], {base: './app/'})
            .pipe(gulp.dest(project.deploy + 'bod'))
            .pipe(plugins.notify({
                message: "Deployment Successful"
            }));

        gulp.src([
                './app/settings.xml'             
                ], {base: './app/'})
            .pipe(gulp.dest(project.deploy))
            .pipe(plugins.notify({
                message: "Deployment Successful"
            }));
    };
};
