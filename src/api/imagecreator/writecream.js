const axios = require('axios');

module.exports = function (app) {
  app.get('/api/imagecreator/writecreamimg', async (req, res) => {
    try {
      const { prompt, ratio } = req.query;
      const availableRatios = ['1:1', '16:9', '2:3', '3:2', '4:5', '5:4', '9:16', '21:9', '9:21'];

      if (!prompt) {
        return res.status(400).json({ status: false, message: 'Parameter "prompt" wajib diisi.' });
      }

      if (!availableRatios.includes(ratio)) {
        return res.status(400).json({
          status: false,
          message: `Rasio tidak valid. Rasio tersedia: ${availableRatios.join(', ')}`
        });
      }

      const { data } = await axios.get('https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image', {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'origin': 'https://www.writecream.com',
          'referer': 'https://www.writecream.com/',
          'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
        },
        params: {
          prompt: prompt,
          aspect_ratio: ratio,
          link: 'writecream.com'
        }
      });

      if (!data.image_link) {
        return res.status(500).json({
          status: false,
          message: 'Gagal mendapatkan gambar. Writecream tidak merespons dengan benar.'
        });
      }

      res.json({
        status: true,
        message: 'Gambar berhasil dibuat!',
        image: data.image_link
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan saat memproses.'
      });
    }
  });
};