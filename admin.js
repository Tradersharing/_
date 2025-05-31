// --- Notifikasi ---
let notifList = JSON.parse(localStorage.getItem("notifList") || "[]");
const notifListDiv = document.getElementById("notifList");
function renderNotif() {
  const now = Date.now();
  notifList = notifList.filter(n => now - n.time < 86400000); // 24jam
  localStorage.setItem("notifList", JSON.stringify(notifList));
  notifListDiv.innerHTML = notifList.map((n,i) => `
    <div class="notif-item">
      <span>${n.text}</span>
      <span>
        <span class="notif-time">${timeAgo(n.time)}</span>
        <button onclick="deleteNotif(${i})">Hapus</button>
      </span>
    </div>
  `).join('');
}
window.deleteNotif = function(idx) {
  notifList.splice(idx,1); renderNotif();
  localStorage.setItem("notifList", JSON.stringify(notifList));
}
document.getElementById("notifForm").onsubmit = e => {
  e.preventDefault();
  const text = document.getElementById("notifText").value.trim();
  if(!text) return;
  notifList.unshift({ text, time: Date.now() });
  renderNotif();
  document.getElementById("notifText").value = "";
};
renderNotif();

// --- Iklan/Template ---
let iklanList = JSON.parse(localStorage.getItem("iklanList") || "[]");
const iklanDiv = document.getElementById("iklanList");
function renderIklan() {
  iklanDiv.innerHTML = iklanList.map((ik,i) => `
    <div class="iklan-item">
      ${ik.img ? `<img src="${ik.img}"/>` : ""}
      <span>${ik.text}</span>
      <span>
        <span class="iklan-time">${timeAgo(ik.time)}</span>
        <button onclick="deleteIklan(${i})">Hapus</button>
      </span>
    </div>
  `).join('');
}
window.deleteIklan = function(idx) {
  iklanList.splice(idx,1); renderIklan();
  localStorage.setItem("iklanList", JSON.stringify(iklanList));
}
document.getElementById("iklanForm").onsubmit = e => {
  e.preventDefault();
  const text = document.getElementById("iklanText").value.trim();
  const fileInput = document.getElementById("iklanImage");
  let imgData = "";
  if(fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      imgData = evt.target.result;
      iklanList.unshift({ text, img: imgData, time: Date.now() });
      renderIklan();
      localStorage.setItem("iklanList", JSON.stringify(iklanList));
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    iklanList.unshift({ text, img: "", time: Date.now() });
    renderIklan();
    localStorage.setItem("iklanList", JSON.stringify(iklanList));
  }
  document.getElementById("iklanText").value = "";
  fileInput.value = "";
  document.getElementById("iklanPreview").innerHTML = "";
};
document.getElementById("iklanImage").onchange = function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    document.getElementById("iklanPreview").innerHTML = `<img src="${evt.target.result}"/><span>Preview</span>`;
  };
  reader.readAsDataURL(file);
};
renderIklan();

// --- Slide Promosi/Interaksi ---
let slideList = JSON.parse(localStorage.getItem("slideList") || "[]");
const slideListDiv = document.getElementById("slideList");
function renderSlide() {
  slideListDiv.innerHTML = slideList.map((s,i) => `
    <div class="slide-item">
      ${s.img ? `<img src="${s.img}"/>` : ""}
      <span><b>${s.title}</b><br><small>${s.desc}</small></span>
      <span>
        <span class="slide-time">${timeAgo(s.time)}</span>
        <button onclick="deleteSlide(${i})">Hapus</button>
      </span>
    </div>
  `).join('');
}
window.deleteSlide = function(idx) {
  slideList.splice(idx,1); renderSlide();
  localStorage.setItem("slideList", JSON.stringify(slideList));
}
document.getElementById("slideForm").onsubmit = e => {
  e.preventDefault();
  const title = document.getElementById("slideTitle").value.trim();
  const desc = document.getElementById("slideDesc").value.trim();
  const fileInput = document.getElementById("slideImage");
  let imgData = "";
  if(fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      imgData = evt.target.result;
      slideList.unshift({ title, desc, img: imgData, time: Date.now() });
      renderSlide();
      localStorage.setItem("slideList", JSON.stringify(slideList));
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    slideList.unshift({ title, desc, img: "", time: Date.now() });
    renderSlide();
    localStorage.setItem("slideList", JSON.stringify(slideList));
  }
  document.getElementById("slideTitle").value = "";
  document.getElementById("slideDesc").value = "";
  fileInput.value = "";
};
renderSlide();

// --- Helper ---
function timeAgo(time) {
  const s = Math.floor((Date.now() - time)/1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}