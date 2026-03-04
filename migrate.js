const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
    db.exec('ALTER TABLE invoices ADD COLUMN status text DEFAULT "pending";');
    console.log('Database migrated successfully: Added status column to invoices');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Column already exists.');
    } else {
        console.error('Migration failed:', error);
    }
}
