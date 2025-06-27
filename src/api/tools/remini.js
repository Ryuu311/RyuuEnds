const axios = require('axios');

module.exports = function(app) {
  app.get('/tools/remini', async (req, res) => {
    const { imageUrl } = req.query;

    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "imageUrl" wajib diisi'
      });
    }

    try {
      const apiUrl = `https://api.hikaruyouki.my.id/api/tools/remini?url=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      const { status, result, message } = response.data;

      res.status(200).json({
        status,
        creator: 'RyuuXiao',
        message,
        result
      });

    } catch (error) {
      console.error('Remini Error:', error.message);
      res.status(500).json({
        status: false,
        message: 'Gagal memproses gambar. Pastikan URL valid.'
      });
    }
  });
};
