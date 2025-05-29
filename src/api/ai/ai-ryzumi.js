const axios = require('axios');

module.exports = function(app) {
    async function fetchRyzumiChat(text) {
        try {
            const response = await axios.get('https://api.ryzumi.vip/api/ai/chatgpt', {
                params: { text }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching from Ryzumi API:", error);
            throw error;
        }
    }

    app.get('/ai/ryzumi', async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Parameter text is required'
                });
            }

            const data = await fetchRyzumiChat(text);
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
