
/*
 * @task: dist
 * Copies everything from "dist" folder into App/Project folder
 */

module.exports = function (gulp, plugins,project) {
    return function () {
        gulp.src(['./dist/**/*.*'], { base: './dist/' })
        .pipe(gulp.dest(project.app))
        .pipe(plugins.notify({
            message: "Transfer Successful"
        }));
    };
};