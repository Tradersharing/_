import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ============== SUPABASE SETUP ==============
const supabaseUrl = 'https://vyeyrkrzgdpemqfnrjle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZXlya3J6Z2RwZW1xZm5yamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODQ4NjksImV4cCI6MjA2NDI2MDg2OX0.0J26OpBV61eEioOg9t63wASpM-q0N9o72PPnmHYL_Zg';
const supabase = createClient(supabaseUrl, supabaseKey);

// ========== PAIR UTAMA ==========
// Pair mayor, minor, XAUUSD, WTI, OIL
const PAIR_UMUM = [
  "EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD", "USDCHF", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "EURAUD", "AUDJPY",
  "XAUUSD", "WTIUSD", "OILUSD"
];

// ========== SLIDE PROMOSI ==========
async function loadSlides() {
  // Ganti dengan supabase slide Anda
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('created_at', { ascending: false });
  const container = document.getElementById('slidePromoList');
  if (error || !data) {
    container.innerHTML = `<div class="slide-empty">Error: ${error?.message || 'Gagal memuat slide'}</div>`;
    return;
  }
  if (!data.length) {
    container.innerHTML = `<div class="slide-empty">Belum ada slide promosi.</div>`;
    return;
  }
  container.innerHTML = data.map(s => `
    <div class="swiper-slide">
      <div style="font-weight:bold;color:#155fa0;font-size:1.05em;margin-bottom:0.3em;">${s.title || ''}</div>
      <div style="color:#344b66;font-size:1em;margin-bottom:0.4em;">${s.desc || ''}</div>
      ${s.image_url ? `<img src="${s.image_url}" loading="lazy">` : ""}
      <div style="margin-top:auto;font-size:0.96em;color:#7fa8c9;">${new Date(s.created_at).toLocaleString()}</div>
    </div>
  `).join('');

  // Swiper promo
  new Swiper('.promo-swiper', {
    loop: data.length > 1,
    autoplay: data.length > 1 ? { delay: 15000, disableOnInteraction: false } : false,
    pagination: { el: '.promo-swiper .swiper-pagination', clickable: true },
    navigation: { nextEl: '.promo-swiper .swiper-button-next', prevEl: '.promo-swiper .swiper-button-prev' },
    slidesPerView: 1,
    spaceBetween: 20,
    centeredSlides: true,
    allowTouchMove: true
  });
}

// ========== SINYAL & ANALITIK CARD ==========
const API_MFXB = "https://corsproxy.io/?https://www.myfxbook.com/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

function normalizePair(pair) {
  let norm = pair.replace(/\W/g, '').toUpperCase();
  if (norm === "GOLD" || norm === "XAUUSD") return "XAUUSD";
  if (norm === "OIL" || norm === "WTI" || norm === "WTIUSD" || norm === "OILUSD") return "WTIUSD";
  return norm;
}

async function fetchAnalitik1() {
  try {
    const res = await fetch(API_MFXB);
    const json = await res.json();
    const symbols = Array.isArray(json.symbols) ? json.symbols : [];
    const data = symbols
      .filter(s => typeof s.longPercentage === "number" && typeof s.shortPercentage === "number")
      .map(s => {
        const normPair = normalizePair(s.name);
        return {
          pair: normPair,
          signal: s.longPercentage >= s.shortPercentage ? "BUY" : "SELL",
          percent: Math.max(s.longPercentage, s.shortPercentage)
        };
      })
      .filter(item => PAIR_UMUM.includes(item.pair)); // Filter pair mayor/minor/XAUUSD/WTI saja
    renderAnalitikCards(data);
  } catch (err) {
    document.getElementById('sinyalCards').innerHTML = `<div style="color:red">Gagal ambil data Myfxbook: ${err}</div>`;
    renderAnalitikCards([]); // Tampilkan card kosong jika gagal
  }
}

function renderAnalitikCards(analitik1 = []) {
  const container = document.getElementById('sinyalCards');
  container.innerHTML = '';

  // Analitik 1: Myfxbook
  const card1 = document.createElement('div');
  card1.className = 'card';
  card1.innerHTML = `<div class="card-title">Analitik 1</div>
    <div class="api-url">Sumber: <a href="https://www.myfxbook.com/community/outlook" target="_blank" rel="noopener">myfxbook.com</a></div>
    <ul class="signal-list">
      ${
        analitik1.length
        ? PAIR_UMUM.map(pair => {
          const item = analitik1.find(i => i.pair === pair && i.percent >= 70);
          if (!item) return '';
          return `<li>
            <span>${item.pair}</span>
            <span class="${item.signal === 'BUY' ? 'buy' : 'sell'}">${item.signal} ${item.percent}%</span>
          </li>`;
        }).join('') || '<li class="info-empty">Tidak ada pair mayor/minor dengan sinyal kuat (&ge;70%)</li>'
        : '<li class="info-empty">Gagal memuat atau data kosong.</li>'
      }
    </ul>`;
  container.appendChild(card1);

  // Analitik 2: Placeholder
  const card2 = document.createElement('div');
  card2.className = 'card';
  card2.innerHTML = `<div class="card-title">Analitik 2</div>
    <div class="api-url">Sumber: <span style="color:#888">[Disiapkan]</span></div>
    <ul class="signal-list">
      <li class="info-empty">Belum tersedia.</li>
    </ul>`;
  container.appendChild(card2);

  // Sinyal harian gabungan
  const card3 = document.createElement('div');
  card3.className = 'card final-today';
  card3.innerHTML = `<div class="card-title">Sinyal Hari Ini</div>
    <ul class="signal-list">
      ${
        analitik1.length
        ? PAIR_UMUM.map(pair => {
          const item = analitik1.find(i => i.pair === pair && i.percent >= 70);
          if (item) {
            return `<li>
              <span>${item.pair}</span>
              <span class="${item.signal === 'BUY' ? 'buy' : 'sell'}">${item.signal} ${item.percent}%</span>
            </li>`;
          }
          return '';
        }).join('') || '<li class="info-empty">Tidak ada sinyal kuat hari ini.</li>'
        : '<li class="info-empty">Belum ada data.</li>'
      }
    </ul>`;
  container.appendChild(card3);
}

// ========== POSTING ADMIN ==========
async function loadPostsBox() {
  const section = document.getElementById('postsSection');
  const container = document.getElementById('postsBox');
  if (!container) return;
  container.innerHTML = '<div class="no-post">Memuat postingan...</div>';
  section.style.display = 'none';

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error || !data) {
    container.innerHTML = `<div class="no-post" style="color:red;">Gagal load posting: ${error?.message || 'Unknown error'}</div>`;
    section.style.display = '';
    return;
  }
  if (!data.length) {
    container.innerHTML = `<div class="no-post">Belum ada posting dari admin.</div>`;
    section.style.display = 'none';
    return;
  }
  container.innerHTML = data.map(post => `
    <div class="swiper-slide post-card" data-id="${post.id}">
      <div class="card-title">
        <b>${post.author || 'Admin'}</b>
        <span style="color:#7fa8c9;font-weight:normal;font-size:0.97em;margin-left:0.8em;">${new Date(post.timestamp).toLocaleString()}</span>
      </div>
      <div style="margin-bottom:0.2em;">${post.content}</div>
      ${post.canDelete ? `<button onclick="deletePost(${post.id})">Hapus</button>` : ""}
    </div>
  `).join('');
  section.style.display = '';

  // Swiper posting admin
  setTimeout(() => {
    if (window.postsSwiper) window.postsSwiper.destroy(true, true);
    window.postsSwiper = new Swiper('.posts-swiper', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop: data.length > 1,
      autoplay: data.length > 1 ? { delay: 15000, disableOnInteraction: false } : false,
      pagination: { el: '.posts-swiper .swiper-pagination', clickable: true },
      navigation: { nextEl: '.posts-swiper .swiper-button-next', prevEl: '.posts-swiper .swiper-button-prev' },
      slidesPerView: 1,
      spaceBetween: 20,
      allowTouchMove: true,
      observeParents: true,
      observer: true
    });
  }, 100);
}

window.deletePost = async function(id) {
  if (!confirm('Hapus postingan ini?')) return;
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (!error) loadPostsBox();
  else alert('Gagal hapus: ' + error.message);
};

// ========== INISIALISASI ==========
loadSlides();
fetchAnalitik1();
loadPostsBox();

// ========== MENU BURGER SIAP ==========
document.getElementById('burgerBtn').addEventListener('click', () => {
  alert('Menu akan segera tersedia!');
});
