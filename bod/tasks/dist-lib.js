
/*
 * @task: dist
 * Copies all except scripts from "dist" folder into App/Project folder
 */

module.exports = function (gulp, plugins,project) {
    return function () {
        gulp.src(['./dist/libs/*/dist/*/*.*','./dist/libs/font-awesome/*/*.*','./dist/libs/owl.carousel/dist/**/*.*'], {base: './dist/'})
            .pipe(gulp.dest(project.app))
            .pipe(plugins.notify({
                message: "Transfer Successful"
            }));
    };
};
