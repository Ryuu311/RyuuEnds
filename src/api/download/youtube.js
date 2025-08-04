const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = function(app) {
  async function getHash(link) {
    const { data } = await axios.get(`https://ytmp3.lat/download/${encodeURIComponent(link)}`);
    const $ = cheerio.load(data);
    const id = $('#convertForm input[name=id]').val();
    const v = $('#convertForm input[name=v]').val();
    const k = $('#convertForm input[name=k]').val();
    const token = $('#convertForm input[name=_token]').val();

    return { id, v, k, token };
  }

  async function getStatus({ id, v, k, token }, type) {
    const data = new FormData();
    data.append('type', type);
    data.append('v', v);
    data.append('k', k);
    data.append('_token', token);

    const res = await axios.post(`https://ytmp3.lat/status/${id}`, data, {
      headers: data.getHeaders()
    });

    const result = res.data;
    if (!result || !result.status || !result.url) {
      throw new Error('Gagal mendapatkan link unduhan.');
    }

    return {
      url: result.url,
      status: result.status,
      format: result.ext,
      size: result.size
    };
  }

  app.get('/download/youtube', async (req, res) => {
    const { url, type = 'mp3' } = req.query;
    if (!url) return res.status(400).json({ success: false, message: 'Parameter "url" dibutuhkan' });

    try {
      const hash = await getHash(url);
      const result = await getStatus(hash, type);

      res.json({
        success: true,
        result: {
          downloadUrl: result.url,
          format: result.format,
          size: result.size,
          status: result.status
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });
};