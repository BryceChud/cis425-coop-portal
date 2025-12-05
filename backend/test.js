const http = require("http");

const PORT = 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from WSL\n");
  })
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Test server on http://localhost:${PORT}`);
  });
