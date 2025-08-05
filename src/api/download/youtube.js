const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = function (app) {
  async function getFormData(url) {
    const { data } = await axios.get(`https://ytmp3.lat/download/${encodeURIComponent(url)}`);
    const $ = cheerio.load(data);

    return {
      id: $('input[name=id]').val(),
      v: $('input[name=v]').val(),
      k: $('input[name=k]').val(),
      token: $('input[name=_token]').val()
    };
  }

  async function waitForReady(form, type, retries = 6, delay = 2000) {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('v', form.v);
    formData.append('k', form.k);
    formData.append('_token', form.token);

    for (let i = 0; i < retries; i++) {
      try {
        const res = await axios.post(`https://ytmp3.lat/status/${form.id}`, formData, {
          headers: formData.getHeaders()
        });

        const { status, url, ext, size } = res.data;

        if (status === 'ok' && url) {
          return { url, format: ext, size };
        }
      } catch (e) {
        if (e.response?.status === 404) {
          await new Promise(r => setTimeout(r, delay));
        } else {
          throw e;
        }
      }
    }

    throw new Error('Gagal mengambil link unduhan setelah mencoba beberapa kali');
  }

  app.get('/download/youtube', async (req, res) => {
    const { url, type = 'mp3' } = req.query;
    if (!url) {
      return res.status(400).json({
        creator: 'RyuuDev',
        success: false,
        message: 'Parameter "url" diperlukan'
      });
    }

    try {
      const form = await getFormData(url);
      const result = await waitForReady(form, type);

      res.json({
        creator: 'RyuuDev',
        success: true,
        output: result
      });
    } catch (e) {
      res.status(500).json({
        creator: 'RyuuDev',
        success: false,
        message: e.message
      });
    }
  });
};