
const axios = require('axios');

module.exports = function(app) {
    async function fetchRyzumiChat(text, prompt) {
        try {
            const response = await axios.get('https://api.ryzumi.vip/api/ai/chatgpt', {
                params: { text, prompt }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching from Ryzumi API:", error);
            throw error;
        }
    }

    app.get('/ai/ryzumi', async (req, res) => {
        try {
            const { text, prompt } = req.query;

            if (!text || !prompt) {
                return res.status(400).json({
                    success: false,
                    error: 'Both text and prompt are required'
                });
            }

            const data = await fetchRyzumiChat(text, prompt);

            if (!data.success || !data.result) {
                return res.status(404).json({
                    success: false,
                    error: 'No valid response received'
                });
            }

            res.status(200).json({
                success: true,
                result: data.result
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
};
