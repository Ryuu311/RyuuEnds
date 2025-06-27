const axios = require('axios');
const setting = require('../../src/apikey'); // ganti ke file baru

module.exports = function(app) {
  app.get('/tools/remini', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "url" wajib diisi'
      });
    }

    const apiKey = setting.list[0]; // aman

    try {
      const apiUrl = `https://api.hikaruyouki.my.id/api/tools/remini?url=${encodeURIComponent(url)}`;
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
        creator: 'RyuuXiao',
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
