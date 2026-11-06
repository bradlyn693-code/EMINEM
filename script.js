function toggleSidePanel(){
  document.getElementById('sidebar').classList.toggle('hidden');
  document.getElementById('main').classList.toggle('full');
}
function toggleMenu(){ toggleSidePanel(); }

let allPets = [];
let usedImgs = new Set();

// ===== COUNTS + ORIGIN YOU WANTED =====
const COUNTS = { dog:147, cat:112, kitten:89, parrot:74, puppy:97 };

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
  {breed:"German Shepherd", api:"germanshepherd", desc:"Loyal guard dog, very smart.", price: 1450},
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
  {breed:"Bull Terrier", api:"bullterrier", desc:"Egg head, loyal.", price:1800},
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

let kittenNames = ["Mochi","Simba","Oliver","Lily","Milo","Zoe","Felix","Nala","Oreo","Ginger","Shadow","Pepper","Smokey","Angel","Tiger","Snow","Bella","Lucky","Cleo","Jasper","Misty","Pumpkin","Cookie","Midnight","Chloe","Ash"];
let kittenPrices = [780,1220,1200,1160,1190,1140,1210,670,1150,1180,990,1700,1990,1600,1220,1250,1240,1700,1190,1210,1160,1180,1200,170,1190,1150];

let parrotList = [
  {breed:"African Grey", price: 1200, desc:"Smartest parrot, can talk, grey feathers."},
  {breed:"Blue Macaw", price: 1500, desc:"Big blue parrot, very rare."},
  {breed:"Scarlet Macaw", price: 1400, desc:"Red, yellow, blue macaw."},
  {breed:"Green Macaw", price: 1300, desc:"Large green macaw."},
  {breed:"Budgie", price: 45, desc:"Small green/yellow parrot, easy to keep."},
  {breed:"Cockatiel", price: 120, desc:"Yellow crest, whistles tunes."},
  {breed:"Lovebird", price: 1190, desc:"Small, colorful, loves cuddles."},
  {breed:"Cockatoo", price: 950, desc:"White crest, very cuddly."},
  {breed:"Amazon Parrot", price: 800, desc:"Green, talkative."},
  {breed:"Conure", price: 1350, desc:"Playful, loud, colorful."},
  {breed:"Eclectus", price: 750, desc:"Male green, female red."},
  {breed:"Caique", price: 3650, desc:"Clown parrot, playful."},
  {breed:"Pionus", price: 550, desc:"Quiet, blue head."},
  {breed:"Quaker", price: 1280, desc:"Green, talks well."},
  {breed:"Senegal", price: 1320, desc:"Small, calm."},
  {breed:"Meyers", price: 2300, desc:"Small African parrot."},
  {breed:"Rosella", price: 1250, desc:"Colorful Australian parrot."},
  {breed:"Lorikeet", price: 1280, desc:"Rainbow colors, loves nectar."},
  {breed:"Budgerigar", price: 140, desc:"Small friendly parakeet."},
  {breed:"Parakeet", price: 1150, desc:"Small green parakeet."},
  {breed:"Sun Conure", price: 1420, desc:"Bright orange/yellow."},
  {breed:"Jenday Conure", price: 1380, desc:"Orange head conure."},
  {breed:"Green Cheek Conure", price: 1300, desc:"Small, quiet conure."},
  {breed:"Blue Crown Conure", price: 1360, desc:"Blue head conure."},
  {breed:"Severe Macaw", price: 850, desc:"Small macaw, green."},
  {breed:"Hahns Macaw", price: 800, desc:"Smallest macaw."},
  {breed:"Yellow Naped Amazon", price: 900, desc:"Yellow nape, talks."},
  {breed:"Double Yellow Amazon", price: 950, desc:"Yellow head amazon."},
  {breed:"Umbrella Cockatoo", price: 1100, desc:"Big white cockatoo."},
  {breed:"Sulphur Cockatoo", price: 1000, desc:"Yellow crest cockatoo."},
  {breed:"Goffins Cockatoo", price: 850, desc:"Small white cockatoo."},
  {breed:"Rose Breasted Cockatoo", price: 1900, desc:"Pink breast cockatoo."},
  {breed:"Palm Cockatoo", price: 1600, desc:"Black, big beak."}
];

async function getUniqueDog(api){
  for(let t=0; t<5; t++){
    try{
      let res = await fetch(`https://dog.ceo/api/breed/${api}/images/random`);
      let d = await res.json();
      if(!usedImgs.has(d.message)){ usedImgs.add(d.message); return d.message; }
    }catch(e){}
  }
  return "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80";
}

async function getUniqueCat(code){
  for(let t=0; t<5; t++){
    try{
      let res = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${code}&limit=1`);
      let d = await res.json();
      if(d[0] && !usedImgs.has(d[0].url)){ usedImgs.add(d[0].url); return d[0].url; }
    }catch(e){}
  }
  return "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80";
}

async function loadPets(){
  for(let i=0; i<dogList.length; i++){
    let b = dogList[i];
    let img = await getUniqueDog(b.api);
    allPets.push({type:'dog', name: b.breed, breed: b.breed, price: b.price, age: (2 + (i%10))+" months", desc: b.desc, img: img});
  }
  for(let i=0; i<24; i++){
    let b = dogList[i];
    let img = await getUniqueDog(b.api);
    allPets.push({type:'puppy', name: puppyNames[i], breed: b.breed+" Puppy", price: puppyPrices[i], age: (2 + (i%4))+" months", desc: "Baby "+b.breed+" puppy named "+puppyNames[i]+". "+b.desc, img: img});
  }
  for(let i=0; i<catList.length; i++){
    let c = catList[i];
    let img = await getUniqueCat(c.code);
    allPets.push({type:'cat', name: c.breed, breed: c.breed, price: c.price, age: (3 + (i%8))+" months", desc: c.desc, img: img});
  }
  for(let i=0; i<26; i++){
    let c = catList[i % catList.length];
    let img = await getUniqueCat(c.code);
    allPets.push({type:'kitten', name: kittenNames[i], breed: c.breed+" Kitten", price: kittenPrices[i], age: (2 + (i%4))+" months", desc: "Kitten "+kittenNames[i]+" - "+c.desc, img: img});
  }
  let parrotImgs = [
    "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=80",
    "https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=400&q=80",
    "https://images.unsplash.com/photo-1552727451-6f5671e14d83?w=400&q=80",
    "https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&q=80",
    "https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=400&q=80",
    "https://images.unsplash.com/photo-1549608276-5786777e6587?w=400&q=80",
    "https://images.unsplash.com/photo-1591198936750-16d8e15edb9e?w=400&q=80",
    "https://images.unsplash.com/photo-1619468007294-22b6c7e0a2e0?w=400&q=80"
  ];
  for(let i=0; i<parrotList.length; i++){
    let p = parrotList[i];
    let img = parrotImgs[i % parrotImgs.length];
    allPets.push({type:'parrot', name: p.breed, breed: p.breed, price: p.price, age: (4 + (i%10))+" months", desc: p.desc, img: img});
  }
  showPets('all');
}

function showPets(type){
  let list = document.getElementById('petList');
  let title = document.getElementById('pageTitle');
  let filtered = type === 'all' ? allPets : allPets.filter(p => p.type === type);
  title.innerText = type === 'all' ? 'All Pets (' + allPets.length + ')' : type.charAt(0).toUpperCase() + type.slice(1) + ' (' + filtered.length + ')';
  list.innerHTML = filtered.map(p => `
    <div class="card">
      <img src="${p.img}" loading="lazy" alt="${p.name}">
      <div class="card-body">
        <span class="health">✓ HEALTH CHECKED</span>
        <h3>${p.name}</h3>
        <p class="age">${p.age} • ${p.breed}</p>
        <p class="desc">${p.desc}</p>
        <div class="price">$${p.price.toLocaleString()}</div>
        <button onclick="addToCart('${p.name}')">🛒 Add to Cart</button>
      </div>
    </div>
  `).join('');
} 

loadPets();

// ===== GOOGLE STYLE SEARCH - MADE FOR YOUR FILE =====

function displaySearchResults(list) {
  let el = document.getElementById("petList");
  let title = document.getElementById("pageTitle");
  title.innerText = "Search Results (" + list.length + ")";
  el.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.img}" loading="lazy" alt="${p.name}">
      <div class="card-body">
        <span class="health">✓ HEALTH CHECKED</span>
        <h3>${p.name}</h3>
        <p class="age">${p.age} • ${p.breed}</p>
        <p class="desc">${p.desc}</p>
        <div class="price">$${p.price.toLocaleString()}</div>
        <button>Add to Cart</button>
      </div>
    </div>
  `).join("");
}

async function googleSearch() {
  let input = document.getElementById("searchInput").value.trim().toLowerCase();
  let box = document.getElementById("suggestionsBox");

  if (input.length === 0) {
    box.innerHTML = "";
    showPets('all');
    showExplore();
    return;
  }

  // 1. SEARCH INSIDE YOUR allPets FIRST - NO REDIRECT
  let filtered = allPets.filter(p =>
    p.name.toLowerCase().includes(input) ||
    p.breed.toLowerCase().includes(input) ||
    p.type.toLowerCase().includes(input)
  );

  box.innerHTML = filtered.slice(0,5).map(p =>
    `<div class="suggestion" onclick="selectSuggestion('${p.name}')">🔍 ${p.name} - $${p.price}</div>`
  ).join("");

  if (filtered.length > 0) {
    displaySearchResults(filtered);
    return;
  }

  // 2. NOT FOUND - FIND IT ONLINE BUT STAY ON YOUR SITE, SAME THEME
  let list = document.getElementById("petList");
  list.innerHTML = `<p style="text-align:center; padding:30px;">🔍 Searching for <b>${input}</b> in extended catalog...</p>`;
  
  let price = 150 + (input.length * 37);
  if (price > 1200) price = 1200;
  let img = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400";
  let type = "dog";

  try {
    if (input.includes("cat") || input.includes("persian") || input.includes("siamese") || input.includes("maine")) {
      let r = await fetch("https://api.thecatapi.com/v1/images/search");
      let d = await r.json();
      img = d[0].url; type = "cat";
    } else if (input.includes("parrot") || input.includes("bird") || input.includes("macaw") || input.includes("cockatoo")) {
      img = "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400"; type = "parrot";
    } else if (input.includes("fish") || input.includes("goldfish") || input.includes("betta")) {
      img = "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400"; type = "fish";
    } else if (input.includes("rabbit") || input.includes("bunny")) {
      img = "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400"; type = "rabbit";
    } else {
      let r = await fetch(`https://dog.ceo/api/breed/${input.split(" ")[0]}/images/random`);
      let d = await r.json();
      if (d.message) img = d.message;
    }
  } catch(e){}

  let newPet = {
    type: type,
    name: input.charAt(0).toUpperCase() + input.slice(1),
    breed: input.charAt(0).toUpperCase() + input.slice(1),
    price: price,
    img: img,
    age: "1 year",
    desc: "Found in extended catalog. Healthy and ready for a new home."
  };

  allPets.push(newPet);
  displaySearchResults([newPet]);
  box.innerHTML = `<div class="suggestion">✅ Found "${newPet.name}" - $${newPet.price} - Added to store</div>`;
}

function selectSuggestion(name){
  document.getElementById("searchInput").value = name;
  document.getElementById("suggestionsBox").innerHTML = "";
  googleSearch();
}
function clearSearch(){
  document.getElementById("searchInput").value = "";
  googleSearch();
}
function feelingLucky(){
  let random = allPets[Math.floor(Math.random()*allPets.length)];
  document.getElementById("searchInput").value = random.name;
  googleSearch();
}
function showExplore(){
  let box = document.getElementById("exploreSection");
  if(!box) return;
  let trending = [...allPets].sort(()=>0.5-Math.random()).slice(0,8);
  box.innerHTML = trending.map(p=>`
    <div class="explore-card" onclick="selectSuggestion('${p.name}')">
      <img src="${p.img}"><p><b>${p.name}</b></p><p>🔥 $${p.price}</p>
    </div>`).join("");
}

// ===== STEP 2: FAST + ORIGIN + AGE + SMART SEARCH =====

// ===== STEP 4: FIX 0 PETS - WAIT FOR API =====
let _originalLoad = typeof loadPets === 'function' ? loadPets : null;

// Don't let showPets run when empty - wait a bit and retry
let _oldShow = showPets;
showPets = function(type){
  if(!allPets || allPets.length===0){
    setTimeout(()=>showPets(type), 500);
    let t=document.getElementById("pageTitle");
    if(t) t.innerText="Loading pets... please wait...";
    return;
  }
  _oldShow(type);
};

// After page loads, try again until pets appear
setTimeout(()=>{
  if(allPets && allPets.length>0){
    showPets('all');
  } else {
    // If API failed, reload pets
    if(_originalLoad) _originalLoad();
    setTimeout(()=>showPets('all'), 1500);
  }
}, 1200);

// Fix Home button - show banner again
function goHome(){
  let h=document.getElementById("homePage");
  if(h) h.style.display="block";
  showPets('all');
  window.scrollTo(0,0);
}

// ===== STEP 5: NO DUPLICATES + SMART SEARCH =====

// 1. Remove duplicates - keep only 1 of each pet name
function removeDuplicates(list){
  let seen = {};
  return list.filter(p=>{
    let key = (p.name||p.breed||"").toLowerCase().trim() + "|" + (p.origin||"").toLowerCase().trim();
    if(seen[key]) return false;
    seen[key]=true;
    return true;
  });
}

// Clean allPets every time we show
let _show5 = showPets;
showPets = function(type){
  if(allPets && allPets.length>0){

  }
  _show5(type);
};

// 2. Fix    allPets = removeDuplicates(allPets); loadPets - don't load twice
let _load5 = typeof loadPets === 'function' ? loadPets : null;
let _isLoading = false;
if(_load5){
  loadPets = function(){
    if(_isLoading) return;
    _isLoading = true;
    _load5();
    setTimeout(()=>{ _isLoading=false; }, 3000);
  };
}

// 3. NEW SMART SEARCH - searches name, breed, origin, type, description
function googleSearch(){
  let q = document.getElementById("searchInput").value.toLowerCase().trim();
  // also check home banner search if used
  let homeQ = document.getElementById("homeSearch");
  if(!q && homeQ) q = homeQ.value.toLowerCase().trim();
  if(!q){ showPets('all'); return; }

  let words = q.split(" ");
  let results = allPets.filter(p=>{
    let text = ((p.name||"")+" "+(p.breed||"")+" "+(p.origin||"")+" "+(p.type||"")+" "+(p.category||"")+" "+(p.description||"")).toLowerCase();
    return words.every(w=> text.includes(w));
  });

  results = removeDuplicates(results);

  // Show results using your existing display
  if(typeof displayPets === 'function'){
    displayPets(results);
  } else if(typeof renderPets === 'function'){
    renderPets(results);
  } else {
    // fallback - set currentList and call show
    currentList = results;
    let listDiv = document.getElementById("petList");
    if(listDiv) listDiv.innerHTML = "";
    // force showPets to use results
    let oldAll = allPets;
    allPets = results;
    _show5('all');
    allPets = oldAll;
  }

  let t = document.getElementById("pageTitle");
  if(t) t.innerText = `Results for "${q}" (${results.length})`;
  let h = document.getElementById("homePage");
  if(h) h.style.display="none";
  window.scrollTo(0,0);
}

function feelingLucky(){
  if(!allPets || allPets.length===0) return;
  let r = allPets[Math.floor(Math.random()*allPets.length)];
  // show just that one
  let oldAll = allPets;
  allPets = [r];
  _show5('all');
  allPets = oldAll;
}

// ===== STEP 6B: WALLET + PAYSTACK INLINE (NO REDIRECT) =====
const PAYSTACK_PUBLIC_KEY = "pk_live_746fa4cd031258a58692b35c6f73e79ca330c873";
function getBalance(){ return parseFloat(localStorage.getItem("userBalance") || "0"); }
function setBalance(v){ localStorage.setItem("userBalance", v.toString()); updateWalletUI(); }

function updateWalletUI(){
  let el = document.getElementById("walletBalanceDisplay");
  if(el) el.innerText = "$" + getBalance().toFixed(2);
  let nav = document.getElementById("walletNavBalance");
  if(nav) nav.innerText = "$" + getBalance().toFixed(2);
}

function openWallet(){
  let m = document.getElementById("walletModal");
  if(!m){
    let div = document.createElement("div");
    div.id = "walletModal";
    div.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:999;display:flex;justify-content:center;align-items:center;";
    div.innerHTML = '<div style="background:white;width:90%;max-width:380px;padding:20px;border-radius:15px;text-align:center;"><h2>💰 My Wallet</h2><p style="font-size:14px;color:#666;">Your  balance to buy pets</p><div id="walletBalanceDisplay" style="background:#f0f8ff;padding:20px;border-radius:12px;font-size:32px;font-weight:bold;">$0.00</div><br><label>Top Up Amount ($)</label><br><input id="topupAmount" type="number" value="10" min="1" style="padding:12px;width:80%;border-radius:10px;border:1px solid #ccc;text-align:center;font-size:18px;"><br><br><button onclick="topUpWallet()" style="width:100%;padding:14px;background:#0ba4db;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;">💳 Top Up with Paystack</button><p style="font-size:12px;color:#888;">Visa • Mastercard • American Express • Apple Pay</p><button onclick="closeWallet()" style="background:none;border:none;color:red;cursor:pointer;">Close</button></div>';
    document.body.appendChild(div);
    m = div;
  }
  updateWalletUI();
  m.style.display = "flex";
}
function closeWallet(){ let m=document.getElementById("walletModal"); if(m) m.style.display="none"; }
function topUpWallet(){
  let amount = parseFloat(document.getElementById("topupAmount").value);
  if(!amount || amount < 1){ alert("Enter amount $1 or more"); return; }
  let email = localStorage.getItem("userEmail") || prompt("Enter your email for receipt:");
  if(!email) return;
  localStorage.setItem("userEmail", email);
closeWallet();
window.scrollTo(0,0);
  let handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: amount * 100, // Paystack uses cents
    currency: "USD",
    channels: ['card', 'apple_pay'], // This shows Visa, Mastercard, Amex, Apple Pay
    callback: function(response){
      // Payment succeeded!
      let newBal = getBalance() + amount;
      setBalance(newBal);
      alert("Top up successful! New Balance: $" + newBal.toFixed(2) + "\nRef: " + response.reference);
      closeWallet();
    },
    onClose: function(){ alert("Payment cancelled"); openWallet(); },
  });
  handler.openIframe(); // This is the popup INSIDE your site, NOT redirect
}

// Make sidebar Wallet button open wallet
// In index.html change Wallet link to onclick="openWallet()"M

let cart = [];
function addToCart(petName){
  const pet = allPets.find(p => p.name === petName);
  if(!pet) return alert("Pet not found");
  cart.push(pet);
  updateCartUI();
  openCart();
}
function updateCartUI(){
  document.getElementById('cartCount').innerText = cart.length;
  const total = cart.reduce((s,p)=> s + Number(p.price), 0);
  document.getElementById('cartTotal').innerText = total.toLocaleString();
  document.getElementById('cartItems').innerHTML = cart.length===0 ? "<p>Cart is empty</p>" : cart.map((p,i)=>`<div style="display:flex;justify-content:space-between;padding:10px 0"><span>${p.name} - USD
 ${Number(p.price).toLocaleString()}</span><button onclick="removeFromCart(${i})">❌</button></div>`).join('');
  const btn = document.getElementById('checkoutBtn');
  const info = document.getElementById('balanceInfo');
  if(btn && info){
    if(cart.length===0){ btn.disabled=true; info.innerText=""; }
    else if(getBalance() < total){ btn.disabled=true; btn.style.background="#ccc"; info.innerText=`❌ Not enough balance. Need 
       ${total.toLocaleString()}, you have 
     ${getBalance().toLocaleString()}. Top up first.`; info.style.color="red"; }
    else { btn.disabled=false; btn.style.background="#ff6b00"; info.innerText=`✅ Enough balance. After paying you will remain with 
       ${(getBalance()-total).toLocaleString()}`; info.style.color="green"; }
  }
}
function removeFromCart(i){ cart.splice(i,1); updateCartUI(); }
function openCart(){ document.getElementById('cartDrawer').style.display='block'; updateCartUI(); }
function closeCart(){ document.getElementById('cartDrawer').style.display='none'; }
function checkout(){
  const total = cart.reduce((s,p)=> s + Number(p.price), 0);
  if(cart.length===0) return alert("Cart empty");
  if(getBalance() < total){ alert(`❌ Cannot buy. Need 
     ${total}, you have 
     ${getBalance()}. Top up first.`); closeCart(); openWallet(); return; }
  setBalance(getBalance() - total);
  updateWalletUI(); updateCartUI();
  alert(`🎉 Order successful! Paid 
     ${total.toLocaleString()} from wallet.`);
  cart=[]; updateCartUI(); closeCart();
}

  // ===== STEP 2: PAY NOW - CREATE ORDER =====
function payNow() {
  const name = document.getElementById("custName") ? document.getElementById("custName").value.trim() : "";
  const code = document.getElementById("phoneCode") ? document.getElementById("phoneCode").value : "+254";
  const phone = document.getElementById("custPhone") ? document.getElementById("custPhone").value.trim() : "";
  const email = document.getElementById("custEmail") ? document.getElementById("custEmail").value.trim() : "";const address = document.getElementById("custAddress") ? document.getElementById("custAddress").value : "";
  const msg = document.getElementById("orderMessage");
 

if (!address || !phone || !email) {
    if (msg) { msg.style.color = "red"; msg.innerText = "Please enter your address, phone, and email."; }
    return;
  }
  const total = cart.reduce((s,p)=> s + Number(p.price), 0);
  if (getBalance() < total) { alert("Not enough wallet balance. Top up first."); return; }
  setBalance(getBalance() - total);
  if (typeof updateWalletUI === "function") updateWalletUI();
  const fullPhone = code + phone;

  if (msg) {
    msg.style.color = "green";
    msg.innerText = "Order Started! We'll notify you on " + fullPhone + ". Thank you!";
  }

  // Clear cart if it exists
  try {
    if (typeof cart !== "undefined") { cart = []; }
    if (typeof updateCartUI === "function") updateCartUI();
    if (typeof renderCart === "function") renderCart();
    localStorage.removeItem("cart");
  } catch(e) {}

  alert("Order Started! We'll notify you on " + fullPhone);
}

// ===== SEARCHABLE COUNTRY PICKER WITH REAL FLAGS =====
document.addEventListener("DOMContentLoaded", () => {
// FULL COUNTRIES WITH FLAGS - All Asia, Europe, America, Africa, Australia, South America
function flagFromCode(code){
  // Turns "KE" -> 🇰🇪, "US" -> 🇺🇸, "GB" -> 🇬🇧
  return code.toUpperCase().replace(/./g, ch => String.fromCodePoint(127397 + ch.charCodeAt(0)));
}

const countries = [
  // AFRICA
  {n:"Algeria", d:"+213", c:"DZ", r:"Africa"},
  {n:"Angola", d:"+244", c:"AO", r:"Africa"},
  {n:"Benin", d:"+229", c:"BJ", r:"Africa"},
  {n:"Botswana", d:"+267", c:"BW", r:"Africa"},
  {n:"Burkina Faso", d:"+226", c:"BF", r:"Africa"},
  {n:"Burundi", d:"+257", c:"BI", r:"Africa"},
  {n:"Cabo Verde", d:"+238", c:"CV", r:"Africa"},
  {n:"Cameroon", d:"+237", c:"CM", r:"Africa"},
  {n:"Central African Republic", d:"+236", c:"CF", r:"Africa"},
  {n:"Chad", d:"+235", c:"TD", r:"Africa"},
  {n:"Comoros", d:"+269", c:"KM", r:"Africa"},
  {n:"Congo", d:"+242", c:"CG", r:"Africa"},
  {n:"Congo, DR", d:"+243", c:"CD", r:"Africa"},
  {n:"Djibouti", d:"+253", c:"DJ", r:"Africa"},
  {n:"Egypt", d:"+20", c:"EG", r:"Africa"},
  {n:"Equatorial Guinea", d:"+240", c:"GQ", r:"Africa"},
  {n:"Eritrea", d:"+291", c:"ER", r:"Africa"},
  {n:"Eswatini", d:"+268", c:"SZ", r:"Africa"},
  {n:"Ethiopia", d:"+251", c:"ET", r:"Africa"},
  {n:"Gabon", d:"+241", c:"GA", r:"Africa"},
  {n:"Gambia", d:"+220", c:"GM", r:"Africa"},
  {n:"Ghana", d:"+233", c:"GH", r:"Africa"},
  {n:"Guinea", d:"+224", c:"GN", r:"Africa"},
  {n:"Guinea-Bissau", d:"+245", c:"GW", r:"Africa"},
  {n:"Ivory Coast", d:"+225", c:"CI", r:"Africa"},
  {n:"Kenya", d:"+254", c:"KE", r:"Africa"},
  {n:"Lesotho", d:"+266", c:"LS", r:"Africa"},
  {n:"Liberia", d:"+231", c:"LR", r:"Africa"},
  {n:"Libya", d:"+218", c:"LY", r:"Africa"},
  {n:"Madagascar", d:"+261", c:"MG", r:"Africa"},
  {n:"Malawi", d:"+265", c:"MW", r:"Africa"},
  {n:"Mali", d:"+223", c:"ML", r:"Africa"},
  {n:"Mauritania", d:"+222", c:"MR", r:"Africa"},
  {n:"Mauritius", d:"+230", c:"MU", r:"Africa"},
  {n:"Morocco", d:"+212", c:"MA", r:"Africa"},
  {n:"Mozambique", d:"+258", c:"MZ", r:"Africa"},
  {n:"Namibia", d:"+264", c:"NA", r:"Africa"},
  {n:"Niger", d:"+227", c:"NE", r:"Africa"},
  {n:"Nigeria", d:"+234", c:"NG", r:"Africa"},
  {n:"Rwanda", d:"+250", c:"RW", r:"Africa"},
  {n:"Sao Tome & Principe", d:"+239", c:"ST", r:"Africa"},
  {n:"Senegal", d:"+221", c:"SN", r:"Africa"},
  {n:"Seychelles", d:"+248", c:"SC", r:"Africa"},
  {n:"Sierra Leone", d:"+232", c:"SL", r:"Africa"},
  {n:"Somalia", d:"+252", c:"SO", r:"Africa"},
  {n:"South Africa", d:"+27", c:"ZA", r:"Africa"},
  {n:"South Sudan", d:"+211", c:"SS", r:"Africa"},
  {n:"Sudan", d:"+249", c:"SD", r:"Africa"},
  {n:"Tanzania", d:"+255", c:"TZ", r:"Africa"},
  {n:"Togo", d:"+228", c:"TG", r:"Africa"},
  {n:"Tunisia", d:"+216", c:"TN", r:"Africa"},
  {n:"Uganda", d:"+256", c:"UG", r:"Africa"},
  {n:"Zambia", d:"+260", c:"ZM", r:"Africa"},
  {n:"Zimbabwe", d:"+263", c:"ZW", r:"Africa"},
  // ASIA
  {n:"Afghanistan", d:"+93", c:"AF", r:"Asia"},
  {n:"Armenia", d:"+374", c:"AM", r:"Asia"},
  {n:"Azerbaijan", d:"+994", c:"AZ", r:"Asia"},
  {n:"Bahrain", d:"+973", c:"BH", r:"Asia"},
  {n:"Bangladesh", d:"+880", c:"BD", r:"Asia"},
  {n:"Bhutan", d:"+975", c:"BT", r:"Asia"},
  {n:"Brunei", d:"+673", c:"BN", r:"Asia"},
  {n:"Cambodia", d:"+855", c:"KH", r:"Asia"},
  {n:"China", d:"+86", c:"CN", r:"Asia"},
  {n:"Cyprus", d:"+357", c:"CY", r:"Asia"},
  {n:"Georgia", d:"+995", c:"GE", r:"Asia"},
  {n:"India", d:"+91", c:"IN", r:"Asia"},
  {n:"Indonesia", d:"+62", c:"ID", r:"Asia"},
  {n:"Iran", d:"+98", c:"IR", r:"Asia"},
  {n:"Iraq", d:"+964", c:"IQ", r:"Asia"},
  {n:"Israel", d:"+972", c:"IL", r:"Asia"},
  {n:"Japan", d:"+81", c:"JP", r:"Asia"},
  {n:"Jordan", d:"+962", c:"JO", r:"Asia"},
  {n:"Kazakhstan", d:"+7", c:"KZ", r:"Asia"},
  {n:"Kuwait", d:"+965", c:"KW", r:"Asia"},
  {n:"Kyrgyzstan", d:"+996", c:"KG", r:"Asia"},
  {n:"Laos", d:"+856", c:"LA", r:"Asia"},
  {n:"Lebanon", d:"+961", c:"LB", r:"Asia"},
  {n:"Malaysia", d:"+60", c:"MY", r:"Asia"},
  {n:"Maldives", d:"+960", c:"MV", r:"Asia"},
  {n:"Mongolia", d:"+976", c:"MN", r:"Asia"},
  {n:"Myanmar", d:"+95", c:"MM", r:"Asia"},
  {n:"Nepal", d:"+977", c:"NP", r:"Asia"},
  {n:"North Korea", d:"+850", c:"KP", r:"Asia"},
  {n:"Oman", d:"+968", c:"OM", r:"Asia"},
  {n:"Pakistan", d:"+92", c:"PK", r:"Asia"},
  {n:"Palestine", d:"+970", c:"PS", r:"Asia"},
  {n:"Philippines", d:"+63", c:"PH", r:"Asia"},
  {n:"Qatar", d:"+974", c:"QA", r:"Asia"},
  {n:"Saudi Arabia", d:"+966", c:"SA", r:"Asia"},
  {n:"Singapore", d:"+65", c:"SG", r:"Asia"},
  {n:"South Korea", d:"+82", c:"KR", r:"Asia"},
  {n:"Sri Lanka", d:"+94", c:"LK", r:"Asia"},
  {n:"Syria", d:"+963", c:"SY", r:"Asia"},
  {n:"Taiwan", d:"+886", c:"TW", r:"Asia"},
  {n:"Tajikistan", d:"+992", c:"TJ", r:"Asia"},
  {n:"Thailand", d:"+66", c:"TH", r:"Asia"},
  {n:"Timor-Leste", d:"+670", c:"TL", r:"Asia"},
  {n:"Turkey", d:"+90", c:"TR", r:"Asia"},
  {n:"Turkmenistan", d:"+993", c:"TM", r:"Asia"},
  {n:"UAE", d:"+971", c:"AE", r:"Asia"},
  {n:"Uzbekistan", d:"+998", c:"UZ", r:"Asia"},
  {n:"Vietnam", d:"+84", c:"VN", r:"Asia"},
  {n:"Yemen", d:"+967", c:"YE", r:"Asia"},
  // EUROPE
  {n:"Albania", d:"+355", c:"AL", r:"Europe"},
  {n:"Andorra", d:"+376", c:"AD", r:"Europe"},
  {n:"Austria", d:"+43", c:"AT", r:"Europe"},
  {n:"Belarus", d:"+375", c:"BY", r:"Europe"},
  {n:"Belgium", d:"+32", c:"BE", r:"Europe"},
  {n:"Bosnia & Herzegovina", d:"+387", c:"BA", r:"Europe"},
  {n:"Bulgaria", d:"+359", c:"BG", r:"Europe"},
  {n:"Croatia", d:"+385", c:"HR", r:"Europe"},
  {n:"Czech Republic", d:"+420", c:"CZ", r:"Europe"},
  {n:"Denmark", d:"+45", c:"DK", r:"Europe"},
  {n:"Estonia", d:"+372", c:"EE", r:"Europe"},
  {n:"Finland", d:"+358", c:"FI", r:"Europe"},
  {n:"France", d:"+33", c:"FR", r:"Europe"},
  {n:"Germany", d:"+49", c:"DE", r:"Europe"},
  {n:"Greece", d:"+30", c:"GR", r:"Europe"},
  {n:"Hungary", d:"+36", c:"HU", r:"Europe"},
  {n:"Iceland", d:"+354", c:"IS", r:"Europe"},
  {n:"Ireland", d:"+353", c:"IE", r:"Europe"},
  {n:"Italy", d:"+39", c:"IT", r:"Europe"},
  {n:"Kosovo", d:"+383", c:"XK", r:"Europe"},
  {n:"Latvia", d:"+371", c:"LV", r:"Europe"},
  {n:"Liechtenstein", d:"+423", c:"LI", r:"Europe"},
  {n:"Lithuania", d:"+370", c:"LT", r:"Europe"},
  {n:"Luxembourg", d:"+352", c:"LU", r:"Europe"},
  {n:"Malta", d:"+356", c:"MT", r:"Europe"},
  {n:"Moldova", d:"+373", c:"MD", r:"Europe"},
  {n:"Monaco", d:"+377", c:"MC", r:"Europe"},
  {n:"Montenegro", d:"+382", c:"ME", r:"Europe"},
  {n:"Netherlands", d:"+31", c:"NL", r:"Europe"},
  {n:"North Macedonia", d:"+389", c:"MK", r:"Europe"},
  {n:"Norway", d:"+47", c:"NO", r:"Europe"},
  {n:"Poland", d:"+48", c:"PL", r:"Europe"},
  {n:"Portugal", d:"+351", c:"PT", r:"Europe"},
  {n:"Romania", d:"+40", c:"RO", r:"Europe"},
  {n:"Russia", d:"+7", c:"RU", r:"Europe"},
  {n:"San Marino", d:"+378", c:"SM", r:"Europe"},
  {n:"Serbia", d:"+381", c:"RS", r:"Europe"},
  {n:"Slovakia", d:"+421", c:"SK", r:"Europe"},
  {n:"Slovenia", d:"+386", c:"SI", r:"Europe"},
  {n:"Spain", d:"+34", c:"ES", r:"Europe"},
  {n:"Sweden", d:"+46", c:"SE", r:"Europe"},
  {n:"Switzerland", d:"+41", c:"CH", r:"Europe"},
  {n:"Ukraine", d:"+380", c:"UA", r:"Europe"},
  {n:"UK", d:"+44", c:"GB", r:"Europe"},
  {n:"Vatican City", d:"+379", c:"VA", r:"Europe"},
  // NORTH AMERICA
  {n:"Antigua & Barbuda", d:"+1", c:"AG", r:"America"},
  {n:"Bahamas", d:"+1", c:"BS", r:"America"},
  {n:"Barbados", d:"+1", c:"BB", r:"America"},
  {n:"Belize", d:"+501", c:"BZ", r:"America"},
  {n:"Canada", d:"+1", c:"CA", r:"America"},
  {n:"Costa Rica", d:"+506", c:"CR", r:"America"},
  {n:"Cuba", d:"+53", c:"CU", r:"America"},
  {n:"Dominica", d:"+1", c:"DM", r:"America"},
  {n:"Dominican Republic", d:"+1", c:"DO", r:"America"},
  {n:"El Salvador", d:"+503", c:"SV", r:"America"},
  {n:"Grenada", d:"+1", c:"GD", r:"America"},
  {n:"Guatemala", d:"+502", c:"GT", r:"America"},
  {n:"Haiti", d:"+509", c:"HT", r:"America"},
  {n:"Honduras", d:"+504", c:"HN", r:"America"},
  {n:"Jamaica", d:"+1", c:"JM", r:"America"},
  {n:"Mexico", d:"+52", c:"MX", r:"America"},
  {n:"Nicaragua", d:"+505", c:"NI", r:"America"},
  {n:"Panama", d:"+507", c:"PA", r:"America"},
  {n:"St Kitts & Nevis", d:"+1", c:"KN", r:"America"},
  {n:"St Lucia", d:"+1", c:"LC", r:"America"},
  {n:"St Vincent & Grenadines", d:"+1", c:"VC", r:"America"},
  {n:"Trinidad & Tobago", d:"+1", c:"TT", r:"America"},
  {n:"USA", d:"+1", c:"US", r:"America"},
  // SOUTH AMERICA
  {n:"Argentina", d:"+54", c:"AR", r:"South America"},
  {n:"Bolivia", d:"+591", c:"BO", r:"South America"},
  {n:"Brazil", d:"+55", c:"BR", r:"South America"},
  {n:"Chile", d:"+56", c:"CL", r:"South America"},
  {n:"Colombia", d:"+57", c:"CO", r:"South America"},
  {n:"Ecuador", d:"+593", c:"EC", r:"South America"},
  {n:"Guyana", d:"+592", c:"GY", r:"South America"},
  {n:"Paraguay", d:"+595", c:"PY", r:"South America"},
  {n:"Peru", d:"+51", c:"PE", r:"South America"},
  {n:"Suriname", d:"+597", c:"SR", r:"South America"},
  {n:"Uruguay", d:"+598", c:"UY", r:"South America"},
  {n:"Venezuela", d:"+58", c:"VE", r:"South America"},
  // AUSTRALIA / OCEANIA
  {n:"Australia", d:"+61", c:"AU", r:"Australia"},
  {n:"Fiji", d:"+679", c:"FJ", r:"Australia"},
  {n:"Kiribati", d:"+686", c:"KI", r:"Australia"},
  {n:"Marshall Islands", d:"+692", c:"MH", r:"Australia"},
  {n:"Micronesia", d:"+691", c:"FM", r:"Australia"},
  {n:"Nauru", d:"+674", c:"NR", r:"Australia"},
  {n:"New Zealand", d:"+64", c:"NZ", r:"Australia"},
  {n:"Palau", d:"+680", c:"PW", r:"Australia"},
  {n:"Papua New Guinea", d:"+675", c:"PG", r:"Australia"},
  {n:"Samoa", d:"+685", c:"WS", r:"Australia"},
  {n:"Solomon Islands", d:"+677", c:"SB", r:"Australia"},
  {n:"Tonga", d:"+676", c:"TO", r:"Australia"},
  {n:"Tuvalu", d:"+688", c:"TV", r:"Australia"},
  {n:"Vanuatu", d:"+678", c:"VU", r:"Australia"}
];
countries.sort((a,b)=>a.n.localeCompare(b.n));
function flagFromCode(code){
  return `<img src="https://flagcdn.com/w20/${code.toLowerCase()}.png" width="20" style="vertical-align:middle;border:1px solid #ddd">`;
}


function renderCountries(filter=""){
  const list = document.getElementById("countryList");
  if(!list) return;
  const q = filter.toLowerCase();
  const filtered = countries.filter(c => c.n.toLowerCase().includes(q) || c.d.includes(q));
  list.innerHTML = filtered.map(c => {
    const flag = flagFromCode(c.c);
    return `<div onclick="selectCountry('${c.c}','${c.d}','${c.n}')" style="padding:8px 10px;cursor:pointer;border-bottom:1px solid #eee">${flag} ${c.d} ${c.n} <small>• ${c.r}</small></div>`;
  }).join('');
}

function selectCountry(code, dial, name){
  const btn = document.getElementById("countryBtn");
  if(btn) btn.innerHTML = flagFromCode(code) + ' ' + dial + ' ' + name + ' ▼';
  const box = document.getElementById("countryList");
  if(box) box.innerHTML = '';
  const search = document.getElementById("countrySearch");
  if(search) search.value = '';
}

renderCountries();{
 
}
// Delegated - works even if checkout is created later
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#countryBtn");
  if (btn) {
    e.stopPropagation();
    const d = document.getElementById("countryDrop");
    const show = d.style.display === "none" || d.style.display === "";
    d.style.display = show ? "block" : "none";
    if (show) {
      renderCountries("");
      const s = document.getElementById("countrySearch");
      s.value = "";
      setTimeout(() => s.focus(), 50);
    }
    return;
  }
  const picker = document.getElementById("countryPicker");
  if (picker && !picker.contains(e.target)) {
    const d = document.getElementById("countryDrop");
    if (d) d.style.display = "none";
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "countrySearch") renderCountries(e.target.value);
});
renderCountries("");
});

document.getElementById('menuBtn').addEventListener('click', toggleSidePanel);
document.getElementById('signOutBtn').addEventListener('click', function() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.href = 'login.html';
});
