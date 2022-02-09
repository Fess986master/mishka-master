// основа скриптов с сайта: https://webdesign-master.ru/blog/tools/gulp-4-lesson.html

let preprocessor = 'sass'; // Выбор препроцессора в проекте - sass или less
let gulp = require('gulp'); //описание стандартных процедур в галпе
const {
  src, //источник
  dest, //куда выгружать
  parallel, //запуск параллельных операций
  series,
  watch //слежка за изменением файлов
} = require('gulp');

// Подключаем Browsersync. Здесь необходимо указать .create() для создания нового подключения.
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat'); // Подключаем gulp-concat - объединение файлов
const uglify = require('gulp-uglify-es').default; // Подключаем gulp-uglify-es   - уродование, сжимание и тд
// Подключаем модули gulp-sass и gulp-less
const sass = require('gulp-sass')(require('sass'));
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer'); // Подключаем Autoprefixer - обеспечение доступности для браузеров. Может опираться на пэкэдж - описанию версий
const cleancss = require('gulp-clean-css'); // Подключаем модуль gulp-clean-css
const del = require('del'); // Подключаем модуль del
const plumber = require('gulp-plumber'); // запуск галпа игнорируя ошибки
const map = require('gulp-sourcemaps'); // подключаем модуль карт кода
const imagemin = require('gulp-imagemin'); //оптимизация изображений
const webp = require('gulp-webp'); //создание картинок с расширением webp
const svgstore = require('gulp-svgstore') //работа со спрайтами
const rename = require('gulp-rename') //переименование файлов
const htmlmin = require('gulp-htmlmin') //минимизация html


// Определяем логику работы Browsersync. Только строчные буквы чтобы не совпадало с константой
function browsersync() {
  browserSync.init({ // Инициализация Browsersync
    server: {
      baseDir: 'src/'
    }, // Указываем папку сервера
    notify: false, // Отключаем уведомления
    online: true // Режим работы: true или false (фолс если хотим работать в офлайне)
  })
}

// Оптимизация изображений
function images() {
  //const images = () => {
  return src('src/sourse_img/**/*.{jpg,png,svg}') //берем файлы
    .pipe(imagemin([ // []  -  означает массив данных
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 3
      }) //лучше всего использовать 3, если выше, то будет всё тормозить
      //imagemin.svgo()
      // imagemin.svgo({   //почему то убивает некоторые файлыь в том числе файл спрайта
      //   plugins: [{
      //       removeViewBox: false
      //     },
      //     {
      //       removeTitle: false
      //     },
      //     {
      //       cleanupNumericValues: {
      //         floatPrecision: 0
      //       }
      //     }
      //   ]

    ]))
    .pipe(gulp.dest('src/img'))
}

//создание картинок  webp
function createwebp() {
  return src('src/img/**/*.{jpg,png}')
    .pipe(webp({
      quality: 75
    }))
    .pipe(gulp.dest('src/img'))
}

//создание спрайтов sprites.svg
function sprites() {
  return src('src/img/icons/*.svg')
    .pipe(svgstore())
    .pipe(rename('sprites.svg'))
    .pipe(gulp.dest('src/img'))
}

//минимизация html
function htmlB() {
  return src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeEmptyAttributes: true,
      ///removeEmptyElements: true,   -  убивает привязку к спрайту и внешним ссылкам
      removeRedundantAttributes: true

    }))
    .pipe(dest('build'))
}


function scripts() {
  return src([ // Берем файлы из источников
      //'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
      'src/js/index.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
    .pipe(concat('index.min.js')) // Конкатенируем(сливаем) в один файл
    .pipe(uglify()) // Сжимаем(уродуем) JavaScript
    .pipe(dest('src/js/')) // Выгружаем готовый файл в папку назначения
    .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function scriptsB() {
  return src([ // Берем файлы из источников
      //'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
      'src/js/index.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
    .pipe(concat('index.min.js')) // Конкатенируем(сливаем) в один файл
    .pipe(uglify()) // Сжимаем(уродуем) JavaScript
    .pipe(dest('build/js/')) // Выгружаем готовый файл в папку назначения
}

function startwatch() {
  // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
  watch(['src/**/*.js', '!src/**/*.min.js'], scripts);
  // Мониторим файлы препроцессора на изменения
  watch('src/**/' + preprocessor + '/**/*.scss', styles);
  // Мониторим файлы HTML на изменения
  watch('src/**/*.html').on('change', browserSync.reload);
}

function styles() {
  return src('src/sass/main.scss') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
    .pipe(plumber())
    .pipe(map.init()) //запускаем карту кода
    .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
    .pipe(concat('style.min.css')) // Конкатенируем в файл style.css
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    })) // Создадим префиксы с помощью Autoprefixer. Префиксы нужны для совместимости браузеров. грид - нужен для того чтобы эксплорер понимал гриды
    //.pipe(cleancss( { level: { 2: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили. в одну строку. если расскоментить бьютифай, то наоборот будет максимально красиво
    // .pipe(cleancss({
    //   level: {
    //     1: {
    //       specialComments: 0
    //     }
    //   },
    //   format: 'beautify'
    // })) //делаем всё красиво!! Если надо сжато, то расскоментим предыдущую строку
    .pipe(cleancss({
      level: {
        2: {
          specialComments: 0
        }
      }
    })) // Минифицируем стили. в одну строку. если расскоментить бьютифай, то наоборот будет максимально красиво

    .pipe(map.write('../css/')) //записываем карту кода в папку css
    .pipe(dest('src/css/')) // Выгрузим результат в папку "app/css/"
    .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function stylesB() {
  return src('src/sass/main.scss') // Выбираем источник: "app/sass/main.sass" или "app/less/main.less"
    .pipe(map.init()) //запускаем карту кода
    .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
    .pipe(concat('style.min.css')) // Конкатенируем в файл style.css
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    })) // Создадим префиксы с помощью Autoprefixer. Префиксы нужны для совместимости браузеров. грид - нужен для того чтобы эксплорер понимал гриды
    .pipe(cleancss({
      level: {
        2: {
          specialComments: 0
        }
      }
    })) // Минифицируем стили. в одну строку. если расскоментить бьютифай, то наоборот будет максимально красиво
    .pipe(map.write('../../build/css/')) //записываем карту кода в папку css
    .pipe(dest('build/css/')) // Выгрузим результат в папку "app/css/"
}


//чистка папок
function cleanB() {
  // return del('src/imgtest/**/**', {
  //   force: true
  // }) // Удаляем все содержимое папки "app/images/dest/"
  return del(['build'])

}

// копирование шрифтов и тд
function copyB() {
  return src([
      "src/fonts/*.*",
      'src/img/**/*'
    ], {
      base: "src"
    })
    .pipe(dest("build"))
}

exports.styles = styles; // Экспортируем функцию styles() в таск styles
exports.browsersync = browsersync; // Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.scripts = scripts; // Экспортируем функцию scripts() в таск scripts
exports.images = images; // Экспортируем функцию images() в таск images
exports.createwebp = createwebp; // Экспортируем функцию создания webP
exports.sprites = sprites; // Экспортируем функцию создания спрайтов

exports.default = parallel(styles, scripts, browsersync, startwatch); //параллельно запустятся скрипты, сервер и слежка

exports.cleanB = cleanB; // Экспортируем функцию cleanimg() как таск cleanimg

// отдельные скрипты для сборки проекта
exports.stylesB = stylesB
exports.scriptsB = scriptsB;
exports.htmlB = htmlB; // Минификация хтмл
exports.copyB = copyB; //копирование файлов изображений и шрифтов из src в build
// Экспортируем дефолтный таск с нужным набором функций. Вызывается тупо коммандой gulp из консоли

//запуск сборки проекта
const build = gulp.series( // сначала запускаем чистку папки назначения, а потом параллельно заполняем ее контентом
  //cleanB,
  htmlB,
  stylesB,
  scriptsB,
  copyB, //явная ошибка: копируем и обычные картинки и оптимизированные
)

exports.build = build;
