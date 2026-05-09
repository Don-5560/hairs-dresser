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

const catOrder = ['cut', 'color', 'perm', 'treatment', 'spa'];

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

  const setSection = menuContent.querySelector('#set');

  // 既存セクション（#set 以外）を削除
  menuContent.querySelectorAll('.menu-section:not(#set)').forEach(el => el.remove());

  try {
    // ← orderByを1つだけにしてインデックスエラー回避、JS側でソート
    const snap = await getDocs(collection(db, 'menu'));

    if (snap.empty) {
      console.log('メニューデータがありません');
      return;
    }

    // 全件取得してJS側でソート
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    items.sort((a, b) => {
      const ci = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      if (ci !== 0) return ci;
      return (a.order || 0) - (b.order || 0);
    });

    // カテゴリーごとにグループ化
    const groups = {};
    items.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });

    // セクションを生成
    catOrder.forEach(cat => {
      const catItems = groups[cat];
      if (!catItems || catItems.length === 0) return;
      const info = categoryMap[cat];

      const rows = catItems.map(item => {
        const badge = item.badge
          ? `<span class="menu-row-badge${item.badge === '人気' ? ' popular' : ''}">${item.badge}</span>`
          : '';
        const small = item.smallDesc ? `<small>${item.smallDesc}</small>` : '';
        return `
          <li class="menu-row">
            <div class="menu-row-name">${item.name}${small}</div>
            ${badge}
            <span class="menu-row-time">${item.time || ''}</span>
            <div class="menu-row-price">${item.price || ''}</div>
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

    // セットメニューを読み込む
    await loadSetMenu();

  } catch (e) {
    console.error('メニュー読み込みエラー:', e);
  }
}

async function loadSetMenu() {
  const setSection = document.querySelector('#set');
  if (!setSection) return;

  try {
    const snap = await getDocs(collection(db, 'setmenu'));
    if (snap.empty) return;

    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    const setGrid = setSection.querySelector('.set-grid');
    if (!setGrid) return;
    setGrid.innerHTML = '';

    items.forEach(d => {
      const detail = (d.detail || '').replace(/\n/g, '<br>');
      setGrid.innerHTML += `
        <div class="set-card">
          <span class="set-card-badge new">新規限定</span>
          <p class="set-card-name">${d.name}</p>
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
window.closeMenu = closeMenu;


/* =====================
  カテゴリーナビ：クリックでスクロール
===================== */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 100;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}
window.scrollToSection = scrollToSection;


/* =====================
  スクロールでカテゴリーナビのアクティブを自動更新
===================== */
const sections = ['cut', 'color', 'perm', 'treatment', 'spa', 'set'];

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.cat-btn').forEach((btn, i) => {
    btn.classList.toggle('active', sections[i] === current);
  });
});
