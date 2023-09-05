const {src, dest, watch, parallel, series} = require('gulp'); //присваиваем все возможности gulp встроенные в Gulp(поиск файла, место куда отправляется файл, отслеживание изменений, параллельная работа, последовательная работа))

const fonter = require('gulp-fonter'); // из ttf в woff формат шрифта
const ttf2woff2 = require('gulp-ttf2woff2'); // из ttf в woff формат шрифта
const clean = require('gulp-clean'); //удалит все файлы из папки dist перед компиляцией
const browserSync = require('browser-sync').create(); // лайв сервер

const scss = require('gulp-sass')(require('sass')); // конвертация с препроцессора scss
const autoprefixer = require('gulp-autoprefixer'); // автопрефиксер

const imagemin = require('gulp-imagemin'); // сжимает изображения PNG, JPEG, GIF и SVG
const newer = require('gulp-newer'); // работа с кэшем

const gulppug = require('gulp-pug'); // препроцессор pug

const plumber = require('gulp-plumber'); //поиск ошибок
const notify = require('gulp-notify'); // вывод ошибок в виде уведомления 


// функция работы с pug
function pug() {
    return src('app/pug/index.pug' , {sourcemaps: true}) // sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка
        .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
            title: "pug", 
            message: "Error: <%= error.message %>"
        }))) 
        .pipe(gulppug({    //функция преобразования
            verbose: true // опция - показывает какой файл преобразует
        }))
        .pipe(dest('app/')) //кидает в папку с конечным файлом
        .pipe(browserSync.stream()) // отслеживание изменений
}

//функция работы со стилями
function styles() {
    return src('app/scss/style.scss', {sourcemaps: true}) //поиск файла стиля scss в сборке. sourcemaps: true - покажет ошибку в каком конкретно файле произошла ошибка
    .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
        title: "SCSS", 
        message: "Error: <%= error.message %>"
    }))) 
    // .pipe(autoprefixer({    //не работает
    // }))
    .pipe(autoprefixer({overrideBrowserslist : ['last 10 version']}))
    .pipe(scss()) //подключение к модулю scss + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))
    .pipe(dest('app/css')) //показать путь куда преобразовать готовый файл css
    .pipe(browserSync.stream()) // обновляет страницу после каждого изменения -  Лайв сервер
}
//функция конвертации из любого формата шрифта в woff и woff2
function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({ //берет файлы и конвертирует их в woff и ttf
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf')) // берет файлы которые сконвертировались выше и берет только форматы ttf
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
}
//функция работы с изображениями, сжатие
function images() { 
    return src('app/img/src/**/*.{jpg,jpeg,png,svg,gif,ico,webp,bmp}', {sourcemaps: true}) //взять исходные файлы олько файлы с изображениями из папки и сжать их + если нужно сжать файл .pipe(scss({ outputStyle: 'compressed'}))
        .pipe(plumber(notify.onError({ //работа с поиском и выводом ошибок в сообщении
            title: "Images", 
            message: "Error: <%= error.message %>"
        }))) 
        .pipe(newer('app/img')) //если видит что там уже есть изображения, не будет создавать другие
        .pipe(imagemin()) //сжимает файлы
        .pipe(dest('app/img/')); // перенос изображений в папку с жатыми файлами
}

// функция сборки всех скомпилированных файлов в нужную папку с готовым проектом
function building() { 
    return src(['app/fonts/*.*', // работа со шрифтами
    'app/img/**/*.*', // работа с изображениями
    '!app/img/src/**/*.*', //запрещает перенос файлов из папки с исходными файлами, без сжатия
    'app/*.html', // работа с pug/html
    'app/css/*.*' // работа с css
    ], {base : 'app'}) // создает туже самую структура папок как в app
        .pipe(dest('dist')); // выгрузка в папку с готовым проектом /dist
}

// функция удаления папки dist перед сборкой
function cleanDist() { 
    return src('dist')
    .pipe(clean())
}

//функция отслеживания изменений файлов
function watching() {
    browserSync.init({ // функция запуска лайв сервера
        server: {
            baseDir: "app/" // папка отслеживания
        }
    });
    watch(['app/fonts/src'], fonts)// если происходит изменение в папке fonts то запустит функцию конвертации 
    watch(['app/scss/*.scss'], styles) // если происходит изменение в файле style.scss то запускается функция (styles), для работы со стилями
    watch(['app/img/**/*.*'], images); // если происходит изменение в папке, то запускает таск для изображений
    watch(['app/pug/*.pug'], pug);
}

// вызов функций по отдельности или в составе сборки
exports.fonts = fonts; //функция преобразования шрифтов
exports.cleanDist = cleanDist; //функция удаления файлов и папок в dist
exports.building = building; //функция  переноса файлов в конечную папку
exports.watching = watching; // экспорт функции отслеживания изменения файлов
exports.styles = styles; // экспорт функции работы с scss для дальнейшей работы с ней
exports.images = images; // работа с изображениями
exports.pug = pug; // работа с pug

// ------выполняет функции после старта сборки описанные выше, последовательно (series) или параллельно (parallel)(-------------
exports.building = series(cleanDist, building); //последовательная работа сначала преобразует файлы шрифтов, далее очистит папку с проектом и после перенесёт всё файлы в конечную папку
exports.default = parallel(styles, images, pug, watching, fonts, building); // параллельная работа (отслеживание, изменение шрифтов, перенесение файлов )


//не очищает папку dist перед сборкой
//придумать как сделать чтобы сборку можно было делать если больше одной страницы
//добавить работу с js сборка
//не работает автопрефиксер
//подключить модуль, при удалении файла - удаляет из сборки (del)
//модуль gulp-sourcemaps - чтобы видеть какие недочеты в dev tols с указанием на стили в формате scss а не css.
//index.html сжимает, нужно отменить в настройках
//сделать для изображений и шрифтов отдельную папку для конвертированных файлов ,чтобы не лежали вместе иначе путаница куда положить исходники
//установить валидатор html https://github.com/center-key/w3c-html-validator
