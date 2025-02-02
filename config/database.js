const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

// SQL Queries to create tables if they don't exist
const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createTrainsTableQuery = `
  CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createBookingsTableQuery = `
  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    train_id INTEGER REFERENCES trains(id) ON DELETE CASCADE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Booked'
  );
`;

// Function to initialize DB and tables
async function initializeDatabase() {
  const client = await pool.connect();

  try {
    // Step 1: Run the table creation queries
    await client.query(createUsersTableQuery);
    await client.query(createTrainsTableQuery);
    await client.query(createBookingsTableQuery);

    console.log('Tables created or already exist.');
  } catch (err) {
    console.error('Error setting up database and tables:', err);
  } finally {
    client.release();
  }
}

// Call the initialize function
initializeDatabase();

module.exports = pool;
