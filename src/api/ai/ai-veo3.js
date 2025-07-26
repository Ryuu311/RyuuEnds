const axios = require('axios')
const crypto = require('crypto')

module.exports = function (app) {
  app.get('/ai/veo3', async (req, res) => {
    const rawPrompt = req.query.prompt?.trim()
    if (!rawPrompt) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "prompt" wajib diisi!'
      })
    }

    try {
      const result = await veo3(rawPrompt)

      if (!result?.data?.video_url) {
        return res.status(500).json({
          status: false,
          message: 'Gagal mendapatkan hasil video.'
        })
      }

      return res.json({
        status: true,
        message: 'Video berhasil dibuat!',
        result
      })
    } catch (e) {
      return res.status(500).json({
        status: false,
        message: e.message || 'Terjadi kesalahan saat memproses.'
      })
    }
  })
}

// Fungsi utama logic video-nya
async function veo3(prompt, { model = 'veo-3-fast', auto_sound = false, auto_speech = false } = {}) {
  const allowedModels = ['veo-3-fast', 'veo-3']
  if (!prompt) throw new Error('Prompt wajib diisi')
  if (!allowedModels.includes(model)) throw new Error(`Model tidak valid. Pilih: ${allowedModels.join(', ')}`)

  try {
    const { data: cf } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff', {
      params: {
        mode: 'turnstile-min',
        siteKey: '0x4AAAAAAANuFg_hYO9YJZqo',
        url: 'https://aivideogenerator.me/features/g-ai-video-generator',
        accessKey: 'e2ddc8d3ce8a8fceb9943e60e722018cb23523499b9ac14a8823242e689eefed'
      }
    })

    const uid = crypto.createHash('md5').update(Date.now().toString()).digest('hex')

    const { data: task } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
      prompt,
      imgUrls: [],
      quality: '720p',
      duration: 8,
      autoSoundFlag: auto_sound,
      soundPrompt: '',
      autoSpeechFlag: auto_speech,
      speechPrompt: '',
      speakerId: 'Auto',
      aspectRatio: '16:9',
      secondaryPageId: 1811,
      channel: 'VEO3',
      source: 'aivideogenerator.me',
      type: 'features',
      watermarkFlag: true,
      privateFlag: true,
      isTemp: true,
      vipFlag: true,
      model
    }, {
      headers: {
        uniqueid: uid,
        verify: cf.result.token
      }
    })

    const maxWait = 120000
    const start = Date.now()

    while (Date.now() - start < maxWait) {
      const { data } = await axios.get(`https://aiarticle.erweima.ai/api/v1/secondary-page/api/${task.data.recordId}`, {
        headers: {
          uniqueid: uid,
          verify: cf.result.token
        }
      })

      if (data?.data?.state === 'success') {
        return JSON.parse(data.data.completeData)
      }

      await new Promise(res => setTimeout(res, 1500))
    }

    throw new Error('Timeout: Video belum selesai diproses.')

  } catch (error) {
    throw new Error(error.message)
  }
}