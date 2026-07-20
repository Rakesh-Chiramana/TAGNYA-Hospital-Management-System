const db = require("../config/db");
const bcrypt = require("bcrypt");

const loginUser = (username, password, callback) => {
    const sql = `
    SELECT *
    FROM users
    WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
    AND status = 'Active'
    LIMIT 1
  `;

    console.log('loginUser SQL params:', { username, passwordPreview: password ? '***' : '(empty)' });

    db.query(sql, [username, username], (err, result) => {
        if (err) {
            console.error('loginUser SQL error:', err);
            return callback(err, null);
        }

        if (!result || result.length === 0) {
            console.log('loginUser result count: 0');
            return callback(null, []);
        }

        const user = result[0];
        const stored = user.password || '';

        // First try bcrypt comparison (expected in migrated users)
        bcrypt.compare(password, stored, (bcryptErr, matched) => {
            if (bcryptErr) {
                console.error('bcrypt compare error:', bcryptErr);
                return callback(bcryptErr, null);
            }

            if (matched) {
                // Correct password (hashed)
                return callback(null, [user]);
            }

            // Fallback: if stored password equals plaintext password, migrate to bcrypt
            if (stored === password) {
                // Hash and update password in DB
                bcrypt.hash(password, 10, (hashErr, hash) => {
                    if (hashErr) {
                        console.error('bcrypt hash error during migration:', hashErr);
                        // Still allow login this time
                        return callback(null, [user]);
                    }

                    const updateSql = `UPDATE users SET password = ? WHERE id = ?`;
                    db.query(updateSql, [hash, user.id], (uErr) => {
                        if (uErr) console.error('Failed to migrate plaintext password to bcrypt for user', user.id, uErr);
                        // proceed with login
                        return callback(null, [user]);
                    });
                });
                return;
            }

            // Not matched
            return callback(null, []);
        });
    });
};

module.exports = {
    loginUser,
};