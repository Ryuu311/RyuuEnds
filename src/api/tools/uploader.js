const axios = require("axios");

module.exports = function (app) {
  // Endpoint POST /upload
  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, content } = req.body;

      if (!filename || !content) {
        return res.status(400).json({ error: "Filename dan content wajib ada" });
      }

      /* ---------- Konfigurasi ---------- */
      const GITHUB_USERNAME = "Ryuu311";
      const REPO = "RyuuEnds";
      const TOKEN = "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";
      const BRANCH = "main";
      /* -------------------------------- */

      const FILE_PATH = `src/assest/tmp/${filename}`;
      const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO}/contents/${FILE_PATH}`;

      const payload = {
        message: "upload via backend - " + filename,
        content, // base64 dari frontend
        branch: BRANCH,
      };

      const headers = {
        Authorization: "token " + TOKEN,
        "Content-Type": "application/json",
      };

      const resp = await axios.put(apiUrl, payload, { headers });

      if (resp.status === 201 || resp.status === 200) {
        const url = `https://api.ryuu-dev.offc.my.id/${FILE_PATH}`;
        return res.status(200).json({
          success: true,
          url,
        });
      } else {
        return res
          .status(500)
          .json({ error: "Upload gagal — response tidak terduga" });
      }
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    }
  });
};