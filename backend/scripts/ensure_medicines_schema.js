const db = require('../config/db');

const ensurePack = () => {
  db.query("SHOW COLUMNS FROM medicines LIKE 'pack'", (err, result) => {
    if (err) {
      console.error('Error checking columns:', err);
      process.exit(1);
    }
    if (result.length === 0) {
      console.log('Column `pack` missing — adding column...');
      db.query("ALTER TABLE medicines ADD COLUMN pack VARCHAR(100)", (err2) => {
        if (err2) {
          console.error('Error adding pack column:', err2);
          process.exit(1);
        }
        console.log('Added `pack` column successfully.');
        process.exit(0);
      });
    } else {
      console.log('Column `pack` already exists.');
      process.exit(0);
    }
  });
};

ensurePack();
