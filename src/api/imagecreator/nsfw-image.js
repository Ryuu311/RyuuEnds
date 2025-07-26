const axios = require('axios');
const ProxyAgent = require('@rynn-k/proxy-agent');
const proxies = require('../../../proxies'); // file proxies.js
const proxy = new ProxyAgent(proxies, { random: true });

async function nsfwImage(prompt) {
    const style = 'anime';
    const negative_prompt = 'lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, low quality, low score, bad score, average score, signature, watermark, username, blurry';
    const width = 1024;
    const height = 1024;
    const guidance_scale = 7;
    const inference_steps = 28;

    const agent = proxy.config();
    const session_hash = Math.random().toString(36).substring(2);

    const post = await axios.post(
        `https://heartsync-nsfw-uncensored.hf.space/gradio_api/queue/join?`,
        {
            data: [
                prompt,
                negative_prompt,
                0,
                true,
                width,
                height,
                guidance_scale,
                inference_steps
            ],
            event_data: null,
            fn_index: 2,
            trigger_id: 16,
            session_hash
        },
        agent
    );

    const { data } = await axios.get(
        `https://heartsync-nsfw-uncensored.hf.space/gradio_api/queue/data?session_hash=${session_hash}`,
        agent
    );

    const lines = data.split('\n\n');
    for (const line of lines) {
        if (line.startsWith('data:')) {
            const d = JSON.parse(line.slice(6));
            if (d.msg === 'process_completed') {
                return d.output.data[0].url;
            }
        }
    }

    throw new Error('Gagal mendapatkan hasil dari API');
}

module.exports = function(app) {
    app.get('/imagecreator/nsfw-image', async (req, res) => {
        const { prompt } = req.query;
        if (!prompt) return res.status(400).json({ status: false, message: 'Prompt tidak boleh kosong!' });

        try {
            const imageURL = await nsfwImage(prompt);
            return res.json({
                status: true,
                creator: "RyuuDev",
                result: imageURL
            });
        } catch (err) {
            return res.status(500).json({
                status: false,
                message: err.message
            });
        }
    });
};