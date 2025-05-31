// =========== Signal Section ===========
const allowedPairs = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "EURAUD", "AUDJPY", "XAUUSD", "WTI"
];
const displayPairs = [
  "EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD", "USDCHF", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "EURAUD", "AUDJPY", "XAUUSD", "WTI"
];


const allSignals = [
  {
    provider: "Data Analitik 1",
    data: [
      { pair: "EURUSD", signal: "BUY", percent: 81 },
      { pair: "GBPUSD", signal: "SELL", percent: 72 },
      { pair: "XAUUSD", signal: "BUY", percent: 74 },
      { pair: "AUDUSD", signal: "SELL", percent: 73 },
      { pair: "WTI", signal: "BUY", percent: 78 },
      { pair: "USDJPY", signal: "BUY", percent: 73 },
      { pair: "EURJPY", signal: "BUY", percent: 75 }
    ]
  },
  {
    provider: "Data Analitik 2",
    data: [
      { pair: "EURUSD", signal: "BUY", percent: 78 },
      { pair: "AUDUSD", signal: "SELL", percent: 75 },
      { pair: "WTI", signal: "BUY", percent: 80 },
      { pair: "GBPJPY", signal: "SELL", percent: 70 },
      { pair: "GBPUSD", signal: "SELL", percent: 74 },
      { pair: "EURGBP", signal: "BUY", percent: 79 }
    ]
  },
];

const API_URL = "https://corsproxy.io/?https://www.myfxbook.com/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";



function getLiveIcon() {
  return `<span class="icon-live" title="Realtime Analytic">
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none"><rect x="2" y="6" width="3" height="9" rx="1.5" fill="#32b7ff"/><rect x="8" y="2" width="3" height="17" rx="1.5" fill="#32b7ff"/><rect x="15" y="9" width="3" height="6" rx="1.5" fill="#32b7ff"/></svg>
  </span>`;
}
function getSignalIcon() {
  return `<span style="margin-left:6px;vertical-align:-2px;">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 16a6 6 0 0 1 8.5 0" stroke="#FFA500" stroke-width="2.1" stroke-linecap="round"/><path d="M9.5 16.5a2 2 0 0 1 3 0" stroke="#FFA500" stroke-width="2.1" stroke-linecap="round"/><circle cx="11" cy="9.5" r="1.5" fill="#FFA500"/></svg>
  </span>`;
}

function renderSignals() {
  const container = document.getElementById('container');
  container.innerHTML = '';

  // Analitik cards
  allSignals.forEach(sig => {
    const card = document.createElement('div');
    card.className = 'card final-today';
    card.innerHTML = `<div class="card-title">
      ${getLiveIcon()}
      ${sig.provider}
    </div>
      <ul class="signal-list">
        ${displayPairs.map(pair => {
          const item = sig.data.find(i => i.pair === pair && allowedPairs.includes(i.pair) && i.percent >= 70);
          if (!item) return '';
          return `<li>
            <span>${item.pair}:</span>
            <span class="${item.signal === 'BUY' ? 'buy' : 'sell'}">
              ${item.signal} ${item.percent}%
            </span>
          </li>`;
        }).join('') || '<li style="color: #888;">No pairs meet the criteria.</li>'}
      </ul>`;
    container.appendChild(card);
  });

  // Final signal
  const final = document.createElement('div');
  final.className = 'card final-today';
  final.innerHTML = `<div class="card-title">Sinyal Hari Ini ${getSignalIcon()}</div>
    <ul class="signal-list">
      ${renderFinalSignal()}
    </ul>`;
  container.appendChild(final);
}

// Gabungan vote/rata-rata
function renderFinalSignal() {
  let html = '';
  displayPairs.forEach(pair => {
    let signals = [];
    allSignals.forEach(sig => {
      const found = sig.data.find(item => item.pair === pair && allowedPairs.includes(item.pair) && item.percent >= 70);
      if (found) signals.push(found);
    });
    if (signals.length > 0) {
      let buy = signals.filter(s => s.signal === "BUY");
      let sell = signals.filter(s => s.signal === "SELL");
      let finalSignal = buy.length >= sell.length ? "BUY" : "SELL";
      let relevantSignals = signals.filter(s => s.signal === finalSignal);
      let avgPercent = Math.round(
        relevantSignals.reduce((a, b) => a + b.percent, 0) / relevantSignals.length
      );
      html += `
        <li>
          <span>${pair}:</span>
          <span class="${finalSignal === 'BUY' ? 'buy' : 'sell'}">${finalSignal} ${avgPercent}%</span>
        </li>
      `;
    }
  });
  if (!html) html = '<li style="color: #888;">No pairs meet the criteria.</li>';
  return html;
}

renderSignals();

// ========== PROMO SLIDES (SUPABASE) ==========
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabaseUrl = 'https://vyeyrkrzgdpemqfnrjle.supabase.co'; // ganti dengan milikmu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZXlya3J6Z2RwZW1xZm5yamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODQ4NjksImV4cCI6MjA2NDI2MDg2OX0.0J26OpBV61eEioOg9t63wASpM-q0N9o72PPnmHYL_Zg';    // ganti dengan milikmu
const supabase = createClient(supabaseUrl, supabaseKey);

async function loadSlides() {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('created_at', { ascending: false });
  const promoBox = document.getElementById('promoSlidesBox');
  const container = document.getElementById('slidePromoList');
  if (error || !data || !Array.isArray(data) || !container) {
    promoBox.style.display = 'none';
    return;
  }
  if (!data.length) {
    promoBox.style.display = 'none';
    return;
  }
  promoBox.style.display = '';
  container.innerHTML = data.map(s => `
    <div class="swiper-slide" style="display:flex;flex-direction:column;">
      <b style="color:#fff;font-size:1.09em;margin-bottom:0.25em;">${s.title}</b>
      <div style="color:#cddfff;font-size:1em;margin-bottom:0.5em;">${s.desc}</div>
      ${s.image_url ? `<img src="${s.image_url}" loading="lazy">` : ""}
      <div class="promo-date" style="margin-top:auto;font-size:0.96em;color:#9fb5c9;">${new Date(s.created_at).toLocaleString()}</div>
    </div>
  `).join('');

  new Swiper('.promo-swiper', {
    loop: data.length > 1,
    autoplay: data.length > 1 ? { delay: 15000, disableOnInteraction: false } : false,
    pagination: { el: '.swiper-pagination', clickable: true },
    slidesPerView: 1,
    spaceBetween: 12,
    centeredSlides: true,
    allowTouchMove: true
  });
}
window.addEventListener('DOMContentLoaded', loadSlides);
