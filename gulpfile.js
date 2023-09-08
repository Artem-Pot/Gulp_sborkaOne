
const {src, dest, watch, parallel, series} = require('gulp'); //присваиваем все возможности gulp встроенные в Gulp(поиск файла, место куда отправляется файл, отслеживание изменений, параллельная работа, последовательная работа))

const gulppug = require('gulp-pug'); // препроцессор pug

const scss = require('gulp-sass')(require('sass')); // конвертация с препроцессора scss и gulp-sass
const sourcemapsFiles = require('gulp-sourcemaps'); //создает карту для корректного отображения файла и строки dev tols
const concat = require('gulp-concat'); //собирает файлы в один, применяю для css и js

const fonter = require('gulp-fonter'); // конвертирует все форматы шрифтов
const ttf2woff2 = require('gulp-ttf2woff2'); // из ttf в woff формат шрифта
const clean = require('gulp-clean'); //удалит все файлы из папки dist перед компиляцией

const browserSync = require('browser-sync').create(); // лайв сервер

const imagemin = require('gulp-imagemin'); // сжимает изображения PNG, JPEG, GIF и SVG
const newer = require('gulp-newer'); // работа с кэшем

const plumber = require('gulp-plumber'); //поиск ошибок
const notify = require('gulp-notify'); // вывод ошибок в виде уведомления 
const log = require('fancy-log'); // вывод сообщений в консоль после каждого таска


// функция работы с pug
function pug() {
    return src('app/pug/*.pug', 
    {sourcemaps: true}) // sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка (если нужны ещё файлы то писать 'app/pug/index.pug', 'app/pug/index2.pug' и т.д
        .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
            title: "Pug", 
            message: "Error: <%= error.message %>"
        }))) 
        .pipe(gulppug({    //функция преобразования
            verbose: true, // опция - показывает какой файл преобразует в консоле
            pretty: true  // отключает сжатие файла
        }))
        .pipe(dest('app/')) //кидает в папку скомпилированный файл html 
        .pipe(dest('123/')) //кидает в папку со сборкой
        .pipe(browserSync.stream()) // отслеживание изменений
        .on('end', function(){ log('------Компиляция Html завершена-----------')});
}

//функция работы со стилями
function styles() {
    return src('app/scss/*.scss', 
    {sourcemaps: true}) //поиск файла стиля scss в сборке. sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка
    .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
        title: "SCSS", 
        message: "Error: <%= error.message %>"
    }))) 
    .pipe(scss()) //подключение к модулю scss + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))
    .pipe(sourcemapsFiles.write()) //создает карту для корректного отображения файла и строки dev tols
    .pipe(dest('app/css')) //показать путь куда преобразовать готовый файл css
    .pipe(browserSync.stream()) // обновляет страницу после каждого изменения -  Лайв сервер
    .on('end', function(){ log('------Компиляция CSS завершена-----------')});
}
//функция конвертации из любого формата шрифта в woff и woff2
function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({ //берет файлы и конвертирует их в woff и ttf
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf')) // берет файлы которые сконвертировались выше и берет только форматы ttf и конвертирует их в woff2
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
        .on('end', function(){ log('------Конвертация шрифтов завершена-----------')});
}

//функция работы с изображениями, сжатие
// function images() { 
//     return src('app/img/src/**/*.{jpg,jpeg,png,svg,gif,ico,webp,bmp}', 
//         {sourcemaps: true}) //взять исходные файлы только файлы с изображениями из папки и сжать их + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))

//         .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
//             title: "Images", 
//             message: "Error: <%= error.message %>"
//         }))) 
//         .pipe(newer('app/img/')) //если видит что там уже есть изображения, не будет создавать другие
//         .pipe(imagemin({ //сжимает файлы
//             progressive: true,
//             svgoPlugins: [{ removeViewBox: false}],
//             interlaced: true,
//             optimizationLevel: 3
//         })) 
//         .pipe(dest('app/img/')) // перенос изображений в папку с жатыми файлами
//         .on('end', function(){ log('------Сжатие и перенос изображений завершено-----------')});
// }

function images() { 
    return src('app/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp,bmp}', 
        {sourcemaps: true},
        {base : 'app'}
        ) //взять исходные файлы только файлы с изображениями из папки и сжать их + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))

        .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
            title: "Images", 
            message: "Error: <%= error.message %>"
        }))) 

        .pipe(newer('123/img/')) //если видит что там уже есть изображения, не будет создавать другие
        .pipe(imagemin({ //сжимает файлы
            progressive: true,
            svgoPlugins: [{ removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        }))
        
        .pipe(dest('123/img/')) // перенос изображений в папку с жатыми файлами 
        .on('end', function(){ log('------Сжатие и перенос изображений завершено-----------')});
}

// функция удаления папки dist перед сборкой
function cleanDist() { 
    return src('dist')
    .pipe(clean())
    .on('end', function(){ log('------Очистка папки Dist------------')});
}

// функция сборки всех скомпилированных файлов в нужную папку с готовым проектом
function building() { 
    return src([
    'app/fonts/*.*', // работа со шрифтами
    'app/img/**/*.*', // работа с изображениями
    '!app/img/src/**/*.*', //запрещает перенос файлов из папки с исходными файлами, без сжатия
    'app/*.html', // работа с pug/html
    'app/css/*.css', // работа с css
    'app/scripts/*.js' // работа с js
    ], {base : 'app'}) // создает туже самую структура папок как в папке сборки
    .pipe(dest('dist')) // выгрузка в папку с готовым проектом /dist
    .on('end', function(){ log('-------Компиляция сборки завершена------------')});
}

// функция отслеживания изменений файлов
function watching() {
    browserSync.init({ // функция запуска лайв сервера
        server: {
            baseDir: "app/" // папка отслеживания сборки
        }
    });
    watch(['app/fonts/src'], fonts)// если происходит изменение в папке fonts то запустит функцию конвертации 
    watch(['app/scss/*.scss', 'app/scss/components/*.scss'], styles) // если происходит изменение в файле style.scss то запускается функция (styles), для работы со стилями
    watch(['app/img/src/**/*.*'], images); // если происходит изменение в папке, то запускает таск для изображений
    watch(['app/pug/*.pug', 'app/pug/components/*.pug'], pug);
}

// // вызов функций по отдельности или в составе сборки
exports.fonts = fonts; //функция преобразования шрифтов
exports.cleanDist = cleanDist; //функция удаления файлов и папок в dist
exports.watching = watching; // экспорт функции отслеживания изменения файлов
exports.styles = styles; // экспорт функции работы с scss для дальнейшей работы с ней
exports.images = images; // работа с изображениями
exports.pug = pug; // работа с pug
exports.building = building; // функция сборки

// //------выполняет функции после старта сборки описанные выше, последовательно (series) и параллельно (parallel)(-------------
exports.default = series(
    cleanDist, building, 
    parallel(styles, images, pug, fonts), 
    parallel(watching));

// //Доработать сборку------------
// //не работает автопрефиксер
// //установить медиагропп
// //установить валидатор html https://github.com/center-key/w3c-html-validator
//при каждом изменении в папке с фонами, сборка форматирует и проверят все сразу. Нужно сделать проверку, если есть ин чего не делать
//сделать что все файлы сразу попадали ещё и окончательную сборку, а то приходится запускать 2 раза сборку