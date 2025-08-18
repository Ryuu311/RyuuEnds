module.exports = function (app) {
    const sdown = {
    _tools: {
        async hit(hitDescription, url, options, returnType = "text") {
            try {
                const response = await fetch(url, options)
                if (!response.ok) throw Error(`${response.status} ${response.statusText} ${(await response.text() || `(respond body kosong)`).substring(0, 100)}...`)
                try {

                    if (returnType === "text") {
                        const data = await response.text()
                        return { data, response }
                    } else if (returnType === "json") {
                        const data = await response.json()
                        return { data, response }
                    } else {
                        throw Error(`invalid param return type. pilih text/json`)
                    }
                } catch (error) {
                    throw Error(`gagal mengubah response menjadi ${returnType}\n${error.message}`)
                }
            } catch (error) {
                throw Error(`gagal hit. ${hitDescription}.\n${error.message}`)
            }
        },
        validateString: (description, variable) => { if (typeof (variable) !== "string" || variable?.trim()?.length === 0) throw Error(`${description} harus string dan gak boleh kosong!`) },
    },

    get baseHeaders() {
        return {
            'accept-encoding': 'gzip, deflate, br, zstd',
        }
    },

    get baseUrl() {
        return 'https://spotidown.app/'
    },

    async getCookieAndToken() {
        const headers = { ...this.baseHeaders }
        const url = this.baseUrl
        const { data: html, response } = await this._tools.hit(`homepage`, url, { headers })
        const tokenName = html.match(/input name="(.+?)"/)?.[1]
        const tokenValue = html.match(/type="hidden" value="(.+?)"/)?.[1]
        const cookie = response.headers.getSetCookie()?.[0]?.split('; ')?.[0]
        const result = { tokenName, tokenValue, cookie }
        if (!tokenName || !tokenValue || !cookie) throw Error(`ada value missing, token name, token value atau kuki`)
        console.log('got cookie and token')
        return result
    },

    async action(trackUrl, gcatObject) {
        const { cookie, tokenName, tokenValue } = gcatObject

        const baseUrl = new URL(this.baseUrl)
        const headers = {
            "referer": baseUrl.href,
            cookie,
            ...this.baseHeaders
        }
        const body = new URLSearchParams({
            url: trackUrl,
            [tokenName]: tokenValue,
            'g-recaptcha-response': null
        })

        const api = new URL(this.baseUrl)
        api.pathname = '/action'
        const { data: json } = await this._tools.hit(`action`, api, { headers, body, 'method': 'post' }, 'json')
        if (json.error) {
            throw Error(`ada error di fungsi action.\n${JSON.stringify(json, null, 2)}`)
        }
        const html = json.data
        const image = html.match(/<img src="(.+?)"/)?.[1]
        const data = html.match(/name="data" value=(?:"|')(.+?)(?:"|')/)?.[1]
        const base = html.match(/name="base" value="(.+?)"/)?.[1]
        const token = html.match(/name="token" value="(.+?)"/)?.[1]
        if (!data || !base || !token) throw Error(`fungsi action gagal. data, base atau token is missing.`)
        const result = { image, data, base, token, headers }
        console.log('got token submit')
        return result
    },

    async track(aObject) {
        const { data, base, token, image, headers } = aObject

        const body = new URLSearchParams({
            data,
            base,
            token,
        })
        const api = new URL(this.baseUrl)
        api.pathname = '/action/track'
        const { data: json } = await this._tools.hit(`action`, api, { headers, body, 'method': 'post' }, 'json')
        if (json.error) {
            throw Error(`ada error di fungsi action.\n${JSON.stringify(json, null, 2)}`)
        }
        const html = json.data
        const title = html.match(/title="(.+?)">/)?.[1] || `(no title)`
        const artist = html.match(/<span>(.+?)<\/span>/)?.[1] || `(no artist)`
        const audioUrl = html.match(/href="(.+?)" class="abutton is-success is-fullwidth "/)?.[1]
        const albumArtUrl = html.match(/<a href="(.+?)" class="abutton is-success is-fullwidth">/)?.[1]
        if (!audioUrl) throw Error(`error di fungsi track, tidak ada match untuk audioUrl`)
        const result = { title, artist, audioUrl, albumArtUrl: albumArtUrl || image }
        return result
    },

    async download(trackUrl) {
        this._tools.validateString(`url spotify track`, trackUrl)
        const gcatObject = await this.getCookieAndToken()
        const aObject = await this.action(trackUrl, gcatObject)
        const tObject = await this.track(aObject)
        return tObject
    },

}


  // Endpoint API
  app.get('/download/spdl', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) return res.json({ status: false, error: 'Masukkan URL Spotify' });
     
      const hasil = await sdown.download(url)
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

