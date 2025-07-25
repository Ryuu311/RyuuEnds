const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const sharp = require('sharp');

module.exports = function (app) {
  app.get('/ai/bratnime', async (req, res) => {
    const text = req.query.text?.trim();
    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi!'
      });
    }

    try {
      const imageUrl = 'https://files.catbox.moe/kwkiyb.png';
      const fontUrl = 'https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf';

      const imagePath = path.join(__dirname, '../session/bratnime.jpg');
      const outputPath = path.join(__dirname, '../session/bratnime.webp');
      const fontPath = path.join(__dirname, '../session/NotoColorEmoji.ttf');

      // Download font jika belum ada
      if (!fs.existsSync(fontPath)) {
        const fontData = await axios.get(fontUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(fontPath, Buffer.from(fontData.data));
      }

      const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(imgRes.data));

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

      let maxFontSize = 62;
      let minFontSize = 12;
      let fontSize = maxFontSize;

      const isTextFit = (text, fontSize) => {
        ctx.font = `bold ${fontSize}px EmojiFont`;
        const words = text.split(' ');
        const lineHeight = fontSize * 1.2;
        const maxWidth = boardWidth * 0.9;
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        const textHeight = lines.length * lineHeight;
        return textHeight <= boardHeight * 0.9;
      };

      while (!isTextFit(text, fontSize) && fontSize > minFontSize) {
        fontSize -= 2;
      }

      ctx.font = `bold ${fontSize}px EmojiFont`;
      const words = text.split(' ');
      const lineHeight = fontSize * 1.2;
      const maxWidth = boardWidth * 0.9;
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
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

      // Konversi ke WebP
      const buffer = canvas.toBuffer('image/jpeg');
      await sharp(buffer).toFormat('webp').toFile(outputPath);
      const webpBuffer = fs.readFileSync(outputPath);

      res.set('Content-Type', 'image/webp');
      return res.send(webpBuffer);

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        message: 'Gagal membuat stiker: ' + err.message
      });
    }
  });
};