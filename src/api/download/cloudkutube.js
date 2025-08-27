const fetch = require("node-fetch");

module.exports = function (app) {
  const APIKEY = "yt_user_085713905517355c19a8ad53d45e013a";

  async function fetchCloudkutube(endpoint, url) {
    const apiUrl = `https://cloudkutube.eu/${endpoint}?url=${encodeURIComponent(url)}&apikey=${APIKEY}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.status !== "success") {
      throw new Error(result?.message || "Gagal mengambil data");
    }

    const { creator, ...rest } = result;
    return {
      ...rest,
      creator: "Ryuu Dev"
    };
  }

  app.get("/download/ytmp3", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.json({ status: false, error: "Masukkan URL YouTube" });

      const output = await fetchCloudkutube("ytmp3", url);
      res.json(output);
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });

  app.get("/download/ytmp4", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.json({ status: false, error: "Masukkan URL YouTube" });

      const output = await fetchCloudkutube("ytmp4", url);
      res.json(output);
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });
};