const fs = require('fs');
const path = require('path');

module.exports = function(app) {
    let requestCount = 0;
    let rps = 0;

    // Middleware untuk hit request
    app.use((req, res, next) => {
        requestCount++;
        next();
    });

    // Hitung RPS tiap detik
    setInterval(() => {
        rps = requestCount;
        requestCount = 0;
    }, 1000);

    const totalRoutes = 50

    // Endpoint /stats
    app.get('/stats', (req, res) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        res.json({
            ip,
            rps,
            totalRouter: totalRoutes
        });
    });
};