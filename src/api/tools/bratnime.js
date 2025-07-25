const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const sharp = require('sharp');

const imageUrl = 'https://files.catbox.moe/kwkiyb.png';
const fontUrl = 'https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf';
const imagePath = path.join(__dirname, '../../session/file.jpg');
const outputPath = path.join(__dirname, '../../session/file.webp');
const fontPath = path.join(__dirname, '../../session/NotoColorEmoji.ttf');

async function generateBratSticker(text) {
  if (!fs.existsSync(fontPath)) {
    const fontData = await axios.get(fontUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(fontPath, Buffer.from(fontData.data));
  }

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, Buffer.from(response.data));

  const baseImage = await loadImage(imagePath);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  registerFont(fontPath, { family: 'EmojiFont' });

  const boardX = canvas.width * 0.18;
  const boardY = canvas.height * 0.57;
  const boardWidth = canvas.width * 0.56;
  const boardHeight = canvas.height * 0.25;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let fontSize = 62;
  const minFontSize = 12;
  const maxWidth = boardWidth * 0.9;

  function isTextFit(text, size) {
    ctx.font = `bold ${size}px EmojiFont`;
    const words = text.split(' ');
    const lineHeight = size * 1.2;
    let lines = [], currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      let testLine = currentLine + ' ' + words[i];
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else currentLine = testLine;
    }
    lines.push(currentLine);
    return lines.length * lineHeight <= boardHeight * 0.9;
  }

  while (!isTextFit(text, fontSize) && fontSize > minFontSize) fontSize -= 2;

  ctx.font = `bold ${fontSize}px EmojiFont`;
  const lineHeight = fontSize * 1.2;
  const words = text.split(' ');
  let lines = [], currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    let testLine = currentLine + ' ' + words[i];
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else currentLine = testLine;
  }
  lines.push(currentLine);

  const startY = boardY + boardHeight / 2 - (lines.length - 1) * lineHeight / 2;
  lines.forEach((line, i) => {
    const xPos = boardX + boardWidth / 2 - 15;
    const yPos = startY + i * lineHeight;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(line, xPos, yPos);
    ctx.fillStyle = '#000000';
    ctx.fillText(line, xPos, yPos);
  });

  const jpegBuffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(imagePath, jpegBuffer);
  await sharp(imagePath).toFormat('webp').toFile(outputPath);

  return outputPath;
}

module.exports = function(app) {
  app.get('/tools/bratnime', async (req, res) => {
    try {
      const { apikey, text } = req.query;
      if (!global.apikey.includes(apikey)) return res.status(403).json({ status: false, message: 'Invalid apikey' });
      if (!text) return res.status(400).json({ status: false, message: 'Parameter "text" wajib diisi' });

      const file = await generateBratSticker(text);
      const imageBuffer = fs.readFileSync(file);

      res.set('Content-Type', 'image/webp');
      res.status(200).send(imageBuffer);
    } catch (err) {
      console.error('[Bratnime Error]', err.message);
      res.status(500).json({
        status: false,
        message: 'Gagal memproses gambar bratnime.',
        error: err.message
      });
    }
  });
};
