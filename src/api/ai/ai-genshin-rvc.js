const axios = require('axios');
const fetch = require('node-fetch');
const { fileTypeFromBuffer } = require('file-type');
const FormData = require('form-data');

// karakter Genshin Impact RVC
const char_female = {
  lumine: [5, 84],
  paimon: [10, 127], 
  venti: [15, 173],
  eula: [25, 259], 
  mona: [30, 302], 
  hutao: [40, 391],
  ayaka: [65, 609], 
  yae: [60, 566], 
  raiden: [55, 523],
  kuki: [70, 652], 
  nahida: [75, 698], 
  nilou: [80, 741],
  furina: [95, 873],
  navia: [110, 1002],
};
const char_male = {
  aether: [0, 41], 
  diluc: [20, 216], 
  zhongli: [35, 348],
  xiao: [45, 434], 
  kazuha: [50, 477], 
  wanderer: [85, 784],
  kaveh: [90, 827], 
  neuvillette: [100, 916], 
  wriothesley: [105, 959],
};
const all_char = { ...char_female, ...char_male };

async function rvcVoiceChanger({ char, input }) {
  const BASEURL = 'https://arkandash-rvc-genshin-impact.hf.space';
  const session = Math.random().toString(36).substring(2);

  if (!Object.keys(all_char).includes(char)) {
    return { status: false, msg: 'Karakter tidak ditemukan', char: Object.keys(all_char) };
  }

  const [fn_index, trigger_id] = all_char[char];
  const fileType = (await fileTypeFromBuffer(input)) || { ext: 'mp3', mime: 'audio/mpeg' };

  const form = new FormData();
  form.append('files', input, { filename: `voice.${fileType.ext}`, contentType: fileType.mime });

  const upload = await axios.post(`${BASEURL}/upload`, form, {
    headers: form.getHeaders(),
  });

  const filename = upload.data[0];
  const dataAudio = {
    is_stream: false,
    mime_type: '',
    orig_name: filename.split('/')[4],
    path: filename,
    size: input.length,
    url: `${BASEURL}/file=/${filename}`,
  };

  const payload = {
    data: [
      'Upload audio', '', dataAudio, 'dummy',
      'id-ID-GadisNeural-Female', 0, 'pm', 0.7,
      3, 0, 1, 0.5
    ],
    event_data: null,
    fn_index,
    session_hash: session,
    trigger_id
  };

  await axios.post(`${BASEURL}/queue/join?`, payload);

  return new Promise(async (resolve) => {
    const stream = await axios.get(`${BASEURL}/queue/data?session_hash=${session}`, {
      headers: { 'content-type': 'text/event-stream' },
      responseType: 'stream'
    });

    let result = '';
    stream.data.on('data', chunk => {
      result += chunk.toString();
      const lines = result.split('\n');
      result = lines.pop();
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.msg === 'process_completed') {
              const url = json.output.data?.[0];
              return resolve({ status: true, result: url });
            }
          } catch (err) {
            return resolve({ status: false, msg: err.message });
          }
        }
      }
    });
  });
}

module.exports = function(app) {
  app.get('/ai/genshin-rvc', async (req, res) => {
    try {
      const { char, url } = req.query;
      if (!char || !url) {
        return res.status(400).json({ status: false, msg: 'Parameter char dan url dibutuhkan' });
      }

      const audio = await fetch(url);
      if (!audio.ok) return res.status(502).json({ status: false, msg: 'Gagal mengambil audio' });

      const buffer = await audio.buffer();
      const result = await rvcVoiceChanger({ char, input: buffer });

      if (!result.status) {
        return res.status(500).json({ status: false, msg: result.msg });
      }

      const file = await axios.get(result.result, { responseType: 'arraybuffer' });
      res.set('Content-Type', 'audio/mpeg');
      res.send(file.data);
    } catch (err) {
      res.status(500).json({ status: false, msg: err.message });
    }
  });
};