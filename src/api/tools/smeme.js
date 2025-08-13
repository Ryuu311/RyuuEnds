const axios = require('axios');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');

module.exports = function(app) {
  app.get('/tools/smeme', async (req, res) => {
    try {
      const { img, atas, bawah } = req.query;

      if (!img) return res.status(400).send('Parameter img (URL) wajib diisi');
      if (!atas) return res.status(400).send('Parameter atas wajib diisi');
      if (!bawah) return res.status(400).send('Parameter bawah wajib diisi');

      // Ambil gambar background
      const imageResp = await axios.get(img, { responseType: 'arraybuffer' });
      const baseImage = await loadImage(Buffer.from(imageResp.data));

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext('2d');

      // Render background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // Daftarin font default (bisa diganti ke font custom)
      GlobalFonts.registerFromPath('./NotoColorEmoji.ttf', 'EmojiFont');

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;

      // Fungsi tulis teks dengan stroke + fill
      const drawText = (text, y) => {
        let fontSize = canvas.height / 10;
        ctx.font = `bold ${fontSize}px EmojiFont`;
        ctx.strokeText(text.toUpperCase(), canvas.width / 2, y);
        ctx.fillText(text.toUpperCase(), canvas.width / 2, y);
      };

      // Tulis teks atas & bawah
      drawText(atas, canvas.height * 0.1);
      drawText(bawah, canvas.height * 0.9);

      // Konversi ke WebP
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