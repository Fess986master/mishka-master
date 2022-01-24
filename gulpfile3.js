var gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

gulp.task('mytask', async function() {
  console.log('Привет, я таск!');
});

gulp.task('sass', function(){ // Создаем таск "sass"
  return gulp.src('src/sass/**/*.sass') // Берем источник
    .pipe(sass()) // Преобразуем Sass в CSS посредством gulp-sass
    .pipe(gulp.dest('src/css')) // Выгружаем результата в папку app/css
});
