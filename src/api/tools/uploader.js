const axios = require("axios");
const crypto = require("crypto");

module.exports = function(app) {
  app.post("/uploader/api", async (req, res) => {
    try {
      // buffer dari body request
      let chunks = [];
      req.on("data", chunk => chunks.push(chunk));
      req.on("end", async () => {
        const fileBuffer = Buffer.concat(chunks);
        if (!fileBuffer || fileBuffer.length === 0) {
          return res.status(400).json({ error: "File wajib dikirim di body request" });
        }

        const originalName = req.headers["x-filename"] || "file.bin";
        const mimeType = req.headers["x-mimetype"] || "application/octet-stream";

        const ext = mimeType.split("/")[1] || "bin";
        const filenameGit = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;
        const FILE_PATH = `src/assest/tmp/${filenameGit}`;
        const content = fileBuffer.toString("base64");

        // === CONFIG GITHUB ===
        const GITHUB_USERNAME = "Ryuu311";
        const REPO = "RyuuEnds";
        const TOKEN = "ghp_Evnn3HcTifAxXYgbgiI4Hi8h1SS85l0khshshsbAJNU";
        const BRANCH = "main";

        await axios.put(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO}/contents/${FILE_PATH}`,
          {
            message: `upload via app - ${filenameGit}`,
            content: content,
            branch: BRANCH,
          },
          {
            headers: {
              Authorization: `token ${TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        res.json({
          creator: "RyuuDev",
          filename: originalName,
          uploaded_at: new Date().toISOString(),
          url: `https://api.ryuu-dev.offc.my.id/${FILE_PATH}`
        });
      });

      req.on("error", (err) => {
        console.error(err);
        res.status(500).json({ error: err.message || "Upload gagal" });
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || "Upload gagal" });
    }
  });
};