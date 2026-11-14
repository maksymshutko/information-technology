// Спільний клієнт для сторінок квесту.
// Справжній режим: POST до Apps Script. Демо-режим: імітація в localStorage.
(function () {
  const URL_ = window.QUEST_SCRIPT_URL;
  const DEMO = !URL_;

  async function real(params) {
    const res = await fetch(URL_, {
      method: 'POST',
      // text/plain — щоб браузер не робив CORS preflight, який Apps Script не підтримує
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  // ── Демо: 3 тестові точки (справжні 20 — у Code.gs) ──
  const DEMO_POINTS = [
    { n: 1, key: 'demo1', topic: 'Демо · Паролі', q: 'Який пароль найнадійніший?',
      options: ['qwerty123', 'Кіт-Ліхтар-Сніг-47!', 'P@ssw0rd'], correct: 1,
      explain: 'Довга фраза з кількох слів і символів — найкраща.' },
    { n: 2, key: 'demo2', topic: 'Демо · Фішинг', q: 'Банк просить код з SMS телефоном. Що робити?',
      options: ['Продиктувати', 'Нікому не казати й завершити розмову'], correct: 1,
      explain: 'Банк ніколи не просить коди з SMS.' },
    { n: 3, key: 'demo3', topic: 'Демо · QR', q: 'Що перевірити перед відкриттям посилання з QR?',
      options: ['Нічого', 'Адресу сайту'], correct: 1, explain: 'Шахраї наклеюють фальшиві QR.' }
  ];
  const ROLES = { student: ['Студент', 'Студенти'], master: ['Майстер виробничого навчання', 'Працівники'],
                  teacher: ['Викладач', 'Працівники'], worker: ['Працівник ліцею', 'Працівники'] };
  function db() { try { return JSON.parse(localStorage.getItem('qrq_demo_db')) || { people: [], answers: [] }; } catch (e) { return { people: [], answers: [] }; } }
  function save(d) { try { localStorage.setItem('qrq_demo_db', JSON.stringify(d)); } catch (e) {} }
  function prog(d, id) {
    const done = {};
    d.answers.filter(a => a.id === id).forEach(a => { done[a.n] = a.ok; });
    const v = Object.values(done);
    return { done, answered: v.length, correct: v.filter(Boolean).length, total: DEMO_POINTS.length };
  }
  async function demo(p) {
    await new Promise(r => setTimeout(r, 250));
    const d = db();
    const pt = DEMO_POINTS.find(x => String(x.n) === String(p.p) && x.key === p.k);
    const person = d.people.find(x => x.id === p.id);
    switch (p.action) {
      case 'question':
        if (!pt) return { ok: false, error: 'Цей QR-код недійсний. Відскануйте код ще раз.' };
        return { ok: true, total: DEMO_POINTS.length, point: { n: pt.n, topic: pt.topic, q: pt.q, options: pt.options } };
      case 'register': {
        const r = ROLES[p.role];
        if (!r) return { ok: false, error: 'Оберіть, хто ви' };
        if (!p.last || !p.first) return { ok: false, error: 'Вкажіть прізвище та ім’я' };
        if (p.role === 'student' && !p.group) return { ok: false, error: 'Вкажіть групу' };
        const id = Math.random().toString(16).slice(2, 10);
        d.people.push({ id, last: p.last, first: p.first, role: r[0], cat: r[1], group: p.role === 'student' ? p.group : '' });
        save(d); return { ok: true, id };
      }
      case 'answer': {
        if (!pt) return { ok: false, error: 'Цей QR-код недійсний.' };
        if (!person) return { ok: false, error: 'Учасника не знайдено', reRegister: true };
        const prev = d.answers.find(a => a.id === person.id && a.n === pt.n);
        if (prev) return { ok: true, already: true, correct: prev.ok, explain: pt.explain, progress: prog(d, person.id) };
        const ok = Number(p.choice) === pt.correct;
        d.answers.push({ id: person.id, n: pt.n, ok, t: Date.now() }); save(d);
        return { ok: true, correct: ok, explain: pt.explain, progress: prog(d, person.id) };
      }
      case 'progress':
        if (!person) return { ok: false, error: 'Учасника не знайдено', reRegister: true };
        return { ok: true, name: person.first + ' ' + person.last, role: person.role, group: person.group, progress: prog(d, person.id) };
      case 'rating': {
        const list = d.people.map(x => {
          const a = d.answers.filter(y => y.id === x.id);
          const good = a.filter(y => y.ok);
          return { name: x.last + ' ' + x.first, cat: x.cat, sub: x.cat === 'Студенти' ? x.group : x.role,
                   correct: good.length, answered: a.length, last: Math.max(0, ...good.map(y => y.t)) };
        }).filter(x => x.answered).sort((a, b) => b.correct - a.correct || a.last - b.last);
        return { ok: true, total: DEMO_POINTS.length, students: list.filter(x => x.cat === 'Студенти'),
                 staff: list.filter(x => x.cat === 'Працівники'), updated: new Date().toISOString() };
      }
      case 'qrlist': {
        const base = location.href.replace(/[^/]*$/, '');
        return { ok: true, points: DEMO_POINTS.map(x => ({ n: x.n, topic: x.topic, place: '', url: base + '?p=' + x.n + '&k=' + x.key })) };
      }
    }
    return { ok: false, error: 'Невідома дія' };
  }

  window.QuestAPI = {
    demo: DEMO,
    call: async function (params) {
      try { return await (DEMO ? demo(params) : real(params)); }
      catch (e) { return { ok: false, error: 'Немає зв’язку з сервером. Перевірте інтернет і спробуйте ще раз.' }; }
    }
  };
})();
