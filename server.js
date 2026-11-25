require('dotenv').config();
const express = require('express');
const axios = require('axios');
axios.defaults.timeout = 10000;
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { createHash, randomBytes, randomInt, timingSafeEqual } = require('crypto');

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

app.get('/api/search', async (req, res) => {
  const type = String(req.query.type || '').toLowerCase();
  const query = String(req.query.q || '').trim();
  if (type !== 'dog' && type !== 'cat') {
    return res.status(400).json({ error: 'Type must be dog or cat' });
  }
  if (!query) return res.status(400).json({ error: 'Search query is required' });
  const apiKey = type === 'dog' ? DOG_API_KEY : CAT_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: `${type.toUpperCase()}_API_KEY is not configured` });
  }
  const apiBase = type === 'dog' ? 'https://api.thedogapi.com/v1' : 'https://api.thecatapi.com/v1';
  try {
    const breedResponse = await fetch(
      `${apiBase}/breeds/search?q=${encodeURIComponent(query)}`,
      { headers: { 'x-api-key': apiKey } }
    );
    if (!breedResponse.ok) throw new Error(`Breed search returned ${breedResponse.status}`);
    const breeds = await breedResponse.json();
    if (!Array.isArray(breeds) || breeds.length === 0) {
      return res.json({ error: 'No pet found' });
    }
    const breed = breeds[0];
    const imageResponse = await fetch(
      `${apiBase}/images/search?breed_ids=${encodeURIComponent(breed.id)}&limit=4`,
      { headers: { 'x-api-key': apiKey } }
    );
    if (!imageResponse.ok) throw new Error(`Image search returned ${imageResponse.status}`);
    const imageResults = await imageResponse.json();
    const images = Array.isArray(imageResults)
      ? imageResults.map(image => image.url).filter(url => typeof url === 'string').slice(0, 4)
      : [];
    const pet = {
      name: breed.name,
      temperament: breed.temperament || '',
      life_span: breed.life_span || '',
      images,
      price: type === 'dog' ? randomInt(1235, 2571) : randomInt(1310, 2367),
      type
    };
    if (type === 'dog') pet.weight = breed.weight?.metric ? `${breed.weight.metric} kg` : '';
    else pet.description = breed.description || '';
    return res.json(pet);
  } catch (error) {
    console.error(`${type} search failed:`, error.message);
    return res.status(502).json({ error: 'Pet search failed' });
  }
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

// FIX 1 - transporter was missing, now added
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

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
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
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
      reset_token TEXT,
      reset_expires TIMESTAMPTZ,
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
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_pending_signups (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      verification_code_hash TEXT NOT NULL,
      verification_expires TIMESTAMPTZ NOT NULL,
      verification_attempts INTEGER NOT NULL DEFAULT 0
    )
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
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Pets account',
      text: `Your verification code is: ${code}. It expires in 1 minute. If you did not sign up, ignore this.`
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
           verification_code_expires_at=NOW() + INTERVAL '1 minute',
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

function hashesMatch(value, hashedValue) {
  const expected = Buffer.from(hashedValue || '', 'hex');
  const actual = Buffer.from(hashVerificationCode(value), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function sendPasswordResetLink(email, token) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is not configured');
  }
  const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const resetUrl = new URL('/reset-password', baseUrl);
  resetUrl.searchParams.set('token', token);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your Pets password',
    text: `Use this link to reset your password. It expires in 1 minute:\n\n${resetUrl.toString()}\n\nIf you did not request this, ignore this email.`
  });
}

app.post(['/api/auth/signup', '/api/signup'], async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  const confirmPassword = req.body?.confirmPassword;
  if (!name) return res.status(400).json({ success: false, error: 'Please enter your full name' });
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }
  let client;
  try {
    await ensureUsersTable();
    const passwordHash = await bcrypt.hash(password, 10);
    const code = createVerificationCode();
    client = await pool.connect();
    await client.query('BEGIN');
    const saved = await client.query(
      `INSERT INTO users(
         name,email,password_hash,verified,verification_code_hash,
         verification_code_expires_at,verification_attempts
       ) VALUES($1,$2,$3,FALSE,$4,NOW() + INTERVAL '1 minute',0)
       ON CONFLICT(email) DO UPDATE SET
         name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,verified=FALSE,
         verification_code_hash=EXCLUDED.verification_code_hash,
         verification_code_expires_at=EXCLUDED.verification_code_expires_at,
         verification_attempts=0
       WHERE users.verified=FALSE
       RETURNING id`,
      [name, email, passwordHash, hashVerificationCode(code)]
    );
    if (!saved.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'An account already exists for this email. Please log in.' });
    }
    await sendVerificationCode(email, code);
    await client.query('COMMIT');
    return res.status(200).json({ success: true, needsVerification: true, email });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch((rollbackError) => console.error('Signup rollback error:', rollbackError.message));
    if (error.isEmailDeliveryError) {
      console.error('Signup email error:', error.cause?.message || error.message);
      return res.status(502).json({ success: false, error: 'Could not send verification email. Check email settings and try again.' });
    }
    console.error('Signup error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({ success: false, error: unavailable ? 'Database unavailable' : 'Account creation failed' });
  } finally {
    if (client) client.release();
  }
});

app.post('/api/auth/verify', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, error: 'Enter the 6-digit verification code' });
  let client;
  try {
    await ensureUsersTable();
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT id,verified,verification_code_hash,
              verification_code_expires_at,verification_attempts
       FROM users WHERE email=$1 FOR UPDATE`,
      [email]
    );
    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'No account found for this email. Please create an account.' });
    }
    const user = result.rows[0];
    if (user.verified) {
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Account created successfully ✅' });
    }
    if (!user.verification_code_expires_at || new Date(user.verification_code_expires_at) <= new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Verification code expired. Please resend a new code.' });
    }
    if (user.verification_attempts >= 5) {
      await client.query('ROLLBACK');
      return res.status(429).json({ success: false, error: 'Too many attempts. Please resend a new code.' });
    }
    if (!hashesMatch(code, user.verification_code_hash)) {
      await client.query('UPDATE users SET verification_attempts=verification_attempts+1 WHERE id=$1', [user.id]);
      await client.query('COMMIT');
      return res.status(400).json({ success: false, error: 'Incorrect verification code. Please try again.' });
    }
    await client.query(
      `UPDATE users SET verified=TRUE,verification_code_hash=NULL,
       verification_code_expires_at=NULL,verification_attempts=0 WHERE id=$1`,
      [user.id]
    );
    await client.query('COMMIT');
    return res.json({ success: true, message: 'Account created successfully ✅' });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch((rollbackError) => console.error('Verification rollback error:', rollbackError.message));
    console.error('Email verification error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({ success: false, error: unavailable ? 'Database unavailable' : 'Email verification failed' });
  } finally {
    if (client) client.release();
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  try {
    await ensureUsersTable();
    const result = await pool.query('SELECT id,verified FROM users WHERE email=$1', [email]);
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'No account found for this email.' });
    }
    if (result.rows[0].verified) {
      return res.status(409).json({ success: false, error: 'This account is already verified. Please log in.' });
    }
    await issueVerificationCode(result.rows[0].id, email);
    return res.json({ success: true });
  } catch (error) {
    console.error('Resend verification code error:', error.cause?.message || error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 502).json({
      success: false,
      error: unavailable ? 'Database unavailable' : 'Could not send verification email. Check email settings and try again.'
    });
  }
});

app.post(['/api/auth/forgot-password', '/api/forgot-password'], async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
  try {
    await ensureUsersTable();
    const result = await pool.query(
      'SELECT id FROM users WHERE email=$1 AND verified=TRUE',
      [email]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'No account found' });
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = createHash('sha256').update(code).digest('hex');
    await pool.query(
      `UPDATE users SET reset_token=$1, reset_expires=NOW() + INTERVAL '1 minute' WHERE id=$2`,
      [codeHash, result.rows[0].id]
    );
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Pets - Your reset code',
        text: `Your reset code is ${code}. It expires in 1 minute.`
      });
    } catch (error) {
      await pool.query(`UPDATE users SET reset_token=NULL, reset_expires=NULL WHERE id=$1`, [result.rows[0].id]);
      console.error('Password reset email error:', error.message);
      return res.status(502).json({ success: false, error: 'Could not send code' });
    }
    return res.json({ success: true, message: 'Check your email for the verification code' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({ success: false, error: unavailable ? 'Database unavailable' : 'Could not process the reset request' });
  }
});

// VERIFY RESET CODE - 6-digit code
app.post('/api/auth/verify-reset', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = String(req.body?.code || '').trim();
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, error: 'Enter the 6-digit code' });
  try {
    await ensureUsersTable();
    const r = await pool.query('SELECT id, reset_token, reset_expires FROM users WHERE email=$1', [email]);
    if (!r.rows.length) return res.status(404).json({ success: false, error: 'No account found' });
    const user = r.rows[0];
    if (!user.reset_token || new Date(user.reset_expires) <= new Date()) return res.status(400).json({ success: false, error: 'Code expired, request again' });
    const codeHash = createHash('sha256').update(code).digest('hex');
    if (codeHash !== user.reset_token) return res.status(400).json({ success: false, error: 'Wrong code' });
    return res.json({ success: true, message: 'Verified' });
  } catch (e) { return res.status(500).json({ success: false, error: 'Verification failed' }); }
});

// RESET PASSWORD - 6-digit code + new password, erases old
app.post(['/api/auth/reset-password', '/api/reset-password'], async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const code = String(req.body?.code || req.body?.token || '').trim();
  const password = req.body?.newPassword || req.body?.password;
  const confirmPassword = req.body?.confirmPassword;
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ success: false, error: 'Enter the 6-digit code' });
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }
  if (confirmPassword !== undefined && (typeof confirmPassword !== 'string' || password !== confirmPassword)) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }
  try {
    await ensureUsersTable();
    const passwordHash = await bcrypt.hash(password, 10);
    const codeHash = createHash('sha256').update(code).digest('hex');
    const updated = await pool.query(
      `UPDATE users SET password_hash=$1,reset_token=NULL,reset_expires=NULL
       WHERE email=$2 AND reset_token=$3 AND reset_expires>NOW() AND verified=TRUE RETURNING id`,
      [passwordHash, email, codeHash]
    );
    if (!updated.rows.length) {
      return res.status(400).json({ success: false, error: 'Code is invalid or expired' });
    }
    return res.json({ success: true, message: 'Password changed, please login' });
  } catch (error) {
    console.error('Password reset error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({ success: false, error: unavailable ? 'Database unavailable' : 'Could not reset the password' });
  }
});

app.post(['/api/auth/login', '/api/login'], async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Please enter your password' });
  }
  if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: 'Account service is not configured' });
  try {
    await ensureUsersTable();
    const result = await pool.query(
      'SELECT id,name,email,password_hash,verified,wallet_balance FROM users WHERE email=$1',
      [email]
    );
    if (!result.rows.length) return res.status(401).json({ success: false, message: "Create account, details doesn't exist!!" });
    const user = result.rows[0];
    if (!await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ success: false, message: "Create account, details doesn't exist!!" });
    }
    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: 'This account is not verified. Please verify your email before logging in.'
      });
    }
    return res.json({
      success: true,
      message: 'Welcome back ♥️',
      token: createToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, balance: Number(user.wallet_balance || 0) }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    const unavailable = isDatabaseUnavailable(error);
    return res.status(unavailable ? 503 : 500).json({ success: false, message: unavailable ? 'Database unavailable' : 'Login failed' });
  }
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
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
// ---------- PETS SEARCH - Dog + Cat API ----------
function priceInRange(seed, min, max){
  let h = 0; for(let c of seed) h = (h*31 + c.charCodeAt(0)) % 100000;
  return min + (h % (max - min + 1));
}

app.get('/api/pets/search', async (req, res) => {
  const q = (req.query.q || 'dog').toLowerCase();
  const isCat = q.includes('cat') || q.includes('kitten') || q.includes('kitty');
  try {
    if (isCat) {
      const searchTerm = q.replace('cat','').replace('kitten','').replace('kitty','').trim() || 'persian';
      const breedRes = await fetch(`https://api.thecatapi.com/v1/breeds/search?q=${encodeURIComponent(searchTerm)}`, { headers: { 'x-api-key': process.env.CAT_API_KEY } });
      let breeds = await breedRes.json();
      if (!breeds.length) breeds = [{ id: 'pers', name: 'Persian', description: 'Sweet, calm and fluffy companion.', temperament: 'Calm, Affectionate', origin: 'Iran', life_span: '12 - 17' }];
      const out = [];
      for (let b of breeds.slice(0, 6)) {
        const imgRes = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${b.id}&limit=4`, { headers: { 'x-api-key': process.env.CAT_API_KEY } });
        const imgs = await imgRes.json();
        const photos = imgs.map(i => i.url).filter(Boolean);
        if (!photos.length) continue;
        out.push({
          id: b.id, type: 'cat', name: b.name, breed: b.name,
          description: b.description || 'Lovely cat looking for a home.',
          temperament: b.temperament || 'Friendly',
          origin: b.origin || 'Unknown',
          life: b.life_span || '12 - 15',
          price: priceInRange(b.id + b.name, 975, 2200),
          photos, mainPhoto: photos[0]
        });
      }
      return res.json(out);
    } else {
      const searchTerm = q.replace('dog','').replace('puppy','').replace('puppies','').trim() || 'labrador';
      const breedRes = await fetch(`https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(searchTerm)}`, { headers: { 'x-api-key': process.env.DOG_API_KEY } });
      let breeds = await breedRes.json();
      if (!breeds.length) breeds = [{ id: 1, name: 'Labrador', bred_for: 'Retrieving', breed_group: 'Sporting', life_span: '10 - 12 years', temperament: 'Friendly, Active, Outgoing', reference_image_id: 'BJa4kxc4X' }];
      const out = [];
      for (let b of breeds.slice(0, 6)) {
        let photos = [];
        const imgRes = await fetch(`https://api.thedogapi.com/v1/images/search?breed_ids=${b.id}&limit=4`, { headers: { 'x-api-key': process.env.DOG_API_KEY } });
        const imgs = await imgRes.json();
        photos = imgs.map(i => i.url).filter(Boolean);
        if (!photos.length) {
          const fb = await fetch('https://dog.ceo/api/breed/labrador/images/random/4').then(r=>r.json()).catch(()=>({message:[]}));
          photos = fb.message || [];
        }
        if (!photos.length) continue;
        out.push({
          id: String(b.id), type: 'dog', name: b.name, breed: b.name,
          description: `A wonderful ${b.name}. ${b.bred_for ? 'Bred for ' + b.bred_for + '.' : ''} Great companion for families.`,
          temperament: b.temperament || 'Friendly, Loyal',
          origin: b.origin || b.breed_group || 'Unknown',
          life: b.life_span || '10 - 13 years',
          price: priceInRange(String(b.id) + b.name, 1152, 2710),
          photos, mainPhoto: photos[0]
        });
      }
      return res.json(out);
    }
  } catch (e) { console.error(e); res.status(500).json({ error: 'Pet search failed' }); }
});

if (require.main === module) {
  app.listen(PORT, () => console.log('Running on', PORT));
}
module.exports = app;