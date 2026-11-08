require('dotenv').config();
const express = require('express');
const axios = require('axios');
axios.defaults.timeout = 10000;
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { createHash, randomInt } = require('crypto');

const app = express();
app.use(express.json());
app.get('/api/config', (req, res) => {
  res.json({ paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '' });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(__dirname));

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PORT = process.env.PORT || 3000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
  query_timeout: 10000,
  statement_timeout: 10000
});

let usersTableReady = false;
function isDatabaseUnavailable(error) {
  const code = error.code || '';
  return code.startsWith('08') ||
    ['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT', 'EHOSTUNREACH', '57P03'].includes(code);
}

async function ensureUsersTable() {
  if (usersTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      verified BOOLEAN NOT NULL DEFAULT TRUE,
      verification_code_hash TEXT,
      verification_code_expires_at TIMESTAMPTZ,
      verification_attempts INTEGER NOT NULL DEFAULT 0,
      wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS verification_code_hash TEXT,
      ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS verification_attempts INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id),
      reference TEXT NOT NULL UNIQUE,
      amount_usd NUMERIC(12,2) NOT NULL CHECK (amount_usd > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  usersTableReady = true;
}

function createToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function hashVerificationCode(code) {
  return createHash('sha256').update(code).digest('hex');
}

function createVerificationCode() {
  return String(randomInt(100000, 1000000));
}

async function sendVerificationCode(email, code) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('EMAIL_USER or EMAIL_PASS is not configured');
    error.isEmailDeliveryError = true;
    throw error;
  }
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Pets account',
      text: `Your verification code is: ${code}. It expires in 10 minutes. If you did not sign up, ignore this.`
    });
  } catch (cause) {
    const error = new Error('Verification email delivery failed');
    error.isEmailDeliveryError = true;
    error.cause = cause;
    throw error;
  }
}

async function issueVerificationCode(userId, email) {
  const code = createVerificationCode();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE users
       SET verification_code_hash=$1,
           verification_code_expires_at=NOW() + INTERVAL '10 minutes',
           verification_attempts=0
       WHERE id=$2`,
      [hashVerificationCode(code), userId]
    );
    await sendVerificationCode(email, code);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch((rollbackError) => {
      console.error('Verification rollback error:', rollbackError.message);
    });
    throw error;
  } finally {
    client.release();
  }
}

function requireLogin(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match || !process.env.JWT_SECRET) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' });
  }
  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET);
    if (typeof payload === 'string' || !payload.sub) {
      return res.status(401).json({ success: false, message: 'Please log in to continue' });
    }
    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' });
  }
}

app.post(['/api/auth/signup', '/api/signup'], async (req, res) => {
  const { name, email, password } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanName) return res.status(400).json({ success: false, message: 'Please enter your name' });
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  let client;
  try {
    await ensureUsersTable();
    const existing = await pool.query(
      'SELECT id,verified FROM users WHERE email=$1',
      [cleanEmail]
    );
    if (existing.rows.length && existing.rows[0].verified) {
      return res.status(409).json({
        success: false,
        error: 'Account already exists, please log in',
        message: 'Account already exists, please log in'
      });
    }

    if (existing.rows.length) {
      await issueVerificationCode(existing.rows[0].id, cleanEmail);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      const code = createVerificationCode();
      client = await pool.connect();
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO users(
           name,email,password_hash,verified,verification_code_hash,
           verification_code_expires_at,verification_attempts,wallet_balance
         )
         VALUES($1,$2,$3,FALSE,$4,NOW() + INTERVAL '10 minutes',0,0)
         ON CONFLICT(email) DO NOTHING
         RETURNING id`,
        [cleanName, cleanEmail, passwordHash, hashVerificationCode(code)]
      );
      if (!result.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          error: 'Account already exists, please log in',
          message: 'Account already exists, please log in'
        });
      }
      await sendVerificationCode(cleanEmail, code);
      await client.query('COMMIT');
    }

    return res.status(existing.rows.length ? 200 : 201).json({
      success: true,
      needsVerification: true,
      message: 'Verification code sent to your email',
      email: cleanEmail
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch((rollbackError) => {
        console.error('Signup rollback error:', rollbackError.message);
      });
    }
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Account already exists, please log in',
        message: 'Account already exists, please log in'
      });
    }
    if (error.isEmailDeliveryError) {
      console.error('Signup email error:', error.cause?.message || error.message);
      return res.status(502).json({
        success: false,
        error: 'Could not send verification email. Check email address and try again.',
        message: 'Could not send verification email. Check email address and try again.'
      });
    }
    if (error.code && !isDatabaseUnavailable(error) && !['23505'].includes(error.code)) {
      console.error('Signup verification/database error:', error.message);
    }
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({
      success: false,
      error: unavailable ? 'Database unavailable' : 'Account creation failed',
      message: unavailable ? 'Database unavailable' : 'Account creation failed'
    });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ success: false, error: 'Enter the 6-digit verification code' });
  }
  try {
    await ensureUsersTable();
    const result = await pool.query(
      `SELECT id,verified,verification_code_hash,
              verification_code_expires_at,verification_attempts
       FROM users WHERE email=$1`,
      [email]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'Account does not exist, please create account' });
    }
    const user = result.rows[0];
    if (user.verified) {
      return res.json({ success: true, message: 'Already verified, please log in' });
    }
    if (!user.verification_code_expires_at || new Date(user.verification_code_expires_at) <= new Date()) {
      return res.status(400).json({ success: false, error: 'Code expired, please resend' });
    }
    if (user.verification_code_hash !== hashVerificationCode(code)) {
      await pool.query(
        'UPDATE users SET verification_attempts=verification_attempts+1 WHERE id=$1',
        [user.id]
      );
      return res.status(400).json({ success: false, error: 'Wrong code, try again' });
    }
    await pool.query(
      `UPDATE users
       SET verified=TRUE,verification_code_hash=NULL,
           verification_code_expires_at=NULL,verification_attempts=0
       WHERE id=$1`,
      [user.id]
    );
    return res.json({ success: true, message: 'Email verified! Please log in.' });
  } catch (error) {
    console.error('Email verification error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({
      success: false,
      error: unavailable ? 'Database unavailable' : 'Email verification failed'
    });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  }
  try {
    await ensureUsersTable();
    const result = await pool.query(
      'SELECT id,verified FROM users WHERE email=$1',
      [email]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'Account does not exist, please create account' });
    }
    if (result.rows[0].verified) {
      return res.status(409).json({ success: false, error: 'Email is already verified, please log in' });
    }
    await issueVerificationCode(result.rows[0].id, email);
    return res.json({ success: true, message: 'New code sent' });
  } catch (error) {
    console.error('Resend verification code error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 502).json({
      success: false,
      error: unavailable
        ? 'Database unavailable'
        : 'Could not send verification email. Check email address and try again.'
    });
  }
});

app.post(['/api/auth/login', '/api/login'], async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_PATTERN.test(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'Account service is not configured' });
  }

  try {
    await ensureUsersTable();
    const result = await pool.query(
      'SELECT id,name,email,password_hash,wallet_balance FROM users WHERE email=$1',
      [cleanEmail]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Account does not exist, please create account'
      });
    }
    const user = result.rows[0];
    if (!await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ success: false, message: 'Wrong password, try again' });
    }
    const verification = await pool.query(
      'SELECT verified FROM users WHERE id=$1',
      [user.id]
    );
    if (!verification.rows[0].verified) {
      try {
        await issueVerificationCode(user.id, user.email);
      } catch (emailError) {
        console.error('Login verification email error:', emailError.cause?.message || emailError.message);
        return res.status(502).json({
          success: false,
          error: 'Could not send verification email. Check email address and try again.'
        });
      }
      return res.status(403).json({
        success: false,
        needsVerification: true,
        error: 'Please verify your email first. Code sent to your email.'
      });
    }
    return res.json({
      success: true,
      message: 'Welcome back!',
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, balance: Number(user.wallet_balance) }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({
      success: false,
      message: unavailable ? 'Database unavailable' : 'Login failed'
    });
  }
});

app.post('/api/wallet/verify', requireLogin, async (req, res) => {
  const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
  if (!reference) {
    return res.status(400).json({ success: false, message: 'Payment reference is required' });
  }
  if (!PAYSTACK_SECRET_KEY) {
    return res.status(503).json({ success: false, message: 'Payment service is not configured' });
  }

  let client;
  try {
    await ensureUsersTable();
    const verifiedResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
    );
    const transaction = verifiedResponse.data?.data;
    if (transaction?.status !== 'success' || transaction.currency !== 'USD' ||
        !Number.isSafeInteger(transaction.amount) || transaction.amount < 1) {
      return res.status(400).json({ success: false, message: 'Payment could not be verified in USD' });
    }

    client = await pool.connect();
    await client.query('BEGIN');
    const userResult = await client.query(
      'SELECT id,email FROM users WHERE id=$1 FOR UPDATE',
      [req.userId]
    );
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, message: 'Please log in to continue' });
    }
    if (transaction.customer?.email?.toLowerCase() !== userResult.rows[0].email.toLowerCase()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Payment email does not match your account' });
    }

    const amountUsd = (transaction.amount / 100).toFixed(2);
    const inserted = await client.query(
      `INSERT INTO wallet_transactions(user_id,reference,amount_usd)
       VALUES($1,$2,$3)
       ON CONFLICT(reference) DO NOTHING
       RETURNING id`,
      [req.userId, reference, amountUsd]
    );
    if (inserted.rows.length === 0) {
      const previous = await client.query(
        'SELECT user_id FROM wallet_transactions WHERE reference=$1',
        [reference]
      );
      if (String(previous.rows[0]?.user_id) !== String(req.userId)) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'Payment reference has already been used' });
      }
    } else {
      await client.query(
        'UPDATE users SET wallet_balance=wallet_balance + $1 WHERE id=$2',
        [amountUsd, req.userId]
      );
    }
    const balanceResult = await client.query(
      'SELECT wallet_balance FROM users WHERE id=$1',
      [req.userId]
    );
    await client.query('COMMIT');
    return res.json({
      success: true,
      message: 'Wallet topped up successfully',
      balance: Number(balanceResult.rows[0].wallet_balance)
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch((rollbackError) => {
      console.error('Wallet rollback error:', rollbackError.message);
    });
    console.error('Wallet verification error:', error.response?.data || error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 400).json({
      success: false,
      message: error.response?.data?.message || (unavailable ? 'Database unavailable' : 'Payment verification failed')
    });
  } finally {
    if (client) client.release();
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

if (require.main === module) {
  app.listen(PORT, () => console.log('Running on', PORT));
}
module.exports = app;
