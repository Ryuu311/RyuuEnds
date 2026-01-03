import fetch from 'node-fetch';

async function loadHarukaCore() {
  const url = 'https://ryuu-dev.offc.my.id/example/haruka-confg';

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'HarukaBot/1.0',
    'x-client-id': `haruka-${global.nomorbot}`
  };

  const body = {
    password: `RyuuBotz-${global.nomorbot}`
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    console.log('Gagal load module:', res.status);
    return null;
  }

  const encodedModule = await res.text();

  return await import('data:text/javascript,' + encodedModule);
}

const mod = await loadHarukaCore();
if (!mod) process.exit(1);

export const {
  unixTimestampSeconds,
  generateMessageTag,
  formatp,
  processTime,
  getRandom,
  getBuffer,
  capital,
  fetchJson,
  runtime,
  clockString,
  sleep,
  isUrl,
  getTime,
  formatDate,
  tanggal,
  day,
  bulan,
  tahun,
  checkTheNumber,
  weton,
  jsonformat,
  logic,
  bytesToSize,
  parseMention
} = mod;
