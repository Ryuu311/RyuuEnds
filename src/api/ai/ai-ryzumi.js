const axios = require('axios');

module.exports = function(app) {

    // Endpoint Chat AI Ryzumi
    async function fetchRyzumiChat(text, prompt) {
        try {
            const response = await axios.get('https://api.ryzumi.vip/api/ai/ryzumi', {
                params: { text, prompt }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetchRyzumiChat:", error);
            throw error;
        }
    }

    app.get('/ai/ryzumi', async (req, res) => {
        try {
            const { text, prompt } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: 'Parameter text wajib diisi' });
            }

            const result = await fetchRyzumiChat(text, prompt || '');
            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });

    // Endpoint Filter Gambar Ryzumi
    app.get('/ai/ryzumi-filter', async (req, res) => {
        try {
            const { url, filter } = req.query;
            if (!url || !filter) {
                return res.status(400).json({ status: false, error: 'Parameter url dan filter wajib diisi' });
            }

            const response = await axios.get('https://api.ryzumi.vip/api/ai/negro', {
                params: { url, filter }
            });

            if (!response.data || !response.data.result) {
                return res.status(500).json({ status: false, error: 'Gagal mendapatkan gambar dari API ryzumi' });
            }

            res.status(200).json({
                status: true,
                result: response.data.result
            });
        } catch (error) {
            console.error("Error dari ryzumi-filter:", error.response?.data || error.message);
            res.status(500).json({ status: false, error: 'Gagal memproses gambar dari API ryzumi' });
        }
    });

};
