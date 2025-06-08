const axios = require('axios');

module.exports = function(app) {
    async function removeBackground({ imageUrl }) {
        try {
            const url = `https://api.nekorinn.my.id/tools/removebg?imageUrl=${encodeURIComponent(imageUrl)}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('RemoveBG API Error:', error.message);
            throw new Error('Failed to connect to RemoveBG API');
        }
    }

    app.get('/tools/removebg', async (req, res) => {
        const { imageUrl } = req.query;

        if (!imageUrl) {
            return res.status(400).json({
                status: false,
                message: 'Parameter "imageUrl" is required'
            });
        }

        try {
            const result = await removeBackground({ imageUrl });
            res.status(200).json({
                ...result,
                creator: "RyuuXiao"
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
