module.exports = function (app) {
 const download = async (videoId, format = "mp3") => {
    const headers = {
        "accept-encoding": "gzip, deflate, br, zstd",
        "origin": "https://ht.flvto.online",
    }
    const body = JSON.stringify({
        "id": videoId,
        "fileType": format
    })
    const response = await fetch (`https://ht.flvto.online/converter`,{headers, body, method: "post"})
    if (!response.ok) throw Error (`${response.status} ${response.statusText}\n${await response.text()}`)
    const json = await response.json()
    return json
}


  // Endpoint API
  app.get('/download/ytmp3', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.json({ status: false, error: 'Masukkan URL YouTube' });
     
      function extractYoutubeID(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        } else if (urlObj.hostname.includes('youtu.be')) {
            return urlObj.pathname.slice(1);
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}     
const hasil = await download(extractYoutubeID(url));
      res.json({
        creator: "RyuuDev",
        output: [hasil]
      });
    } catch (err) {
      res.json({
        creator: "RyuuDev",
        status: false,
        error: err.message
      });
    }
  });
};

