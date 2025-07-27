const axios = require('axios');
const path = require('path');

module.exports = function(app) {
    async function waifu() {
        try {
            const { data } = await axios.get(`https://ryuu-endss-api.vercel.app/src/json.json`);
            const randomUrl = data[Math.floor(Math.random() * data.length)];
            const response = await axios.get(randomUrl, { responseType: 'arraybuffer' });

            // Ambil ekstensi dari URL
            const ext = path.extname(randomUrl).toLowerCase().replace('.', '');

            // Mapping ekstensi ke MIME type
            const mimeMap = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                webp: 'image/webp'
            };

            return {
                buffer: Buffer.from(response.data),
                contentType: mimeMap[ext] || 'application/octet-stream'
            };
        } catch (error) {
            throw error;
        }
    }

    app.get('/random/waifupic', async (req, res) => {
        try {
            const result = await waifu();
            res.writeHead(200, {
                'Content-Type': result.contentType,
                'Content-Length': result.buffer.length,
            });
            res.end(result.buffer);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
