const axios = require('axios');
const ws = require('ws');

class RVCBlueArchive {
  constructor() {
    this.char = {
      arisu: 0,
      wakamo: 6,
      himari: 12,
      arona: 18,
      hoshino: 24,
      noa: 30,
      hina: 36,
      hifumi: 42,
      haruka: 48,
      nagisa: 54,
      kokona: 60,
      saori: 66,
      yuuka: 72,
      aru: 78,
      umika: 84,
      asuna: 90,
      kasumi: 96,
      shiroko: 102,
      mika: 108,
      mutsuki: 114,
      yukari: 120,
      mari: 126,
      hanako: 132,
      sakurako: 138,
      reisa: 144
    };
  }

  generateSession() {
    return Math.random().toString(36).substring(2);
  }

  generate = async function ({ audio, char = 'arisu', is_audio_male = true }) {
    return new Promise((resolve, reject) => {
      if (!(char.toLowerCase() in this.char)) {
        return reject(`Karakter '${char}' tidak ditemukan.`);
      }

      const base_url = 'https://andhikagg-rvc-blue-archive.hf.space/';
      const session_hash = this.generateSession();
      const socket = new ws('wss://andhikagg-rvc-blue-archive.hf.space/queue/join');

      const aud = {
        data: 'data:audio/mpeg;base64,' + audio.toString('base64'),
        name: `audio_${Date.now()}.mp3`
      };

      socket.on('message', (data) => {
        const d = JSON.parse(data.toString('utf8'));

        switch (d.msg) {
          case 'send_hash':
            socket.send(JSON.stringify({
              fn_index: this.char[char],
              session_hash,
            }));
            break;

          case 'send_data':
            socket.send(JSON.stringify({
              fn_index: this.char[char],
              session_hash,
              data: ['Upload audio', '', aud, '', 'en-US-AnaNeural-Female', is_audio_male ? 12 : -12, 'pm', 0.7, 3, 0, 1, 0.5],
            }));
            break;

          case 'process_completed':
            socket.close();
            const o = d.output;
            const name = o.data[1]?.name;
            return resolve({
              duration: +o.duration.toFixed(2),
              url: base_url + 'file=' + name
            });

          default:
            break;
        }
      });

      socket.on('error', (err) => reject('WebSocket error: ' + err));
      socket.on('close', () => console.log('WebSocket closed'));
    });
  }
}

const rvc = new RVCBlueArchive();

module.exports = function (app) {
  app.get('/ai/rvc-ba', async (req, res) => {
    const { char, audio_url, pitch } = req.query;

    if (!char || !audio_url) {
      return res.json({
        status: false,
        creator: "RyuuDev",
        message: "Parameter 'char' dan 'audio_url' wajib diisi.",
      });
    }

    try {
      const response = await axios.get(audio_url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);

      const result = await rvc.generate({
        char,
        audio: buffer,
        is_audio_male: pitch !== undefined ? parseInt(pitch) >= 0 : true
      });

      return res.json({
        status: true,
        creator: "RyuuDev",
        message: "Berhasil mengubah suara~",
        char,
        pitch: pitch !== undefined ? parseInt(pitch) : -7,
        duration: result.duration,
        url: result.url
      });

    } catch (e) {
      console.error(e);
      return res.json({
        status: false,
        creator: "RyuuDev",
        message: "Gagal mendapatkan hasil audio.",
        char,
        duration: null,
        pitch: pitch !== undefined ? parseInt(pitch) : -7,
        url: null
      });
    }
  });
};