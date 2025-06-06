const axios = require('axios');

module.exports = function(app) {
    app.get('/ai/gpt4', async (req, res) => {
        try {
            const { apikey, ask } = req.query;
            if (!global.apikey.includes(apikey)) {
                return res.status(400).json({ status: false, error: 'Apikey invalid' });
            }
            if (!ask) {
                return res.status(400).json({ status: false, error: 'Parameter "ask" wajib diisi' });
            }

            const response = await axios.get(`https://fastrestapis.fasturl.cloud/aillm/gpt-4?ask=${encodeURIComponent(ask)}`);
            const data = response.data;

            if (data.status !== 200) {
                return res.status(500).json({ status: false, error: 'Gagal mengambil data dari GPT-4 API' });
            }

            res.status(200).json({
                status: true,
                result: data.result,
                message: '/ai/gpt4?apikey=your_apikey&ask=Hai aku ubed'
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, error: error.message });
        }
    });
}