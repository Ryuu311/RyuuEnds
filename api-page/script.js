
document.addEventListener("DOMContentLoaded", async () => {
  const loadingScreen = document.getElementById("loadingScreen");
  const apiContent = document.getElementById("apiContent");
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const body = document.body;

  try {
    const res = await fetch("/src/settings.json");
    const settings = await res.json();

    settings.categories.forEach((category) => {
      const section = document.createElement("div");
      section.className = "category-section";

      const header = document.createElement("h3");
      header.className = "category-header";
      header.textContent = category.name;
      section.appendChild(header);

      const row = document.createElement("div");
      row.className = "row";

      category.items.forEach((item) => {
        const col = document.createElement("div");
        col.className = "col-md-6 col-lg-4 api-item";

        col.dataset.name = item.name;
        col.dataset.desc = item.desc;
        col.dataset.category = category.name;

        const card = document.createElement("div");
        card.className = "p-3 border rounded shadow-sm mb-3 bg-light";

        const title = document.createElement("h5");
        title.textContent = item.name;

        const desc = document.createElement("p");
        desc.textContent = item.desc;

        card.appendChild(title);
        card.appendChild(desc);
        col.appendChild(card);
        row.appendChild(col);
      });

      section.appendChild(row);
      apiContent.appendChild(section);
    });

    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const items = document.querySelectorAll(".api-item");
      let found = 0;

      items.forEach((item) => {
        const name = item.dataset.name?.toLowerCase() || "";
        const desc = item.dataset.desc?.toLowerCase() || "";
        const category = item.dataset.category?.toLowerCase() || "";
        const match = name.includes(searchTerm) || desc.includes(searchTerm) || category.includes(searchTerm);
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

    clearSearch?.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.focus();
    });

  } catch (err) {
    console.error("Failed to load /src/settings.json:", err);
    apiContent.innerHTML = `
      <div class="alert alert-danger text-center mt-4">
        <h5>⚠️ Gagal Memuat API</h5>
        <p>Pastikan file <code>/src/settings.json</code> tersedia dan valid.</p>
      </div>
    `;
  } finally {
    loadingScreen?.remove();
    body.classList.remove("no-scroll");
  }
});
