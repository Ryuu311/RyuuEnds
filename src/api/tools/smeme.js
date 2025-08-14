const axios = require('axios');
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');

module.exports = function (app) {
  app.get('/tools/smeme', async (req, res) => {
    try {
      const { img, atas, bawah } = req.query;

      if (!img) return res.status(400).send('Parameter img (URL) wajib diisi');
      if (!atas) return res.status(400).send('Parameter atas wajib diisi');
      if (!bawah) return res.status(400).send('Parameter bawah wajib diisi');

      // Ambil gambar
      const imageResp = await axios.get(img, { responseType: 'arraybuffer' });
      const baseImage = await loadImage(Buffer.from(imageResp.data));

      // Buat canvas ukuran sesuai gambar
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext('2d');

      // Render background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // Load font emoji
      // Daftarkan font Arial Narrow (huruf & angka)
        GlobalFonts.registerFromPath(
            path.join(__dirname, './lib/arialnarrow.ttf'),
            'Arial Narrow'
        );

        // Daftarkan font Noto Color Emoji (emoji)
        GlobalFonts.registerFromPath(
            path.join(__dirname, './lib/NotoColorEmoji.ttf'),
            'Noto Color Emoji'
        );

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';

      const drawText = (text, y, baseline) => {
        let fontSize = Math.floor(canvas.height * 0.10); // 10% dari tinggi gambar
        ctx.font = `900 ${fontSize}px "Arial Narrow", "Noto Color Emoji"`;

        // Kecilkan font kalau teks kepanjangan
        while (ctx.measureText(text).width > canvas.width * 0.9 && fontSize > 30) {
          fontSize -= 2;
          ctx.font = `900 ${fontSize}px "Arial Narrow", "Noto Color Emoji"`;
        }

        ctx.textBaseline = baseline;

        // Outline tebal
        ctx.lineWidth = Math.floor(fontSize / 4);
        ctx.strokeText(text.toUpperCase(), canvas.width / 2, y);

        // Outline tipis (halusin pinggiran)
        ctx.lineWidth = Math.floor(fontSize / 10);
        ctx.strokeText(text.toUpperCase(), canvas.width / 2, y);

        // Isi teks
        ctx.fillText(text.toUpperCase(), canvas.width / 2, y);
      };

      // Gambar teks atas & bawah
      drawText(atas, 10, 'top');
      drawText(bawah, canvas.height - 10, 'bottom');

      // Convert ke webp
      const buffer = canvas.toBuffer('image/png');
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