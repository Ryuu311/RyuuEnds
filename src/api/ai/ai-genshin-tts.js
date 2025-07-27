const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/genshin-tts", async (req, res) => {
    const { char, text } = req.query;

    if (!char || !text) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'char' dan 'text' harus diisi",
      });
    }

    try {
      const BASEURL = "https://arkandash-rvc-genshin-impact.hf.space";
      const session = Math.random().toString(36).substring(2);
      const char_female = {
        lumine: 5, paimon: 10, venti: 15, eula: 25, mona: 30,
        hutao: 40, ayaka: 65, yae: 60, raiden: 55, kuki: 70,
        nahida: 75, nilou: 80, furina: 95, navia: 110,
      };
      const char_male = {
        aether: 0, diluc: 20, xiao: 45, zhongli: 35, kazuha: 50,
        wanderer: 85, kaveh: 90, neuvillette: 100, wriothesley: 105,
      };
      const allChar = { ...char_female, ...char_male };

      if (!allChar[char]) {
        return res.status(400).json({
          status: false,
          message: "Karakter tidak dikenali",
          available: Object.keys(allChar),
        });
      }

      const charVoice = Object.keys(char_female).includes(char)
        ? "id-ID-GadisNeural-Female"
        : "id-ID-ArdiNeural-Male";

      const send_data_payload = {
        data: [
          "TTS Audio", "", null, text, charVoice, 0, "pm",
          0.7, 3, 0, 1, 0.5
        ],
        event_data: null,
        fn_index: allChar[char],
        session_hash: session,
        trigger_id: allChar[char] + 79, // trigger ID disesuaikan
      };

      await axios.post(BASEURL + "/queue/join?", send_data_payload);

      const response = await axios.get(`${BASEURL}/queue/data?session_hash=${session}`, {
        headers: { "content-type": "text/event-stream" },
        responseType: "stream",
      });

      let result = "";
      response.data.on("data", (chunk) => {
        result += chunk.toString();
        const lines = result.split("\n");
        result = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.msg !== "process_completed") continue;

              const output = data.output.data;
              return res.json({
                status: true,
                ThanksTo: "Nekorinn owner",
                creator: "RyuuDev",
                result: output[0],
              });
            } catch (err) {
              return res.status(500).json({
                status: false,
                message: "Gagal parsing stream",
                error: err.message,
              });
            }
          }
        }
      });

    } catch (e) {
      return res.status(500).json({
        status: false,
        message: e.message || "Terjadi kesalahan internal",
      });
    }
  });
};