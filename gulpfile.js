import * as nodePath from 'path'
import fs            from 'fs'

import gulp          from 'gulp'
import rimraf        from 'rimraf'
import browserSync   from 'browser-sync'
import panini        from 'panini'
import inky          from 'inky'
import dartSass      from 'sass'
import gulpSass      from 'gulp-sass'
import imagemin      from 'gulp-imagemin'
import replace       from 'gulp-replace'
import inlineCss     from 'gulp-inline-css'
import htmlMin       from 'gulp-htmlmin'

const sass = gulpSass(dartSass)


/** Folders */
const rootFolder = nodePath.basename(nodePath.resolve())
const srcFolder  = `./src`
const destFolder = `./dist`


/** Paths */
export const path = {
    watch: {
        emails: `${srcFolder}/{pages,layouts,partials}/**/*.html`,
        styles: `${srcFolder}/assets/scss/**/*.scss`,
        images: `${srcFolder}/assets/img/**/*`,
    },
    rootFolder: rootFolder,
    srcFolder: srcFolder,
    destFolder: destFolder,
    cleanFolder: destFolder,
}


/** Reset */
const reset = (done) => {
    rimraf(`${destFolder}`, done)
}


/** Browser Sync */
const server = (done) => {
    browserSync.init({
        server: {
            baseDir: [`${destFolder}`]
        },
        online: true,
        notify: false,
    }, done)
}


/** Emails */
const emails = () => {
    panini.refresh()
    return gulp.src(['src/pages/**/*.html', '!src/pages/archive/**/*.html'], {})
        .pipe(panini({
            root:     'src/pages/',
            layouts:  'src/layouts/',
            partials: 'src/partials/',
            helpers:  'src/pages/helpers/',
            data:     'src/pages/data/'
        }))
        .pipe(inky())
        .pipe(gulp.dest(`${destFolder}`), {})
        .pipe(browserSync.stream())
}


/** Styles */
const styles = () => {
    return gulp.src('src/assets/scss/app.scss')
        .pipe(sass.sync(
            {includePaths: ['node_modules/foundation-emails/scss']}
        ))
        .pipe(gulp.dest(`${destFolder}/css`))
        .pipe(browserSync.stream())
}


/** Images */
const images = () => {
    return gulp.src(['src/assets/img/**/*', '!src/assets/img/archive/**/*'])
        .pipe(imagemin())
        .pipe(gulp.dest(`${destFolder}/assets/img`))
        .pipe(browserSync.stream())
}


/** Inline CSS */
const inline = () => {
    return gulp.src('dist/**/*.html')
        .pipe(inlineCss({
            // Встраивать стили в файлы <style></style> [true]
            applyStyleTags: false,
            // Удалять исходные <style></style> теги после встраивания из них css [true]
            removeStyleTags: true,
            // Следует ли разрешать <link rel="stylesheet"> теги и встраивать полученные стили [true]
            // applyLinkTags: true,
            // Удалять исходные <link rel="stylesheet"> после встраивания из них css [true]
            removeLinkTags: false,
            // Сохраняет все медиа-запросы (и содержащиеся в них стили) в <style></style> тегах в качестве уточнения, когда removeStyleTags установлено значение true. Другие стили удалены. [false]
            preserveMediaQueries: true,
            // removeHtmlSelectors: false,
            // applyWidthAttributes: true,
            // applyTableAttributes: true,
            // lowerCaseTags: true,
            // lowerCaseAttributeNames: true,
        }))
        // .pipe(inLiner('./dist/css/app.css'))
        /*.pipe(htmlMin({
            collapseWhitespace: true,
            minifyCSS: true
        }))*/
        .pipe(gulp.dest(`${destFolder}`))
        .pipe(browserSync.stream())
}


/** Watcher */
const watcher = () => {
    gulp.watch(path.watch.emails, emails).on('all', gulp.series(emails, inline, browserSync.reload))
    gulp.watch(path.watch.styles, styles).on('all', gulp.series(reset, styles, emails, images, inline, browserSync.reload))
    gulp.watch(path.watch.images, images).on('all', gulp.series(images, emails, inline, browserSync.reload));
}

const emailTasks = gulp.series(emails, styles, images, inline)
const dev = gulp.series(reset, emailTasks, gulp.parallel(watcher, server))

/** Default task */
gulp.task('default', dev)
