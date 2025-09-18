const axios = require('axios');

module.exports = (app) => {
    const creatorName = "RyuuDev";
    
async function tiktokDl(query) {
  try {
    const response = await axios.post("https://ttsave.app/download", {
      query,
      language_id: "2",
    });

    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

    // Route Express
    app.get('/download/tiktok', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                creator: creatorName,
                message: 'Parameter url wajib diisi'
            });
        }

        try {
            const result = await tiktokDl(url);
            if (!result) {
                res.json({
                    status: true,
                    creator: creatorName,
                    result
                });
            } else {
                res.status(400).json({
                    status: false,
                    creator: creatorName,
                    message: 'Gagal mengambil data dari TikTok.'
                });
            }
        } catch (err) {
            console.error("TikTok Downloader Error:", err.message || err);
            res.status(500).json({
                status: false,
                creator: creatorName,
                message: err.message || 'Terjadi kesalahan saat memproses permintaan.'
            });
        }
    });
};