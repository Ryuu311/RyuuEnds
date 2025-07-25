const fetch = require("node-fetch");

module.exports = function(app) {
  app.get('/tools/brat', async (req, res) => {
    try {
      const { apikey, text, preview } = req.query;

      if (!global.apikey.includes(apikey)) return res.status(403).send('Invalid API key');
      if (!text) return res.status(400).send('Text is required');

      const url = `https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`;
      const response = await fetch(url);

      if (!response.ok) return res.status(502).send('Failed to fetch image from API');

      const buffer = await response.buffer();

      // ✅ Mode preview JSON
      if (preview === 'true') {
        return res.status(200).json({
          status: true,
          results: url,
          creator: 'RyuuDev'
        });
      }

      // ✅ Mode normal: kirim gambar PNG
      res.set('Content-Type', 'image/png');
      res.status(200).send(buffer);

    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan internal'
      });
    }
  });
};