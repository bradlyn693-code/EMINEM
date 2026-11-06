require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(__dirname));

const SECRET = process.env.PAYSTACK_SECRET_KEY;
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('❌ DB FAILED:', err.message);
  } else {
    console.log('✅ Neon DB Connected:', res.rows[0].now);
  }
});

app.post('/api/pay', async (req, res) => {
  const { email, amount } = req.body;
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: amount * 100,
        callback_url: `${req.protocol}://${req.get('host')}/`
      },
      { headers: { Authorization: `Bearer ${SECRET}` } }
    );
    res.json(response.data.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: 'Paystack failed' });
  }
});

app.get('/api/verify/:reference', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      { headers: { Authorization: `Bearer ${SECRET}` } }
    );
    res.json(response.data.data);
  } catch (err) {
    res.status(500).json({ error: 'Verify failed' });
  }
});
// ===== LOGIN / REGISTER =====
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if(!email || !password || password.length < 6) return res.json({success:false, message:'Email + password min 6 chars needed'});
  try{
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email', [name, email, hash]);
    res.json({success:true, message:'Account created!', user: result.rows[0]});
  }catch(e){
    if(e.code==='23505') return res.json({success:false, message:'Email already used, try login'});
    console.log(e);
    res.json({success:false, message:'Error creating account'});
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try{
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if(result.rows.length===0) return res.json({success:false, message:'No account with that email'});
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.json({success:false, message:'Wrong password'});
    const token = jwt.sign({id:user.id, email:user.email}, process.env.JWT_SECRET, {expiresIn:'7d'});
    res.json({success:true, message:'Login ok', token, user:{id:user.id, name:user.name, email:user.email}});
  }catch(e){
    console.log(e);
    res.json({success:false, message:'Login error'});
  }
});

app.get('/login', (req,res)=>{ res.sendFile(__dirname + '/login.html'); });


if (require.main === module) {
  app.listen(PORT, () => console.log('Running on', PORT));
}
module.exports = app;
