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

  // ── Демо: 3 тестові точки (справжні 15 — у Code.gs) ──
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
  const CATS = { student: 'Студенти', staff: 'Працівники' };
  const LIMIT = 120;
  function db() { try { return JSON.parse(localStorage.getItem('qrq_demo_db')) || { people: [], answers: [], starts: [] }; } catch (e) { return { people: [], answers: [], starts: [] }; } }
  function save(d) { try { localStorage.setItem('qrq_demo_db', JSON.stringify(d)); } catch (e) {} }
  const norm = s => String(s || '').toLowerCase().replace(/[’'`ʼ-]/g, '').replace(/\s+/g, '');
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = []; for (let i = 0; i <= a.length; i++) d[i] = [i];
    for (let j = 0; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function prog(d, id) {
    const done = {}; let points = 0;
    d.answers.filter(a => a.id === id).forEach(a => { done[a.n] = a.ok; points += a.pts; });
    const v = Object.values(done);
    return { done, answered: v.length, correct: v.filter(Boolean).length, points, total: DEMO_POINTS.length, maxPoints: DEMO_POINTS.length * 100 };
  }
  async function demo(p) {
    await new Promise(r => setTimeout(r, 250));
    const d = db(); d.starts = d.starts || [];
    const pt = DEMO_POINTS.find(x => String(x.n) === String(p.p) && x.key === p.k);
    const person = d.people.find(x => x.id === p.id);
    switch (p.action) {
      case 'question': {
        if (!pt) return { ok: false, error: 'Цей QR-код недійсний. Відскануйте код ще раз.' };
        const out = { ok: true, total: DEMO_POINTS.length, limit: LIMIT, maxPoints: 100, point: { n: pt.n, topic: pt.topic, q: pt.q, options: pt.options } };
        if (person && !d.answers.find(a => a.id === person.id && a.n === pt.n)) {
          let s0 = d.starts.find(x => x.id === person.id && x.n === pt.n);
          if (!s0) { s0 = { id: person.id, n: pt.n, t: Date.now() }; d.starts.push(s0); save(d); }
          out.remaining = Math.max(0, LIMIT - Math.floor((Date.now() - s0.t) / 1000));
        }
        return out;
      }
      case 'register': {
        const cat = CATS[p.cat];
        if (!cat) return { ok: false, error: 'Оберіть: студент чи працівник ліцею' };
        if (!p.last || !p.first) return { ok: false, error: 'Вкажіть прізвище та ім’я' };
        if (p.cat === 'student' && !p.group) return { ok: false, error: 'Вкажіть групу' };
        const mine = d.people.filter(x => x.cat === cat);
        const same = mine.find(x => norm(x.last) === norm(p.last) && norm(x.first) === norm(p.first));
        if (same) return { ok: true, id: same.id, restored: true };
        if (!p.force) {
          const similar = mine.filter(x => lev(norm(x.last), norm(p.last)) + lev(norm(x.first), norm(p.first)) <= 2)
            .slice(0, 3).map(x => ({ id: x.id, name: x.last + ' ' + x.first, group: x.group }));
          if (similar.length) return { ok: false, similar };
        }
        const id = Math.random().toString(16).slice(2, 10);
        d.people.push({ id, last: p.last, first: p.first, cat, group: p.cat === 'student' ? p.group : '' });
        save(d); return { ok: true, id };
      }
      case 'answer': {
        if (!pt) return { ok: false, error: 'Цей QR-код недійсний.' };
        if (!person) return { ok: false, error: 'Учасника не знайдено', reRegister: true };
        const prev = d.answers.find(a => a.id === person.id && a.n === pt.n);
        if (prev) return { ok: true, already: true, correct: prev.ok, points: prev.pts, explain: pt.explain, progress: prog(d, person.id) };
        const s0 = d.starts.find(x => x.id === person.id && x.n === pt.n);
        const sec = Math.round((Date.now() - (s0 ? s0.t : Date.now())) / 1000);
        const late = Number(p.choice) === -1 || sec > LIMIT + 3;
        const ok = !late && Number(p.choice) === pt.correct;
        const pts = ok ? Math.round(50 + 50 * (LIMIT - Math.min(sec, LIMIT)) / LIMIT) : 0;
        d.answers.push({ id: person.id, n: pt.n, ok, pts, t: Date.now() }); save(d);
        return { ok: true, correct: ok, late, sec, points: pts, explain: pt.explain, progress: prog(d, person.id) };
      }
      case 'progress':
        if (!person) return { ok: false, error: 'Учасника не знайдено', reRegister: true };
        return { ok: true, name: person.first + ' ' + person.last, cat: person.cat, group: person.group, progress: prog(d, person.id) };
      case 'rating': {
        const list = d.people.map(x => {
          const a = d.answers.filter(y => y.id === x.id);
          const good = a.filter(y => y.ok);
          return { name: x.last + ' ' + x.first, cat: x.cat, sub: x.cat === 'Студенти' ? x.group : 'працівник ліцею',
                   points: a.reduce((s, y) => s + y.pts, 0), correct: good.length, answered: a.length, last: Math.max(0, ...good.map(y => y.t)) };
        }).filter(x => x.answered).sort((a, b) => b.points - a.points || b.correct - a.correct || a.last - b.last);
        const st = list.filter(x => x.cat === 'Студенти'), sf = list.filter(x => x.cat === 'Працівники');
        return { ok: true, total: DEMO_POINTS.length, students: st.slice(0, 10), staff: sf.slice(0, 10),
                 studentsCount: st.length, staffCount: sf.length, updated: new Date().toISOString() };
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
