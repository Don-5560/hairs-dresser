/* =====================
  ハンバーガーメニューの開閉
  
  やってること：
  1. ハンバーガーボタンをクリック
  2. "open"クラスを付ける/外す
  3. CSSで表示/非表示が切り替わる
===================== */

// ボタンとメニューの要素を取得
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

// ハンバーガーボタンをクリックしたとき
hamburger.addEventListener('click', function() {

  // すでに開いているか確認
  const isOpen = mobileMenu.classList.contains('open');

  if (isOpen) {
    // 開いていたら閉じる
    closeMenu();
  } else {
    // 閉じていたら開く
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden'; // スクロール禁止
  }

});

// メニューを閉じる関数（HTMLのonclick=""からも呼ばれる）
function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = ''; // スクロール解除
}


/* =====================
  microCMS からイベントを取得して表示
===================== */
async function loadEvents() {
  const list = document.querySelector('.event-list');
  if (!list) return;

  try {
    const res = await fetch('https://zjf3r5fchx.microcms.io/api/v1/events?orders=-date', {
      headers: { 'X-MICROCMS-API-KEY': 'y5YS0lD3Y97Bj8iwQ1cECeGjOeYpqX1UCmbn' }
    });
    const data = await res.json();

    if (data.contents.length === 0) {
      list.innerHTML = '<li style="padding:28px 0; color:#6b6b6b;">現在お知らせはありません。</li>';
      return;
    }

    list.innerHTML = data.contents.map(event => {
      const d = new Date(event.date);
      const formatted = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      const datetime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return `
        <li class="event-item">
          <div class="event-meta">
            <time class="event-date" datetime="${datetime}">${formatted}</time>
            <span class="event-tag">EVENT</span>
          </div>
          <p class="event-title">${event.title}</p>
        </li>
      `;
    }).join('');

  } catch (e) {
    console.error('イベントの取得に失敗しました', e);
  }
}

loadEvents();


/* =====================
  定休日カレンダー
  定休日ルール：
  - 毎週月曜
  - 第1・第3日曜
  - 第2・第4火曜
  - 第5週がある月は5回目の月・火も休み
===================== */
(function () {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();

  function getDaysOfWeekInMonth(y, m, dow) {
    const days = [];
    const d = new Date(y, m, 1);
    while (d.getMonth() === m) {
      if (d.getDay() === dow) days.push(d.getDate());
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  function isClosed(y, m, d) {
    const dow = new Date(y, m, d).getDay();
    const mondays  = getDaysOfWeekInMonth(y, m, 1);
    const tuesdays = getDaysOfWeekInMonth(y, m, 2);
    const sundays  = getDaysOfWeekInMonth(y, m, 0);

    if (dow === 1) return true; // 毎週月曜
    if (dow === 0 && (sundays.indexOf(d) === 0 || sundays.indexOf(d) === 2)) return true; // 第1・3日曜
    if (dow === 2 && (tuesdays.indexOf(d) === 1 || tuesdays.indexOf(d) === 3)) return true; // 第2・4火曜
    if (mondays.length >= 5) {
      if (dow === 2 && tuesdays.length >= 5 && tuesdays.indexOf(d) === 4) return true; // 第5火曜
    }
    return false;
  }

  function render() {
    const title = document.getElementById('cal-title');
    const grid  = document.getElementById('cal-grid');
    if (!title || !grid) return;

    title.textContent = `${year}年${month + 1}月`;

    const firstDow    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < firstDow; i++) html += '<div class="cal-cell cal-empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(year, month, d).getDay();
      let cls = 'cal-cell';
      if (isClosed(year, month, d)) cls += ' cal-closed';
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === d) cls += ' cal-today';
      if (dow === 0) cls += ' cal-sun';
      if (dow === 6) cls += ' cal-sat';
      html += `<div class="${cls}">${d}</div>`;
    }
    grid.innerHTML = html;
  }

  document.getElementById('cal-prev')?.addEventListener('click', () => {
    month--; if (month < 0) { month = 11; year--; } render();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    month++; if (month > 11) { month = 0; year++; } render();
  });

  render();
})();