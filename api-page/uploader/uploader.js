const GITHUB_USERNAME = "Ryuu311";
const REPO = "RyuuEnds";
const TOKEN = "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"; 
const BRANCH = "main";

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview");

dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  fileInput.files = e.dataTransfer.files;
  showFileName();
});

fileInput.addEventListener("change", showFileName);

function showFileName() {
  const file = fileInput.files[0];
  if (file) {
    filePreview.innerHTML = `📂 File dipilih: <span class="font-semibold">${file.name}</span>`;
  } else {
    filePreview.innerHTML = "";
  }
}

async function uploadFile() {
  const file = fileInput.files[0];
  const result = document.getElementById("result");

  if (!file) {
    result.innerHTML = "<p class='text-red-500'>⚠️ Pilih file dulu ya</p>";
    return;
  }
  if (file.size > 70 * 1024 * 1024) {
    result.innerHTML = "<p class='text-red-500'>❌ File terlalu besar (max 70MB)</p>";
    return;
  }

  const reader = new FileReader();
  reader.onloadend = async () => {
    const content = reader.result.split(",")[1];
    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const FILE_PATH = `src/assest/tmp/${filename}`;

    try {
      result.innerHTML = `
        <p class='text-gray-700'>📂 File: <span class="font-semibold">${file.name}</span></p>
        <p class='text-gray-500'>⏳ Mengupload...</p>
      `;

      await axios.put(
        `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO}/contents/${FILE_PATH}`,
        {
          message: `upload via frontend - ${filename}`,
          content: content,
          branch: BRANCH,
        },
        {
          headers: {
            Authorization: `token ${TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const url = `https://api.ryuu-dev.offc.my.id/${FILE_PATH}`;
      result.innerHTML = `
        <p class="text-green-600 font-semibold">✅ Berhasil diupload!</p>
        <p class="text-gray-700">📂 File: <span class="font-semibold">${file.name}</span></p>
        <button onclick="copyToClipboard('${url}')" 
          class="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md transition relative">
          Salin Link 📋
        </button>
      `;
    } catch (err) {
      console.error(err);
      result.innerHTML = "<p class='text-red-500'>❌ Error saat upload</p>";
    }
  };
  reader.readAsDataURL(file);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Link berhasil disalin ke clipboard!");
  });
}