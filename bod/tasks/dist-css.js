
/*
 * @task: dist
 * Copies all except scripts from "dist" folder into App/Project folder
 */

module.exports = function (gulp, plugins,project) {
    return function () {
        gulp.src(['./dist/**/*.*','!./dist/scripts/*.js','!./dist/libs/**/*.*'], {base: './dist/'})
            .pipe(gulp.dest(project.app))
            .pipe(plugins.notify({
                message: "Transfer Successful"
            }));
    };
};
