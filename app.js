// ====================== SUPABASE POSTING ADMIN =========================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = 'https://vyeyrkrzgdpemqfnrjle.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZXlya3J6Z2RwZW1xZm5yamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODQ4NjksImV4cCI6MjA2NDI2MDg2OX0.0J26OpBV61eEioOg9t63wASpM-q0N9o72PPnmHYL_Zg';
const supabase = createClient(supabaseUrl, supabaseKey);

// ====================== Kode Pair dan Mapping Sinyal =========================
const PAIR_MAP = {
  'EUR/USD': 'EURUSD', 'USD/JPY': 'USDJPY', 'GBP/USD': 'GBPUSD', 'AUD/USD': 'AUDUSD',
  'USD/CHF': 'USDCHF', 'NZD/USD': 'NZDUSD', 'USD/CAD': 'USDCAD',
  'EUR/JPY': 'EURJPY', 'EUR/GBP': 'EURGBP', 'EUR/AUD': 'EURAUD', 'EUR/CHF': 'EURCHF',
  'EUR/CAD': 'EURCAD', 'EUR/NZD': 'EURNZD',
  'GBP/JPY': 'GBPJPY', 'GBPAUD': 'GBPAUD', 'GBP/CHF': 'GBPCHF', 'GBP/CAD': 'GBPCAD', 'GBP/NZD': 'GBPNZD',
  'AUD/JPY': 'AUDJPY', 'AUD/NZD': 'AUDNZD', 'AUD/CAD': 'AUDCAD', 'AUD/CHF': 'AUDCHF',
  'NZD/JPY': 'NZDJPY', 'NZD/CAD': 'NZDCAD', 'NZD/CHF': 'NZDCHF',
  'CAD/JPY': 'CADJPY', 'CAD/CHF': 'CADCHF',
  'CHF/JPY': 'CHFJPY',
  'XAU/USD': 'XAUUSD', 'WTI/USD': 'WTIUSD', 'OIL/USD': 'OILUSD', 'US30': 'US30'
};
let displayPairs = [
  "EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD", "USDCHF", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "EURAUD", "AUDJPY", "XAUUSD", "WTIUSD"
];

// ====================== API Myfxbook (Analitik 1) ====================
const API_URL = "https://corsproxy.io/?https://www.myfxbook.com/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";
function normalizePair(pair) {
  if (PAIR_MAP[pair]) return PAIR_MAP[pair];
  if (/^[A-Z0-9]{6,}$/.test(pair)) return pair;
  return pair.replace(/\W/g, "").toUpperCase();
}
async function fetchMyfxbookData() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const symbols = json.symbols || [];
    const dataAnalitik1 = symbols
      .filter(s => s.name && typeof s.longPercentage === "number" && typeof s.shortPercentage === "number")
      .map(s => {
        const normPair = normalizePair(s.name);
        if (!displayPairs.includes(normPair)) displayPairs.push(normPair);
        return {
          pair: normPair,
          signal: s.longPercentage >= s.shortPercentage ? "BUY" : "SELL",
          percent: Math.max(s.longPercentage, s.shortPercentage)
        };
      });
    renderSignals(dataAnalitik1);
  } catch (err) {
    document.getElementById("container").innerHTML = `<div style="color:red">Gagal ambil data Myfxbook: ${err}</div>`;
    console.error(err);
  }
}

// ====================== Analitik 2 Placeholder =======================
function getAnalitik2Placeholder() {
  return {
    provider: "Data Analitik 2",
    data: [],
    is_placeholder: true
  };
}
// ====================== Ikon =====================
function getLiveIcon() {
  return `<span class="icon-live" title="Realtime Analytic">
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none"><rect x="2" y="6" width="3" height="9" rx="1.5" fill="#32b7ff"/><rect x="8" y="2" width="3" height="17" rx="1.5" fill="#32b7ff"/><rect x="16" y="8" width="3" height="5" rx="1.5" fill="#32b7ff"/></svg>
  </span>`;
}
function getSignalIcon() {
  return `<span style="margin-left:6px;vertical-align:-2px;">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 16a6 6 0 0 1 8.5 0" stroke="#FFA500" stroke-width="2.1" stroke-linecap="round"/><path d="M9.5 16.5a2 2 0 0 1 3 0" stroke="#FFA500" stroke-width="2.1" stroke-linecap="round"/><circle cx="11" cy="18" r="1" fill="#FFA500"/></svg>
  </span>`;
}

// ===================== Render Signals ================================
function renderSignals(dataAnalitik1 = []) {
  const container = document.getElementById('container');
  container.innerHTML = '';

  // Analitik 1 (Myfxbook)
  const card1 = document.createElement('div');
  card1.className = 'card';
  card1.innerHTML = `<div class="card-title">
    ${getLiveIcon()} Data Analitik 1 (Myfxbook)
    <div class="api-url">API: <a href="${API_URL}" target="_blank">${API_URL}</a></div>
  </div>
    <ul class="signal-list">
      ${displayPairs.map(pair => {
        const item = dataAnalitik1.find(i => i.pair === pair && i.percent >= 70);
        if (!item) return '';
        return `<li>
          <span>${item.pair}:</span>
          <span class="${item.signal === 'BUY' ? 'buy' : 'sell'}">
            ${item.signal} ${item.percent}%
          </span>
        </li>`;
      }).join('') || '<li style="color: #888;">No pairs meet the criteria.</li>'}
    </ul>`;
  container.appendChild(card1);

  // Analitik 2 (Placeholder)
  const analitik2 = getAnalitik2Placeholder();
  const card2 = document.createElement('div');
  card2.className = 'card';
  card2.innerHTML = `<div class="card-title">
    ${getLiveIcon()} Data Analitik 2
    <div class="api-url">API: Masukkan API/anda di sini</div>
  </div>
    <ul class="signal-list">
      <li style="color:#888;">Memuat sinyal...</li>
    </ul>`;
  container.appendChild(card2);

  // Kolom final gabungan
  const final = document.createElement('div');
  final.className = 'card final-today';
  final.innerHTML = `<div class="card-title">Sinyal Hari Ini ${getSignalIcon()}</div>
    <ul class="signal-list">
      ${renderFinalSignal(dataAnalitik1)}
    </ul>`;
  container.appendChild(final);
}

// Gabungan vote/rata-rata hanya dari Analitik 1 untuk saat ini
function renderFinalSignal(dataAnalitik1 = []) {
  let html = '';
  displayPairs.forEach(pair => {
    const item = dataAnalitik1.find(i => i.pair === pair && i.percent >= 70);
    if (item) {
      html += `
        <li>
          <span>${pair}:</span>
          <span class="${item.signal === 'BUY' ? 'buy' : 'sell'}">${item.signal} ${item.percent}%</span>
        </li>
      `;
    }
  });
  if (!html) html = '<li style="color: #888;">No pairs meet the criteria.</li>';
  return html;
}

// ===================== Posting Admin Box (SLIDESHOW/FADE) =========================
async function loadPostsBox() {
  const container = document.getElementById('postsBox');
  if (!container) return;
  container.innerHTML = '<div style="color:#888;">Memuat postingan...</div>';

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error || !data) {
    container.innerHTML = `<div style="color:red;">Gagal load posting: ${error?.message || 'Unknown error'}</div>`;
    return;
  }
  if (!data.length) {
    container.innerHTML = `<i>Tidak ada postingan dari admin.</i>`;
    return;
  }
  container.innerHTML = data.map(post => `
    <div class="swiper-slide post-card" data-id="${post.id}">
      <div class="card-title">
        <b>${post.author || 'Admin'}</b> 
        <span style="color:#9fb5c9;font-weight:normal;font-size:0.97em;margin-left:0.75em;">${new Date(post.timestamp).toLocaleString()}</span>
      </div>
      <div style="margin-bottom:0.5em;">${post.content}</div>
      ${post.canDelete ? `<button onclick="deletePost(${post.id})">Hapus</button>` : ""}
    </div>
  `).join('');

  // Inisialisasi Swiper dengan fade effect & delay 15s jika postingan > 1
  setTimeout(() => {
    if (window.postSwiper) window.postSwiper.destroy(true, true);
    window.postSwiper = new Swiper('.post-swiper', {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop: data.length > 1,
      autoplay: data.length > 1 ? { delay: 15000, disableOnInteraction: false } : false,
      pagination: { el: '.post-swiper .swiper-pagination', clickable: true },
      navigation: { nextEl: '.post-swiper .swiper-button-next', prevEl: '.post-swiper .swiper-button-prev' },
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

// ===================== Load Slide Promosi (Tetap) =========================
import { createClient as createClientSlides } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrlSlides = 'https://oaatowhxrefpjlwucvvg.supabase.co'
const supabaseKeySlides = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYXRvd2h4cmVmcGpsd3VjdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzgzMDQsImV4cCI6MjA2NDAxNDMwNH0.-Qf6y5JiWVx2P6b6Y6LqR1q4pRjywH2E2-9F4kWm3f0'
const supabaseSlides = createClientSlides(supabaseUrlSlides, supabaseKeySlides)

async function loadSlides() {
  const { data, error } = await supabaseSlides
    .from('slides')
    .select('*')
    .order('created_at', { ascending: false })
  const container = document.getElementById('slidePromoList')
  if (error) {
    container.innerHTML = `<div class="slide-empty">Error: ${error.message}</div>`
    return
  }
  if (!data.length) {
    container.innerHTML = `<div class="slide-empty">Belum ada slide promosi.</div>`
    return
  }
  container.innerHTML = data.map(s => `
    <div class="swiper-slide">
      <b>${s.title}</b><br>
      <div>${s.desc}</div>
      ${s.image_url ? `<img src="${s.image_url}" loading="lazy">` : ""}
      <small style="margin-top:auto;">${new Date(s.created_at).toLocaleString()}</small>
    </div>
  `).join('')

  // Inisialisasi Swiper setelah slides ter-load
  new Swiper('.swiper', {
    loop: data.length > 1, // Loop hanya jika lebih dari 1 slide
    autoplay: data.length > 1 ? { delay: 15000, disableOnInteraction: false } : false, // 15 detik otomatis geser
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    slidesPerView: 1,
    spaceBetween: 20,
    centeredSlides: true,
    allowTouchMove: true,
    // Responsive
    breakpoints: {
      700: { slidesPerView: 1 }
    }
  })
}

// ===================== Eksekusi Awal =============================
loadSlides();
fetchMyfxbookData();
loadPostsBox();
