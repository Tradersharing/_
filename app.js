const PAIR_MAP = {
  'EUR/USD': 'EURUSD', 'USD/JPY': 'USDJPY', 'GBP/USD': 'GBPUSD', 'AUD/USD': 'AUDUSD',
  'USD/CHF': 'USDCHF', 'NZD/USD': 'NZDUSD', 'USD/CAD': 'USDCAD',
  'EUR/JPY': 'EURJPY', 'EUR/GBP': 'EURGBP', 'EUR/AUD': 'EURAUD', 'EUR/CHF': 'EURCHF',
  'EUR/CAD': 'EURCAD', 'EUR/NZD': 'EURNZD',
  'GBP/JPY': 'GBPJPY', 'GBP/AUD': 'GBPAUD', 'GBP/CHF': 'GBPCHF', 'GBP/CAD': 'GBPCAD', 'GBP/NZD': 'GBPNZD',
  'AUD/JPY': 'AUDJPY', 'AUD/NZD': 'AUDNZD', 'AUD/CAD': 'AUDCAD', 'AUD/CHF': 'AUDCHF',
  'NZD/JPY': 'NZDJPY', 'NZD/CAD': 'NZDCAD', 'NZD/CHF': 'NZDCHF',
  'CAD/JPY': 'CADJPY', 'CAD/CHF': 'CADCHF',
  'CHF/JPY': 'CHFJPY',
  'XAU/USD': 'XAUUSD', 'WTI/USD': 'WTIUSD', 'OIL/USD': 'OILUSD', 'US30': 'US30'
};

const PAIR_UMUM = [
  "EURUSD", "USDJPY", "GBPUSD", "AUDUSD", "USDCHF", "NZDUSD", "USDCAD",
  "EURJPY", "EURGBP", "EURCHF", "EURCAD", "EURAUD", "EURNZD",
  "GBPJPY", "GBPAUD", "GBPCHF", "GBPCAD", "GBPNZD",
  "AUDJPY", "AUDNZD", "AUDCAD", "AUDCHF",
  "NZDJPY", "NZDCAD", "NZDCHF",
  "CADJPY", "CADCHF", "CHFJPY",
  "XAUUSD", "WTIUSD", "OILUSD", "US30"
];

const API_URL = "https://corsproxy.io/?https://www.myfxbook.com/api/get-community-outlook.json?session=9UtvFTG9S31Z4vO1aDW31671626";

async function fetchMyfxbookData() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const data = (json.symbols || []).map(s => ({
      name: s.name,
      buy: s.longPercentage,
      sell: s.shortPercentage
    }));
    renderKotakAnomali(data);
    renderKotakSinyalHariIni(data);
  } catch (err) {
    document.getElementById("signal-output").innerText = "Gagal ambil sinyal: " + err;
    document.getElementById("anomali-output").innerText = "Gagal ambil anomali: " + err;
    console.error(err);
  }
}


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


document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pair").addEventListener("change", fetchMyfxbookData);
  fetchMyfxbookData();
  kosongkanNews();
  setInterval(fetchMyfxbookData, 300000); // auto-refresh 5 menit
});
