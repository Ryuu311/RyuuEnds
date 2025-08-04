const express = require('express');
const axios = require('axios');

module.exports = function(app) {
    async function reinzmahiruytdl(link) {
        try {
            const response = await axios.get('https://y2ts.us.kg/token');
            const token = response.data.token;

            const url = `https://y2ts.us.kg/youtube?url=${link}`;
            const headers = {
                'Authorization-Token': token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                'Content-Type': 'application/json'
            };

            const videoResponse = await axios.get(url, { headers });
            if (videoResponse.data.status) {
                return videoResponse.data.result;
            } else {
                throw new Error('Gagal mengambil video, status = false');
            }

        } catch (error) {
            throw new Error(error.message || 'Gagal memproses permintaan');
        }
    }

    app.get('/download/youtube', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'Parameter "url" is required'
            });
        }

        try {
            const hasil = await reinzmahiruytdl(url);
            res.json({
                status: true,
                creator: "RyuuDev",
                result: hasil
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                statu: false,
                creator: "RyuuDev",
                message: error.message
            });
        }
    });
};