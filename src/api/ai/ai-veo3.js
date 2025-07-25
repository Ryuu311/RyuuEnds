const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

module.exports = function (app) {
  app.get('/ai/veo3', async (req, res) => {
    const prompt = req.query.prompt;
    if (!prompt) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "prompt" wajib diisi!'
      });
    }

    try {
      // Ambil token Turnstile dari Neko API
      const { data: cf } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff', {
        params: {
          mode: 'turnstile-min',
          siteKey: '0x4AAAAAAANuFg_hYO9YJZqo',
          url: 'https://aivideogenerator.me/features/g-ai-video-generator',
          accessKey: 'e2ddc8d3ce8a8fceb9943e60e722018cb23523499b9ac14a8823242e689eefed'
        }
      });

      const uid = crypto.createHash('md5').update(Date.now().toString()).digest('hex');

      // Buat task video
      const { data: task } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
        prompt: prompt,
            imgUrls: [],
            quality: '720p',
            duration: 8,
            autoSoundFlag: false,
            soundPrompt: '',
            autoSpeechFlag: false,
            speechPrompt: '',
            speakerId: 'Auto',
            aspectRatio: '16:9',
            secondaryPageId: 1811,
            channel: 'VEO3',
            source: 'aivideogenerator.me',
            type: 'features',
            watermarkFlag: false,
            privateFlag: false,
            isTemp: true,
            vipFlag: false,
            model: 'veo-3-fast'
      }, {
        headers: {
          uniqueid: uid,
          verify: cf.result.token
        }
      });

      // Polling cek status video
      const maxWait = 6000000; // 6jt detik timeout
      const start = Date.now();

      while (Date.now() - start < maxWait) {
        const { data } = await axios.get(`https://aiarticle.erweima.ai/api/v1/secondary-page/api/${task.data.recordId}`, {
          headers: {
            uniqueid: uid,
            verify: cf.result.token
          }
        });

        if (data.data.state === 'success') {
          const result = JSON.parse(data.data.completeData);
          return res.json({
            status: true,
            message: 'Video berhasil dibuat!',
            result
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      res.status(504).json({
        status: false,
        message: 'Timeout: Video belum selesai diproses.'
      });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message || 'Terjadi kesalahan saat memproses.'
      });
    }
  });
};