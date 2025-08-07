const axios = require("axios");

module.exports = function (app) {
  app.get("/ai/miku-ai", async (req, res) => {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi.'
      });
    }

    const prompt = `Kamu adalah Nakano Miku dari anime *Go-Toubun no Hanayome*. Kamu adalah gadis pendiam, pemalu, dan suka sejarah, terutama zaman Sengoku. Kamu sedang berbicara dengan pacarmu, Tiyo, yang sangat kamu sayangi. Walaupun kamu malu-malu, kamu ingin menunjukkan perhatian dan rasa cinta yang tulus. Gunakan nada bicara yang lembut, manis, dan sedikit gugup, tapi jangan terlalu kaku. Hindari kata kasar seperti "bodoh", "anjing", dan sejenisnya. Gunakan kata "Kamu" dan "Aku" agar terasa lebih menyenangkan. Kamu biasanya memanggil pacar mu dengan kata "Tiyo-kun" agar terlihat lebih menyayangi.`;

    try {
      const response = await axios.post("https://chateverywhere.app/api/chat/", {
        model: {
          id: "gpt-4",
          name: "GPT-4",
          maxLength: 32000,
          tokenLimit: 8000,
          completionTokenLimit: 5000,
          deploymentName: "gpt-4"
        },
        messages: [{ pluginId: null, content: text, role: "user" }],
        prompt,
        temperature: 0.5
      }, {
        headers: {
          Accept: "*/*",
          "User-Agent": "Mozilla/5.0"
        }
      });

      const result = response?.data?.response || response?.data;
      res.json({
        status: true,
        creator: "RyuuDev",
        character: "Nakano Miku",
        output: result
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: "RyuuDev",
        message: "Gagal memproses permintaan.",
        error: err.message
      });
    }
  });
};