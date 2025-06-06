// Versi ringan dan stabil dari fitur pencarian untuk dokumentasi API // Pastikan file ini dipanggil di bagian bawah <body> atau setelah HTML dimuat

document.addEventListener("DOMContentLoaded", async () => { const searchInput = document.getElementById("searchInput"); const clearSearch = document.getElementById("clearSearch"); const apiContent = document.getElementById("apiContent");

try { const res = await fetch("/src/settings.json"); const settings = await res.json();

// Render kategori dan item API
settings.categories.forEach((category) => {
  const categorySection = document.createElement("div");
  categorySection.className = "category-section";

  const header = document.createElement("h3");
  header.className = "category-header";
  header.textContent = category.name;
  categorySection.appendChild(header);

  const row = document.createElement("div");
  row.className = "row";

  category.items.forEach((item) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 api-item";

    // Set data-* untuk pencarian
    col.dataset.name = (item.name || "").toLowerCase();
    col.dataset.desc = (item.desc || "").toLowerCase();
    col.dataset.category = (category.name || "").toLowerCase();

    const card = document.createElement("div");
    card.className = "p-3 border rounded shadow-sm mb-3 bg-light";

    const title = document.createElement("h5");
    title.textContent = item.name || "Unnamed API";

    const desc = document.createElement("p");
    desc.textContent = item.desc || "No description.";

    card.appendChild(title);
    card.appendChild(desc);
    col.appendChild(card);
    row.appendChild(col);
  });

  categorySection.appendChild(row);
  apiContent.appendChild(categorySection);
});

// Event pencarian
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const items = document.querySelectorAll(".api-item");
  let found = 0;

  items.forEach((item) => {
    const name = item.dataset.name || "";
    const desc = item.dataset.desc || "";
    const category = item.dataset.category || "";

    const match =
      name.includes(searchTerm) ||
      desc.includes(searchTerm) ||
      category.includes(searchTerm);

    item.style.display = match ? "block" : "none";
    if (match) found++;
  });

  const noResults = document.getElementById("noResultsMessage");
  if (found === 0) {
    if (!noResults) {
      const div = document.createElement("div");
      div.id = "noResultsMessage";
      div.className = "text-center p-4 text-muted";
      div.innerHTML = `
        <i class="fas fa-search fa-2x"></i>
        <p>No results found for "<strong>${searchTerm}</strong>"</p>
        <button class="btn btn-primary" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'));">Clear Search</button>
      `;
      apiContent.appendChild(div);
    } else {
      noResults.style.display = "block";
      noResults.querySelector("strong").textContent = searchTerm;
    }
  } else {
    if (noResults) noResults.style.display = "none";
  }
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("input"));
  searchInput.focus();
});

} catch (e) { console.error("Failed to load settings.json", e); apiContent.innerHTML = <div class="alert alert-danger">Gagal memuat API settings. Coba refresh halaman.</div>; } });

                                                           
