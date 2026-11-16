/**
 * СПІЛЬНІ НАЛАШТУВАННЯ САЙТУ
 * ==========================
 * Один URL для всіх сторінок, які надсилають чи отримують дані
 * з Google Таблиці через apps-script/Code.gs
 * (submit.html, тести на кшталт rozdil-02/misiia-analityka.html, kabinet.html).
 *
 * Як підключити (одноразово):
 * 1. Розгорни apps-script/Code.gs як Web App (Deploy → New deployment → Web app,
 *    Execute as: Me, Who has access: Anyone).
 * 2. Встав отриманий URL нижче замість SCRIPT_URL.
 * 3. Зберігай — усі сторінки сайту одразу почнуть його використовувати.
 */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPl-a59GrCh_O0NR0NbekP1CrTncQaq1PaDNLZLm8KXE86zPyR8Q25SY6tI992nwlX/exec";
