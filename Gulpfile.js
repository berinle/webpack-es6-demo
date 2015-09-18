var gulp        = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require("./webpack.config.js");

//https://github.com/kriasoft/react-starter-kit/blob/88eabc907aa0f3f8be6a00663f265cbc94262276/gulpfile.js#L114-L141
var src = {};
var DEST = ".";
var watch = false;
var reload = browserSync.reload;

gulp.task('default', ['serve']);

// HTML pages
gulp.task('pages', function () {
    src.pages = '*.html';
    return gulp.src(src.pages)
        // .pipe($.if(RELEASE, $.htmlmin({
        //     removeComments: true,
        //     collapseWhitespace: true,
        //     minifyJS: true
        // })))
        .pipe(gulp.dest(DEST))
        .pipe($.if(watch, reload({stream: true})));
});

gulp.task('build', [], function (cb) {
    //runSequence(['vendor', 'assets', 'images', 'pages', 'styles', 'bundle'], cb);
    runSequence(['pages', 'bundle'], cb);
});

gulp.task('serve', function (cb) {

    watch = true;

    runSequence('build', function () {
        browserSync({
            notify: false,
            // Run as an https by uncommenting 'https: true'
            // Note: this uses an unsigned certificate which on first access
            //       will present a certificate warning in the browser.
            // https: true,
            server: {
                baseDir: ['./']
            }
        });

        // gulp.watch(src.assets, ['assets']);
        // gulp.watch(src.images, ['images']);
        gulp.watch(src.pages, ['pages']);
        // gulp.watch(src.styles, ['styles']);

        cb();
    });
});


gulp.task('bundle', function (cb) {
    var started = false;
    var bundler = webpack(webpackConfig);

    function bundle (err, stats) {
        if (err) {
            throw new $.util.PluginError('webpack', err);
        }

        $.util.log('[webpack]', stats.toString({colors: true}));

        if (watch) {
            reload(webpackConfig.output.filename);
        }

        if (!started) {
            started = true;
            return cb();
        }
    }

    if (watch) {
        bundler.watch(200, bundle);
    } else {
        bundler.run(bundle);
    }
});

gulp.task("webpack", function(callback) {
    // run webpack
    webpack({
        // configuration
    }, function(err, stats) {
        if(err) throw new $.util.PluginError("webpack", err);
        $.util.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function(callback) {
    // Start a webpack-dev-server
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
	  myConfig.debug = true;
    var compiler = webpack(myConfig);

    new WebpackDevServer(compiler, {
        // server and middleware options
        stats: {colors: true}
    }).listen(4000, "localhost", function(err) {
        if(err) throw new $.util.PluginError("webpack-dev-server", err);
        // Server listening
        $.util.log("[webpack-dev-server]", "http://localhost:4000/webpack-dev-server/index.html");

        // keep the server alive or continue?
        // callback();
    });
});
