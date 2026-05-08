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
      headers: { 'X-MICROCMS-API-KEY': 'vUCco7aGEoT99Og7rLtsUBhL9JKY9C3WvIm5' }
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