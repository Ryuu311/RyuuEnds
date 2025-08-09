const crypto = require("crypto");
const fetch = require("node-fetch");

module.exports = function (app) {
  class Youtubers {
    constructor() {
      this.salt = null;
    }

    async getCDN() {
      const cdn = [
        "cdn100.savetube.su",
        "cdn200.savetube.su",
        "cdn300.savetube.su",
        "cdn400.savetube.su",
        "cdn500.savetube.su",
      ];
      return cdn[Math.floor(Math.random() * cdn.length)];
    }

    async fetchJsonWithChecks(url, opts = {}, timeout = 10000) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { signal: controller.signal, ...opts });
        const status = res.status;
        const contentType = (res.headers.get("content-type") || "").toLowerCase();
        const bodyText = await res.text();

        if (!res.ok) {
          throw new Error(`HTTP ${status} - ${bodyText.slice(0, 400)}`);
        }

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Invalid JSON response (content-type=${contentType}): ${bodyText.slice(0, 400)}`
          );
        }

        return JSON.parse(bodyText);
      } catch (err) {
        if (err.name === "AbortError") throw new Error("Request timed out");
        throw err;
      } finally {
        clearTimeout(timer);
      }
    }

    async Data(data) {
      const payload = {
        key: crypto
          .createHash("sha256")
          .update(data + this.salt)
          .digest("hex"),
      };

      const cdn = await this.getCDN();
      const res = await this.fetchJsonWithChecks(
        `https://${cdn}/v2/decrypt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
            Referer: "https://media.savetube.me/",
          },
          body: JSON.stringify(payload),
        },
        10000
      );

      return res.data;
    }

    async infoVideo(linkYoutube) {
      let lastErr = null;
      const attempts = 6;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Referer: "https://media.savetube.me/",
      };

      for (let i = 0; i < attempts; i++) {
        const cdn = await this.getCDN();
        try {
          const url = `https://${cdn}/v2/info`;
          const json = await this.fetchJsonWithChecks(
            url,
            {
              method: "POST",
              headers,
              body: JSON.stringify({ url: linkYoutube }),
            },
            10000
          );

          if (!json.status) throw new Error(json.message || "status=false dari API");
          if (!json.data) throw new Error("Response tidak mengandung data terenkripsi");

          this.salt = json.salt || "";
          const isi = await this.Data(json.data);
          return {
            judul: isi.title,
            durasi: isi.durationLabel,
            thumbnail: isi.thumbnail,
            kode: isi.key,
            kualitas: (isi.video_formats || []).map((f) => ({
              label: f.label,
              kualitas: f.height,
              default: f.default_selected,
            })),
            infoLengkap: isi,
          };
        } catch (err) {
          lastErr = err;
          console.warn(
            `[savetube] infoVideo failed (try ${i + 1}/${attempts}) cdn=${cdn} -> ${err.message}`
          );
          await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
        }
      }
      throw lastErr || new Error("Gagal mengambil info video setelah beberapa percobaan");
    }

    async getDownloadLink(kodeVideo, kualitas, type) {
      let lastErr = null;
      const attempts = 6;
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        Referer: "https://media.savetube.me/",
      };

      for (let i = 0; i < attempts; i++) {
        const cdn = await this.getCDN();
        try {
          const url = `https://${cdn}/download`;
          const json = await this.fetchJsonWithChecks(
            url,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                downloadType: kualitas === "128" ? "audio" : type,
                quality: kualitas,
                key: kodeVideo,
              }),
            },
            12000
          );

          if (!json.status) throw new Error(json.message || "status=false dari API");
          if (!json.data || !json.data.downloadUrl)
            throw new Error("downloadUrl tidak ditemukan");

          return json.data.downloadUrl;
        } catch (err) {
          lastErr = err;
          console.warn(
            `[savetube] getDownloadLink failed (try ${i + 1}/${attempts}) cdn=${cdn} -> ${err.message}`
          );
          await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
        }
      }
      throw lastErr || new Error("Gagal mengambil link unduhan setelah beberapa percobaan");
    }
  }

  const yt = new Youtubers();

  app.get("/download/youtube", async (req, res) => {
    try {
      const { url, quality, type } = req.query;
      if (!url) return res.status(400).json({ error: "URL YouTube diperlukan" });

      const info = await yt.infoVideo(url);
      const link = await yt.getDownloadLink(info.kode, quality || "720", type || "video");

      res.json({
        status: "success",
        judul: info.judul,
        durasi: info.durasi,
        thumbnail: info.thumbnail,
        kualitas: info.kualitas,
        download: link,
      });
    } catch (err) {
      console.error("[/download/yt] Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
};