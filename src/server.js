const http = require('http');
const app = require('./app');
const { connectToDatabase } = require('./database');

const PORT = 3000;

(async () => {
  try {
    await connectToDatabase();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`[server] API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start application:', err);
    process.exit(1);
  }
})();
