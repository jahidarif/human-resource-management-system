import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { pool } from '../src/db';

dotenv.config();

const JOB_TITLES = [
  'Software Engineer',
  'Product Manager',
  'UI/UX Designer',
  'HR Manager',
  'Accountant',
  'Data Analyst',
  'DevOps Engineer',
  'Marketing Specialist',
  'Sales Executive',
  'Operations Manager',
];

function getRealisticStatus(
  date: Date
): 'Present' | 'Absent' | 'Leave' {
  const day = date.getDay();
  if (day === 0 || day === 6) return 'Absent';
  const rand = Math.random();
  if (rand < 0.80) return 'Present';
  if (rand < 0.92) return 'Leave';
  return 'Absent';
}

function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

async function seed() {
  try {
    console.log('Starting seed...');

    // seed admin
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await pool.query(`
      INSERT INTO users (email, password, role)
      VALUES (?, ?, 'admin')
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, ['admin@hrm.com', hashedPassword]);
    console.log('✓ Admin seeded (admin@hrm.com / Admin@123)');

    // clear existing data
    await pool.query('DELETE FROM attendance');
    await pool.query('DELETE FROM employees');
    console.log('✓ Cleared existing data');

    // seed 50 employees
    const employeeIds: number[] = [];

    for (let i = 0; i < 50; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({
        firstName,
        lastName,
        provider: 'company.com',
      });
      const role = JOB_TITLES[
        Math.floor(Math.random() * JOB_TITLES.length)
      ];
      const hireDate = faker.date.between({
        from: '2020-01-01',
        to: '2024-01-01',
      }).toISOString().split('T')[0];
      const salary = faker.number.float({
        min: 30000,
        max: 150000,
        fractionDigits: 2,
      });

      const [result] = await pool.query(
        `INSERT INTO employees
          (first_name, last_name, email, role, hire_date, salary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [firstName, lastName, email, role, hireDate, salary]
      ) as any[];

      employeeIds.push(result.insertId);
    }
    console.log('✓ Seeded 50 employees');

    // seed 3 months attendance
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const allDates = getDatesInRange(threeMonthsAgo, today);

    for (const employeeId of employeeIds) {
      const values: any[] = [];
      const placeholders: string[] = [];

      for (const date of allDates) {
        const dateStr = date.toISOString().split('T')[0];
        const status = getRealisticStatus(date);
        values.push(employeeId, dateStr, status);
        placeholders.push('(?, ?, ?)');
      }

      await pool.query(
        `INSERT IGNORE INTO attendance (employee_id, date, status)
         VALUES ${placeholders.join(', ')}`,
        values
      );
    }
    console.log('✓ Seeded 3 months attendance for 50 employees');
    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();