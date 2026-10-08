const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// 1. Initialize SQLite Database
async function initDatabase() {
  try {
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
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

initDatabase();

// 2. Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ Server is ready to send emails!");
  }
});

// Test route to verify server is alive
app.get('/', (req, res) => {
  res.send('Hyder Logistics Backend is Running!');
});

// 3. Handle Quote Form Submission
// 3. Handle Quote Form Submission
app.post('/api/quote', async (req, res) => {
  console.log("--> New Quote Request Received:", req.body);

  const { name, email, phone, service, origin, dest, message } = req.body;

  try {
    // A. Database mein save karein
    if (db) {
      await db.run(
        `INSERT INTO quotes (name, email, phone, service, origin, dest, message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name || '', email || '', phone || '', service || '', origin || '', dest || '', message || '']
      );
    }

    const senderEmail = process.env.EMAIL_USER;
    const recipientEmail = process.env.CLIENT_EMAIL || process.env.EMAIL_USER;

    if (!senderEmail) {
      throw new Error("EMAIL_USER environment variable is missing in .env!");
    }

    // B. Email options setup
    const mailOptions = {
      from: `"Hyder Logistics" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: email || senderEmail,
      subject: 'New Quote Request - Hyder Logistics',
      html: `
        <h3>New Quote Request Received</h3>
        <p><strong>Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Service:</strong> ${service || 'N/A'}</p>
        <p><strong>Origin:</strong> ${origin || 'N/A'}</p>
        <p><strong>Destination:</strong> ${dest || 'N/A'}</p>
        <p><strong>Message:</strong> ${message || 'N/A'}</p>
      `
    };

    // C. Email send karein
    const info = await transporter.sendMail(mailOptions);
    console.log("--> Email sent successfully:", info.response);

    return res.status(200).json({ success: true, message: 'Quote submitted successfully!' });

  } catch (error) {
    console.error("========== NODEMAILER ERROR ==========");
    console.error(error.stack || error);
    console.error("=======================================");

    return res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

// 4. Start Express Server
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}!`);
});
module.exports = app;