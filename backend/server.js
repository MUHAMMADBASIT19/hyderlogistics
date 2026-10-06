const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

let db;

// 1. Initialize SQLite Database
async function initDatabase() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      service TEXT,
      origin TEXT,
      dest TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('SQLite Database successfully connected!');
}

initDatabase();

// 2. Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 3. Handle Quote Form Submission
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, service, origin, dest, message } = req.body;

  try {
    // Database me Save karna
    await db.run(
      `INSERT INTO quotes (name, email, phone, service, origin, dest, message) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, service, origin, dest, message]
    );

    // Email Notification bhejnah
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Quote Request from ${name} - Hyder Logistics`,
      html: `
        <h2>New Quote Request Received</h2>
        <p><strong>Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Service:</strong> ${service || 'N/A'}</p>
        <p><strong>Origin:</strong> ${origin || 'N/A'}</p>
        <p><strong>Destination:</strong> ${dest || 'N/A'}</p>
        <p><strong>Message:</strong> ${message || 'N/A'}</p>
      `,
    };

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log('--- Email Notification Bhej Di Gai Hai ---');
    }

    console.log('--- Quote Request Database Mein Save Ho Gai Hai ---');

    res.status(200).json({
      success: true,
      message: 'Quote request database me save ho gayi hai!'
    });
  } catch (error) {
    console.error('Error handling quote request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request.'
    });
  }
});

// View All Saved Quotes
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await db.all('SELECT * FROM quotes ORDER BY id DESC');
    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}!`);
});