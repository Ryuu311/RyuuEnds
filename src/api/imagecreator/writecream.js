// writecream.js versi endpoint modular
const axios = require('axios');

module.exports = function (app) {
  app.get('/api/imagecreator/writecreamimg', async (req, res) => {
    try {
      const { prompt, ratio } = req.query;

      const availableRatios = ['1:1', '16:9', '2:3', '3:2', '4:5', '5:4', '9:16', '21:9', '9:21'];

      if (!prompt) {
        return res.status(400).json({
          status: false,
          message: 'Parameter "prompt" wajib diisi.'
        });
      }

      if (!ratio || !availableRatios.includes(ratio)) {
        return res.status(400).json({
          status: false,
          message: `Parameter "ratio" wajib dan harus salah satu dari: ${availableRatios.join(', ')}`
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

      return res.status(200).json({
        status: true,
        prompt,
        ratio,
        image: data.image_link
      });

    } catch (err) {
      console.error('[Writecream Error]', err.message);
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat memproses gambar.',
        error: err.message
      });
    }
  });
};