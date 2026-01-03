import fetch from 'node-fetch';

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

  if (!res.ok) return console.log('Gagal load module:', res.status);

  const encodedModule = await res.text();

  const {
  tanggal,
  day,
  bulan,
  tahun,
  weton,
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetchJson,
  sleep,
  runtime,
  formatp,
  whitelistChecking,
  checkTheNumber
} = await import('data:text/javascript,' + encodedModule);

export {
  tanggal,
  day,
  bulan,
  tahun,
  weton,
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetchJson,
  sleep,
  runtime,
  formatp,
  whitelistChecking,
  checkTheNumber
};
