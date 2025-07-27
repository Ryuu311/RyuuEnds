const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function wrapText(text, maxCharsPerLine = 30) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (testLine.length > maxCharsPerLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

module.exports = function(app) {
  app.get('/tools/bratnime', async (req, res) => {
    const { apikey, text } = req.query;

    if (!global.apikey.includes(apikey)) return res.status(403).send('Invalid API key');
    if (!text) return res.status(400).json({ status: false, message: 'Teks tidak boleh kosong.' });
    if (text.length > 70) return res.status(400).json({ status: false, message: 'Maksimal 70 karakter.' });

    try {
      const imageUrl = 'https://files.catbox.moe/kwkiyb.png';
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const baseImage = Buffer.from(response.data);

      const fontPath = path.join(__dirname, '../Geist-Regular.ttf');
      const geistFont = fs.readFileSync(fontPath).toString('base64');

      const width = 856;
      const height = 808;
      const fontSize = 45;
      const lineHeight = fontSize * 1.2;
      const wrappedLines = wrapText(text, 17);

      const totalLines = wrappedLines.length;
      const centerY = 514 + (130 / 2);
      const textBlockHeight = totalLines * lineHeight;
      const startY = centerY - (textBlockHeight / 2) + (fontSize / 2);

      const svgText = wrappedLines.map((line, i) => {
        const y = startY + i * lineHeight;
        return `<text x="378" y="${y}" text-anchor="middle" class="text">${line}</text>`;
      }).join('\n');

      const svgOverlay = `
<svg width="${width}" height="${height}">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: 'Geist';
        src: url('data:font/ttf;base64,${geistFont}') format('truetype');
      }
      .text {
        fill: black;
        font-size: ${fontSize}px;
        font-family: 'Geist', sans-serif;
        font-weight: bold;
      }
    </style>
  </defs>
  <rect x="0" y="564" width="${width}" height="130" fill="rgba(255,255,255,0.4)" />
  ${svgText}
</svg>`;

      const svgBuffer = Buffer.from(svgOverlay);

      const resultBuffer = await sharp(baseImage)
        .composite([{ input: svgBuffer, top: 0, left: 0 }])
        .webp({ quality: 100 })
        .toBuffer();

      res.set('Content-Type', 'image/webp');
      res.status(200).send(resultBuffer);

    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: err.message || 'Terjadi kesalahan saat membuat stiker' });
    }
  });
};