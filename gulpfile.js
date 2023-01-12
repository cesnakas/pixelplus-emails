import * as nodePath from 'path'
import fs            from 'fs'

import gulp          from 'gulp'
import browserSync   from 'browser-sync'
import panini        from 'panini'
import inky          from 'inky'
import dartSass      from 'sass'
import gulpSass      from 'gulp-sass'
import rimraf        from 'rimraf'

const sass = gulpSass(dartSass)


/** Folders */
const rootFolder = nodePath.basename(nodePath.resolve())
const srcFolder  = `./src`
const destFolder = `./dist`


/** Paths */
const path = {
    watch: {
        emails: `${srcFolder}/{pages,layouts,partials}/**/*.html`,
        styles: `${srcFolder}/assets/scss/**/*.scss`,
        images: `${srcFolder}/assets/img/**/*`,
    },
    rootFolder: rootFolder,
    srcFolder: srcFolder,
    destFolder: destFolder,
    clean: destFolder,
}


/** Reset */
const reset = (done) => {
    rimraf(`${destFolder}`, done)
}

/** Browser sync */
const server = (done) => {
    browserSync.init({
        server: {
            baseDir: [`${destFolder}`]
        },
        online: true,
        notify: false,
    }, done)
}

/** Default task */
gulp.task('default', email)
