function toggleSidePanel(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('panelOverlay');
  const menuButton = document.getElementById('menuBtn');
  if(!window.matchMedia('(max-width: 1024px)').matches) return;
  const isOpen = sidebar.classList.toggle('open');
  if(overlay) overlay.classList.toggle('active', isOpen);
  if(menuButton) menuButton.setAttribute('aria-expanded', String(isOpen));
}
function toggleMenu(){ toggleSidePanel(); }

function closeSidePanel(){
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('panelOverlay');
  const menuButton = document.getElementById('menuBtn');
  sidebar.classList.remove('open');
  if(overlay) overlay.classList.remove('active');
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

function parrotFallbackImage(bodyColor, accentColor){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#f3f3f3"/><ellipse cx="390" cy="340" rx="190" ry="145" fill="${bodyColor}"/><circle cx="520" cy="205" r="95" fill="${bodyColor}"/><path d="M600 200l130 45-130 40z" fill="${accentColor}"/><path d="M280 355l-170 145 240-65z" fill="${accentColor}"/><circle cx="550" cy="180" r="12" fill="#222"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

let parrotList = [
  {breed:"African Grey Parrot", price:1200, desc:"Intelligent...", img:"https://picsum.photos/seed/africangrey/400/300", bodyColor:"#808080", accentColor:"#FF0000"},
  {breed:"Blue and Gold Macaw", price:1500, desc:"Blue wings...", img:"https://picsum.photos/seed/macaw/400/300", bodyColor:"#0066FF", accentColor:"#FFCC00"},
  {breed:"Budgerigar / Budgie", price:45, desc:"A small, live...", img:"https://picsum.photos/seed/budgie/400/300", bodyColor:"#00CC66", accentColor:"#FFFF00"},
  {breed:"Cockatiel", price:120, desc:"Grey cockatiel...", img:"https://picsum.photos/seed/cockatiel/400/300", bodyColor:"#999999", accentColor:"#FF9900"},
  {breed:"Amazon Parrot", price:800, desc:"A sociable green...", img:"https://picsum.photos/seed/amazon/400/300", bodyColor:"#009900", accentColor:"#FF0000"},
  {breed:"Sun Conure", price:1420, desc:"A brilliant conure...", img:"https://picsum.photos/seed/sunconure/400/300", bodyColor:"#FF9900", accentColor:"#FFFF00"},
  {breed:"Lovebird", price:1190, desc:"A small, affectionate...", img:"https://picsum.photos/seed/lovebird/400/300", bodyColor:"#FF3399", accentColor:"#00CCFF"},
  {breed:"White Cockatoo", price:950, desc:"An elegant all-white...", img:"https://picsum.photos/seed/cockatoo/400/300", bodyColor:"#FFFFFF", accentColor:"#FFCC00"},
];

async function fetchWithTimeout(url, timeoutMs = 8000){
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try{
    return await fetch(url, { signal: controller.signal });
  }finally{
    clearTimeout(timeout);
  }
}

const dogFallbackImages = [
  "https://images.dog.ceo/breeds/german-shepherd/n02106662_20711.jpg",
  "https://images.dog.ceo/breeds/german-shepherd/img_20200801_005827_704.jpg",
  "https://images.dog.ceo/breeds/german-shepherd/n02106662_1451.jpg",
  "https://images.dog.ceo/breeds/german-shepherd/n02106662_10858.jpg"
];
const germanShepherdFallback = "https://images.dog.ceo/breeds/german-shepherd/n02106662_20711.jpg";
const catFallbackImages = [
  "https://cdn2.thecatapi.com/images/avc.jpg",
  "https://cdn2.thecatapi.com/images/eda.jpg",
  "https://cdn2.thecatapi.com/images/77e.jpg",
  "https://cdn2.thecatapi.com/images/MTg5OTI0Ng.jpg"
];
const breedPhotos = new Map();

function getBreedPhotos(key, load){
  if(!breedPhotos.has(key)) breedPhotos.set(key, load());
  return breedPhotos.get(key);
}

async function getDogImages(api){
  try{
    const response = await fetchWithTimeout(`https://dog.ceo/api/breed/${api}/images/random/4`);
    if(!response.ok) throw new Error(`Dog image API returned ${response.status} for ${api}`);
    const data = await response.json();
    const images = Array.isArray(data.message) ? [...new Set(data.message)] : [];
    if(data.status === "success" && images.length >= 4) return images.slice(0, 4);
    throw new Error(`Dog image API returned fewer than four photos for ${api}`);
  }catch(error){
    console.warn(`Using real-photo fallback for dog breed ${api}:`, error);
    return dogFallbackImages;
  }
}

async function getCatImages(code){
  try{
    const response = await fetchWithTimeout(`https://api.thecatapi.com/v1/images/search?breed_ids=${encodeURIComponent(code)}&limit=4&mime_types=jpg`);
    if(!response.ok) throw new Error(`Cat image API returned ${response.status} for ${code}`);
    const data = await response.json();
    const images = Array.isArray(data)
      ? [...new Set(data.map(item => item.url).filter(url => /^https:\/\/[^/]+\/.+\.jpg(?:\?.*)?$/i.test(url)))]
      : [];
    if(images.length >= 4) return images.slice(0, 4);
    throw new Error(`Cat image API returned fewer than four JPG photos for ${code}`);
  }catch(error){
    console.warn(`Using real-photo fallback for cat breed ${code}:`, error);
    return catFallbackImages;
  }
}

function handlePetImageError(image){
  if(image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  const index = Number(image.dataset.petIndex);
  const pet = allPets[index];
  if(pet && pet.breed.toLowerCase().includes("german shepherd")){
    image.src = germanShepherdFallback;
  }else if(pet && (pet.type === "cat" || pet.type === "kitten")){
    image.src = catFallbackImages[0];
  }else if(pet && pet.type === "parrot"){
    image.src = pet.fallbackImage;
  }else{
    image.src = dogFallbackImages[0];
  }
}

function loadPets(){
  if(allPets.length) return;
  const imageTasks = [];
  const seenPets = new Set();
  function addPet(pet, getImages){
    const normalizedBreed = pet.breed.toLowerCase().trim() === "budgie"
      ? "budgerigar"
      : pet.breed.toLowerCase().trim();
    const duplicateKey = pet.type === "puppy" || pet.type === "kitten"
      ? `${pet.type}|${normalizedBreed}|${pet.name.toLowerCase().trim()}`
      : `${pet.type}|${normalizedBreed}`;
    if(seenPets.has(duplicateKey)) return;
    seenPets.add(duplicateKey);

    const index = allPets.length;
    allPets.push({...pet, id:`pet-${index + 1}`, images:pet.images.slice(0, 4)});
    if(getImages){
      imageTasks.push(async () => {
        const images = await getImages();
        if(images.length === 4){
          allPets[index].images = images;
          document.querySelectorAll(`[data-pet-index="${index}"]`).forEach((image) => {
            const photoIndex = Number(image.dataset.photoIndex || 0);
            image.dataset.fallbackApplied = "";
            image.src = images[photoIndex] || images[0];
          });
        }
      });
    }
  }

  for(let i=0; i<dogList.length; i++){
    const dog = dogList[i];
    addPet({
      type:'dog', name:dog.breed, breed:dog.breed, price:dog.price,
      age:(2 + (i%10))+" months", desc:dog.desc, images:dogFallbackImages
    }, () => getBreedPhotos(`dog:${dog.api}`, () => getDogImages(dog.api)));
  }
  for(let i=0; i<24; i++){
    const dog = dogList[i];
    addPet({
      type:'puppy', name:puppyNames[i], breed:dog.breed+" Puppy", price:puppyPrices[i],
      age:(2 + (i%4))+" months", desc:"Baby "+dog.breed+" puppy named "+puppyNames[i]+". "+dog.desc,
      images:dogFallbackImages
    }, () => getBreedPhotos(`dog:${dog.api}`, () => getDogImages(dog.api)));
  }
  for(let i=0; i<catList.length; i++){
    const cat = catList[i];
    addPet({
      type:'cat', name:cat.breed, breed:cat.breed, price:cat.price,
      age:(3 + (i%8))+" months", desc:cat.desc, images:catFallbackImages
    }, () => getBreedPhotos(`cat:${cat.code}`, () => getCatImages(cat.code)));
  }
  for(let i=0; i<26; i++){
    const cat = catList[i % catList.length];
    addPet({
      type:'kitten', name:kittenNames[i], breed:cat.breed+" Kitten", price:kittenPrices[i],
      age:(2 + (i%4))+" months", desc:"Kitten "+kittenNames[i]+" - "+cat.desc,
      images:catFallbackImages
    }, () => getBreedPhotos(`cat:${cat.code}`, () => getCatImages(cat.code)));
  }
  for(let i=0; i<parrotList.length; i++){
    const parrot = parrotList[i];
    addPet({
      type:'parrot', name:parrot.breed, breed:parrot.breed, price:parrot.price,
      age:(4 + (i%10))+" months", desc:parrot.desc, images:[parrot.image],
      fallbackImage:parrot.fallbackImage
    });
  }

  for(const type of ["dog", "cat", "kitten", "parrot", "puppy"]){
    const count = document.getElementById(`${type}Count`);
    if(count) count.textContent = allPets.filter(pet => pet.type === type).length;
  }
  showPets('all');

  let nextImageTask = 0;
  const workers = Array.from({length: 6}, async () => {
    while(nextImageTask < imageTasks.length){
      const task = imageTasks[nextImageTask++];
      await task();
    }
  });
  Promise.all(workers).catch((error) => console.error('Pet image loading failed:', error));
}

function showPets(type){
  const list = document.getElementById('petList');
  const title = document.getElementById('pageTitle');
  const filtered = type === 'all' ? allPets : allPets.filter(pet => pet.type === type);
  title.innerText = type === 'all' ? 'All Pets (' + allPets.length + ')' : type.charAt(0).toUpperCase() + type.slice(1) + ' (' + filtered.length + ')';
  list.innerHTML = filtered.map(pet => {
    const index = allPets.indexOf(pet);
    return `
      <div class="card">
        <img src="${pet.images[0]}" loading="lazy" alt="${pet.name}" data-pet-index="${index}" onerror="handlePetImageError(this)">
        <div class="card-body">
          <span class="health">✓ HEALTH CHECKED</span>
          <h3>${pet.name}</h3>
          <p class="age">${pet.age} • ${pet.breed}</p>
          <p class="desc">${pet.desc}</p>
          <div class="price">${formatUsd(pet.price)}</div>
          <button type="button" class="pet-photo-button" onclick="openPetDetails('${pet.id}')">View 4 Photos</button>
          <button type="button" onclick="addToCart('${pet.id}')">🛒 Add to Cart</button>
        </div>
      </div>
    `;
  }).join('');
}

function openPetDetails(petId){
  const pet = allPets.find(item => item.id === petId);
  if(!pet) return;
  let modal = document.getElementById("petDetailModal");
  if(!modal){
    modal = document.createElement("div");
    modal.id = "petDetailModal";
    modal.className = "pet-detail-overlay";
    modal.addEventListener("click", event => {
      if(event.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
  }
  const index = allPets.indexOf(pet);
  modal.innerHTML = `
    <div class="pet-detail-panel" role="dialog" aria-modal="true" aria-label="${pet.name} photos">
      <button type="button" onclick="document.getElementById('petDetailModal').remove()" aria-label="Close photos" style="float:right">Close</button>
      <h2>${pet.name}</h2>
      <img id="petDetailMain" class="pet-detail-main" src="${pet.images[0]}" alt="${pet.name}" data-pet-index="${index}" data-photo-index="0" onerror="handlePetImageError(this)">
      <div class="pet-thumbnails">
        ${pet.images.slice(0, 4).map((image, photoIndex) => `
          <button type="button" class="${photoIndex === 0 ? 'active' : ''}" onclick="selectPetPhoto('${pet.id}', ${photoIndex})" aria-label="Show photo ${photoIndex + 1}">
            <img src="${image}" alt="${pet.name}, photo ${photoIndex + 1}" data-pet-index="${index}" data-photo-index="${photoIndex}" onerror="handlePetImageError(this)">
          </button>
        `).join('')}
      </div>
      <p>${pet.age} • ${pet.breed}</p>
      <div class="price">${formatUsd(pet.price)}</div>
      <button type="button" onclick="addToCart('${pet.id}')">🛒 Add to Cart</button>
    </div>
  `;
}

function selectPetPhoto(petId, photoIndex){
  const pet = allPets.find(item => item.id === petId);
  const modal = document.getElementById("petDetailModal");
  const mainImage = document.getElementById("petDetailMain");
  if(!pet || !modal || !mainImage || !pet.images[photoIndex]) return;
  mainImage.src = pet.images[photoIndex];
  mainImage.dataset.photoIndex = String(photoIndex);
  modal.querySelectorAll(".pet-thumbnails button").forEach((button, index) => {
    button.classList.toggle("active", index === photoIndex);
  });
}

loadPets();

// ===== GOOGLE STYLE SEARCH - MADE FOR YOUR FILE =====

function displaySearchResults(list) {
  let el = document.getElementById("petList");
  let title = document.getElementById("pageTitle");
  title.innerText = "Search Results (" + list.length + ")";
  el.innerHTML = list.map(p => {
    const index = allPets.indexOf(p);
    return `
    <div class="card">
      <img src="${p.images[0]}" loading="lazy" alt="${p.name}" data-pet-index="${index}" onerror="handlePetImageError(this)">
      <div class="card-body">
        <span class="health">✓ HEALTH CHECKED</span>
        <h3>${p.name}</h3>
        <p class="age">${p.age} • ${p.breed}</p>
        <p class="desc">${p.desc}</p>
        <div class="price">${formatUsd(p.price)}</div>
        <button type="button" class="pet-photo-button" onclick="openPetDetails('${p.id}')">View 4 Photos</button>
        <button type="button" onclick="addToCart('${p.id}')">🛒 Add to Cart</button>
      </div>
    </div>
  `;
  }).join("");
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
  const seen = new Set();
  return list.filter(p=>{
    const key = `${p.type}|${(p.breed||"").toLowerCase().trim()}|${(p.name||"").toLowerCase().trim()}`;
    if(seen.has(key)) return false;
    seen.add(key);
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

function formatUsd(amount){
  return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function getBalance(){
  const balance = Number(localStorage.getItem('userBalance'));
  return Number.isFinite(balance) && balance >= 0 ? balance : 0;
}

function setBalance(value){
  localStorage.setItem('userBalance', Number(value).toFixed(2));
  updateWalletUI();
}

let walletPaymentPending = false;
let cachedPaystackKeyPromise = null;

function getPaystackPublicKey(){
  if(!cachedPaystackKeyPromise){
    cachedPaystackKeyPromise = fetch('/api/config')
      .then(async response => {
        const config = await response.json();
        const key = typeof config.paystackPublicKey === 'string'
          ? config.paystackPublicKey.trim()
          : '';
        if(!response.ok || !/^pk_(test|live)_/.test(key)){
          throw new Error(config.message || 'Payment service is not configured.');
        }
        return key;
      })
      .catch(error => {
        cachedPaystackKeyPromise = null;
        throw error;
      });
  }
  return cachedPaystackKeyPromise;
}

function updateWalletUI(){
  const formattedBalance = formatUsd(getBalance());
  const balanceDisplay = document.getElementById('walletBalanceDisplay');
  if(balanceDisplay) balanceDisplay.textContent = formattedBalance;
  const navBalance = document.getElementById('walletNavBalance');
  if(navBalance) navBalance.textContent = formattedBalance;
}

function showWalletMessage(message, type){
  const element = document.getElementById('wallet-message');
  if(!element) return;
  element.textContent = message;
  element.style.color = type === 'success' ? '#198754' : '#c62828';
}

function openWallet(){
  let modal = document.getElementById('walletModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id = 'walletModal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:999;display:flex;justify-content:center;align-items:center;';
    modal.innerHTML = '<div style="background:white;width:90%;max-width:380px;padding:20px;border-radius:15px;text-align:center;"><h2>💰 My Wallet</h2><p style="font-size:14px;color:#666;">Your USD balance to buy pets</p><div id="walletBalanceDisplay" style="background:#f0f8ff;padding:20px;border-radius:12px;font-size:32px;font-weight:bold;">$0.00</div><br><label for="topupAmount">Top Up Amount (USD)</label><br><input id="topupAmount" type="number" value="10.00" min="0.01" step="0.01" style="padding:12px;width:80%;border-radius:10px;border:1px solid #ccc;text-align:center;font-size:18px;"><br><br><button id="topupButton" type="button" onclick="topUpWallet()" style="width:100%;padding:14px;background:#0ba4db;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer;">💳 Top Up with Paystack</button><div id="wallet-message" role="status" aria-live="polite" style="min-height:20px;margin:12px 0;font-weight:bold;"></div><p style="font-size:12px;color:#888;">Visa • Mastercard • American Express • Apple Pay</p><button type="button" onclick="closeWallet()" style="background:none;border:none;color:red;cursor:pointer;">Close</button></div>';
    document.body.appendChild(modal);
  }
  updateWalletUI();
  modal.style.display = 'flex';
}

function closeWallet(){
  if(walletPaymentPending){
    showWalletMessage('Complete or cancel the Paystack payment before closing the wallet.', 'error');
    return;
  }
  const modal = document.getElementById('walletModal');
  if(modal) modal.style.display = 'none';
}

async function topUpWallet(){
  const button = document.getElementById('topupButton');
  const token = localStorage.getItem('token');
  const email = (localStorage.getItem('userEmail') || '').trim().toLowerCase();
  const amount = Number(document.getElementById('topupAmount').value);
  const amountInCents = Math.round(amount * 100);
  if(!token){
    showWalletMessage('Please log in before topping up your wallet.', 'error');
    return;
  }
  if(!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(amountInCents) || amountInCents < 1){
    showWalletMessage('Enter a USD amount greater than $0.00.', 'error');
    return;
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    showWalletMessage('Please log in with a valid email address.', 'error');
    return;
  }
  if(!window.PaystackPop || typeof window.PaystackPop.setup !== 'function'){
    showWalletMessage('Paystack failed to load. Check internet and refresh.', 'error');
    return;
  }

  button.disabled = true;
  walletPaymentPending = true;
  showWalletMessage('Preparing secure payment...', 'error');
  try{
    const paystackPublicKey = await getPaystackPublicKey();

    let paymentCompleted = false;
    const reference = window.crypto?.randomUUID
      ? `pets-${window.crypto.randomUUID()}`
      : `pets-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: amountInCents,
      currency: 'USD',
      ref: reference,
      callback: function(response) {
        paymentCompleted = true;
        showWalletMessage('Verifying payment...', 'error');
        (async () => {
          try{
            const verifyResponse = await fetch('/api/wallet/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ reference: response.reference })
            });
            const data = await verifyResponse.json();
            if(!verifyResponse.ok || !data.success) {
              throw new Error(data.message || data.error || 'Payment verification failed.');
            }
            setBalance(data.balance);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.balance = Number(data.balance);
            localStorage.setItem('user', JSON.stringify(user));
            showWalletMessage(`Top-up successful! New balance: ${formatUsd(data.balance)}`, 'success');
          }catch(error){
            showWalletMessage(error.message || 'Payment verification failed.', 'error');
          }finally{
            walletPaymentPending = false;
            button.disabled = false;
          }
        })();
      },
      onClose: () => {
        if(!paymentCompleted){
          walletPaymentPending = false;
          showWalletMessage('Payment cancelled.', 'error');
          button.disabled = false;
        }
      }
    });
    showWalletMessage('', 'error');
    handler.openIframe();
  }catch(error){
    walletPaymentPending = false;
    showWalletMessage(error.message || 'Could not start payment.', 'error');
    button.disabled = false;
  }
}

let cart = [];
function addToCart(petId){
  const pet = allPets.find(p => p.id === petId);
  if(!pet) return alert("Pet not found");
  cart.push(pet);
  updateCartUI();
  openCart();
}
function updateCartUI(){
  document.getElementById('cartCount').innerText = cart.length;
  const total = cart.reduce((s,p)=> s + Number(p.price), 0);
  document.getElementById('cartTotal').innerText = formatUsd(total);
  document.getElementById('cartItems').innerHTML = cart.length===0 ? "<p>Cart is empty</p>" : cart.map((p,i)=>`<div style="display:flex;justify-content:space-between;padding:10px 0"><span>${p.name} - ${formatUsd(p.price)}</span><button onclick="removeFromCart(${i})">❌</button></div>`).join('');
  const btn = document.getElementById('checkoutBtn');
  const info = document.getElementById('balanceInfo');
  if(btn && info){
    if(cart.length===0){ btn.disabled=true; info.innerText=""; }
    else if(getBalance() < total){ btn.disabled=true; btn.style.background="#ccc"; info.innerText=`❌ Not enough balance. Need ${formatUsd(total)}, you have ${formatUsd(getBalance())}. Top up first.`; info.style.color="red"; }
    else { btn.disabled=false; btn.style.background="#ff6b00"; info.innerText=`✅ Enough balance. After paying you will remain with ${formatUsd(getBalance()-total)}`; info.style.color="green"; }
  }
}
function removeFromCart(i){ cart.splice(i,1); updateCartUI(); }
function openCart(){ document.getElementById('cartDrawer').style.display='block'; updateCartUI(); }
function closeCart(){ document.getElementById('cartDrawer').style.display='none'; }
function checkout(){
  const total = cart.reduce((s,p)=> s + Number(p.price), 0);
  if(cart.length===0) return alert("Cart empty");
  if(getBalance() < total){ alert(`❌ Cannot buy. Need ${formatUsd(total)}, you have ${formatUsd(getBalance())}. Top up first.`); closeCart(); openWallet(); return; }
  setBalance(getBalance() - total);
  updateWalletUI(); updateCartUI();
  alert(`🎉 Order successful! Paid ${formatUsd(total)} from wallet.`);
  cart=[]; updateCartUI(); closeCart();
}

  // ===== STEP 2: PAY NOW - CREATE ORDER =====
function payNow() {
  const name = document.getElementById("custName") ? document.getElementById("custName").value.trim() : "";
  const code = document.getElementById("phoneCode") ? document.getElementById("phoneCode").value : "+44";
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
let selectedCountry = localStorage.getItem("selectedCountry") || "UK";

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
    return `<button type="button" class="country-option" data-code="${c.c}" data-dial="${c.d}" data-name="${c.n}" style="display:block;width:100%;padding:8px 10px;text-align:left;background:white;border:0;border-bottom:1px solid #eee;cursor:pointer">${flag} ${c.d} ${c.n} <small>• ${c.r}</small></button>`;
  }).join('');
  list.querySelectorAll(".country-option").forEach(row => {
    row.addEventListener("click", () => selectCountry(row.dataset.code, row.dataset.dial, row.dataset.name));
  });
}

function selectCountry(code, dial, name){
  selectedCountry = name;
  localStorage.setItem("selectedCountry", name);
  const btn = document.getElementById("countryBtn");
  if(btn) btn.innerHTML = flagFromCode(code) + ' ' + dial + ' ' + name + ' ▼';
  const phoneCode = document.getElementById("phoneCode");
  if(phoneCode) phoneCode.value = dial;
  const selectedCountryInput = document.getElementById("selectedCountry");
  if(selectedCountryInput) selectedCountryInput.value = selectedCountry;
  const shippingCountry = document.getElementById("shippingCountry");
  if(shippingCountry) shippingCountry.textContent = name;
  const box = document.getElementById("countryList");
  if(box) box.innerHTML = '';
  const search = document.getElementById("countrySearch");
  if(search) search.value = '';
  const dropdown = document.getElementById("countryDrop");
  if(dropdown) dropdown.style.display = "none";
  updateCartUI();
}

const initialCountry = countries.find(country => country.n === selectedCountry)
  || countries.find(country => country.n === "UK");
selectCountry(initialCountry.c, initialCountry.d, initialCountry.n);
renderCountries();
// Delegated - works even if checkout is created later
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#countryBtn");
  if (btn) {
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
document.getElementById('closeSidebarBtn').addEventListener('click', toggleSidePanel);
document.getElementById('panelOverlay').addEventListener('click', toggleSidePanel);
document.getElementById('sidebar').querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    if(window.matchMedia('(max-width: 1024px)').matches) closeSidePanel();
  });
});
document.getElementById('signOutBtn').addEventListener('click', function() {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('user');
  localStorage.removeItem('userBalance');
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'login.html';
});

let installPromptEvent = null;
const installAppButton = document.getElementById("installAppBtn");
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPromptEvent = event;
  installAppButton.hidden = false;
});
installAppButton.addEventListener("click", async () => {
  if(!installPromptEvent) return;
  installPromptEvent.prompt();
  await installPromptEvent.userChoice;
  installPromptEvent = null;
  installAppButton.hidden = true;
});
window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  installAppButton.hidden = true;
});

if("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .catch(error => console.error("Service worker registration failed:", error));
  });
}

window.addEventListener("load", () => {
  getPaystackPublicKey().catch(error => console.warn("Paystack configuration prefetch failed:", error));
});
// --- INSTALL APP - LOGIN PAGE ---
let deferredPrompt = null;
const installWrap = document.getElementById('installWrap');
const installBtn = document.getElementById('installBtn');
const installHelp = document.getElementById('installHelp');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installWrap) installWrap.style.display = 'block';
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (installWrap) installWrap.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  if (installWrap) installWrap.style.display = 'none';
});

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (isIOS && installWrap && installHelp && installBtn) {
  installWrap.style.display = 'block';
  installBtn.style.display = 'none';
  installHelp.style.display = 'block';
}

// --- FIX COUNTRY PICKER ---
const countryBtn = document.getElementById('countryBtn');
const countryDrop = document.getElementById('countryDrop');
const countryList = document.getElementById('countryList');
const countrySearch = document.getElementById('countrySearch');
const selectedCountryInput = document.getElementById('selectedCountry');
const phoneCodeInput = document.getElementById('phoneCode');
const countryBtnFlag = document.getElementById('countryBtnFlag');
const shippingCountrySpan = document.getElementById('shippingCountry');

if (countryBtn && countryDrop) {
  countryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    countryDrop.style.display = countryDrop.style.display === 'block' ? 'none' : 'block';
    if (countrySearch) countrySearch.focus();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#countryPicker')) {
      countryDrop.style.display = 'none';
    }
  });
}

if (countryList) {
  countryList.addEventListener('click', (e) => {
    const item = e.target.closest('[data-country]');
    if (!item) return;
    const code = item.dataset.code || '';
    const name = item.dataset.country || item.textContent.trim();
    const flag = item.dataset.flag || '';
    if (selectedCountryInput) selectedCountryInput.value = name;
    if (phoneCodeInput && code) phoneCodeInput.value = code;
    if (shippingCountrySpan) shippingCountrySpan.textContent = name;
    if (countryBtnFlag && flag) countryBtnFlag.src = flag;
    const btnName = document.getElementById('countryBtnName');
    if (btnName) btnName.textContent = name;
    countryDrop.style.display = 'none';
  });
}

if (countrySearch && countryList) {
  countrySearch.addEventListener('input', () => {
    const q = countrySearch.value.toLowerCase();
    countryList.querySelectorAll('[data-country]').forEach(el => {
      el.style.display = el.dataset.country.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}