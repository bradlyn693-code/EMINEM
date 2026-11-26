const CAT_API_KEY = "YOUR_NEW_KEY_HERE"; // <-- PASTE NEW ROTATED KEY HERE
function toggleSidePanel(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('panelOverlay');
  const menuButton = document.getElementById('menuBtn');
  if(!sidebar) return;
  const isOpen = sidebar.classList.toggle('open');
  if(overlay) overlay.classList.toggle('show', isOpen);
  if(menuButton) menuButton.setAttribute('aria-expanded', String(isOpen));
}
function toggleMenu(){ toggleSidePanel(); }

function closeSidePanel(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('panelOverlay');
  const menuButton = document.getElementById('menuBtn');
  if(!sidebar) return;
  sidebar.classList.remove('open');
  if(overlay) overlay.classList.remove('show');
  if(menuButton) menuButton.setAttribute('aria-expanded', 'false');
}

let allPets = [];

const ORIGIN_MAP = {
  "German Shepherd":"Germany", "Labrador":"Canada", "Golden Retriever":"Scotland",
  "Bulldog":"England", "Poodle":"France", "Beagle":"England", "Rottweiler":"Germany",
  "Husky":"Siberia", "Pug":"China", "Chihuahua":"Mexico", "Boxer":"Germany",
  "Dachshund":"Germany", "Shiba Inu":"Japan", "Corgi":"Wales", "Dalmatian":"Croatia",
  "Great Dane":"Germany", "Border Collie":"Scotland", "Australian Shepherd":"USA",
  "Akita":"Japan", "Maltese":"Malta", "Shih Tzu":"China", "Yorkshire Terrier":"England",
  "Schnauzer":"Germany", "Cocker Spaniel":"England", "Pomeranian":"Germany",
  "French Bulldog":"France", "Samoyed":"Siberia", "Chow Chow":"China",
  "Doberman":"Germany", "Pitbull":"USA", "Saint Bernard":"Switzerland",
  "Basset Hound":"France", "Bloodhound":"Belgium", "Afghan Hound":"Afghanistan",
  "Greyhound":"Egypt", "Whippet":"England", "Belgian Malinois":"Belgium"
};

function getOrigin(breed){
  for(let k in ORIGIN_MAP){
    if(breed.includes(k)) return ORIGIN_MAP[k];
  }
  return "Unknown";
}

let dogList = [
  {breed:"German Shepherd", api:"german/shepherd", desc:"Loyal guard dog, very smart.", price: 1450},
  {breed:"Labrador", api:"labrador", desc:"Friendly family dog, loves water.", price: 750},
  {breed:"Golden Retriever", api:"retriever/golden", desc:"Gentle golden coat, great with kids.", price: 900},
  {breed:"Bulldog", api:"bulldog/english", desc:"Calm, stocky, loves sleeping.", price: 1100},
  {breed:"Poodle", api:"poodle", desc:"Smart, curly coat, hypoallergenic.", price: 950},
  {breed:"Beagle", api:"beagle", desc:"Small, curious, great nose.", price: 580},
  {breed:"Rottweiler", api:"rottweiler", desc:"Strong confident guard dog.", price: 800},
  {breed:"Husky", api:"husky", desc:"Blue eyes, thick fur, loves running.", price: 700},
  {breed:"Pug", api:"pug", desc:"Small funny wrinkly face.", price: 600},
  {breed:"Chihuahua", api:"chihuahua", desc:"Tiny, big eyes, very loyal.", price: 450},
  {breed:"Boxer", api:"boxer", desc:"Playful, muscular, loves jumping.", price: 650},
  {breed:"Dachshund", api:"dachshund", desc:"Long body, short legs, brave.", price: 500},
  {breed:"Shiba Inu", api:"shiba", desc:"Fox-like, independent, clean.", price: 1000},
  {breed:"Corgi", api:"corgi", desc:"Short legs, big smile, herding dog.", price: 1050},
  {breed:"Dalmatian", api:"dalmatian", desc:"White with black spots.", price: 700},
  {breed:"Great Dane", api:"dane/great", desc:"Giant gentle dog.", price: 1200},
  {breed:"Border Collie", api:"collie/border", desc:"Smartest dog, loves herding.", price: 750},
  {breed:"Australian Shepherd", api:"australian/shepherd", desc:"Blue merle, very active.", price: 800},
  {breed:"Akita", api:"akita", desc:"Loyal Japanese dog.", price: 1100},
  {breed:"Maltese", api:"maltese", desc:"Small white fluffy lap dog.", price: 850},
  {breed:"Shih Tzu", api:"shihtzu", desc:"Long hair, sweet face.", price: 650},
  {breed:"Yorkshire Terrier", api:"terrier/yorkshire", desc:"Tiny, silky hair.", price: 750},
  {breed:"Schnauzer", api:"schnauzer/miniature", desc:"Bearded, smart.", price: 600},
  {breed:"Cocker Spaniel", api:"spaniel/cocker", desc:"Long ears, happy.", price: 700},
  {breed:"Pomeranian", api:"pomeranian", desc:"Fluffy orange ball.", price: 900},
  {breed:"French Bulldog", api:"bulldog/french", desc:"Bat ears, funny.", price: 1300},
  {breed:"Samoyed", api:"samoyed", desc:"White smiling cloud.", price: 1150},
  {breed:"Chow Chow", api:"chow", desc:"Lion-like, blue tongue.", price: 1000},
  {breed:"Doberman", api:"doberman", desc:"Sleek black guard dog.", price: 850},
  {breed:"Pitbull", api:"pitbull", desc:"Muscular, loving.", price: 1480},
  {breed:"Saint Bernard", api:"stbernard", desc:"Giant rescue dog.", price: 1250},
  {breed:"Basset Hound", api:"hound/basset", desc:"Long ears, droopy eyes.", price: 550},
  {breed:"Bloodhound", api:"hound/blood", desc:"Best nose in dogs.", price: 700},
  {breed:"Afghan Hound", api:"hound/afghan", desc:"Long silky hair, elegant.", price: 1100},
  {breed:"Greyhound", api:"greyhound/italian", desc:"Fastest dog, slim.", price: 1950},
  {breed:"Whippet", api:"whippet", desc:"Small greyhound.", price: 1300},
  {breed:"Bull Terrier", api:"terrier/bull", desc:"Egg head, playful.", price: 1700},
  {breed:"Fox Terrier", api:"terrier/fox", desc:"Wiry, energetic.", price: 1050},
  {breed:"Jack Russell", api:"terrier/russell", desc:"Tiny, hyper, smart.", price: 780},
  {breed:"Scottish Terrier", api:"terrier/scottish", desc:"Black beard dog.", price: 650},
  {breed:"Westie", api:"terrier/westhighland", desc:"White fluffy terrier.", price: 1700},
  {breed:"Lhasa Apso", api:"lhasa", desc:"Long hair, royal dog.", price: 750},
  {breed:"Pekingese", api:"pekinese", desc:"Lion dog, flat face.", price: 640},
  {breed:"Bichon Frise", api:"bichon/frise", desc:"White curly cloud.", price:1800},
  {breed:"Cavalier King Charles", api:"cavalier", desc:"Royal companion.", price:1800},
  {breed:"Papillon", api:"papillon", desc:"Butterfly ears.", price: 1650},
  {breed:"Basenji", api:"basenji", desc:"Doesn't bark, yodels.", price: 1920},
  {breed:"Weimaraner", api:"weimaraner", desc:"Silver grey hunter.", price: 1850},
  {breed:"Vizsla", api:"vizsla", desc:"Golden hunter.", price: 900},
  {breed:"Brittany", api:"spaniel/brittany", desc:"Orange hunting dog.", price:1800},
];

let puppyNames = ["Max","Bella","Luna","Rocky","Daisy","Cooper","Milo","Lola","Buddy","Ruby","Teddy","Rosie","Bear","Molly","Leo","Poppy","Zeus","Willow","Duke","Ivy","Archie","Nala","Oscar","Coco"];
let puppyPrices = [780,965,1380,490,1350,480,1780,650,1460,1370,1500,1360,790,1280,1510,380,1490,350,430,1320,680,1660,1440,980];

let catList = [
  {breed:"Persian", code:"pers", desc:"Long fluffy fur, calm.", price: 1950},
  {breed:"Siamese", code:"siam", desc:"Blue eyes, talkative.", price: 450},
  {breed:"Maine Coon", code:"mcoo", desc:"Big gentle giant.", price: 650},
  {breed:"British Shorthair", code:"bsho", desc:"Round grey face.", price: 500},
  {breed:"Bengal", code:"beng", desc:"Leopard spots.", price: 750},
  {breed:"Ragdoll", code:"ragd", desc:"Floppy, blue eyes.", price: 600},
  {breed:"Sphynx", code:"sphy", desc:"Hairless, warm.", price: 900},
  {breed:"Scottish Fold", code:"sfol", desc:"Folded ears.", price: 650},
  {breed:"Russian Blue", code:"rblu", desc:"Silver blue fur.", price: 1550},
  {breed:"Abyssinian", code:"abys", desc:"Ticked coat, active.", price: 480},
  {breed:"Birman", code:"birm", desc:"White gloves, blue eyes.", price: 520},
  {breed:"Bombay", code:"bomb", desc:"Black panther look.", price: 1480},
  {breed:"Devon Rex", code:"drex", desc:"Big ears, curly.", price: 1600},
  {breed:"Cornish Rex", code:"crex", desc:"Wavy coat.", price: 550},
  {breed:"American Shorthair", code:"asho", desc:"Classic tabby.", price: 350},
  {breed:"Oriental", code:"orie", desc:"Slim, big ears.", price: 420},
  {breed:"Turkish Angora", code:"tang", desc:"White silky.", price: 1580},
  {breed:"Norwegian Forest", code:"norw", desc:"Fluffy forest cat.", price: 520},
  {breed:"Siberian", code:"sibe", desc:"Thick triple coat.", price: 600},
  {breed:"Manx", code:"manx", desc:"No tail.", price: 1400}
];
// === LOAD REAL CAT IMAGES WITH API KEY ===
async function loadCatImagesFromAPI() {
  for (const cat of catList) {
    try {
      const res = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${cat.code}&limit=5`, {
        headers: { "x-api-key": CAT_API_KEY }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        cat.images = data.map(d => d.url);
        cat.image = cat.images[0];
      }
    } catch(e) { console.log("fail", cat.breed); }
  }
}
loadCatImagesFromAPI();

let kittenNames = ["Mochi","Simba","Oliver","Lily","Milo","Zoe","Felix","Nala","Oreo","Ginger","Shadow","Pepper","Smokey","Angel","Tiger","Snow","Bella","Lucky","Cleo","Jasper","Misty","Pumpkin","Cookie","Midnight","Chloe","Ash"];
let kittenPrices = [780,1220,1200,1160,1190,1140,1210,670,1150,1180,990,1700,1990,1600,1220,1250,1240,1700,1190,1210,1160,1180,1200,170,1190,1150];

function parrotFallbackImage(bodyColor, accentColor){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#f3f3f3"/><ellipse cx="390" cy="340" rx="190" ry="145" fill="${bodyColor}"/><circle cx="520" cy="205" r="95" fill="${bodyColor}"/><path d="M600 200l130 45-130 40z" fill="${accentColor}"/><path d="M280 355l-170 145 240-65z" fill="${accentColor}"/><circle cx="550" cy="180" r="12" fill="#222"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

let parrotList = [
  {breed:"Macaw", desc:"Large colorful talking parrot.", price:1800, bodyColor:"#d53f2b", accentColor:"#f2c230", fallback: parrotFallbackImage("#d53f2b","#f2c230")},
  {breed:"African Grey", desc:"Smartest talking parrot.", price:1500, bodyColor:"#8d9297", accentColor:"#d33b2d", fallback: parrotFallbackImage("#8d9297","#d33b2d")},
  {breed:"Cockatoo", desc:"White fluffy crest parrot.", price:1200, bodyColor:"#f5f5f5", accentColor:"#ffcf3d", fallback: parrotFallbackImage("#f5f5f5","#ffcf3d")},
  {breed:"Budgerigar", desc:"Small green friendly parakeet.", price:120, bodyColor:"#7bc950", accentColor:"#f7d154", fallback: parrotFallbackImage("#7bc950","#f7d154")},
  {breed:"Conure", desc:"Playful, loud, colorful.", price:900, bodyColor:"#2f9e6e", accentColor:"#e84e2d", fallback: parrotFallbackImage("#2f9e6e","#e84e2d")},
  {breed:"Amazon Parrot", desc:"Green talkative parrot.", price:1100, bodyColor:"#2d8a4e", accentColor:"#f6c945", fallback: parrotFallbackImage("#2d8a4e","#f6c945")},
  {breed:"Lovebird", desc:"Tiny pair bonding parrot.", price:180, bodyColor:"#51a847", accentColor:"#f2725b", fallback: parrotFallbackImage("#51a847","#f2725b")},
  {breed:"Cockatiel", desc:"Grey with orange cheeks.", price:250, bodyColor:"#a8a8a8", accentColor:"#ff9440", fallback: parrotFallbackImage("#a8a8a8","#ff9440")},
  {breed:"Eclectus", desc:"Red and green, calm.", price:1300, bodyColor:"#c9272f", accentColor:"#1f9d55", fallback: parrotFallbackImage("#c9272f","#1f9d55")},
  {breed:"Quaker Parrot", desc:"Small green talker.", price:350, bodyColor:"#5ea84b", accentColor:"#8fd14f", fallback: parrotFallbackImage("#5ea84b","#8fd14f")},
  {breed:"Caique", desc:"Clown parrot, playful.", price:1000, bodyColor:"#f5f5f5", accentColor:"#ff8c1a", fallback: parrotFallbackImage("#f5f5f5","#ff8c1a")},
  {breed:"Senegal Parrot", desc:"Calm, green and yellow.", price:600, bodyColor:"#3f9e4d", accentColor:"#f2c230", fallback: parrotFallbackImage("#3f9e4d","#f2c230")},
  {breed:"Pionus", desc:"Quiet, gentle parrot.", price:800, bodyColor:"#3b6fb6", accentColor:"#e84e2d", fallback: parrotFallbackImage("#3b6fb6","#e84e2d")},
  {breed:"Rosella", desc:"Colorful Australian parrot.", price:400, bodyColor:"#d53f2b", accentColor:"#f2c230", fallback: parrotFallbackImage("#d53f2b","#f2c230")},
  {breed:"Ringneck Parakeet", desc:"Green with ring.", price:300, bodyColor:"#4fae4e", accentColor:"#f2725b", fallback: parrotFallbackImage("#4fae4e","#f2725b")},
  {breed:"Meyers Parrot", desc:"Brown and yellow, calm.", price:450, bodyColor:"#6b4a2f", accentColor:"#f2c230", fallback: parrotFallbackImage("#6b4a2f","#f2c230")},
  {breed:"Jardine Parrot", desc:"Orange head, smart.", price:500, bodyColor:"#2f9e6e", accentColor:"#f2725b", fallback: parrotFallbackImage("#2f9e6e","#f2725b")},
  {breed:"Hawk Head Parrot", desc:"Fan crest, red/green.", price:900, bodyColor:"#7b2d26", accentColor:"#2f9e6e", fallback: parrotFallbackImage("#7b2d26","#2f9e6e")},
  {breed:"Blue and Gold Macaw", desc:"Blue and gold giant.", price:2000, bodyColor:"#2b6cb0", accentColor:"#f2c230", fallback: parrotFallbackImage("#2b6cb0","#f2c230")},
  {breed:"Scarlet Macaw", desc:"Bright red giant.", price:2100, bodyColor:"#d53f2b", accentColor:"#f2c230", fallback: parrotFallbackImage("#d53f2b","#f2c230")},
];

let allPetsLoaded = false;
let userBalance = 0;

async function fetchDogImages(){
  const breedGroups = {};
  for(const d of dogList){
    const parts = d.api.split('/');
    const base = parts[0];
    if(!breedGroups[base]) breedGroups[base] = [];
    breedGroups[base].push(d);
  }
  for(const base in breedGroups){
    try{
      const r = await fetch(`https://dog.ceo/api/breed/${base}/images/random/6`);
      const data = await r.json();
      if(data.status === 'success'){
        breedGroups[base].forEach((dog,i)=>{
          dog.images = data.message.slice(i*2, i*2+2);
        });
      }
    }catch(e){ console.log('fail', base); }
  }
  const puppies = [];
  for(const dog of dogList){
    puppies.push({
      breed: dog.breed,
      name: puppyNames[Math.floor(Math.random()*puppyNames.length)],
      price: dog.price,
      images: dog.images || [],
      desc: dog.desc,
      api: dog.api,
      type: 'Dog'
    });
  }
  return puppies;
}

async function buildAllPets(){
  if(allPetsLoaded) return;
  allPetsLoaded = true;
  const dogPuppies = await fetchDogImages();
  const catKittens = catList.map((cat,i)=>({ breed: cat.breed, name: kittenNames[i % kittenNames.length], price: cat.price, images: cat.images || [], desc: cat.desc, type:'Cat', code: cat.code }));
  const parrots = parrotList.map((p,i)=>({ breed: p.breed, name: 'Polly '+(i+1), price: p.price, images: [p.fallback], desc: p.desc, type:'Parrot' }));
  allPets = [...dogPuppies, ...catKittens, ...parrots];
  renderPets(allPets, 'All');
}

function renderPets(list, category){
  const grid = document.getElementById('petGrid') || document.getElementById('petList');
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(pet=>{
    const card = document.createElement('div');
    card.className = 'pet-card';
    const img = (pet.images && pet.images[0]) ? pet.images[0] : 'https://placehold.co/600x400?text=Pet';
    card.innerHTML = `<img src="${img}" alt="${pet.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Pet';"><div class="pet-info"><h3>${pet.name}</h3><p>${pet.breed} - ${pet.desc}</p><p><strong>$${pet.price}</strong> • Origin: ${getOrigin(pet.breed)}</p><button class="add-btn" onclick="addToCart('${pet.name.replace(/'/g,"\\'")}','${pet.breed.replace(/'/g,"\\'")}','${pet.price}','${img}')">Add to Cart</button><button class="buy-now-btn" onclick="addToCart('${pet.name.replace(/'/g,"\\'")}','${pet.breed.replace(/'/g,"\\'")}','${pet.price}','${img}');document.querySelector('.cart-btn').click()">Buy Now</button></div>`;
    grid.appendChild(card);
  });
}

function renderCats(list, category){
  const grid = document.getElementById('petGrid') || document.getElementById('petList');
  if(!grid) return;
  grid.innerHTML = '';
  list.forEach(cat=>{
    const card = document.createElement('div');
    card.className = 'pet-card';
    const img = (cat.images && cat.images[0]) ? cat.images[0] : 'https://placehold.co/600x400?text=Cat';
    card.innerHTML = `<img src="${img}" alt="${cat.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Cat';"><div class="pet-info"><h3>${cat.name}</h3><p>${cat.breed} - ${cat.desc}</p><p><strong>$${cat.price}</strong> • Origin: ${getOrigin(cat.breed)}</p><button class="add-btn" onclick="addToCart('${cat.name.replace(/'/g,"\\'")}','${cat.breed.replace(/'/g,"\\'")}','${cat.price}','${img}')">Add to Cart</button><button class="buy-now-btn" onclick="addToCart('${cat.name.replace(/'/g,"\\'")}','${cat.breed.replace(/'/g,"\\'")}','${cat.price}','${img}');document.querySelector('.cart-btn').click()">Buy Now</button></div>`;
    grid.appendChild(card);
  });
}

function filterPets(category){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  const btn = document.querySelector(`.filter-btn[data-category="${category}"]`);
  if(btn) btn.classList.add('active');
  if(category === 'All'){ buildAllPets().then(()=>renderPets(allPets,'All')); return; }
  if(category === 'Dog'){ buildAllPets().then(()=>renderPets(allPets.filter(p=>p.type==='Dog'),'Dog')); return; }
  if(category === 'Cat'){ buildAllPets().then(()=>renderPets(allPets.filter(p=>p.type==='Cat'),'Cat')); return; }
  if(category === 'Parrot'){ buildAllPets().then(()=>renderPets(allPets.filter(p=>p.type==='Parrot'),'Parrot')); return; }
}

function toggleCart(){
  const el = document.getElementById('cartPanel');
  el.classList.toggle('open');
}

let cart = [];
let userCart = [];
function addToCart(name, breed, price, image){
  const existing = cart.find(item=>item.name === name && item.breed === breed);
  if(existing){ existing.qty++; } else { cart.push({name, breed, price: Number(price), image, qty: 1}); }
  updateCartUI();
}
function removeFromCart(index){ cart.splice(index,1); updateCartUI(); }
function updateCartUI(){
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');
  if(!cartItems) return;
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach((item,idx)=>{
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `<img src="${item.image}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"><div><strong>${item.name}</strong><br>${item.breed}<br>$${item.price} x ${item.qty}</div><button onclick="removeFromCart(${idx})" style="background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:6px;cursor:pointer;">✕</button>`;
    cartItems.appendChild(div);
  });
  if(cartTotal) cartTotal.innerText = 'Total: $' + total;
  if(cartCount) cartCount.innerText = cart.reduce((s,i)=>s+i.qty,0);
}

function getBalance(){ return Number(localStorage.getItem('userBalance') || 0); }
function setBalance(v){ localStorage.setItem('userBalance', String(v)); updateWalletUI(); }

function addMoney(amount){
  if(amount <= 0) return;
  const current = getBalance();
  setBalance(current + amount);
  updateWalletUI();
  const status = document.getElementById('topupStatus');
  if(status) status.textContent = `Virtual money added! Your balance is $${getBalance()}.`;
}

function updateWalletUI(){
  const el = document.getElementById('walletBalance');
  if(el) el.textContent = '$' + getBalance();
  const el2 = document.getElementById('walletBalanceDisplay');
  if(el2) el2.textContent = '$' + getBalance();
}

// ===== FIXED ONLY: payNow =====
function payNow(country) {
  const name = document.getElementById("custName") ? document.getElementById("custName").value.trim() : "";
  const code = document.getElementById("phoneCode") ? document.getElementById("phoneCode").value : "";
  const phone = document.getElementById("custPhone") ? document.getElementById("custPhone").value.trim() : "";
  const email = document.getElementById("custEmail") ? document.getElementById("custEmail").value.trim() : "";
  const address = document.getElementById("custAddress") ? document.getElementById("custAddress").value : "";
  const msg = document.getElementById("orderMessage");
  country = country || document.getElementById("country")?.value || "";
  if (!country || !address || !phone || !email) {
    if (msg) { msg.style.color = "red"; msg.innerText = "Please select a country and enter your address, phone, and email."; }
    return;
  }
  const total = cart.reduce((s,p)=> s + Number(p.price) * (p.qty || 1), 0);
  if (getBalance() < total) {
    if (msg) { msg.style.color = "red"; msg.innerText = "*Top up wallet first"; }
    return;
  }
  setBalance(getBalance() - total);
  if (typeof updateWalletUI === "function") updateWalletUI();
  const fullPhone = code + phone;
  if (msg) { msg.style.color = "green"; msg.innerText = `*Order started for ${country} we'll notify you on ${fullPhone}`; }
  try {
    if (typeof cart !== "undefined") { cart = []; }
    if (typeof updateCartUI === "function") updateCartUI();
    if (typeof renderCart === "function") renderCart();
    localStorage.removeItem("cart");
  } catch(e) {}
}

function getBookedPets(){
  try{ return JSON.parse(localStorage.getItem('bookedPets') || '[]'); }catch(e){ return []; }
}
function saveBookedPets(list){ localStorage.setItem('bookedPets', JSON.stringify(list)); }

function showBookedPets(){
  let booked = getBookedPets();
  let box = document.getElementById('bookedPetsList');
  let box2 = document.getElementById('bookedPetsContainer');
  let target = box || box2;
  if(!target) return;
  target.innerHTML = '';
  if(!booked.length){ target.innerHTML = '<p>No booked pets yet.</p>'; return; }
  booked.forEach((item, idx)=>{
    let div = document.createElement('div');
    div.className = 'booked-pet-card';
    div.style.cssText = 'border:1px solid #ddd;border-radius:12px;padding:12px;margin-bottom:12px;background:#fff;';
    div.innerHTML = `
      <img src="${item.image||'https://placehold.co/600x400?text=Pet'}" style="width:100%;height:180px;object-fit:cover;border-radius:10px;">
      <h3>${item.name} - ${item.breed}</h3>
      <p><b>Full Price:</b> $${item.price} | <b>Paid:</b> $${item.paid} | <b>Remaining:</b> $${item.remaining}</p>
      <p>Status: ${item.status}</p>
      <button onclick="completePayment(${idx})" style="background:#2ecc71;color:white;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:bold;">Complete Payment - Pay $${item.remaining}</button>
      <button onclick="cancelBooking(${idx})" style="background:#e74c3c;color:white;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;margin-left:8px;">Cancel Booking</button>
      <p id="bookedMsg-${idx}" style="font-weight:bold;margin-top:8px;"></p>
    `;
    target.appendChild(div);
  });
}

function completePayment(index){
  let booked = getBookedPets();
  let item = booked[index];
  if(!item) return;
  let wallet = getBalance();
  if(wallet < item.remaining){
    let m = document.getElementById('bookedMsg-'+index);
    if(m){ m.style.color='red'; m.textContent = 'Not enough virtual balance. Top up wallet first!'; }
    return;
  }
  setBalance(wallet - item.remaining);
  item.paid = item.price;
  item.remaining = 0;
  item.status = 'Fully Paid - Order Started';
  booked[index] = item;
  saveBookedPets(booked);
  let m = document.getElementById('bookedMsg-'+index);
  if(m){ m.style.color='green'; m.textContent = `Order started for ${item.custName||''}! We will notify you soon.`; }
  showBookedPets();
}

function cancelBooking(index){
  let booked = getBookedPets();
  booked.splice(index,1);
  saveBookedPets(booked);
  showBookedPets();
}

// ===== FIXED ONLY: depositHalfToBook =====
function depositHalfToBook(){
  if(!cart || !cart.length){ alert('Your cart is empty'); return; }
  let wallet = getBalance();
  let totalDeposit = 0;
  cart.forEach(item=>{ totalDeposit += Number(item.price||0) / 2 * (item.qty || 1); });
  const msg = document.getElementById('depositMessage') || document.getElementById('orderMessage');
  if(wallet < totalDeposit){
    if(msg){ msg.style.color='red'; msg.textContent = 'Top up 50% of the pets price to book!!'; }
    return;
  }
  setBalance(wallet - totalDeposit);
  let booked = getBookedPets();
  let custName = document.getElementById('custName') ? document.getElementById('custName').value : '';
  let custAddress = document.getElementById('custAddress') ? document.getElementById('custAddress').value : '';
  let custPhone = document.getElementById('custPhone') ? document.getElementById('custPhone').value : '';
  let custEmail = document.getElementById('custEmail') ? document.getElementById('custEmail').value : '';
  cart.forEach(item=>{
    let price = Number(item.price||0);
    let img = '';
    if(item.images && item.images[0]) img = item.images[0];
    else if(item.image) img = item.image;
    booked.push({ name: item.name || item.breed || 'Pet', breed: item.breed || '', price: price, image: img, paid: price/2, remaining: price/2, status: 'Booked', date: new Date().toLocaleString(), custName: custName, custAddress: custAddress, custPhone: custPhone, custEmail: custEmail });
  });
  saveBookedPets(booked);
  cart = [];
  updateCartUI();
  if(msg){ msg.style.color='green'; msg.textContent = 'Pet Booked successfully🐶'; }
  showBookedPets();
}

// ===== ALIASES ONLY - FOR home.html onclicks, NO OTHER LOGIC CHANGED =====
function showPets(category){
  const map = {dog:'Dog', cat:'Cat', kitten:'Cat', parrot:'Parrot', puppy:'Dog', all:'All'};
  filterPets(map[category] || 'All');
}
function goHome(){
  closeSidePanel();
  const hp = document.getElementById('homePage');
  if(hp) hp.style.display = '';
  const pt = document.getElementById('pageTitle');
  if(pt) pt.textContent = 'All Pets';
  buildAllPets();
}
function openCart(){
  const d = document.getElementById('cartDrawer');
  if(d) d.style.display = 'block';
  else toggleCart();
}
function closeCart(){
  const d = document.getElementById('cartDrawer');
  if(d) d.style.display = 'none';
  const p = document.getElementById('cartPanel');
  if(p) p.classList.remove('open');
}
function googleSearch(){
  const q = (document.getElementById('searchInput')?.value || document.getElementById('homeSearch')?.value || '').trim().toLowerCase();
  if(!q) return buildAllPets();
  buildAllPets().then(()=>{
    const filtered = allPets.filter(p => (p.breed||'').toLowerCase().includes(q) || (p.name||'').toLowerCase().includes(q) || (p.desc||'').toLowerCase().includes(q));
    renderPets(filtered, 'Search');
    const hp = document.getElementById('homePage');
    if(hp) hp.style.display = 'none';
  });
}
function clearSearch(){
  const s = document.getElementById('searchInput');
  if(s) s.value = '';
  const sb = document.getElementById('suggestionsBox');
  if(sb) sb.innerHTML = '';
  buildAllPets();
}
function feelingLucky(){
  buildAllPets().then(()=>{
    if(!allPets.length) return;
    renderPets([allPets[Math.floor(Math.random()*allPets.length)]], 'Lucky');
  });
}
function closeBookedPets(){
  const p = document.getElementById('bookedPetsPage');
  if(p) p.style.display = 'none';
}
// AUTO-LOAD PETS ON HOME PAGE OPEN
document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (typeof buildAllPets === "function") {
      await buildAllPets();
    }
    if (typeof showPets === "function") {
      showPets('all');
    } else if (typeof renderPets === "function" && typeof allPets !== "undefined") {
      renderPets(allPets);
    }
    console.log("Pets loaded:", typeof allPets !== "undefined" ? allPets.length : "unknown");
  } catch (e) {
    console.error("Auto-load failed:", e);
  }
});