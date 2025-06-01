// === SETUP SUPABASE ===
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

 



const supabaseUrl = 'https://vyeyrkrzgdpemqfnrjle.supabase.co'; // Ganti dengan project kamu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZXlya3J6Z2RwZW1xZm5yamxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODQ4NjksImV4cCI6MjA2NDI2MDg2OX0.0J26OpBV61eEioOg9t63wASpM-q0N9o72PPnmHYL_Zg'; // Ganti dengan service_role/admin key (jangan publish key ini di public)
const supabase = createClient(supabaseUrl, supabaseKey);

// === DOM ===
const slideForm = document.getElementById('slideForm');
const slideTitle = document.getElementById('slideTitle');
const slideDesc = document.getElementById('slideDesc');
const slideImage = document.getElementById('slideImage');
const slidePreview = document.getElementById('slidePreview');
const slideListDiv = document.getElementById('slideList');

let editMode = false;
let editId = null;

// === LOAD SLIDES DARI SUPABASE ===
async function loadSlides() {
  slideListDiv.innerHTML = "Loading...";
  const { data, error } = await supabase.from('slides').select('*').order('created_at', { ascending: false });
  if (error) {
    slideListDiv.innerHTML = `<span style="color:red;">Error: ${error.message}</span>`;
    return;
  }
  if (!data.length) {
    slideListDiv.innerHTML = `<span style="color:#888;">Belum ada slide promosi.</span>`;
    return;
  }
  slideListDiv.innerHTML = '';
  data.forEach(slide => {
    const div = document.createElement('div');
    div.className = 'slide-item';

    // Mode edit
    if (editMode && editId === slide.id) {
      div.innerHTML = `
        <input type="text" class="slide-title" value="${slide.title.replace(/"/g,'&quot;')}" id="editTitle${slide.id}" maxlength="60" style="width:98%;margin-bottom:7px;font-weight:600;">
        <textarea class="slide-desc" id="editDesc${slide.id}" maxlength="120" rows="2" style="width:98%;resize:vertical;">${slide.desc}</textarea>
        <div class="img-preview" id="editPreview${slide.id}">
          ${slide.image_url ? `<img src="${slide.image_url}">` : ""}
        </div>
        <input type="file" id="editImage${slide.id}" accept="image/*" style="margin-top:5px;">
        <div class="slide-actions">
          <button class="save" onclick="window.saveEdit(${slide.id})">Simpan</button>
          <button class="cancel" onclick="window.cancelEdit()">Batal</button>
        </div>
      `;
      setTimeout(() => {
        document.getElementById(`editImage${slide.id}`).onchange = function() {
          const file = this.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(evt) {
            document.getElementById(`editPreview${slide.id}`).innerHTML = `<img src="${evt.target.result}">`;
          };
          reader.readAsDataURL(file);
        };
      }, 100);
    } else {
      div.innerHTML = `
        ${slide.image_url ? `<img src="${slide.image_url}" loading="lazy">` : ""}
        <div class="slide-info">
          <div class="slide-title">${slide.title}</div>
          <div class="slide-desc">${slide.desc}</div>
          <div class="slide-meta">${new Date(slide.created_at).toLocaleString()}</div>
        </div>
        <div class="slide-actions">
          <button class="edit" onclick="window.startEdit(${slide.id})">Edit</button>
          <button class="delete" onclick="window.deleteSlide(${slide.id})">Hapus</button>
        </div>
      `;
    }
    slideListDiv.appendChild(div);
  });
}

// === TAMBAH SLIDE ===
slideForm.onsubmit = async e => {
  e.preventDefault();
  const title = slideTitle.value.trim();
  const desc = slideDesc.value.trim();
  let image_url = "";
  if (slideImage.files[0]) {
    // Upload image ke Supabase Storage (opsional)
    const file = slideImage.files[0];
    const fileName = `slide_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('public').upload(fileName, file, { upsert: true });
    if (!error) {
      const { data: imgUrl } = supabase.storage.from('public').getPublicUrl(fileName);
      image_url = imgUrl.publicUrl;
    }
  }
  const { error } = await supabase.from('slides').insert([{ title, desc, image_url }]);
  if (!error) {
    slideTitle.value = "";
    slideDesc.value = "";
    slideImage.value = "";
    slidePreview.innerHTML = "";
    loadSlides();
  } else {
    alert("Gagal posting: " + error.message);
  }
};

// === Preview Image saat input ===
slideImage.onchange = function() {
  const file = this.files[0];
  if (!file) { slidePreview.innerHTML = ""; return; }
  const reader = new FileReader();
  reader.onload = function(evt) {
    slidePreview.innerHTML = `<img src="${evt.target.result}">`;
  };
  reader.readAsDataURL(file);
};

// === HAPUS SLIDE ===
window.deleteSlide = async function(id) {
  if (!confirm('Hapus slide ini?')) return;
  const { error } = await supabase.from('slides').delete().eq('id', id);
  if (!error) loadSlides();
  else alert('Gagal hapus: ' + error.message);
};

// === EDIT SLIDE ===
window.startEdit = function(id) {
  editMode = true;
  editId = id;
  loadSlides();
};
window.cancelEdit = function() {
  editMode = false;
  editId = null;
  loadSlides();
};
window.saveEdit = async function(id) {
  const newTitle = document.getElementById(`editTitle${id}`).value.trim();
  const newDesc = document.getElementById(`editDesc${id}`).value.trim();
  let image_url = "";
  const imgInput = document.getElementById(`editImage${id}`);
  if (imgInput.files[0]) {
    const file = imgInput.files[0];
    const fileName = `slide_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('public').upload(fileName, file, { upsert: true });
    if (!error) {
      const { data: imgUrl } = supabase.storage.from('public').getPublicUrl(fileName);
      image_url = imgUrl.publicUrl;
    }
  }
  // Ambil slide lama untuk image fallback
  const { data: oldS } = await supabase.from('slides').select('*').eq('id', id).single();
  const { error } = await supabase.from('slides').update({
    title: newTitle,
    desc: newDesc,
    image_url: image_url || (oldS ? oldS.image_url : "")
  }).eq('id', id);
  if (!error) {
    editMode = false;
    editId = null;
    loadSlides();
  } else {
    alert("Gagal edit: " + error.message);
  }
};

// === INIT ===
loadSlides();
