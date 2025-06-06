// script.js versi lengkap dan fix fitur search error // Telah diperbaiki agar .toLowerCase() tidak error karena data-category hilang

document.addEventListener('DOMContentLoaded', async () => { const loadingScreen = document.getElementById("loadingScreen"); const body = document.body; body.classList.add("no-scroll");

const settingsResponse = await fetch('/src/settings.json');
const settings = await settingsResponse.json();

const apiContent = document.getElementById('apiContent');

settings.categories.forEach((category, categoryIndex) => {
    const sortedItems = category.items.sort((a, b) => a.name.localeCompare(b.name));

    const categoryElement = document.createElement('div');
    categoryElement.className = 'category-section';

    const categoryHeader = document.createElement('h3');
    categoryHeader.className = 'category-header';
    categoryHeader.textContent = category.name;
    categoryElement.appendChild(categoryHeader);

    const itemsRow = document.createElement('div');
    itemsRow.className = 'row';

    sortedItems.forEach((item, index) => {
        const itemCol = document.createElement('div');
        itemCol.className = 'col-md-6 col-lg-4 api-item';

        // ✅ Tambahkan ini agar search tidak error
        itemCol.dataset.name = item.name;
        itemCol.dataset.desc = item.desc;
        itemCol.dataset.category = category.name;

        const card = document.createElement('div');
        card.className = 'p-3 border rounded shadow-sm mb-3 bg-light';

        const title = document.createElement('h5');
        title.textContent = item.name;

        const desc = document.createElement('p');
        desc.textContent = item.desc;

        card.appendChild(title);
        card.appendChild(desc);
        itemCol.appendChild(card);
        itemsRow.appendChild(itemCol);
    });

    categoryElement.appendChild(itemsRow);
    apiContent.appendChild(categoryElement);
});

// Fitur pencarian
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const apiItems = document.querySelectorAll('.api-item');

    apiItems.forEach(item => {
        const name = item.getAttribute('data-name')?.toLowerCase() || '';
        const desc = item.getAttribute('data-desc')?.toLowerCase() || '';
        const category = item.getAttribute('data-category')?.toLowerCase() || '';

        const matches = name.includes(searchTerm) || desc.includes(searchTerm) || category.includes(searchTerm);
        item.style.display = matches ? '' : 'none';
    });
});

loadingScreen?.remove();
body.classList.remove("no-scroll");

});

