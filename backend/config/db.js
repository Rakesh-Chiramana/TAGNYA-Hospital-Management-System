const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "acc_hospital",
});

const ensureDefaultAdmin = () => {
    const username = "admin";
    const password = "admin123";
    const name = "Administrator";
    const email = "admin@hospital.com";
    const role = "Admin";
    const status = "Active";

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error("Failed to hash default admin password", hashErr);
            return;
        }

        const sql = `
            INSERT INTO users (username, password, name, email, role, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                password = VALUES(password),
                name = VALUES(name),
                email = VALUES(email),
                role = VALUES(role),
                status = VALUES(status)
        `;

        db.query(sql, [username, hashedPassword, name, email, role, status], (insertErr) => {
            if (insertErr) {
                console.error("Failed to create/update default admin user", insertErr);
            } else {
                console.log("Default admin user ensured");
            }
        });
    });
};

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("ACC Database Connected");
        ensureDefaultAdmin();
    }
});

module.exports = db;