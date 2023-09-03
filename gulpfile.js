const {src, dest, watch, parallel, series} = require('gulp'); //присваиваем все возможности gulp встроенные в Gulp(поиск файла, место куда отправляется файл, отслеживание изменений, параллельная работа, последовательная работа))

const fonter = require('gulp-fonter'); // из ttf в woff формат шрифта
const ttf2woff2 = require('gulp-ttf2woff2'); // из ttf в woff формат шрифта
const clean = require('gulp-clean'); //удалит все файлы из папки dist перед компиляцией
const browserSync = require('browser-sync').create(); // лайв сервер

//функция конвертации из любого формата шрифта в woff и woff2
function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({ //берет файлы и конвертирует их в woff и ttf
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf')) // берет файлы которые сконвертировались выше и берет только форматы ttf
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
        .pipe(browserSync.stream());
}

//функция сборки всех скомпилированных файлов в нужную папку с готовым проектом
function building() { 
    return src(['app/fonts/*.*',
    ], {base : 'app'}) // создает туже самую структура папок как в app
        .pipe(dest('dist')); // выгрузка в папку с готовым проектом /dist
}

function cleanDist() { // функция удаления папки dist перед сборкой
    return src('dist')
    .pipe(clean())
}

//функция отслеживания изменений файлов
function watching() {
    browserSync.init({ // функция запуска лайв сервера
        server: {
            baseDir: "app" // папка отслеживания
        }
    });
    watch(['app/fonts/src'], fonts);// если происходит изменение в папке fonts то запустит функцию конвертации 
}

exports.fonts = fonts; //функция преобразования шрифтов
exports.cleanDist = cleanDist; //функция удаления файлов и папок в dist
exports.building = building; //функция  переноса файлов в конечную папку
exports.watching = watching; // экспорт функции отслеживания изменения файлов

//------выполняет функции описанные выше, последовательно (series) или параллельно (parallel)(-------------

//последовательная работа сборщика
exports.building = series(cleanDist, building); //сначала преобразует файлы шрифтов, далее очистит папку с проектом и после перенесёт всё файлы в конечную папку
exports.default = parallel(watching, fonts, building);
