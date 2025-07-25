const axios = require('axios');
const ProxyAgent = require('@rynn-k/proxy-agent');
const proxy = new ProxyAgent('./proxies.txt', { random: true }); // Path ke proxies.txt

// 🟢 Fungsi async dipisah di atas
async function nsfwimage(prompt, options = {}) {
  try {
    const {
      negative_prompt = 'lowres, bad anatomy, bad hands, text, error, missing finger, extra digits, fewer digits, cropped, worst quality, low quality, low score, bad score, average score, signature, watermark, username, blurry',
      style = 'anime',
      width = 1024,
      height = 1024,
      guidance_scale = 7,
      inference_steps = 28
    } = options;

    const _style = ['anime', 'real', 'photo'];
    if (!prompt) throw new Error('Prompt is required');
    if (!_style.includes(style)) throw new Error(`Available styles: ${_style.join(', ')}`);
    if (width < 256 || width > 1216) throw new Error('Min width: 256, Max width: 1216');
    if (height < 256 || height > 1216) throw new Error('Min height: 256, Max height: 1216');
    if (guidance_scale < 0 || guidance_scale > 20) throw new Error('Min guidance scale: 0, Max guidance scale: 20');
    if (inference_steps < 1 || inference_steps > 28) throw new Error('Max inference steps: 28');

    const agent = proxy.config();
    const session_hash = Math.random().toString(36).substring(2);

    await axios.post(`https://heartsync-nsfw-uncensored${style !== 'anime' ? `-${style}` : ''}.hf.space/gradio_api/queue/join`, {
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
    }, agent);

    const { data } = await axios.get(
      `https://heartsync-nsfw-uncensored${style !== 'anime' ? `-${style}` : ''}.hf.space/gradio_api/queue/data?session_hash=${session_hash}`,
      agent
    );

    let result;
    const lines = data.split('\n\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const d = JSON.parse(line.substring(6));
        if (d.msg === 'process_completed') result = d.output.data[0].url;
      }
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

// 🟡 app.get() di bagian bawah, satu file dengan async function
module.exports = function(app) {
  app.get('/imagecreator/nsfw-image', async (req, res) => {
    try {
      const { prompt, style = 'anime', width = 1024, height = 1024, guidance_scale = 7, inference_steps = 28 } = req.query;

      if (!global.apikey.includes(apikey)) return res.status(403).json({ status: false, message: 'Invalid API key' });
      if (!prompt) return res.status(400).json({ status: false, message: 'Prompt wajib diisi.' });

      const result = await nsfwimage(prompt, {
        style,
        width: parseInt(width),
        height: parseInt(height),
        guidance_scale: parseFloat(guidance_scale),
        inference_steps: parseInt(inference_steps)
      });

      if (!result) return res.status(500).json({ status: false, message: 'Gagal mendapatkan gambar.' });

      res.json({ status: true, result });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
    }
  });
};