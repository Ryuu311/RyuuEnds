const { Client } = require('ssh2');

async function downloadYouTube({ ip, port, username, password, url }) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';

    conn.on('ready', () => {
      // Perintah tinggal panggil yt.js + url
      const cmd = `node yt.js "${url}"`;

      conn.exec(cmd, (err, stream) => {
        if (err) return reject({ success: false, error: err.message });

        stream.on('close', (code, signal) => {
          conn.end();
          resolve({ success: true, code, output });
        }).on('data', (data) => {
          output += data.toString();
        }).stderr.on('data', (data) => {
          output += data.toString();
        });
      });
    }).on('error', (err) => {
      reject({ success: false, error: err.message });
    }).connect({
      host: ip,
      port: port,
      username: username,
      password: password
    });
  });
}


module.exports = function (app) {
  // 🎵 Endpoint untuk MP3
  app.get("/download/ytplay", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url)
        return res.json({ status: false, error: "Masukkan URL YouTube" });

      const result = await downloadYouTube({
      ip: 'ipserver.nauval.cloud',
      port: 21633,
      username: 'root',
      password: 'ryuu65',
      url: url
    });

      res.json({
        creator: "Ryuu Dev",
        output: result,
      });
    } catch (err) {
      res.json({ status: false, error: err.message });
    }
  });

};