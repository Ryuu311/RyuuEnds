module.exports = function (app) {
  const crypto = require('crypto');
  const fetch = require('node-fetch');

  class Youtubers {
    constructor() {
      this.hex = "C5D58EF67A7584E4A29F6C35BBC4EB12";
    }

    async uint8(hex) {
      const arr = hex.match(/[\dA-F]{2}/gi);
      if (!arr) throw new Error("Format hex tidak valid");
      return new Uint8Array(arr.map(h => parseInt(h, 16)));
    }

    b64Byte(b64) {
      const clean = b64.replace(/\s/g, "");
      const buf = Buffer.from(clean, "base64");
      return new Uint8Array(buf);
    }

    async key() {
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

      const kunci = await this.key();
      const hasil = await crypto.webcrypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        kunci,
        data
      );

      const teks = new TextDecoder().decode(new Uint8Array(hasil));
      return JSON.parse(teks);
    }

    async getCDN() {
      const res = await fetch("https://media.savetube.me/api/random-cdn");
      const data = await res.json();
      if (!data.cdn) throw new Error("Gagal ambil CDN");
      return data.cdn;
    }

    async infoVideo(linkYoutube) {
      const cdn = await this.getCDN();
      const res = await fetch(`https://${cdn}/v2/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkYoutube }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Respon bukan JSON, mungkin URL salah / CDN error");
      }

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
          downloadType: kualitas === "128" ? "audio" : type,
          quality: kualitas,
          key: kodeVideo,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Respon bukan JSON saat ambil link download");
      }

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

  // Endpoint API
  app.get('/download/youtube', async (req, res) => {
    try {
      const { url, type, quality } = req.query;
      if (!url) return res.json({ status: false, error: 'Masukkan URL YouTube' });

      const kualitas = quality || (type === 'audio' ? '128' : '720');
      const tipe = type || 'video';

      const yt = new Youtubers();
      const hasil = await yt.downloadyt(url, kualitas, tipe);

      res.json({
        creator: "RyuuDev",
        status: true,
        data: hasil
      });

    } catch (err) {
      res.json({
        creator: "RyuuDev",
        status: false,
        error: err.message
      });
    }
  });
};