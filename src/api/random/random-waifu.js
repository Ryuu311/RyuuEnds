const axios = require('axios');
module.exports = function(app) {
    async function waifu() {
        try {
            const { data } = await axios.get(`https://ryuu-endss-api.vercel.app/src/json.json`)
            const response = await axios.get(data[Math.floor(data.length * Math.random())], { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        } catch (error) {
            throw error;
        }
    }
    app.get('/random/waifupic', async (req, res) => {
        try {
            const pedo = await waifu();
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': pedo.length,
            });
            res.end(pedo);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
