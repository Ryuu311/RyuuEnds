app.get('/ai/ryzumi-filter', async (req, res) => {
    try {
        const { url, filter } = req.query;
        if (!url || !filter) {
            return res.status(400).json({ status: false, error: 'Parameter url dan filter wajib diisi' });
        }

        const response = await axios.get('https://api.ryzumi.vip/api/ai/negro', {
            params: { url, filter },
            responseType: 'arraybuffer', // karena hasilnya berupa gambar
            headers: {
                'accept': 'image/png'
            }
        });

        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error("Error dari ryzumi:", error.message);
        res.status(500).json({ status: false, error: 'Gagal memproses gambar dari API ryzumi' });
    }
});
