const ytdl = require("@distube/ytdl-core");

const yt = {
  validateFormat(userFormat) {
    const validFormat = ["mp3", "360p", "720p", "1080p"];
    if (!validFormat.includes(userFormat))
      throw Error(`invalid format! available formats: ${validFormat.join(", ")}`);
  },

  handleFormat(userFormat, info) {
    this.validateFormat(userFormat);
    let format;

    if (userFormat === "mp3") {
      format = ytdl.chooseFormat(info.formats, {
        quality: "highestaudio",
        filter: "audioonly",
      });
    } else {
      // cari format dengan resolusi tertentu
      format = ytdl.chooseFormat(info.formats, {
        quality: "highestvideo",
      });

      // coba cari yang match resolusi (360p, 720p, 1080p)
      const find = info.formats.find(
        (f) => f.qualityLabel === userFormat && f.mimeType.includes("video")
      );
      if (find) format = find;
    }

    if (!format?.url) throw Error(`${userFormat} tidak tersedia`);
    return format;
  },

  async download(queryOrYtUrl, userFormat = "mp3") {
    this.validateFormat(userFormat);

    const info = await ytdl.getInfo(queryOrYtUrl);
    const format = this.handleFormat(userFormat, info);

    return {
      title: info.videoDetails.title,
      lengthSeconds: info.videoDetails.lengthSeconds,
      author: info.videoDetails.author.name,
      thumbnail: info.videoDetails.thumbnails.pop()?.url,
      format: userFormat,
      url: format.url, // direct stream url
    };
  },
};

module.exports = function (app) {
  // 🎵 Endpoint untuk MP3
  app.get("/download/ytmp3", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res.json({ status: false, error: "Masukkan URL YouTube" });

      const result = await yt.download(url, "mp3");

      res.json({
        creator: "Ryuu Dev",
        ...result,
      });
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });

  // 🎬 Endpoint untuk MP4 720p
  app.get("/download/ytmp4", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res.json({ status: false, error: "Masukkan URL YouTube" });

      const result = await yt.download(url, "720p");

      res.json({
        creator: "Ryuu Dev",
        ...result,
      });
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });
};