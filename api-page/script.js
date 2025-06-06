document.addEventListener('DOMContentLoaded', async () => {
  const navList = document.getElementById('nav-list');
  const mainContent = document.getElementById('main-content');
  const modal = document.getElementById('modal');
  const modalDetails = document.getElementById('modal-details');
  const closeModal = document.getElementById('closeModal');

  try {
    const response = await fetch('settings.json');
    const data = await response.json();

    data.categories.forEach((category, catIndex) => {
      const li = document.createElement('li');
      li.textContent = category.name;
      li.addEventListener('click', () => renderEndpoints(catIndex));
      navList.appendChild(li);
    });

    function renderEndpoints(catIndex) {
      const category = data.categories[catIndex];
      mainContent.innerHTML = `<h2>${category.name}</h2>`;

      category.endpoints.forEach(endpoint => {
        const endpointCard = document.createElement('div');
        endpointCard.className = 'endpoint-card';
        endpointCard.innerHTML = `
          <h3>${endpoint.name}</h3>
          <p><strong>URL:</strong> ${endpoint.url}</p>
          <p><strong>Method:</strong> ${endpoint.method}</p>
          <button class="view-detail">View Details</button>
        `;

        endpointCard.querySelector('.view-detail').addEventListener('click', () => {
          modalDetails.innerHTML = `
            <h3>${endpoint.name}</h3>
            <p><strong>Description:</strong> ${endpoint.description}</p>
            <p><strong>URL:</strong> ${endpoint.url}</p>
            <p><strong>Method:</strong> ${endpoint.method}</p>
            <p><strong>Params:</strong> ${endpoint.params || 'None'}</p>
            <p><strong>Example:</strong><br><code>${endpoint.example || ''}</code></p>
          `;
          modal.classList.remove('hidden');
        });

        mainContent.appendChild(endpointCard);
      });
    }

    closeModal.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });

  } catch (error) {
    console.error('Error loading settings.json:', error);
    mainContent.innerHTML = `<p>Error loading API data.</p>`;
  }
});
