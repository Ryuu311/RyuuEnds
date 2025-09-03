const { Client } = require('ssh2');

async function downloadYouTube({ ip, port, username, password, url }) {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn.on('ready', () => {
      const cmd = `node ytdl-api/ytdl-core.js "${url}"`;

      conn.exec(cmd, (err, stream) => {
        if (err) return reject({ success: false, error: err.message });

        let stdout = "";
        let stderr = "";

        stream.on('close', (code, signal) => {
          conn.end();
          resolve({ success: true, code, stdout, stderr });
        }).on('data', (data) => {
          stdout += data.toString();
        }).stderr.on('data', (data) => {
          stderr += data.toString();
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

module.exports = function(app) {
  app.get("/download/ytplay", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ status: false, error: "Masukkan URL YouTube" });

      const result = await downloadYouTube({
        ip: '193.143.69.100',
        port: 35678,
        username: 'root',
        password: 'ryuu',
        url
      });

      let output;
      try {
        output = JSON.parse(result.stdout);
      } catch {
        output = result.stdout || result.stderr;
      }

      res.json({
        status: true,
        creator: "RyuuDev",
        output
      });
    } catch (err) {
      res.status(500).json({ status: false, creator: "RyuuDev", error: err.message });
    }
  });
};