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
// ===== PETS - ADD ONLY THIS BLOCK - DO NOT DELETE ABOVE =====
const DOG_API_KEY = process.env.DOG_API_KEY;
const CAT_API_KEY = process.env.CAT_API_KEY;
console.log('Dog?', DOG_API_KEY ? 'YES ✅' : 'NO ❌');
console.log('Cat?', CAT_API_KEY ? 'YES ✅' : 'NO ❌');

function makePrice(id, name, type) {
  const str = String(id) + name + type;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  const price = 1050 + (hash % (2800 - 1050 + 1));
  return Math.round(price / 50) * 50;
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

app.get('/api/dogs/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const type = (req.query.type || 'dog').toLowerCase();
    if (!q) return res.json({});
    if (type !== 'dog' && type !== 'puppy') return res.json({});
    const breedRes = await fetch(`https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(q)}`, { headers: { 'x-api-key': DOG_API_KEY } });
    const breeds = await breedRes.json();
    if (!breeds.length) return res.json({});
    const breed = breeds[0];
    const imgRes = await fetch(`https://api.thedogapi.com/v1/images/search?breed_ids=${breed.id}&limit=4`, { headers: { 'x-api-key': DOG_API_KEY } });
    const images = await imgRes.json();
    const isPuppy = type === 'puppy';
    res.json({
      id: breed.id, type: isPuppy ? 'Puppy' : 'Dog',
      name: isPuppy ? breed.name + ' Puppy' : breed.name,
      temperament: breed.temperament || 'Friendly, Loyal',
      life_span: breed.life_span, weight: breed.weight?.metric + ' kg',
      origin: breed.origin || 'Unknown',
      age: isPuppy ? '8-12 weeks' : '1-3 years',
      ageLabel: isPuppy ? '🐶 Puppy - 8-12 weeks old' : '🐕 Adult Dog - 1-3 years old',
      price: makePrice(breed.id, breed.name, type),
      mainImage: images[0]?.url || '',
      images: [...new Set(images.map(i => i.url))].slice(0, 4)
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Dog API failed' }); }
});

app.get('/api/cats/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const type = (req.query.type || 'cat').toLowerCase();
    if (!q) return res.json({});
    if (type !== 'cat' && type !== 'kitten') return res.json({});
    const breedRes = await fetch(`https://api.thecatapi.com/v1/breeds/search?q=${encodeURIComponent(q)}`, { headers: { 'x-api-key': CAT_API_KEY } });
    const breeds = await breedRes.json();
    if (!breeds.length) return res.json({});
    const breed = breeds[0];
    const imgRes = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}&limit=4`, { headers: { 'x-api-key': CAT_API_KEY } });
    const images = await imgRes.json();
    const isKitten = type === 'kitten';
    res.json({
      id: breed.id, type: isKitten ? 'Kitten' : 'Cat',
      name: isKitten ? breed.name + ' Kitten' : breed.name,
      temperament: breed.temperament || 'Calm, Affectionate',
      life_span: breed.life_span, weight: breed.weight?.metric + ' kg',
      origin: breed.origin || 'Unknown',
      age: isKitten ? '8-12 weeks' : '1-2 years',
      ageLabel: isKitten ? '🐱 Kitten - 8-12 weeks old' : '🐈 Adult Cat - 1-2 years old',
      price: makePrice(breed.id, breed.name, type),
      mainImage: images[0]?.url || '',
      images: [...new Set(images.map(i => i.url))].slice(0, 4)
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Cat API failed' }); }
});

const PARROT_BREEDS = {
  'african grey': { name: 'African Grey Parrot', temperament: 'Intelligent, Talkative, Social', life_span: '40-60 years', origin: 'Africa', weight: '0.4 kg' },
  'macaw': { name: 'Macaw Parrot', temperament: 'Playful, Loud, Affectionate', life_span: '50-60 years', origin: 'South America', weight: '1.2 kg' },
  'budgie': { name: 'Budgerigar Parrot', temperament: 'Cheerful, Active, Friendly', life_span: '8-15 years', origin: 'Australia', weight: '0.04 kg' },
  'cockatiel': { name: 'Cockatiel Parrot', temperament: 'Gentle, Whistling, Curious', life_span: '15-25 years', origin: 'Australia', weight: '0.1 kg' },
  'cockatoo': { name: 'Cockatoo Parrot', temperament: 'Cuddly, Loud, Loyal', life_span: '40-70 years', origin: 'Australia', weight: '0.8 kg' },
  'conure': { name: 'Conure Parrot', temperament: 'Playful, Clownish, Loud', life_span: '20-30 years', origin: 'South America', weight: '0.2 kg' },
  'amazon': { name: 'Amazon Parrot', temperament: 'Talkative, Bold, Social', life_span: '50 years', origin: 'South America', weight: '0.5 kg' },
  'lovebird': { name: 'Lovebird Parrot', temperament: 'Loving, Active, Playful', life_span: '10-15 years', origin: 'Africa', weight: '0.05 kg' },
  'parrot': { name: 'Parrot', temperament: 'Intelligent, Social, Talkative', life_span: '30-50 years', origin: 'Tropical Regions', weight: '0.5 kg' },
};
app.get('/api/parrots/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) return res.json({});
    let key = Object.keys(PARROT_BREEDS).find(k => q.includes(k) || k.includes(q));
    if (!key) key = 'parrot';
    const breed = PARROT_BREEDS[key];
    const page = (hashCode(key) % 5) + 1;
    let photos = [];
    try {
      const ovRes = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(breed.name)}&page_size=10&page=${page}&license_type=all`);
      const ovData = await ovRes.json();
      photos = (ovData.results || []).map(p => p.url).filter(u => u && u.startsWith('http'));
    } catch (e) {}
    const unique = [...new Set(photos)].slice(0, 4);
    res.json({
      id: key, type: 'Parrot', name: breed.name,
      temperament: breed.temperament, life_span: breed.life_span,
      weight: breed.weight, origin: breed.origin,
      age: '6-12 months', ageLabel: '🦜 Parrot - 6-12 months old',
      price: makePrice(key, breed.name, 'parrot'),
      mainImage: unique[0] || '',
      images: unique
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Parrot API failed' }); }
});
// ===== END PETS =====

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
      verfied BOOLEAN NOT NULL DEFAULT TRUE,
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
// ===== FORGOT PASSWORD - START =====
async function ensurePasswordResetTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}
async function sendResetCodeEmail(email, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your Pets password',
    text: `Your password reset code is: ${code}. It expires in 15 minutes. If you did not request this, ignore this email.`
  });
}

// 1. User asks for code
app.post(['/api/auth/forgot-password', '/api/forgot-password'], async (req, res) => {
  try {
    const { email } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanEmail) return res.status(400).json({ success: false, message: 'Please enter your email' });
    await ensurePasswordResetTable();
    const result = await pool.query('SELECT id, email FROM users WHERE email=$1', [cleanEmail]);
    // If no account, tell user to create one
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'No account found with this email. Please create one.' });
const user = result.rows[0];
    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query('UPDATE password_reset_codes SET used=TRUE WHERE user_id=$1 AND used=FALSE', [user.id]);
    await pool.query('INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1,$2,$3)', [user.id, code, expiresAt]);
    await sendResetCodeEmail(user.email, code);
    return res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (e) { console.error('Forgot password error:', e); return res.status(500).json({ success: false, message: 'Could not send reset code' }); }
});

// 2. User enters code + new password
app.post(['/api/auth/reset-password', '/api/reset-password'], async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !code) return res.status(400).json({ success: false, message: 'Email and code are required' });
    if (typeof newPassword !== 'string' || newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    await ensurePasswordResetTable();
    const userRes = await pool.query('SELECT id FROM users WHERE email=$1', [cleanEmail]);
    if (userRes.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid code' });
    const userId = userRes.rows[0].id;
    const codeRes = await pool.query('SELECT * FROM password_reset_codes WHERE user_id=$1 AND code=$2 AND used=FALSE ORDER BY created_at DESC LIMIT 1', [userId, String(code).trim()]);
    if (codeRes.rows.length === 0) return res.status(400).json({ success: false, message: 'Invalid code' });
    if (new Date(codeRes.rows[0].expires_at) < new Date()) return res.status(400).json({ success: false, message: 'Code expired, request a new one' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, userId]);
    await pool.query('UPDATE password_reset_codes SET used=TRUE WHERE id=$1', [codeRes.rows[0].id]);
    return res.json({ success: true, message: 'Password reset successful, please login' });
  } catch (e) { console.error('Reset password error:', e); return res.status(500).json({ success: false, message: 'Could not reset password' }); }
});
// ===== FORGOT PASSWORD - END =====
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
