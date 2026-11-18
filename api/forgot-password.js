const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { email } = req.body || {};
    if (!email) return res.json({ success: false, error: 'Enter email' });
    const cleanEmail = email.toLowerCase().trim();

    // 1. CHECK NEON DB - DOES USER EXIST?
    const found = await pool.query('SELECT id, email FROM users WHERE email = $1', [cleanEmail]);
    if (found.rows.length === 0) {
      return res.json({ success: false, needsAccount: true, error: 'No account found with this email. Please create account first.' });
    }
    const user = found.rows[0];

    // 2. CREATE TOKEN - valid 1 hour
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3', [token, expires, user.id]);

    // 3. SEND EMAIL WITH EMAIL_USER / EMAIL_PASS
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const link = `https://y-pets-shop.vercel.app/reset-password.html?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cleanEmail,
      subject: 'Reset your Pets World password',
      html: `<p>Hi, click below to reset your password. Link expires in 1 hour.</p><p><a href="${link}">Reset Password</a></p><p>If you did not request this, ignore it.</p>`
    });

    return res.json({ success: true, message: 'Reset link sent. Check your email / spam.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Server error: ' + e.message });
  }
};
