const axios = require('axios');

module.exports = function (app) {
  app.get('/nsfw/bdsm', async (req, res) => {
    try {
      const response = await axios.get('https://api.nekorinn.my.id/nsfwhub/bdsm');
      const data = response.data;

      res.json({
        status: true,
        creator: 'RyuuXiao',
        result: data.result // <-- ini WAJIB agar gambar bisa ditampilkan di UI
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data',
        error: error.message
      });
    }
  });
};
