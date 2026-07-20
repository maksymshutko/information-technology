/**
 * КОД ДЛЯ GOOGLE APPS SCRIPT
 * ==========================
 * Що робить: приймає дані з форми submit.html і дописує їх рядком
 * у Google Sheet, до якого прив'язаний цей скрипт.
 *
 * ЯК ПІДКЛЮЧИТИ (одноразово):
 * 1. Створи новий Google Sheet (це буде твій "кабінет" з роботами учнів).
 * 2. Відкрий меню "Розширення" → "Apps Script".
 * 3. Видали весь приклад коду, який там є, і встав замість нього ВЕСЬ цей файл.
 * 4. Збережи проєкт (значок дискети або Ctrl+S), можеш назвати "Форма здачі робіт".
 * 5. Натисни "Deploy" (Розгорнути) → "New deployment" (Нове розгортання).
 *    - Тип: "Web app" (Веб-застосунок)
 *    - Execute as (Виконати від імені): Me (Я)
 *    - Who has access (Хто має доступ): Anyone (Будь-хто)
 * 6. Натисни "Deploy", дозволь потрібні права доступу (це твій власний скрипт,
 *    Google попросить підтвердити, що довіряєш йому).
 * 7. Скопіюй URL веб-застосунку, який видасть Google.
 * 8. Встав цей URL у файл submit.html замість SCRIPT_URL (на початку тегу <script>).
 *
 * Після цього кожна відправка форми на сайті буде автоматично додавати
 * новий рядок у вкладку "Відповіді" цього Google Sheet.
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Відповіді');

  // якщо аркуша ще немає — створити його і додати заголовки
  if (!sheet) {
    sheet = ss.insertSheet('Відповіді');
    sheet.appendRow([
      'Дата (сервер)', 'Час (учень)', 'Прізвище', "Ім'я", 'Клас',
      'Урок / завдання', 'Тип роботи', 'Посилання на роботу', 'Текстова відповідь'
    ]);
    sheet.setFrozenRows(1);
  }

  var p = e.parameter;

  sheet.appendRow([
    new Date(),
    p.timestamp || '',
    p.lastname || '',
    p.firstname || '',
    p.klass || '',
    p.lesson || '',
    p.worktype || '',
    p.link || '',
    p.answer || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Необов'язково: дозволяє перевірити, що веб-застосунок працює,
 * просто відкривши URL розгортання в браузері (побачиш повідомлення нижче).
 */
function doGet(e) {
  return ContentService.createTextOutput(
    'Форма здачі робіт активна. Ця сторінка призначена лише для прийому даних із submit.html.'
  );
}
