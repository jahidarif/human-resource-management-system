import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { pool } from '../src/db';

dotenv.config();

async function runMigrations() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Migration tracking table ready.');

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const [existing] = await pool.query(
        'SELECT id FROM migrations WHERE name = ?',
        [file]
      ) as any[];

      if (existing.length === 0) {
        const sql = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf-8'
        );
        await pool.query(sql);
        await pool.query(
          'INSERT INTO migrations (name) VALUES (?)',
          [file]
        );
        console.log(`✓ Ran migration: ${file}`);
      } else {
        console.log(`- Skipped (already ran): ${file}`);
      }
    }

    console.log('All migrations complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();