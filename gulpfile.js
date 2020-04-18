const { series, src, dest } = require('gulp')
const concat = require('gulp-concat')
const cssmin = require('gulp-cssmin')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default

// css
function concatCssStyles() {
  return src([
		'./src/presets.css',
		'./src/theme.css',
		'./src/styles.css',
		'./src/snackbar.css',
		'./src/media.css'])
		.pipe(concat('concat.styles.css'))
    .pipe(dest('./src/'))
}

function minifyCssStyles() {
  return src('./src/concat.styles.css')
    .pipe(cssmin())
    .pipe(rename('styles.min.css'))
    .pipe(dest('./public/'))
}

// JavaScript
function minifyJavaScript() {
  return src("./src/main.js")
    .pipe(rename("main.min.js"))
    .pipe(uglify())
    .pipe(dest("./public/"))
}

exports.css = series(concatCssStyles, minifyCssStyles)
exports.js = minifyJavaScript
exports.default = series(concatCssStyles, minifyCssStyles, minifyJavaScript)
