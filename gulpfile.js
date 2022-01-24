// основа скриптов с сайта: https://webdesign-master.ru/blog/tools/gulp-4-lesson.html

// Определяем переменную "preprocessor"
let preprocessor = 'sass'; // Выбор препроцессора в проекте - sass или less

let gulp = require('gulp');
const
    {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');


// Подключаем Browsersync. Здесь необходимо указать .create() для создания нового подключения.
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем gulp-uglify-es
const uglify = require('gulp-uglify-es').default;

// Подключаем модули gulp-sass и gulp-less
const sass = require('gulp-sass')(require('sass'));
const less = require('gulp-less');

// Подключаем Autoprefixer
const autoprefixer = require('gulp-autoprefixer');

// Подключаем модуль gulp-clean-css
const cleancss = require('gulp-clean-css');

// Подключаем модуль del
const del = require('del');

// подключаем модуль карт кода
const map = require('gulp-sourcemaps');

// оптимизация изображений

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
// function images () {

//   console.log('Оптимизация изображений...');

//   return src('src/imgtest')  // + '**/*.{jpg,png,svg}
//     .pipe(imagemin([
//      // imagemin.optipng(),
//       imagemin.svgo({
//         plugins: [
//           {removeViewBox: false},
//           {removeTitle: true},
//           {cleanupNumericValues:
//             {floatPrecision: 0}
//           }
//         ]
//       }),
//       jpegoptim({
//         max: 80,
//         progressive: true
//       })
//     ]))
//     .pipe(dest('src/imgdest/'));
// }

function scripts() {
  return src([ // Берем файлы из источников
      //'node_modules/jquery/dist/jquery.min.js', // Пример подключения библиотеки
      'src/js/app.js', // Пользовательские скрипты, использующие библиотеку, должны быть подключены в конце
    ])
    .pipe(concat('app.min.js')) // Конкатенируем(сливаем) в один файл
    .pipe(uglify()) // Сжимаем(уродуем) JavaScript
    .pipe(dest('src/js/')) // Выгружаем готовый файл в папку назначения
    .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
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
  .pipe(map.init())  //запускаем карту кода
  .pipe(eval(preprocessor)()) // Преобразуем значение переменной "preprocessor" в функцию
    .pipe(concat('style.css')) // Конкатенируем в файл style.css
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    })) // Создадим префиксы с помощью Autoprefixer. Префиксы нужны для совместимости браузеров. грид - нужен для того чтобы эксплорер понимал гриды
    //.pipe(cleancss( { level: { 2: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили. в одну строку. если расскоментить бьютифай, то наоборот будет максимально красиво
    .pipe(cleancss({
      level: {
        1: {
          specialComments: 0
        }
      },
      format: 'beautify'
    })) //делаем всё красиво!! Если надо сжато, то расскоментим предыдущую строку
    .pipe(map.write('../css/'))  //записываем карту кода в папку css
    .pipe(dest('src/css/')) // Выгрузим результат в папку "app/css/"
    .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function cleanimg() {
  return del('src/imgtest/**/**', {
    force: true
  }) // Удаляем все содержимое папки "app/images/dest/"
}

// Экспортируем функцию styles() в таск styles
exports.styles = styles;

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем дефолтный таск с нужным набором функций. Вызывается тупо коммандой gulp из консоли
exports.default = parallel(styles, scripts, browsersync, startwatch); //параллельно запустятся скрипты, сервер и слежка

// Экспортируем функцию cleanimg() как таск cleanimg
exports.cleanimg = cleanimg;

gulp.task('mytask', function () {
  console.log('Привет, я таск!');
});
