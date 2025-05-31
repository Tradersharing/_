// List pair mayor, minor, XAU (emas), dan WTI oil
const allowedPairs = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD", // mayor
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "EURAUD", "AUDJPY",          // minor
  "XAUUSD", "WTI"
];

// Untuk konsistensi pair urutan seperti SS kamu, silakan urutkan sesuai preferensi
const displayPairs = [
  "EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "USDCAD", "USDCHF", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "CHFJPY", "EURAUD", "AUDJPY", "XAUUSD", "WTI"
];

// Data dummy, isi sesuai scraping/api
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
  // Tambah provider/data lain di sini...
];

function getLiveIcon() {
  // Icon gift/market berjalan/live ticker
  return `<span class="icon-live" title="Realtime Analytic">
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none"><rect x="2" y="6" width="3" height="9" rx="1.5" fill="#32b7ff"/><rect x="8" y="2" width="3" height="17" rx="1.5" fill="#32b7ff"/><rect x="14" y="9" width="3" height="7" rx="1.5" fill="#32b7ff"/><rect x="19.5" y="17.5" width="2" height="2" rx="1" transform="rotate(90 19.5 17.5)" fill="#FFA500"/></svg>
  </span>`;
}
function getSignalIcon() {
  // Icon satelit sinyal/antenna
  return `<span style="margin-left:6px;vertical-align:-2px;">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 16a6 6 0 0 1 8.5 0" stroke="#FFA500" stroke-width="2.1" stroke-linecap="round"/><path d="M9.5 16.5a2 2 0 0 1 3 0" stroke="#FFA500" stroke-width="2.1" stroke-linecap="round"/><circle cx="11" cy="19" r="1.5" fill="#FFA500"/></svg>
  </span>`;
}

// Render function
function renderSignals() {
  const container = document.getElementById('container');
  container.innerHTML = '';

  // Render setiap provider (kotak Data Analitik)
  allSignals.forEach((sig, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
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

  // Render kotak final (gabungan) di bawah
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
    // Gabung semua sinyal untuk pair ini
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