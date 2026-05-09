/* =====================
  Firebase 初期化
===================== */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCIbgCMSevcE1tteOv35ZFpFG57Yt6CPJ8",
  authDomain: "hairs-dresser.firebaseapp.com",
  projectId: "hairs-dresser",
  storageBucket: "hairs-dresser.firebasestorage.app",
  messagingSenderId: "298877912322",
  appId: "1:298877912322:web:1b3f08f2bb4a57b4f12e1b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =====================
  ハンバーガーメニューの開閉
===================== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', function() {
  const isOpen = mobileMenu.classList.contains('open');
  if (isOpen) {
    closeMenu();
  } else {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
});

// HTMLのonclickから呼べるようにグローバルに公開
function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeMenu = closeMenu;


/* =====================
  Firestore から NEWS を取得して表示
===================== */
async function loadNews() {
  const list = document.querySelector('.event-list');
  if (!list) return;

  try {
    const q = query(collection(db, 'news'), orderBy('date', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      list.innerHTML = '<li style="padding:28px 0; color:#6b6b6b;">現在お知らせはありません。</li>';
      return;
    }

    list.innerHTML = snap.docs.map(doc => {
      const d = doc.data();
      // YYYY-MM-DD 形式の日付を表示用に変換
      const parts = d.date.split('-');
      const formatted = parts.length === 3
        ? `${parts[0]}.${parts[1]}.${parts[2]}`
        : d.date;
      return `
        <li class="event-item">
          <div class="event-meta">
            <time class="event-date" datetime="${d.date}">${formatted}</time>
            <span class="event-tag">NEWS</span>
          </div>
          <p class="event-title">${d.title}</p>
        </li>`;
    }).join('');

  } catch (e) {
    console.error('NEWSの取得に失敗しました', e);
  }
}

loadNews();


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

    if (dow === 1) return true;
    if (dow === 0 && (sundays.indexOf(d) === 0 || sundays.indexOf(d) === 2)) return true;
    if (dow === 2 && (tuesdays.indexOf(d) === 1 || tuesdays.indexOf(d) === 3)) return true;
    if (mondays.length >= 5) {
      if (dow === 2 && tuesdays.length >= 5 && tuesdays.indexOf(d) === 4) return true;
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
