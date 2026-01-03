import { proto, delay, getContentType, areJidsSameUser, generateWAMessage } from "@ryuu-reinzz/baileys";
import chalk from "chalk";
import fs from "fs";
import Crypto from "crypto";
import axios from "axios";
import moment from "moment-timezone";
import util from "util";
import { sizeFormatter } from "human-readable";
import { defaultMaxListeners } from "events";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

global.imports = {
  proto,
  delay,
  getContentType,
  areJidsSameUser,
  generateWAMessage,
  chalk,
  fs,
  Crypto,
  axios,
  moment,
  util,
  sizeFormatter,
  defaultMaxListeners,
  fileURLToPath,
  path,
  dirname
};

// Pastikan folder ada
const corePath = path.resolve('./database/tmp/core.js');
fs.mkdirSync(path.dirname(corePath), { recursive: true });

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

  // Fetch modul dari web
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    console.log('Gagal load module:', res.status);
    return null;
  }

  // Ambil teks modul
  const encodedModule = await res.text();

  // Simpan ke file lokal
  fs.writeFileSync(corePath, decodeURIComponent(encodedModule), 'utf8');

  // Import dari file lokal pakai file://
  return await import('file://' + corePath);
}

const mod = await loadHarukaCore();
if (!mod) process.exit(1);

// Export semua fungsi dari modul
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
  getSizeMedia,
  parseMention,
  getGroupAdmins,
  whitelistChecking,
  smsg
} = mod;
