const fetch = require("node-fetch");

module.exports = function(app) {
  app.get('/tools/brat', async (req, res) => {
    try {
      const { apikey, text, preview } = req.query;

      if (!global.apikey.includes(apikey)) return res.status(403).send('Invalid API key');
      if (!text) return res.status(400).send('Text is required');

      const url = `https://api.nekorinn.my.id/maker/brat-v2?text=${encodeURIComponent(text)}`;

      // 🎭 Header penyamar tingkat dewa
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/', // 🔁 Seolah dari hasil pencarian Google
          'Origin': 'https://www.google.com'    // 🪪 Asal seolah dari browser biasa
        }
      });

      if (!response.ok) return res.status(502).send('Failed to fetch image from API');

      const buffer = await response.buffer();

      if (preview === 'true') {
        return res.status(200).json({
          status: true,
          results: url,
          creator: 'RyuuDev'
        });
      }

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