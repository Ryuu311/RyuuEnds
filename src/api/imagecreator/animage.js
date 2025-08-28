const axios = require('axios');
const crypto = require('crypto');

module.exports = function(app) {

  class NSFWGenerator {
    constructor() {
        this.basenya = 'https://nech-c-wainsfwillustrious-v140.hf.space';
        this.sessionHash = this.buatSesi();
        this.userAgents = this.UserAgent();
        this.referers = this.getReferers();
    }

    buatSesi() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 11; i++) {
            const byte = crypto.randomBytes(1)[0];
            result += chars[byte % chars.length];
        }
        return result;
    }

    UserAgent() {
        return [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
        ];
    }

    getReferers() {
        return [
            'https://www.google.com/search?q=ai+image+generation',
            'https://www.bing.com/search?q=nech+ai+image+generator',
            'https://www.reddit.com/r/StableDiffusion/',
            'https://github.com/topics/ai-image-generation',
            'https://www.artstation.com/search?q=ai+art'
        ];
    }

    randomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    randomRefer() {
        return this.referers[Math.floor(Math.random() * this.referers.length)];
    }

    headernya() {
        return {
            'User-Agent': this.randomUserAgent(),
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': this.randomRefer(),
            'Origin': this.basenya,
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'sec-ch-ua': '"Chromium";v="129", "Not;A=Brand";v="99", "Microsoft Edge";v="129"',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-mobile': '?0'
        };
    }

    async generateImage(prompt, qualityPrompt = 'masterpiece, best quality, fine details') {
        try {
            const headers = this.headernya();
            const payload = {
                data: [
                    'v140',
                    prompt || 'a cute anime girl',
                    qualityPrompt,
                    'blurry, low quality, watermark, monochrome, text',
                    1336186770,
                    true,
                    1024,
                    1024,
                    12,
                    30,
                    1,
                    null,
                    true
                ],
                event_data: null,
                fn_index: 9,
                trigger_id: null,
                session_hash: this.sessionHash
            };

            const joinResponse = await axios.post(
                `${this.basenya}/gradio_api/queue/join?__theme=system`,
                payload,
                {
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            return { success: true, joinResponse: joinResponse.data, sessionHash: this.sessionHash };
        } catch (error) {
            return { success: false, error: error.message, sessionHash: this.sessionHash };
        }
    }

    async retrive() {
        try {
            const headers = this.headernya();
            const response = await axios.get(
                `${this.basenya}/gradio_api/queue/data?session_hash=${this.sessionHash}`,
                {
                    responseType: 'stream',
                    headers: { ...headers, Accept: 'text/event-stream' },
                    timeout: 120000
                }
            );

            return new Promise((resolve, reject) => {
                let buffer = '';
                let resolved = false;
                const startTime = Date.now();

                response.data.on('data', chunk => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;

                        let parsed;
                        try { parsed = JSON.parse(line.slice(6)); } catch { continue; }

                        if (parsed.msg === 'process_completed') {
                            try {
                                const results = [];
                                const out = parsed.output?.data ? parsed.output.data[0] : null;
                                const processingTime = Date.now() - startTime;

                                if (Array.isArray(out)) {
                                    for (const item of out) {
                                        if (typeof item === 'string') {
                                            if (item.startsWith('data:')) {
                                                results.push({ type: 'base64_image', value: item, size: Math.floor(item.length * 3 / 4) });
                                            } else if (item.startsWith('http')) {
                                                results.push({ type: 'url', value: item, isAbsolute: true });
                                            } else {
                                                results.push({ type: 'string', value: item });
                                            }
                                        } else if (typeof item === 'object' && item !== null) {
                                            if (item.url) results.push({ type: 'url', value: item.url, isAbsolute: true, source: 'object_url' });
                                            else if (item.name) results.push({ type: 'url', value: `${this.basenya}/file=${item.name}`, isAbsolute: false, filename: item.name });
                                            else if (item.path) results.push({ type: 'url', value: `${this.basenya}/file=${item.path}`, isAbsolute: false, path: item.path });
                                            else results.push({ type: 'object', value: item });
                                        }
                                    }
                                }

                                if (!resolved) {
                                    resolved = true;
                                    resolve({ status: 'SUCCESS', sessionHash: this.sessionHash, processingTime, results, resultCount: results.length, hasImages: results.some(r => r.type.includes('image') || r.type === 'url'), message: 'Berhasil membuat gambarnya' });
                                    response.data.destroy();
                                }
                            } catch (err) {
                                if (!resolved) { resolved = true; reject({ status: 'ERROR', sessionHash: this.sessionHash, error: err.message }); response.data.destroy(); }
                            }
                        } else if (parsed.msg === 'process_failed') {
                            if (!resolved) { resolved = true; reject({ status: 'FAILED', sessionHash: this.sessionHash, error: parsed.error || 'Unknown error' }); response.data.destroy(); }
                        }
                    }
                });

                response.data.on('error', err => { if (!resolved) { resolved = true; reject({ status: 'NETWORK_ERROR', sessionHash: this.sessionHash, error: err.message }); } });
                response.data.on('end', () => { if (!resolved) { resolved = true; reject({ status: 'TIMEOUT', sessionHash: this.sessionHash, error: 'Stream ended without results' }); } });
            });
        } catch (error) {
            return { status: 'ERROR', sessionHash: this.sessionHash, error: error.message };
        }
    }

    async GenerateImage(prompt, qualityPrompt) {
        const sessionResult = await this.generateImage(prompt, qualityPrompt);
        if (!sessionResult.success) return sessionResult;
        return await this.retrive();
    }
  }

  app.get('/imagecreator/animage', async (req, res) => {
    try {
        const { prompt } = req.query;
        if (!prompt) return res.json({ status: false, error: 'Parameter "prompt" wajib diisi' });

        const generator = new NSFWGenerator();
        const result = await generator.GenerateImage(prompt);

        res.json({ creator: 'RyuuDev', output: [result] });
    } catch (err) {
        res.json({ creator: 'RyuuDev', status: false, error: err.message });
    }
  });

};