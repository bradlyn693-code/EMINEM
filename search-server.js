// search-server.js - Serves SITE + SEARCH, LOGIN NOT TOUCHED
// Use http://127.0.0.1:3001/ for everything locally
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = new URL(req.url, 'http://127.0.0.1:3001');

  // --- SEARCH API ---
  if (url.pathname === '/api/dogs/search') {
    res.setHeader('Content-Type', 'application/json');
    const q = (url.searchParams.get('q') || '').trim();
    if (!q) return res.end(JSON.stringify([]));
    try {
            const dogRes = await fetch('https://api.thedogapi.com/v1/breeds/search?q=' + encodeURIComponent(q));
      const dogBreeds = await dogRes.json();
      const dogs = dogBreeds.map(b => ({
        name: b.name,
        breed: b.name,
        temperament: b.temperament || 'Loyal, friendly pet',
        image: b.reference_image_id ? `https://cdn2.thedogapi.com/images/${b.reference_image_id}.jpg` : 'https://images.dog.ceo/breeds/hound-afghan/n02088094_1003.jpg'
      }));
            // 2. Try CATS
      const catRes = await fetch('https://api.thecatapi.com/v1/breeds/search?q=' + encodeURIComponent(q));
      const catBreeds = await catRes.json();
      const cats = catBreeds.map(b => ({
        name: b.name,
        breed: b.name,
        type: 'Cat',
        temperament: b.temperament || 'Calm, loving pet',
        image: b.reference_image_id ? `https://cdn2.thecatapi.com/images/${b.reference_image_id}.jpg` : 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg'
      }));
            const pets = [...dogs, ...cats];
      return res.end(JSON.stringify(pets));
    } catch (err) {
      res.writeHead(500);
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // --- SERVE SITE FILES ---
  let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
  res.setHeader('Content-Type', types[ext] || 'text/html');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(3001, () => console.log('✅ SITE + SEARCH on http://127.0.0.1:3001'));