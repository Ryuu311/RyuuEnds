/* ---------- Konfigurasi ---------- */
const GITHUB_USERNAME = "Ryuu311";
const REPO = "RyuuEnds";
const TOKEN = "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";
const BRANCH = "main";
/* -------------------------------- */

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const result = document.getElementById('result');
const themeToggle = document.getElementById('themeToggle');

/* theme toggle */
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

/* drag drop logic */
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  if (e.dataTransfer?.files?.length) {
    fileInput.files = e.dataTransfer.files;
    showFileName();
  }
});

fileInput.addEventListener('change', showFileName);
uploadBtn.addEventListener('click', uploadFile);
clearBtn.addEventListener('click', () => {
  fileInput.value = '';
  filePreview.innerHTML = '';
  result.innerHTML = '';
});

/* tampilkan nama file */
function showFileName(){
  const file = fileInput.files[0];
  if (file) {
    filePreview.innerHTML = `📂 File dipilih: <span class="font-semibold">${escapeHtml(file.name)}</span> — ${(file.size/1024/1024).toFixed(2)} MB`;
  } else {
    filePreview.innerHTML = '';
  }
}

/* upload ke GitHub */
async function uploadFile(){
  const file = fileInput.files[0];
  if (!file) {
    result.innerHTML = '<p class="text-red-600 dark:text-red-400">⚠️ Pilih file dulu ya, Ryuu-kun~</p>';
    return;
  }
  if (file.size > 70 * 1024 * 1024) {
    result.innerHTML = '<p class="text-red-600 dark:text-red-400">❌ File terlalu besar (max 70MB)</p>';
    return;
  }

  result.innerHTML = '<p class="text-slate-500 dark:text-slate-400">⏳ Membaca file...</p>';

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const base64 = reader.result.split(',')[1] || '';
      const ext = (file.name.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi,'');
      const filename = Date.now() + '_' + Math.random().toString(16).slice(2) + '.' + ext;
      const FILE_PATH = 'src/assest/tmp/' + filename;

      result.innerHTML = `<p class="text-slate-500 dark:text-slate-400">⏳ Mengupload <strong>${escapeHtml(file.name)}</strong>...</p>`;

      const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO}/contents/${FILE_PATH}`;
      const payload = { message: 'upload via frontend - ' + filename, content: base64, branch: BRANCH };
      const headers = { 'Authorization': 'token ' + TOKEN, 'Content-Type': 'application/json' };

      const resp = await axios.put(apiUrl, payload, { headers });
      if (resp && (resp.status === 201 || resp.status === 200)) {
        const url = 'https://api.ryuu-dev.offc.my.id/' + FILE_PATH;
        result.innerHTML = `
          <p class="text-green-600 dark:text-green-400 font-semibold">✅ Berhasil diupload!</p>
          <p>📂 File: <strong>${escapeHtml(file.name)}</strong></p>
          <button id="copyBtn" class="mt-3 px-4 py-2 rounded neon-btn text-white">Salin Link 📋</button>
          <p class="text-slate-500 dark:text-slate-400 mt-2">${escapeHtml(url)}</p>
        `;
        document.getElementById('copyBtn').addEventListener('click', () => copyToClipboard(url));
      } else {
        result.innerHTML = '<p class="text-red-600 dark:text-red-400">❌ Upload gagal (response tidak terduga).</p>';
      }
    } catch (err) {
      console.error(err);
      result.innerHTML = '<p class="text-red-600 dark:text-red-400">❌ Error saat upload — cek console.</p>';
    }
  };
  reader.readAsDataURL(file);
}

/* salin ke clipboard */
function copyToClipboard(text){
  navigator.clipboard?.writeText(text).then(() => {
    alert('Link berhasil disalin ke clipboard!');
  }).catch((e) => {
    console.error(e);
    alert('Gagal menyalin.');
  });
}

/* helper: escape HTML */
function escapeHtml(s) {
  return (s+'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}