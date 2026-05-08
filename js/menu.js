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