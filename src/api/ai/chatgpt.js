
const axios = require('axios');

module.exports = function(app) {
    async function fetchChatGPTContent(prompt) {
        try {
            const response = await axios.post('https://chatgpt.com/api/generate', {
                prompt: prompt
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching from ChatGPT API:", error);
            throw error;
        }
    }

    app.get('/ai/chatgpt', async (req, res) => {
        try {
            const { prompt } = req.query;

            if (!prompt) {
                return res.status(400).json({
                    status: false,
                    error: 'Prompt is required'
                });
            }

            const result = await fetchChatGPTContent(prompt);

            res.status(200).json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: error.message });
        }
    });
};
