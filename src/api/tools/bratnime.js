const axios = require('axios');
const sharp = require('sharp');
const fetch = require('node-fetch');

module.exports = function(app) {
  app.get('/tools/bratnime', async (req, res) => {
    try {
      const { text } = req.query;
      if (!text) return res.status(400).json({ status: false, message: 'Parameter "text" diperlukan.' });
      if (text.length > 70) return res.status(400).json({ status: false, message: 'Maksimal 70 karakter.' });

      const wrapText = (text, maxCharsPerLine = 30) => {
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
      };

      const imageUrl = 'https://files.catbox.moe/kwkiyb.png';
      const imageBuffer = await fetch(imageUrl).then(r => r.buffer());

      const fontUrl = 'https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf';
      const fontBuffer = await fetch(fontUrl).then(r => r.buffer());
      const fontBase64 = fontBuffer.toString('base64');

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
  <style>
    @font-face {
      font-family: 'EmojiFont';
      src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
    }
    .text {
      font-family: 'EmojiFont';
      font-weight: bold;
      font-size: ${fontSize}px;
      fill: black;
    }
  </style>
  <rect x="0" y="564" width="${width}" height="130" fill="rgba(255,255,255,0.4)" />
  ${svgText}
</svg>`;

      const svgBuffer = Buffer.from(svgOverlay);

      const resultBuffer = await sharp(imageBuffer)
        .composite([{ input: svgBuffer, top: 0, left: 0 }])
        .webp({ quality: 100 })
        .toBuffer();

      res.set('Content-Type', 'image/webp');
      res.status(200).send(resultBuffer);

    } catch (e) {
      console.error(e);
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat membuat stiker',
        error: e.message
      });
    }
  });
};