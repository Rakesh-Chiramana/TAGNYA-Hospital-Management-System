const db = require("../config/db");

const sql = `
  CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    age INT,
    emergency_contact VARCHAR(20),
    experience VARCHAR(50),
    study VARCHAR(100),
    joining_date DATE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    avatar LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(sql, (err) => {
  if (err) {
    console.error("❌ Failed to create staff table:", err.message);
    db.end();
  } else {
    console.log("✅ staff table created (or already exists)");
    db.query("UPDATE staff SET staff_id = CONCAT('S-', 1000 + id) WHERE staff_id IS NULL OR staff_id NOT LIKE 'S-%'", (err2) => {
      if (err2) {
        console.error("❌ Failed to update default staff IDs:", err2.message);
      } else {
        console.log("✅ Existing staff IDs updated successfully to S-1000 sequence");
      }
      db.end();
    });
  }
});
