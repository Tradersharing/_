let slideList = JSON.parse(localStorage.getItem("slideList") || "[]");
const slideListDiv = document.getElementById("slideList");
const slidePreviewDiv = document.getElementById("slidePreview");

function renderSlide() {
  slideListDiv.innerHTML = slideList.map((s,i) => `
    <div class="slide-item">
      ${s.img ? `<img src="${s.img}"/>` : ""}
      <div class="slide-info">
        <div class="slide-title">${s.title}</div>
        <div class="slide-desc">${s.desc}</div>
      </div>
      <button onclick="deleteSlide(${i})">Hapus</button>
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
  slidePreviewDiv.innerHTML = "";
};

document.getElementById("slideImage").onchange = function() {
  const file = this.files[0];
  if (!file) { slidePreviewDiv.innerHTML = ""; return; }
  const reader = new FileReader();
  reader.onload = function(evt) {
    slidePreviewDiv.innerHTML = `<img src="${evt.target.result}"/><span>Preview</span>`;
  };
  reader.readAsDataURL(file);
};

renderSlide();