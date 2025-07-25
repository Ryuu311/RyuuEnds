// /src/api/writecream.js
const axios = require('axios');

module.exports = function (app) {
  app.get('/ai/writecream', async (req, res) => {
    try {
      const prompt = req.query.prompt?.trim();
      const ratio = req.query.ratio?.trim();

      const availableRatios = ['1:1', '16:9', '2:3', '3:2', '4:5', '5:4', '9:16', '21:9', '9:21'];

      if (!prompt || !ratio) {
        return res.status(400).json({
          status: false,
          message: 'Parameter "prompt" dan "ratio" wajib diisi.'
        });
      }

      if (!availableRatios.includes(ratio)) {
        return res.status(400).json({
          status: false,
          message: `Ratio tidak valid. Gunakan salah satu: ${availableRatios.join(', ')}`
        });
      }

      const { data } = await axios.get('https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image', {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          origin: 'https://www.writecream.com',
          referer: 'https://www.writecream.com/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        },
        params: {
          prompt,
          aspect_ratio: ratio,
          link: 'writecream.com'
        }
      });

      if (!data?.image_link) {
        return res.status(500).json({
          status: false,
          message: 'Gagal mendapatkan gambar dari API Writecream.'
        });
      }

      return res.json({
        status: true,
        message: 'Gambar berhasil dibuat.',
        image_url: data.image_link,
        source: 'writecream.com'
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan saat memproses.'
      });
    }
  });
};