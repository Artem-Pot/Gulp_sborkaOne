
const {src, dest, watch, parallel, series} = require('gulp'); //присваиваем все возможности gulp встроенные в Gulp(поиск файла, место куда отправляется файл, отслеживание изменений, параллельная работа, последовательная работа))
//pug html
const gulppug = require('gulp-pug'); // препроцессор pug
const htmlclean = require('gulp-htmlclean'); // минимизирует код html страницы
const webpHtml= require('gulp-html-img-wrapper'); //вставляет в пути изображения с форматом webp
//scss css
const scss = require('gulp-sass')(require('sass')); // конвертация с препроцессора scss и gulp-sass
const sourcemapsFiles = require('gulp-sourcemaps'); //создает карту для корректного отображения файла и строки dev tols
const groupMedia = require('gulp-group-css-media-queries'); // объединяет медиа запросы, но при этом сломает всю карту плагина gulp-sourcemaps
const autoprefixer = require('gulp-autoprefixer'); //автопрефикс
const csso = require('gulp-csso'); //минифицирует файл css
const wepbCss = require('gulp-webp-css'); //добавит в стилях путь до webp файла
//fonts
const fonter = require('gulp-fonter'); // конвертирует все форматы шрифтов
const ttf2woff2 = require('gulp-ttf2woff2'); // из ttf в woff формат шрифта
//img
const imagemin = require('gulp-imagemin'); // сжимает изображения PNG, JPEG, GIF и SVG
const changed = require('gulp-changed'); // ещё один вариант работы с кэшем
const webp = require('gulp-webp'); // переводит изображения из всех форматов в webp
//errors console
const plumber = require('gulp-plumber'); //поиск ошибок
const notify = require('gulp-notify'); // вывод ошибок в виде уведомления 
const log = require('fancy-log'); // вывод сообщений в консоль после каждого таска
//other
const clean = require('gulp-clean'); //удалит все файлы из папки dist перед компиляцией
const fs = require('fs'); // системная функция необходимая для проверки перед очистки папки dist
const browserSync = require('browser-sync').create(); // лайв сервер

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
         .pipe(webpHtml( // вставит тег picture и путь для файлов webp
            {
                logger: true, //отключить в консоле отображение количества измененных тегов
                extensions: ['.jpg', '.png', '.jpeg'] // форматы изображения которые заменяет webp
              }
         )) 
        .pipe(htmlclean()) // минифицирует html документ
        .pipe(changed('dist/')) //не перенесёт файлы если они там уже есть с таким именем
        .pipe(dest('dist/')) //кидает в папку со сборкой 
        .pipe(browserSync.stream()) // отслеживание изменений
        .on('end', function(){ log('------Компиляция Html завершена-----------')});
}

function styles() {
    return src('app/scss/*.scss', 
    {sourcemaps: true}) //поиск файла стиля scss в сборке. sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка
    .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
        title: "SCSS", 
        message: "Error: <%= error.message %>"
    }))) 
    .pipe(changed('dist/css')) //не перенесёт файлы если они там уже есть с таким именем
    .pipe(sourcemapsFiles.init()) //создает карту для корректного отображения файла и строки dev tols, первая его часть
    .pipe(groupMedia()) // объединит медиа запросы
    .pipe(wepbCss()) //добавит путь до изображения webp вставив синтаксис дополнительный
    .pipe(scss()) //подключение к модулю конвертацияя scss + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))
    .pipe(autoprefixer('last 20 versions')) // автопрефиксы, последние 20 версий браузеров

    .pipe(csso()) // минифицирует файл css
    .pipe(sourcemapsFiles.write()) //создает карту для корректного отображения файла и строки dev tols, вторая его часть
    .pipe(dest('dist/css')) //путь сборки

    .pipe(browserSync.stream()) //  Лайв сервер
    .on('end', function(){ log('------Компиляция CSS завершена-----------')});
}

//функция конвертации из любого формата шрифта в woff и woff2
function fonts() {
    return src('app/fonts/**/*')

        .pipe(fonter({ //берет все файлы шрифтов и конвертирует их в woff и ttf
            formats: ['woff', 'ttf']
        }))

        .pipe(src('app/fonts/**/*.ttf')) // берет файлы которые сконвертировались выше и берет только форматы ttf и конвертирует их в woff2
        .pipe(ttf2woff2())

        .pipe(changed('dist/fonts'))     //если видит что там уже есть изображения, не будет создавать другие и сжимать их
        .pipe(dest('dist/fonts'))
        .on('end', function(){ log('------Конвертация шрифтов завершена-----------')});
}

//функция работы с изображениями
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
        .pipe(dest('dist/img')) // перенос изображений формата webp в папку

        .pipe(src('app/img/**/*')) // снова взять изображения из папки с исходниками
        .pipe(changed('dist/img/'))     //если видит что там уже есть изображения, не будет создавать другие и сжимать их
        .pipe(imagemin({ //сжимает файлы
            progressive: true,
            svgoPlugins: [{ removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3,
            verbose: true // показывает какие файлы сжились и его уровень
        }))

        .pipe(dest('dist/img/')) // перенос изображений в папку с жатыми файлами и файлами webp
        .on('end', function(){ log('------Сжатие и перенос изображений завершено-----------')});
}

// функция сборки всех скомпилированных файлов в нужную папку с готовым проектом
function js() { 
    return src('app/scripts/**/*')
    .pipe(changed('dist/scripts/'))  //запрет переноса файлов если они уже там есть
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
    watch(['app/fonts/**/*'], fonts)// если происходит изменение в папке fonts то запустит функцию конвертации 
    watch(['app/scss/**/*.scss'], styles) // если происходит изменение в файле style.scss то запускается функция (styles), для работы со стилями
    watch(['app/img/**/*'], images); // если происходит изменение в папке, то запускает таск для изображений
    watch(['app/pug/**/*.pug'], pug);
}

// // вызов функций по отдельности или в составе сборки
exports.fonts = fonts; //функция преобразования шрифтов
exports.cleanDist = cleanDist; //функция удаления файлов и папок в dist
exports.watching = watching; // экспорт функции отслеживания изменения файлов
exports.styles = styles; // экспорт функции работы с scss для дальнейшей работы с ней
exports.images = images; // работа с изображениями
exports.pug = pug; // работа с pug
exports.js = js; // функция сборки

// //------выполняет функции после старта сборки описанные выше, последовательно (series) и параллельно (parallel)(-------------
exports.default = series(
    cleanDist, 
    parallel(styles, images, pug, fonts, js), 
    parallel(watching));

// //Доработать сборку------------
//сделать таск для работы со скриптами, сборку например в один файл
// //установить валидатор html https://github.com/center-key/w3c-html-validator