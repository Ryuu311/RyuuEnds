const fetch = require("node-fetch");

module.exports = function(app) {
  app.get('/tools/brat', async (req, res) => {
    try {
      const { apikey, text } = req.query;

      if (!global.apikey.includes(apikey)) return res.status(403).send('Invalid API key');
      if (!text) return res.status(400).send('Text is required');

      const url = `https://api.nekorinn.my.id/maker/brat-v2?text=${encodeURIComponent(text)}`;
      const response = await fetch(url);

      if (!response.ok) return res.status(502).send('Gagal mengambil gambar dari API');

      const buffer = await response.buffer();

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