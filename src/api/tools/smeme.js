const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');

module.exports = function (app) {
  app.get('/tools/smeme', async (req, res) => {
    try {
      const { img, atas, bawah } = req.query;

      if (!img) return res.status(400).send('Parameter img (URL) wajib diisi');
      if (!atas) return res.status(400).send('Parameter atas wajib diisi');
      if (!bawah) return res.status(400).send('Parameter bawah wajib diisi');

      // Cek file font
      const fontArialPath = path.join(__dirname, '../arialnarrow.ttf');
      const fontEmojiPath = path.join(__dirname, '../NotoColorEmoji.ttf');
      if (!fs.existsSync(fontArialPath)) return res.status(500).send('Font Arial Narrow tidak ditemukan');
      if (!fs.existsSync(fontEmojiPath)) return res.status(500).send('Font Noto Color Emoji tidak ditemukan');

      // Register font
      GlobalFonts.registerFromPath(fontArialPath, 'Arial Narrow');
      GlobalFonts.registerFromPath(fontEmojiPath, 'Noto Color Emoji');

      // Ambil gambar
      const imageResp = await axios.get(img, { responseType: 'arraybuffer' });
      const baseImage = await loadImage(Buffer.from(imageResp.data));

      // Canvas kotak (biar konsisten seperti versi case)
      const size = Math.max(baseImage.width, baseImage.height);
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // Background hitam
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, size, size);

      // Hitung scale biar gambar muat tanpa ketarik
      const scale = Math.min(size / baseImage.width, size / baseImage.height);
      const newWidth = baseImage.width * scale;
      const newHeight = baseImage.height * scale;
      const offsetX = (size - newWidth) / 2;
      const offsetY = (size - newHeight) / 2;

      // Gambar sesuai proporsi
      ctx.drawImage(baseImage, offsetX, offsetY, newWidth, newHeight);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';

      const drawText = (text, yPos, baseline) => {
        let fontSize = Math.floor(size * 0.10);
        ctx.font = `900 ${fontSize}px "Arial Narrow", "Noto Color Emoji"`;

        while (ctx.measureText(text).width > size * 0.9 && fontSize > 30) {
          fontSize -= 2;
          ctx.font = `900 ${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
        }

        ctx.textBaseline = baseline;

        // Outline pertama (tebal banget)
        ctx.lineWidth = Math.floor(fontSize / 4);
        ctx.strokeText(text.toUpperCase(), size / 2, yPos);

        // Outline kedua (rapihin pinggiran)
        ctx.lineWidth = Math.floor(fontSize / 10);
        ctx.strokeText(text.toUpperCase(), size / 2, yPos);

        // Isi teks
        ctx.fillText(text.toUpperCase(), size / 2, yPos);
      };

      // Gambar teks atas & bawah
      drawText(atas, 10, 'top');
      drawText(bawah, size - 10, 'bottom');

      // Convert ke webp
      const buffer = canvas.toBuffer('image/jpeg');
      const webpBuffer = await sharp(buffer).toFormat('webp').toBuffer();

      res.set('Content-Type', 'image/webp');
      res.status(200).send(webpBuffer);

    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: err.message || 'Terjadi kesalahan internal'
      });
    }
  });
};