const axios = require('axios');

module.exports = function(app) {
    async function gpt4AI({ text, imageUrl = '', sessionid = '' }) {
        try {
            const url = `https://api.nekorinn.my.id/ai/gpt4?text=${encodeURIComponent(text)}&imageUrl=${encodeURIComponent(imageUrl)}&sessionid=${encodeURIComponent(sessionid)}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('GPT-4 API Error:', error.message);
            throw new Error('Failed to connect to GPT-4 API');
        }
    }

    app.get('/ai/gpt4', async (req, res) => {
        const { text, imageUrl, sessionid } = req.query;

        if (!text) {
            return res.status(400).json({
                status: false,
                message: 'Parameter "text" is required'
            });
        }

        try {
            const result = await gpt4AI({ text, imageUrl, sessionid });
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
