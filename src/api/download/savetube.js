module.exports = function (app) {
const fetch = require('node-fetch');

class Youtubers {
  constructor() {
    this.hex = "C5D58EF67A7584E4A29F6C35BBC4EB12";
  }

  async uint8(hex) {
    const pecahan = hex.match(/[\dA-F]{2}/gi);
    if (!pecahan) throw new Error("Format tidak valid");
    return new Uint8Array(pecahan.map(h => parseInt(h, 16)));
  }

  b64Byte(b64) {
    const bersih = b64.replace(/\s/g, "");
    const biner = Buffer.from(bersih, 'base64').toString('binary');
    const hasil = new Uint8Array(biner.length);
    for (let i = 0; i < biner.length; i++) hasil[i] = biner.charCodeAt(i);
    return hasil;
  }

  async key() {
    const crypto = require('crypto');
    const raw = await this.uint8(this.hex);
    return await crypto.webcrypto.subtle.importKey(
      "raw",
      raw,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
  }

  async Data(base64Terenkripsi) {
    const byteData = this.b64Byte(base64Terenkripsi);
    if (byteData.length < 16) throw new Error("Data terlalu pendek");

    const iv = byteData.slice(0, 16);
    const data = byteData.slice(16);

    const kunci = await require('crypto').webcrypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      await this.key(),
      data
    );

    const teks = new TextDecoder().decode(new Uint8Array(kunci));
    return JSON.parse(teks);
  }

  async getCDN() {
  const res = await fetch("https://media.savetube.me/api/random-cdn", {
    method: "GET",
    headers: {
      "Origin": "https://savetube.me",
      "Referer": "https://savetube.me/",
      "User-Agent": "Mozilla/5.0 (Linux; Android 15; CPH2591 Build/OPM1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36"
    }
  });
  const data = await res.json();
  return data.cdn;
}

  async infoVideo(linkYoutube) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/v2/info`, {
      method: "POST",
      headers: {
      "Origin": "https://savetube.me",
      "Referer": "https://savetube.me/",
      "User-Agent": "Mozilla/5.0 (Linux; Android 15; CPH2591 Build/OPM1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Mobile Safari/537.36"
    },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkYoutube }),
    });

    const hasil = await res.json();
    if (!hasil.status) throw new Error(hasil.message || "Gagal ambil data video");

    const isi = await this.Data(hasil.data);
    return {
      judul: isi.title,
      durasi: isi.durationLabel,
      thumbnail: isi.thumbnail,
      kode: isi.key,
      kualitas: isi.video_formats.map(f => ({
        label: f.label,
        kualitas: f.height,
        default: f.default_selected
      })),
      infoLengkap: isi
    };
  }

  async getDownloadLink(kodeVideo, kualitas, type) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        downloadType: type,
        quality: kualitas,
        key: kodeVideo,
      }),
    });

    const json = await res.json();
    if (!json.status) throw new Error(json.message);
    return json.data.downloadUrl;
  }

  async downloadyt(linkYoutube, kualitas, type) {
    const data = await this.infoVideo(linkYoutube);
    const linkUnduh = await this.getDownloadLink(data.kode, kualitas, type);
    return {
      status: true,
      judul: data.judul,
      kualitasTersedia: data.kualitas,
      thumbnail: data.thumbnail,
      durasi: data.durasi,
      url: linkUnduh,
    };
  }
}
app.get("/download/savetube/mp4", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Masukkan URL YouTube" });

    const AUTHOR = "Ryuu dev";
    const yt = new Youtubers();
    const kualitas = "720";
    const tipe = "video";
    const hasil = await yt.downloadyt(url, kualitas, tipe);

    res.json({
      creator: AUTHOR,
      message: "success",
      output: [hasil]
    });
  } catch (err) {
    res.json({
      creator: "Ryuu dev",
      status: false,
      error: err.message
    });
  }
});

app.get("/download/savetube/mp3", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Masukkan URL YouTube" });

    const AUTHOR = "Ryuu dev";
    const yt = new Youtubers();
    const kualitas = "128";
    const tipe = "audio";
    const hasil = await yt.downloadyt(url, kualitas, tipe);

    res.json({
      creator: AUTHOR,
      message: "success",
      output: [hasil]
    });
  } catch (err) {
    res.json({
      creator: "Ryuu dev",
      status: false,
      error: err.message
    });
  }
});
}
