const axios = require('axios');
const cheerio = require('cheerio');

module.exports = (app) => {
    const creatorName = "RyuuDev";

  async function tiktokDl(url) {
  try {
    const response = await axios.post('https://api.ttsave.app/', {
      id: url,
      hash: 'eabd36f82466974a4527e6b997da38bf',
      mode: 'video',
      locale: 'id',
      loading_indicator_url: 'https://ttsave.app/images/slow-down.gif',
      unlock_url: 'https://ttsave.app/id/unlock'
    });

    const htmlContent = response.data;
    const $ = cheerio.load(htmlContent);

    const profileImage = $('img.h-24').attr('src');
    const username = $('a[title]').text();
    const description = $('p.text-gray-600').text();
    const likeCount = $('span.text-gray-500').eq(0).text();
    const commentCount = $('span.text-gray-500').eq(1).text();
    const shareCount = $('span.text-gray-500').eq(2).text();
    const downloadLinks = {
      withoutWatermark: $('a[type="no-watermark"]').attr('href'),
      withWatermark: $('a[type="watermark"]').attr('href')
    };

    return {
      profileImage,
      username,
      description,
      likeCount,
      commentCount,
      shareCount,
      downloadLinks
    };
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
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