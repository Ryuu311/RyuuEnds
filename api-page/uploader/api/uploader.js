// server.js
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 3000;

// Config GitHub
const GITHUB_USERNAME = "Ryuu311";
const REPO = "RyuuEnds";
const TOKEN = "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"; 
const BRANCH = "main";

// Middleware supaya bisa baca JSON body
app.use(express.json({ limit: "100mb" }));

/**
 * Request body JSON format:
 * {
 *   "fileName": "contoh.jpg",
 *   "content": "BASE64_STRING"
 * }
 */
app.post("/api", async (req, res) => {
  try {
    const { fileName, content } = req.body;
    if (!fileName || !content) return res.status(400).json({ error: "fileName atau content kosong" });

    const ext = fileName.split(".").pop() || "bin";
    const filename = `${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
    const FILE_PATH = `src/assest/tmp/${filename}`;

    // Upload ke GitHub
    await axios.put(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO}/contents/${FILE_PATH}`,
      {
        message: `upload via endpoint - ${filename}`,
        content: content, // base64 langsung
        branch: BRANCH,
      },
      {
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // URL hasil upload
    const url = `https://api.ryuu-dev.offc.my.id/${FILE_PATH}`;

    res.json({
      creator: "RyuuDev",
      uploadAt: new Date().toISOString(),
      url: url,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Gagal upload file" });
  }
});

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));