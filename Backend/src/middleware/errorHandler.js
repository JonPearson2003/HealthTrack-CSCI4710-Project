export function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err.message || 'Server error',
    ...(isProd ? {} : { details: err.details || null })
  });
}
