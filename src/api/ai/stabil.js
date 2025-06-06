const axios = require('axios');

module.exports = function(app) {
    app.get('/ai/stablediff', async (req, res) => {
        const { apikey, prompt } = req.query;
        const model = req.query.model || 'stable-diffusion-xl-fast'; // default model

        if (!apikey || !global.apikey.includes(apikey)) {
            return res.status(403).json({
                status: false,
                error: 'Apikey invalid atau tidak disertakan'
            });
        }

        if (!prompt) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "prompt" wajib diisi'
            });
        }

        try {
            const url = `https://fastrestapis.fasturl.cloud/aiimage/stablediff/simple?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`;
            const response = await axios.get(url, {
                responseType: 'arraybuffer'
            });

            res.set('Content-Type', 'image/jpeg');
            res.send(response.data);
        } catch (err) {
            console.error('[STABLEDIFF ERROR]', err.message);
            res.status(500).json({
                status: false,
                error: 'Gagal mengambil gambar dari API'
            });
        }
    });
};