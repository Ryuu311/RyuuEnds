const os = require("os");
const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");
const disk = require("diskusage"); // npm install diskusage

module.exports = (app) => {
  // Hitung total requests
  let totalRequests = 0;
  app.use((req, res, next) => {
    totalRequests++;
    next();
  });

  // Load semua route dari folder API dan hitung total routes
  let totalRoutes = 0;
  const apiFolder = path.join(__dirname, "./src/api");
  fs.readdirSync(apiFolder).forEach((subfolder) => {
    const subfolderPath = path.join(apiFolder, subfolder);
    if (fs.statSync(subfolderPath).isDirectory()) {
      fs.readdirSync(subfolderPath).forEach((file) => {
        const filePath = path.join(subfolderPath, file);
        if (path.extname(file) === ".js") {
          require(filePath)(app);
          totalRoutes++;
          console.log(`✅ Loaded Route: ${subfolder}/${file}`);
        }
      });
    }
  });

  // Helper CPU usage
  const getCPUUsage = () =>
    new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = performance.now();

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = performance.now();
        const totalUsage = (endUsage.user + endUsage.system) / 1000;
        const cpuPercent = (totalUsage / (endTime - startTime)) * 100;
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });

  // Helper RAM usage
  const getRAMUsage = () => {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return Math.round((used / total) * 10000) / 100; // 2 decimal
  };

  // Helper Disk usage (root folder)
  const getDiskUsage = async () => {
    try {
      const info = await disk.check("/");
      const percent = ((info.total - info.free) / info.total) * 100;
      return Math.round(percent * 100) / 100;
    } catch {
      return 0; // fallback
    }
  };

  // Endpoint summary
  app.get("/api/system/summary", async (req, res) => {
    try {
      const cpu = await getCPUUsage();
      const ram = getRAMUsage();
      const diskPercent = await getDiskUsage();

      res.json({
        status: true,
        data: {
          totalRoutes,
          totalRequests,
          system: {
            cpu: Math.round(cpu * 100) / 100,
            ram,
            disk: diskPercent,
          },
        },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        error: "Failed to get system summary",
        message: err.message,
      });
    }
  });
};