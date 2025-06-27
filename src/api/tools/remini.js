const axios = require('axios'); const { getBuffer } = require('../lib/myfunc'); // Pastikan path ini sesuai dengan struktur project kamu

const VALID_API_KEYS = ["RyuuXiao", "Xiao", "RyuuGanteng"];

module.exports = function (app) { app.get('/tools/remini', async (req, res) => { const { url, apikey } = req.query;

if (!apikey) {
  return res.status(400).json({
    status: false,
    message: 'API key wajib diisi!'
  });
}

if (!VALID_API_KEYS.includes(apikey)) {
  return res.status(403).json({
    status: false,
    message: 'API key tidak valid!'
  });
}

if (!url) {
  return res.status(400).json({
    status: false,
    message: 'Parameter url wajib diisi!'
  });
}

try {
  const apiResponse = await axios.get(`https://ryu-api-lyart.vercel.app/tools/remini`, {
    params: {
      url,
      apikey: 'ZymzzHost'
    }
  });

  const { result } = apiResponse.data;

  return res.status(200).json({
    status: true,
    creator: 'RyuuXiao',
    result
  });
} catch (err) {
  console.error(err);
  return res.status(500).json({
    status: false,
    message: 'Terjadi kesalahan saat memproses gambar.',
    error: err.message
  });
}

}); };

