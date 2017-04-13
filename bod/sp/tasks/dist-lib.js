
/*
 * @task: dist
 * Copies all except scripts from "dist" folder into App/Project folder
 */

module.exports = function (gulp, plugins,project) {
    return function () {
        gulp.src([
                //'./dist/libs/*/dist/*/*.*',
                './dist/libs/jquery/dist/jquery.min.js',
                 './dist/libs/bootstrap/dist/*/*.*',
                 './dist/libs/hashids/hashids.min.js',
                './dist/libs/jquery.SPServices/jquery.SPServices.min.js',
                './dist/libs/font-awesome/*/*.*',
                './dist/libs/owl.carousel/dist/**/*.*',
                './dist/libs/underscore/*.*',
                './dist/libs/eonasdan-bootstrap-datetimepicker/build/**/*.*',
                './dist/libs/moment/min/moment.min.js',
                './dist/libs/jquery-validation/dist/jquery.validate.min.js',
                './dist/libs/jquery-validation/dist/additional-methods.min.js',
                
                ], {base: './dist/'})
            .pipe(gulp.dest(project.app))
            .pipe(plugins.notify({
                message: "Transfer Successful"
            }));
    };
};
