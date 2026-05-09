/* =====================
  Firebase からメニューを動的に読み込む
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

const categoryMap = {
  cut:       { id: 'cut',       num: '01', en: 'Cut',       ja: 'カット',        desc: '骨格に合わせた似合わせカット<br>伸びても崩れないスタイルへ' },
  color:     { id: 'color',     num: '02', en: 'Color',     ja: 'カラー',        desc: '髪と頭皮を守る最高峰のケアカラー<br>染めるたびに美しい艶髪へ' },
  perm:      { id: 'perm',      num: '03', en: 'Perm',      ja: 'パーマ',        desc: 'ふんわり・しっかり<br>ご希望のウェーブへ' },
  treatment: { id: 'treatment', num: '04', en: 'Treatment', ja: 'トリートメント', desc: 'うるツヤになれる厳選トリートメント<br>パサつき・ダメージをしっかりケア' },
  spa:       { id: 'spa',       num: '05', en: 'Head Spa',  ja: 'ヘッドスパ',    desc: '頭〜肩までのマッサージサービス<br>育毛・頭皮ケアに' },
};

async function loadMenu() {
  const menuContent = document.querySelector('.menu-content');
  if (!menuContent) return;

  // カテゴリーナビは残す
  const catNav = menuContent.querySelector('.category-nav');

  // 既存セクション（#set 以外）を削除してから再描画
  menuContent.querySelectorAll('.menu-section:not(#set)').forEach(el => el.remove());

  try {
    const q = query(collection(db, 'menu'), orderBy('category'), orderBy('order'));
    const snap = await getDocs(q);

    // カテゴリーごとにグループ化
    const groups = {};
    snap.forEach(doc => {
      const d = doc.data();
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    });

    // セクションを順番に挿入（#set の前に）
    const setSection = menuContent.querySelector('#set');
    const order = ['cut', 'color', 'perm', 'treatment', 'spa'];

    order.forEach(cat => {
      const items = groups[cat];
      if (!items || items.length === 0) return;
      const info = categoryMap[cat];

      const rows = items.map(item => {
        const badge = item.badge
          ? `<span class="menu-row-badge${item.badge === '人気' ? ' popular' : ''}">${item.badge}</span>`
          : '';
        const small = item.smallDesc ? `<small>${item.smallDesc}</small>` : '';
        return `
          <li class="menu-row">
            <div class="menu-row-name">${item.name}${small}</div>
            ${badge}
            <span class="menu-row-time">${item.time || ''}</span>
            <div class="menu-row-price">${item.price}</div>
          </li>`;
      }).join('');

      const section = document.createElement('section');
      section.className = 'menu-section';
      section.id = info.id;
      section.innerHTML = `
        <div class="menu-section-header">
          <span class="menu-section-num">${info.num}</span>
          <h2 class="menu-section-title">${info.en} <em>${info.ja}</em></h2>
          <p class="menu-section-desc">${info.desc}</p>
        </div>
        <ul class="menu-list">${rows}</ul>`;

      menuContent.insertBefore(section, setSection);
    });

    // セットメニューを動的に読み込む
    await loadSetMenu();

  } catch (e) {
    console.error('メニュー読み込みエラー:', e);
  }
}

async function loadSetMenu() {
  const setSection = document.querySelector('#set');
  if (!setSection) return;

  try {
    const q = query(collection(db, 'setmenu'), orderBy('order'));
    const snap = await getDocs(q);
    if (snap.empty) return;

    const setGrid = setSection.querySelector('.set-grid');
    if (!setGrid) return;
    setGrid.innerHTML = '';

    snap.forEach(doc => {
      const d = doc.data();
      const detail = (d.detail || '').replace(/\n/g, '<br>');
      setGrid.innerHTML += `
        <div class="set-card">
          <span class="set-card-badge new">新規限定</span>
          <p class="set-card-name">${d.name.replace(/\+/g, '+<br>').replace(/＋/g, '＋<br>')}</p>
          <p class="set-card-detail">${detail}</p>
          <div class="set-card-price-wrap">
            <span class="set-card-price-old">${d.priceOld}</span>
            <span class="set-card-price-new">${d.priceNew}</span>
          </div>
          <p class="set-card-price-note">${d.note}</p>
        </div>`;
    });
  } catch (e) {
    console.error('セットメニュー読み込みエラー:', e);
  }
}

loadMenu();

/* =====================
  ハンバーガーメニューの開閉
===================== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', function () {
  const isOpen = mobileMenu.classList.contains('open');

  if (isOpen) {
    closeMenu();
  } else {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
});

function closeMenu() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}


/* =====================
  カテゴリーナビ：クリックでスクロール
===================== */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const offset = 100; // ナビの高さ分
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });

  // クリックしたボタンをアクティブに
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}


/* =====================
  スクロールでカテゴリーナビのアクティブを自動更新
===================== */
const sections = ['cut', 'color', 'perm', 'treatment', 'spa', 'set'];

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.scrollY >= el.offsetTop - 120) {
      current = id;
    }
  });

  document.querySelectorAll('.cat-btn').forEach((btn, i) => {
    btn.classList.toggle('active', sections[i] === current);
  });
});