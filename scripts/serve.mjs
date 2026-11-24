import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { createServer } from "node:http";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".mid": "audio/midi",
  ".midi": "audio/midi"
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  const target = normalize(join(root, pathname));
  if (!target.startsWith(root) || !existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  const type = MIME[extname(target).toLowerCase()] || "application/octet-stream";
  const size = statSync(target).size;
  const headers = {
    "Content-Type": type,
    "Content-Length": size,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  };
  if (request.method === "HEAD") {
    response.writeHead(200, headers);
    response.end();
    return;
  }
  response.writeHead(200, headers);
  createReadStream(target).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Softwave: http://${host}:${port}/`);
});
