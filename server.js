const http = require("http");
const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "Website", "Sambhrama Media House", "Sambhrama Media House", "Sambhrama Media House");
const primaryRoot = path.join(baseDir, "sambhrama-media-house");
const fallbackRoot = path.join(baseDir, "agntix-vue-nuxt.netlify.app");
const appRoot = fs.existsSync(primaryRoot) ? primaryRoot : fallbackRoot;
const port = process.env.PORT || 3000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject"
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent((req.url || "/").split("?")[0]);

  for (const marker of ["/sambhrama-media-house", "/agntix-vue-nuxt.netlify.app"]) {
    const idx = reqPath.indexOf(marker);
    if (idx !== -1) {
      reqPath = reqPath.slice(idx + marker.length) || "/";
      break;
    }
  }

  if (reqPath === "/" || reqPath === "/index.html") {
    res.writeHead(302, { Location: "/dark/creative-agency.html", "Cache-Control": "no-store" });
    return res.end();
  }

  if (reqPath === "/dark" || reqPath === "/dark/" || reqPath === "/dark/index" || reqPath === "/dark/index.html") {
    reqPath = "/dark/creative-agency.html";
  }

  let filePath = path.join(appRoot, reqPath);
  if (!fs.existsSync(filePath) && reqPath.startsWith("/cdnjs.cloudflare.com/")) {
    filePath = path.join(baseDir, reqPath);
  }
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + ".html")) {
    filePath += ".html";
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain", "Cache-Control": "no-store" });
    return res.end("Not found: " + reqPath);
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`\nServer running at: http://localhost:${port}/dark/creative-agency.html\n`);
});
