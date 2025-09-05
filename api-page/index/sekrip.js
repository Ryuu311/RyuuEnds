
// Script untuk fetch stats dari server
async function updateStats() {
    try {
        const res = await fetch('/stats'); // endpoint harus ada di server
        const data = await res.json();
        document.getElementById('stat-ip').innerText = data.ip || 'N/A';
        document.getElementById('stat-rps').innerText = data.rps || 0;
        document.getElementById('stat-fitur').innerText = data.fitur || 0;
    } catch(e) {
        console.error(e);
        document.getElementById('stat-ip').innerText = 'Error';
        document.getElementById('stat-rps').innerText = 'Error';
        document.getElementById('stat-fitur').innerText = 'Error';
    }
}

setInterval(updateStats, 1000);
updateStats();