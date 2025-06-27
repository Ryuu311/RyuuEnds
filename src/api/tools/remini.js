const axios = require('axios');
const setting = require('../../src/setting'); // <- pastikan path ke setting.js benar

module.exports = function(app) {
  app.get('/tools/remini', async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "imageUrl" wajib diisi'
      });
    }

    const apiKey = setting.apiSettings.apikey[0]; // pakai "RyuuXiao" (apikey pertama)

    try {
      const apiUrl = `https://api.hikaruyouki.my.id/api/tools/remini?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl, {
        headers: {
          'apikey': apiKey
        },
        timeout: 15000
      });

      const { status, statuscode, result } = response.data;

      res.status(200).json({
        status,
        statusCode: statuscode,
        creator: setting.apiSettings.creator || 'RyuuXiao',
        result
      });

    } catch (error) {
      console.error('Remini Error:', error.message);
      res.status(500).json({
        status: false,
        message: 'Gagal memproses gambar.',
        error: error.message
      });
    }
  });
};
