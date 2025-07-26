module.exports = function (app) {
  const ws = require('ws');
  const axios = require('axios');
  const { fromBuffer } = require('file-type');

  const charMap = {
    arisu: 0, wakamo: 6, himari: 12, arona: 18, hoshino: 24, noa: 30,
    hina: 36, hifumi: 42, haruka: 48, nagisa: 54, kokona: 60, saori: 66,
    yuuka: 72, aru: 78, umika: 84, asuna: 90, kasumi: 96, shiroko: 102,
    mika: 108, mutsuki: 114, yukari: 120, mari: 126, hanako: 132,
    sakurako: 138, reisa: 144
  };

  app.get('/ai/rvc-ba', async (req, res) => {
    try {
      const { char, audio_url, male, pitch } = req.query;
      const fn_index = charMap[char?.toLowerCase()];
      const isMale = male === 'true';
      const customPitch = parseFloat(pitch);

      if (!char || !audio_url)
        return res.status(400).json({
          status: false,
          message: `Mohon sertakan 'char' dan 'audio_url'. Karakter tersedia: ${Object.keys(charMap).join(', ')}`
        });

      if (fn_index === undefined)
        return res.status(400).json({ status: false, message: `Karakter '${char}' tidak ditemukan.` });

      const audioBuffer = await axios.get(audio_url, { responseType: 'arraybuffer' }).then(r => r.data);
      const filetype = await fromBuffer(audioBuffer);
      if (!filetype || !filetype.mime.startsWith('audio'))
        return res.status(400).json({ status: false, message: 'Link audio tidak valid atau bukan file audio.' });

      const pitchValue = isNaN(customPitch) ? (isMale ? 12 : -12) : customPitch;
      const session_hash = Math.random().toString(36).substring(2);
      const socket = new ws('wss://andhikagg-rvc-blue-archive.hf.space/queue/join');
      const base_url = 'https://andhikagg-rvc-blue-archive.hf.space/';

      socket.on('message', data => {
        const d = JSON.parse(data.toString());
        switch (d.msg) {
          case 'send_hash':
            socket.send(JSON.stringify({ fn_index, session_hash }));
            break;
          case 'send_data':
            socket.send(JSON.stringify({
              fn_index,
              session_hash,
              data: [
                'Upload audio', '',
                {
                  data: 'data:audio/mpeg;base64,' + Buffer.from(audioBuffer).toString('base64'),
                  name: `audio_${Date.now()}.mp3`
                },
                '',
                'en-US-AnaNeural-Female',
                pitchValue,
                'pm',
                0.7,
                3,
                0,
                1,
                0.5
              ]
            }));
            break;
          case 'process_completed':
            const o = d.output;
            const fileName = o?.data?.[1]?.name;
            const url = fileName ? base_url + 'file=' + fileName : null;
            const duration = o?.duration ? +o.duration.toFixed(2) : null;

            socket.close();
            return res.json({
              status: !!url,
              message: url ? 'Berhasil convert audio 💙' : 'Gagal mendapatkan hasil audio.',
              char,
              duration,
              pitch: pitchValue,
              url
            });
        }
      });

      socket.on('error', e => {
        return res.status(500).json({ status: false, message: 'Gagal koneksi WebSocket' });
      });
    } catch (e) {
      return res.status(500).json({ status: false, message: 'Terjadi kesalahan saat memproses' });
    }
  });
};