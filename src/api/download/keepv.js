module.exports = function (app) {
  const fetch = require("node-fetch")

  const AUTHOR = "Ryuu Dev"
  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36"
  const KEEPV_ORIGIN = "https://keepv.id"

  function isYouTubeUrl(u) {
    if (!u) return false
    try {
      const url = new URL(u)
      return /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(url.hostname)
    } catch {
      return false
    }
  }

  function getQuality(fmt, value) {
    if (fmt === 1) return ({ 320: 0, 256: 1, 192: 2, 160: 3, 128: 4, 96: 5 })[value] ?? null
    if (fmt === 0) return [144, 360, 480, 720, 1080].includes(value) ? value : null
    return null
  }

  function randomHex(len = 64, prefix = "t_") {
    const chars = "0123456789abcdef"
    let out = prefix
    for (let i = 0; i < len; i++) out += chars[(Math.random() * chars.length) | 0]
    return out
  }

  function tokenValidToSec(minutes = 20) {
    return Math.floor(Date.now() / 1000 + minutes * 60).toString()
  }

  function pickSetCookie(h) {
    const single = h.get("set-cookie")
    if (single) return single.split(",")[0]?.split(";")[0] ?? null
    return null
  }

  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  async function fetchJson(url, init) {
    const r = await fetch(url, init)
    if (!r.ok) {
      const body = await r.text().catch(() => "")
      throw new Error(`${r.status} ${r.statusText}\n${body || "(empty)"}`)
    }
    return r.json()
  }

  async function getYouTubeMeta(youtubeUrl) {
    try {
      const u = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`
      const meta = await fetchJson(u, { headers: { "user-agent": UA, accept: "application/json" } })
      return { title: meta.title, author: meta.author_name ?? "Unknown" }
    } catch {
      return { title: "YouTube Media", author: "Unknown" }
    }
  }

  async function keepvGetCookie() {
    const r = await fetch(KEEPV_ORIGIN, { headers: { "user-agent": UA, accept: "text/html" } })
    if (!r.ok) throw new Error(`Keepv home failed: ${r.status} ${r.statusText}`)
    const cookie = pickSetCookie(r.headers)
    if (!cookie) throw new Error("Keepv cookie missing")
    return { cookie, redirect: r.url }
  }

  async function keepvValidate(cookie, referer, youtubeUrl) {
    const url = `${KEEPV_ORIGIN}/button/?url=${encodeURIComponent(youtubeUrl)}`
    const r = await fetch(url, { headers: { cookie, referer, "user-agent": UA } })
    if (!r.ok) throw new Error(`Keepv validate failed: ${r.status} ${r.statusText}`)
    return { cookie, referer: url }
  }

  async function keepvConvert(cookie, referer, youtubeUrl) {
    const body = new URLSearchParams({
      url: youtubeUrl,
      convert: "gogogo",
      token_id: randomHex(64, "t_"),
      token_validto: tokenValidToSec(20),
    })
    const r = await fetch(`${KEEPV_ORIGIN}/convert/`, {
      method: "POST",
      headers: {
        cookie,
        referer,
        origin: KEEPV_ORIGIN,
        "x-requested-with": "XMLHttpRequest",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent": UA,
      },
      body,
    })
    if (!r.ok) throw new Error(`Keepv convert failed: ${r.status} ${r.statusText}`)
    const data = await r.json()
    if (data.error) throw new Error(`Keepv convert error: ${data.error}`)
    if (!data.jobid) throw new Error("Keepv jobid empty")
    return data.jobid
  }

  async function keepvCheck(cookie, referer, jobid) {
    const base = new URL(`${KEEPV_ORIGIN}/convert/`)
    let last = {}
    for (let i = 1; i <= 60; i++) {
      base.search = new URLSearchParams({ jobid, time: Date.now().toString() }).toString()
      const r = await fetch(base.toString(), {
        headers: { cookie, referer, "x-requested-with": "XMLHttpRequest", "user-agent": UA },
      })
      last = await r.json()
      if (last.dlurl) return { url: last.dlurl, polls: i }
      if (last.error) throw new Error(`Keepv check error: ${JSON.stringify(last)}`)
      await delay(2000)
    }
    throw new Error("Keepv: result polling timed out")
  }

  async function keepvDownloader(youtubeUrl, fmt = 1, quality = 128) {
    if (!isYouTubeUrl(youtubeUrl)) throw new Error("URL YouTube tidak valid.")

    const q = getQuality(fmt, quality)
    if (q === null) {
      throw new Error(fmt === 1 ? "Bitrate audio tidak valid (96–320 kbps)" : "Resolusi video tidak valid (144–1080)")
    }

    const meta = await getYouTubeMeta(youtubeUrl)
    const ext = fmt === 1 ? ".mp3" : ".mp4"
    const filename = (meta.title || "YouTube Media").endsWith(ext) ? meta.title : `${meta.title}${ext}`

    const { cookie, redirect } = await keepvGetCookie()
    const { referer } = await keepvValidate(cookie, redirect, youtubeUrl)
    const jobid = await keepvConvert(cookie, referer, youtubeUrl)
    const { url: realDownloadUrl, polls } = await keepvCheck(cookie, referer, jobid)

    return {
      type: fmt === 1 ? "audio" : "video",
      title: meta.title,
      channel: meta.author,
      quality: q,
      polls,
      download_link: realDownloadUrl,
      filename,
    }
  }

  // endpoint mp3
  app.get("/download/keepv/mp3", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) return res.json({ status: false, error: "Masukkan URL YouTube" })

      const hasil = await keepvDownloader(url, 1, 128)
      res.json({ creator: AUTHOR, status: true, output: [hasil] })
    } catch (err) {
      res.json({ creator: AUTHOR, status: false, error: err.message })
    }
  })

  // endpoint mp4
  app.get("/download/keepv/mp4", async (req, res) => {
    try {
      const { url } = req.query
      if (!url) return res.json({ status: false, error: "Masukkan URL YouTube" })

      const hasil = await keepvDownloader(url, 0, 720)
      res.json({ 
      creator: AUTHOR, 
      status: true, 
      output: [hasil] })
    } catch (err) {
      res.json({ 
      creator: AUTHOR, 
      status: false, 
      error: err.message })
    }
  })
}