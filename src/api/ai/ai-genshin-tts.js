// genshin-tts-endpoint.js
const axios = require("axios");

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

const char_all = { ...char_female, ...char_male };

module.exports = function (app) {
  app.get("/ai/genshin-tts", async (req, res) => {
    const { char, text } = req.query;
    if (!char || !text) {
      return res.status(400).json({
        status: false,
        msg: 'Parameter "char" dan "text" diperlukan.',
        char: Object.keys(char_all),
      });
    }

    if (!char_all[char]) {
      return res.status(400).json({
        status: false,
        msg: `Karakter tidak ditemukan.`,
        char: Object.keys(char_all),
      });
    }

    try {
      const BASEURL = "https://arkandash-rvc-genshin-impact.hf.space";
      const session_hash = Math.random().toString(36).substring(2);
      const [fn_index, trigger_id] = char_all[char];

      const charVoice = Object.keys(char_female).includes(char)
        ? "id-ID-GadisNeural-Female"
        : "id-ID-ArdiNeural-Male";

      const payload = {
        data: [
          "TTS Audio", "", null,
          text, charVoice,
          0, "pm", 0.7, 3, 0, 1, 0.5
        ],
        event_data: null,
        fn_index,
        session_hash,
        trigger_id
      };

      await axios.post(`${BASEURL}/queue/join`, payload);

      const stream = await axios.get(`${BASEURL}/queue/data?session_hash=${session_hash}`, {
        headers: { "content-type": "text/event-stream" },
        responseType: "stream"
      });

      let result = "";
      stream.data.on("data", chunk => {
        result += chunk.toString();
        const lines = result.split("\n");
        result = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.substring(6));
              if (json.msg !== "process_completed") return;
              if (!json.success) return res.json({ status: false, msg: "Proses gagal." });

              const dt = json.output.data;
              const fileData = dt.find(x => typeof x === "object" && x.name && x.name.endsWith(".wav"));

              if (!fileData)
                return res.status(500).json({ status: false, msg: "File audio tidak ditemukan." });

              return res.json({
                status: true,
                msg: `${BASEURL}/file=${fileData.name}`,
                voice: charVoice,
                char,
              });

            } catch (err) {
              return res.status(500).json({
                status: false,
                msg: "Gagal parsing data stream.",
                error: err.message
              });
            }
          }
        }
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        msg: "Internal server error.",
        error: err.message
      });
    }
  });
};