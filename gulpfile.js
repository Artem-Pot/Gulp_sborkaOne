
const {src, dest, watch, parallel, series} = require('gulp'); //присваиваем все возможности gulp встроенные в Gulp(поиск файла, место куда отправляется файл, отслеживание изменений, параллельная работа, последовательная работа))
//pug html
const gulppug = require('gulp-pug'); // препроцессор pug
const webpHtml= require('gulp-html-img-wrapper'); //вставляет в пути изображения с форматом изображения webp
//scss css
const scss = require('gulp-sass')(require('sass')); // конвертация препроцессора scss в css
const sourcemapsFiles = require('gulp-sourcemaps'); //создает карту для корректного отображения файла и строки в dev tols
const groupMedia = require('gulp-group-css-media-queries'); // объединяет повторяющиеся медиа запросы
const autoprefixer = require('gulp-autoprefixer'); //автоматическая проставка префиксов
const wepbCss = require('gulp-webp-css'); //добавление в стилях путь до webp файла
//fonts
const fonter = require('gulp-fonter'); // конвертирует все форматы шрифтов в woff и woff2
const ttf2woff2 = require('gulp-ttf2woff2'); // из ttf в woff формат шрифта
//img
const imagemin = require('gulp-imagemin'); // сжимает изображения PNG, JPEG, GIF и SVG
const webp = require('gulp-webp'); // переводит изображения в формат в webp
//js
const concat = require('gulp-concat'); //объединение файлов js в один 
const uglify= require('gulp-uglify'); //минимизирует код js
//errors console
const plumber = require('gulp-plumber'); //поиск ошибок
const notify = require('gulp-notify'); // вывод ошибок в виде уведомления 
const log = require('fancy-log'); // вывод сообщений в консоль после каждого таска
//other
const changed = require('gulp-changed'); //запрет переноса файлов которые там уже есть
const clean = require('gulp-clean'); //удалит все файлы из папки dist перед сборкой
const fs = require('fs'); // системная функция необходимая для проверки перед очистки папки dist
const browserSync = require('browser-sync').create(); // лайв сервер

function pug() {
    return src('app/pug/*.pug', 
    {sourcemaps: true}) // sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка
        .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
            title: "Pug", 
            message: "Error: <%= error.message %>"
        }))) 
        .pipe(gulppug({    //функция преобразования в html
            verbose: true, // опция - показывает какой файл преобразует в консоле
            pretty: false  // сжатие файлы
        }))
         .pipe(webpHtml( // вставит тег picture и путь для файлов webp
            {
                logger: true, //отключить в консоле отображение количества измененных тегов
                extensions: ['.jpg', '.png', '.jpeg'] // форматы изображения которые заменяет webp
              })) 
        .pipe(changed('dist/')) //не перенесёт файлы если они там уже есть такой
        .pipe(dest('dist/'))
        .pipe(browserSync.stream()) //отслеживание изменений в браузере
        .on('end', function(){ log('------Компиляция Html завершена-----------')});
}

function styles() {
    return src('app/scss/*.scss', 
    {sourcemaps: true}) // sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка
    .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
        title: "SCSS", 
        message: "Error: <%= error.message %>"
    }))) 
    .pipe(changed('dist/css')) //не перенесёт файлы если они там уже есть такой
    .pipe(sourcemapsFiles.init()) //создает карту для корректного отображения файла и строки dev tols, первая его часть
    .pipe(groupMedia()) // объединит медиа запросы
    .pipe(wepbCss()) //добавит путь до изображения webp вставив синтаксис дополнительный
    .pipe(scss({ outputStyle: 'compressed'})) //подключение к модулю конвертацияя scss, { outputStyle: 'compressed'} - сжатие
    .pipe(autoprefixer('last 20 versions')) // автопрефиксы, последние 20 версий браузеров

    .pipe(sourcemapsFiles.write('.')) //создает карту для корректного отображения файла и строки dev tols, вторая его часть, если добавить ('.') - создаст карту отдельным файлом
    .pipe(dest('dist/css'))

    .pipe(browserSync.stream())
    .on('end', function(){ log('------Компиляция CSS завершена-----------')});
}

function fonts() {
    return src('app/fonts/**/*')

        .pipe(fonter({ //берет все файлы шрифтов и конвертирует их в woff и ttf
            formats: ['woff', 'ttf']
        }))

        .pipe(src('app/fonts/**/*.ttf')) // берет файлы которые сконвертировались выше и берет только форматы ttf и конвертирует их в woff2
        .pipe(ttf2woff2())

        .pipe(changed('dist/fonts'))     //не перенесёт файлы если они там уже есть такой
        .pipe(dest('dist/fonts'))
        .on('end', function(){ log('------Конвертация шрифтов завершена-----------')});
}

function images() { 
    return src('app/img/**/*', 
        {sourcemaps: true},
        {base : 'app'}
        ) //взять исходные файлы только файлы с изображениями из папки и сжать их + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))
        .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
            title: "Images", 
            message: "Error: <%= error.message %>"
        }))) 
        .pipe(changed('dist/img/'))     //если видит что там уже есть изображения, не будет создавать другие и сжимать их

        .pipe(webp()) // переведёт изображения в формат webp
        .pipe(dest('dist/img')) 

        .pipe(src('app/img/**/*')) // снова взять изображения из папки с исходниками
        .pipe(changed('dist/img/'))     //не перенесёт файлы если они там уже есть такой
        .pipe(imagemin({ //сжимает файлы
            progressive: true,
            svgoPlugins: [{ removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3,
            verbose: true // показывает какие файлы сжились и его уровень
        }))

        .pipe(dest('dist/img/')) //не перенесёт файлы если они там уже есть такой
        .on('end', function(){ log('------Сжатие и перенос изображений завершено-----------')});
}

function js() { 
    return src('app/scripts/**/*')
    .pipe(uglify()) //минифицирует код
    .pipe(concat('main.min.js')) //соберёт в один файл
    .pipe(changed('dist/scripts/'))  //не перенесёт файлы если они там уже есть такой
    .pipe(dest('dist/scripts/'))
    .on('end', function(){ log('-------Перенос JS файлов завершён------------')});
}

// функция удаления папки dist перед сборкой
function cleanDist(done) { 
    if (fs.existsSync('./dist')) { //проверка что папки нет и создаст её
        return src('dist', {read: false}) //перед удалением не считывает все пути, а удаляет всю папки сразу - ускоряя удаление
        .pipe(clean({force: true})) // сама функции очистка, force: true - удаляет файлы если  даже для них необходимо разрешение системы
        .on('end', function(){ log('------Очистка папки Dist------------')});
    }
    else {
        done(); // обязательное выполнение колбэк функции иначе будет ошибка если папка пустая
    }
}

// функция отслеживания изменений файлов
function watching() {
    browserSync.init({ // функция запуска лайв сервера
        server: {
            baseDir: "dist/" // папка отслеживания сборки
        }
    });
    watch(['app/fonts/**/*'], fonts)
    watch(['app/scss/**/*.scss'], styles) 
    watch(['app/img/**/*'], images);
    watch(['app/pug/**/*.pug'], pug);
    watch(['app/scripts/**/*.js'], js);
}

// // экспорт функций
exports.fonts = fonts;
exports.cleanDist = cleanDist; 
exports.watching = watching; 
exports.styles = styles;
exports.images = images; 
exports.pug = pug; 
exports.js = js; 

exports.default = series(
    cleanDist, 
    parallel(styles, images, pug, fonts, js), 
    parallel(watching));