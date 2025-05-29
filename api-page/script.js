
fetch('settings.json')
  .then(response => response.json())
  .then(data => {
    const categories = data.categories;
    const categoriesContainer = document.getElementById('categories');
    const itemsContainer = document.getElementById('items');

    categories.forEach(category => {
      const btn = document.createElement('button');
      btn.textContent = category.name;
      btn.onclick = () => {
        itemsContainer.innerHTML = '';
        category.items.forEach(item => {
          const div = document.createElement('div');
          div.className = 'item';
          div.innerHTML = `<h3>${item.name}</h3><p>${item.desc}</p><code>${item.path}</code>`;
          if (item.innerDesc) {
            div.innerHTML += `<p><small>${item.innerDesc}</small></p>`;
          }
          itemsContainer.appendChild(div);
        });
      };
      categoriesContainer.appendChild(btn);
    });
  });
