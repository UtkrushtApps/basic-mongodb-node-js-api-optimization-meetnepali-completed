// Basic middleware implementations used in app.js

function logRequests(req, res, next) {
  const start = Date.now();

  // Serialize query parameters primarily for logging; this can add overhead when queries are large.
  const queryString = JSON.stringify(req.query || {});

  console.log(
    `[middleware] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} query=${queryString}`
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[middleware] Completed ${req.method} ${req.originalUrl} in ${duration}ms with status ${res.statusCode}`
    );
  });

  next();
}

// Very simple fake auth that attaches a static user to every request.
function fakeAuth(req, res, next) {
  req.user = {
    id: 'demo-user-id',
    role: 'viewer',
  };
  next();
}

module.exports = {
  logRequests,
  fakeAuth,
};
