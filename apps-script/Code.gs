/**
 * КОД ДЛЯ GOOGLE APPS SCRIPT
 * ==========================
 * Що робить:
 * 1. Приймає дані з форми submit.html і тестів (напр. urok-15.html) і дописує
 *    їх рядком у Google Sheet, до якого прив'язаний цей скрипт (doPost).
 * 2. Віддає ці рядки як JSON для сторінки kabinet.html — але тільки якщо
 *    передано правильний секретний ключ CABINET_KEY (doGet).
 *
 * ЯК ПІДКЛЮЧИТИ (одноразово):
 * 1. Створи новий Google Sheet (це буде твій "кабінет" з роботами учнів).
 * 2. Відкрий меню "Розширення" → "Apps Script".
 * 3. Видали весь приклад коду, який там є, і встав замість нього ВЕСЬ цей файл.
 * 4. Заміни CABINET_KEY нижче на свій власний довільний секретний рядок
 *    (вигадай щось довге й унікальне — це буде "пароль" до kabinet.html).
 * 5. Збережи проєкт (значок дискети або Ctrl+S), можеш назвати "Форма здачі робіт".
 * 6. Натисни "Deploy" (Розгорнути) → "New deployment" (Нове розгортання).
 *    - Тип: "Web app" (Веб-застосунок)
 *    - Execute as (Виконати від імені): Me (Я)
 *    - Who has access (Хто має доступ): Anyone (Будь-хто)
 * 7. Натисни "Deploy", дозволь потрібні права доступу (це твій власний скрипт,
 *    Google попросить підтвердити, що довіряєш йому).
 * 8. Скопіюй URL веб-застосунку, який видасть Google.
 * 9. Встав цей URL у файл assets/config.js замість SCRIPT_URL.
 *
 * Після цього кожна відправка форми чи тесту на сайті буде автоматично
 * додавати новий рядок у вкладку "Відповіді" цього Google Sheet, а
 * kabinet.html зможе їх показати (після введення CABINET_KEY).
 */

// Встав власний секретний рядок — це "пароль" для перегляду результатів у kabinet.html
const CABINET_KEY = "M02!k1s3";

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
 * Без ключа — просто підтверджує, що веб-застосунок працює (можна відкрити
 * URL розгортання в браузері й побачити повідомлення нижче).
 *
 * З правильним ?key=CABINET_KEY — віддає всі рядки аркуша "Відповіді" як JSON
 * для сторінки kabinet.html. Без правильного ключа дані не віддаються.
 */
function doGet(e) {
  var key = e.parameter.key;

  if (!key || key !== CABINET_KEY) {
    return ContentService.createTextOutput(
      'Форма здачі робіт активна. Ця сторінка призначена лише для прийому даних із submit.html.'
    );
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Відповіді');

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ rows: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var data = sheet.getDataRange().getValues();
  var headers = data.shift();

  var rows = data.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      obj[header] = row[i];
    });
    return obj;
  });

  return ContentService
    .createTextOutput(JSON.stringify({ rows: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
