/**
 * Middleware to sanitize inputs against NoSQL injection
 * Recursively removes any keys starting with '$' or containing '.'
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys with operator syntax like $where, $gt, or dotted paths
    if (!key.startsWith('$') && !key.includes('.')) {
      cleaned[key] = cleanObject(value);
    }
  }
  return cleaned;
};

export const sanitizeNoSql = (req, res, next) => {
  if (req.body) req.body = cleanObject(req.body);
  if (req.query) req.query = cleanObject(req.query);
  if (req.params) req.params = cleanObject(req.params);
  next();
};

