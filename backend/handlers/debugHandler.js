const db = require('../config/db');

// Development-only: return users list without passwords
const listUsers = (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const sql = `SELECT id, username, email, role, status FROM users LIMIT 100`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('debug listUsers error:', err);
      return res.status(500).json({ success: false, message: 'DB error' });
    }

    return res.json({ success: true, users: rows });
  });
};

module.exports = { listUsers };
