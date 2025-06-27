const axios = require('axios');
const setting = require('./setting'); // pastikan path ini sesuai dengan lokasi file setting.js

module.exports = function(app) {
  app.get('/tools/remini', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "url" wajib diisi'
      });
    }

    try {
      const apiUrl = `https://api.hikaruyouki.my.id/api/tools/remini?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, {
        headers: {
          'apikey': setting.apikey // pastikan di setting.js ada: exports.apikey = 'xxx';
        }
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
        message: 'Gagal memproses gambar. Pastikan URL valid dan API aktif.'
      });
    }
  });
};
