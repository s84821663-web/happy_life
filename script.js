/* ===== هپی‌لایف — اسکریپت ===== */
const fa = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);

/* ---------- داده‌ها ---------- */
const CANS = [
  {id:1, name:"کولا نایت",  taste:"کلاسیک تیره",  color:"#1c1c24", text:"#fff", price:85000, caf:150, sugar:32, cal:140, desc:"طعم کولای اصیل با ضربه‌ی انرژی خالص. برای شب‌هایی که هنوز تموم نشده."},
  {id:2, name:"بنفش برقی",  taste:"تمشک وحشی",    color:"#7C3AED", text:"#fff", price:92000, caf:140, sugar:28, cal:130, desc:"انفجار تمشک وحشی با حال‌وهوای بنفش. محبوب‌ترین طعم کالکشن."},
  {id:3, name:"نارنجی آتش", taste:"پرتقال آتشین", color:"#F25C05", text:"#111", price:88000, caf:130, sugar:30, cal:135, desc:"پرتقال آتشین با تلخی خنک. انرژی‌ای که مثل آتش پخش می‌شه."},
  {id:4, name:"زرد لیمویی", taste:"لیموی جرقه‌ای", color:"#EAE32B", text:"#111", price:86000, caf:120, sugar:0,  cal:15,  desc:"لیموی جرقه‌ای، کاملاً بدون شکر. سبک، ترش، بی‌وقفه."},
  {id:5, name:"آبی یخی",    taste:"یخ آسمانی",    color:"#38BDF8", text:"#111", price:90000, caf:135, sugar:26, cal:120, desc:"خنکای یخ قطبی با رگه‌ی آبی. بهترین انتخاب بعد از ورزش."},
  {id:6, name:"سفید وانیلی",taste:"وانیل ابری",   color:"#f2f0ea", text:"#111", price:95000, caf:100, sugar:24, cal:110, desc:"وانیل نرم و ابریشمی. طعمی برای حال‌وهوای روشن و آرام."},
];

const REVIEWS = [
  {stars:5, txt:"طعم بنفش برقی واقعاً یه چیز دیگه‌ست! بسته‌بندی هم عالیه.", who:"سارا م. — تهران"},
  {stars:5, txt:"باکس ترکیبی گرفتم، هر شش تا طعم جذاب بودن. ارسالش هم سریع بود.", who:"امیر ک. — اصفهان"},
  {stars:4, txt:"زرد لیمویی بدون شکر بهترین نوشیدنی انرژی‌زای رژیمیه که خوردم.", who:"نگار ت. — شیراز"},
  {stars:5, txt:"طراحی قوطی‌ها انقدر قشنگه که نمی‌خوام دورشون بندازم!", who:"محمد ر. — مشهد"},
];

const STORES = [
  {name:"فروشگاه مرکزی — ونک", addr:"تهران، خیابان ولیعصر، نرسیده به ونک، پلاک ۱۲۰"},
  {name:"شعبه سعادت‌آباد", addr:"تهران، سعادت‌آباد، بلوار دریا، مجتمع تجاری نور، طبقه ۱"},
  {name:"فروشگاه اصفهان", addr:"اصفهان، خیابان چهارباغ بالا، مجتمع پارک، واحد ۸"},
];

/* ---------- صدای پاپ (WebAudio) ---------- */
let audioCtx = null, soundOn = true;
function popSound(){
  if(!soundOn) return;
  audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type="sine"; o.frequency.setValueAtTime(420, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime+.12);
  g.gain.setValueAtTime(.25, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime+.15);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime+.16);
}
document.getElementById("soundBtn").addEventListener("click", e=>{
  soundOn=!soundOn; e.target.textContent = soundOn?"🔊":"🔇";
});

/* ---------- فیزیک پاندولی قوطی‌ها ---------- */
const cansEl = document.getElementById("cans");
const pendulums = [];

CANS.forEach((c,i)=>{
  const unit = document.createElement("div");
  unit.className="can-unit"; unit.tabIndex=0;
  unit.innerHTML = `<div class="string"></div>
    <div class="can" style="background:linear-gradient(180deg,${c.color},${c.color}dd 60%,${c.color}99)">
      <div class="can-label" style="color:${c.text}">Life</div></div>
    <div class="can-name">${c.name}</div>`;
  cansEl.appendChild(unit);
  pendulums.push({el:unit, angle:0, vel:0, phase:i*0.7});
  unit.addEventListener("mouseenter", ()=>{ pendulums[i].vel += (Math.random()>.5?1:-1)*0.35; nudgeNeighbors(i); });
  unit.addEventListener("click", e=>{ e.stopPropagation(); selectCan(i); });
});

function nudgeNeighbors(i){
  if(pendulums[i-1]) pendulums[i-1].vel += 0.12;
  if(pendulums[i+1]) pendulums[i+1].vel -= 0.12;
}

let lastT = performance.now();
function physicsLoop(now){
  const dt = Math.min((now-lastT)/1000, .05); lastT = now;
  pendulums.forEach(p=>{
    p.vel += (-p.angle*4 - p.vel*0.6)*dt*8;   // فنر + میرایی
    p.angle += p.vel*dt*6;
    p.el.style.transform = `rotate(${p.angle.toFixed(3)}rad)`;
  });
  requestAnimationFrame(physicsLoop);
}
requestAnimationFrame(physicsLoop);

/* ---------- انتخاب قوطی: کل صفحه هم‌رنگ قوطی می‌شه ---------- */
let activeCan = 1;

/* تشخیص روشن یا تیره بودن رنگ قوطی (برای متنِ خوانا) */
function isLight(hex){
  const r = parseInt(hex.slice(1,3),16),
        g = parseInt(hex.slice(3,5),16),
        b = parseInt(hex.slice(5,7),16);
  return (0.299*r + 0.587*g + 0.114*b) > 150;
}

function selectCan(i){
  activeCan = i;
  const c = CANS[i];
  const light = isLight(c.color);
  const st = document.body.style;

  // کل صفحه هم‌رنگ خود قوطی
  st.setProperty("--bg",  c.color);
  st.setProperty("--bg2", `color-mix(in srgb, ${c.color} ${light?"55":"70"}%, ${light?"#fff":"#000"})`);
  st.setProperty("--card", `color-mix(in srgb, ${c.color} ${light?"30":"55"}%, ${light?"#fff":"#000"})`);

  // رنگ تأکیدی یک پله متفاوت تا روی پس‌زمینه دیده بشه
  st.setProperty("--accent",  `color-mix(in srgb, ${c.color} ${light?"70":"60"}%, ${light?"#000":"#fff"})`);
  st.setProperty("--accent2", c.color);

  // روی رنگ‌های روشن متن تیره، روی رنگ‌های تیره متن سفید
  document.body.classList.toggle("light", light);

  pendulums.forEach((p,k)=>p.el.classList.toggle("active", k===i));
  popSound();
  splash(i);
  toast(`کل صفحه هم‌رنگ «${c.name}» شد ✨`);
}

function splash(i){
  const layer = document.getElementById("splashLayer");
  const p = pendulums[i], r = p.el.getBoundingClientRect(), lr = layer.getBoundingClientRect();
  const x = r.left + r.width/2 - lr.left, y = r.top + r.height/2 - lr.top;
  const color = CANS[i].color;
  for(let k=0;k<18;k++){
    const d = document.createElement("div");
    d.className="splash-drop";
    d.style.background=color;
    d.style.left=x+"px"; d.style.top=y+"px";
    layer.appendChild(d);
    const a = Math.random()*Math.PI*2, dist = 60+Math.random()*140;
    d.animate([
      {transform:"translate(0,0) scale(1)", opacity:1},
      {transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist+80}px) scale(.2)`, opacity:0}
    ], {duration:700+Math.random()*400, easing:"cubic-bezier(.2,.6,.4,1)"}).onfinish = ()=>d.remove();
  }
}

/* ---------- حباب‌ها ---------- */
const bubblesEl = document.getElementById("bubbles");
for(let i=0;i<14;i++){
  const b = document.createElement("div");
  b.className="bubble";
  const size = 12+Math.random()*46;
  b.style.width=b.style.height=size+"px";
  b.style.right = Math.random()*100+"%";
  b.style.animationDuration = (8+Math.random()*12)+"s";
  b.style.animationDelay = (-Math.random()*12)+"s";
  bubblesEl.appendChild(b);
}

/* ---------- پارالاکس اسکرول ---------- */
const barWrapper = document.getElementById("barWrapper");
window.addEventListener("scroll", ()=>{
  const y = window.scrollY;
  barWrapper.style.transform = `translateY(${y*0.25}px)`;
  pendulums.forEach((p,i)=>{ p.vel += Math.sin(y/300 + i)*0.0008; });
  const h = document.documentElement;
  document.getElementById("progressBar").style.width = (y/(h.scrollHeight-h.clientHeight)*100)+"%";
});

/* ---------- کارت محصولات ---------- */
const grid = document.getElementById("productsGrid");
CANS.forEach(c=>{
  const card = document.createElement("div");
  card.className="product-card";
  card.style.setProperty("--pc", c.color);
  card.innerHTML = `
    <div class="mini-can" style="background:linear-gradient(180deg,${c.color},${c.color}cc)"></div>
    <h3>${c.name}</h3>
    <div class="taste">${c.taste}</div>
    <div class="price">${fa(c.price.toLocaleString("en"))} تومان</div>
    <div class="product-actions">
      <button class="add-btn">افزودن به سبد</button>
      <button class="info-btn">جزئیات</button>
    </div>`;
  card.querySelector(".add-btn").addEventListener("click", e=>{ e.stopPropagation(); addToCart(c.id); });
  card.querySelector(".info-btn").addEventListener("click", ()=>openProductModal(c.id));
  grid.appendChild(card);
});

/* ---------- جدول مقایسه ---------- */
const tbody = document.querySelector("#compareTable tbody");
CANS.forEach(c=>{
  tbody.insertAdjacentHTML("beforeend",
    `<tr><td><b>${c.name}</b><br><small>${c.taste}</small></td>
     <td>${fa(c.caf)}</td><td>${c.sugar===0?"صفر":fa(c.sugar)}</td><td>${fa(c.cal)}</td><td>۳۳۰ ml</td></tr>`);
});

/* ---------- باکس ترکیبی ---------- */
const mixCansEl = document.getElementById("mixCans");
let mixSel = [];
CANS.forEach((c,i)=>{
  const chip = document.createElement("button");
  chip.className="mix-chip"; chip.style.setProperty("--mc", c.color);
  chip.textContent = `${c.name} — ${fa(c.price.toLocaleString("en"))} تومان`;
  chip.addEventListener("click", ()=>{
    const idx = mixSel.indexOf(c.id);
    if(idx>=0){ mixSel.splice(idx,1); chip.classList.remove("sel"); }
    else if(mixSel.length<6){ mixSel.push(c.id); chip.classList.add("sel"); }
    else { toast("حداکثر ۶ قوطی!"); return; }
    updateMix();
  });
  mixCansEl.appendChild(chip);
});
function updateMix(){
  const sum = mixSel.reduce((a,id)=>a+CANS.find(c=>c.id===id).price,0);
  document.getElementById("mixCount").textContent = fa(mixSel.length);
  document.getElementById("mixDiscount").textContent = mixSel.length===6 ? `(با ۱۵٪ تخفیف: ${fa(Math.round(sum*0.85).toLocaleString("en"))} تومان)` : "";
  document.getElementById("mixTotal").textContent = fa(sum.toLocaleString("en"));
  document.getElementById("mixAdd").disabled = mixSel.length===0;
}
document.getElementById("mixAdd").addEventListener("click", ()=>{
  mixSel.forEach(id=>addToCart(id, true));
  const sum = mixSel.reduce((a,id)=>a+CANS.find(c=>c.id===id).price,0);
  cart.push({name:`🎁 باکس ترکیبی (۶ قوطی، ۱۵٪ تخفیف)`, price:Math.round(sum*0.85), qty:1});
  mixSel = []; mixCansEl.querySelectorAll(".mix-chip").forEach(ch=>ch.classList.remove("sel"));
  updateMix(); renderCart(); toast("باکس ترکیبی به سبد اضافه شد!");
  openCart();
});

/* ---------- نظرات (اسلایدر خودکار) ---------- */
const slides = document.getElementById("slides"), sliderNav = document.getElementById("sliderNav");
REVIEWS.forEach((r,i)=>{
  slides.insertAdjacentHTML("beforeend",
    `<div class="slide"><div class="stars">${"⭐".repeat(r.stars)}</div><p class="txt">«${r.txt}»</p><div class="who">${r.who}</div></div>`);
  const d = document.createElement("button");
  d.className="dot"+(i===0?" on":"");
  d.addEventListener("click", ()=>goSlide(i));
  sliderNav.appendChild(d);
});
let slideIdx=0;
function goSlide(i){
  slideIdx=i;
  slides.style.transform = `translateX(${i*100}%)`;
  sliderNav.querySelectorAll(".dot").forEach((d,k)=>d.classList.toggle("on",k===i));
}
setInterval(()=>goSlide((slideIdx+1)%REVIEWS.length), 4000);

/* ---------- گالری ---------- */
const gGrid = document.getElementById("galleryGrid");
CANS.forEach(c=>{
  const t = document.createElement("div");
  t.className="g-tile"; t.style.setProperty("--gc", c.color);
  t.innerHTML=`<span dir="ltr">Life</span>`;
  gGrid.appendChild(t);
});

/* ---------- فروشگاه‌ها ---------- */
const storeList = document.getElementById("storeList");
STORES.forEach(s=>{
  storeList.insertAdjacentHTML("beforeend",
    `<div class="store-item"><b>⚡ ${s.name}</b><p>📍 ${s.addr}</p></div>`);
});

/* ---------- شمارنده‌های آماری ---------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(!en.isIntersecting) return;
    io.unobserve(en.target);
    const el = en.target, target = +el.dataset.target, suf = el.dataset.suffix||"";
    const t0 = performance.now();
    (function tick(now){
      const p = Math.min((now-t0)/1500, 1);
      const val = Math.round(target*(1-Math.pow(1-p,3)));
      el.textContent = fa(val.toLocaleString("en")) + suf;
      if(p<1) requestAnimationFrame(tick);
    })(t0);
  });
},{threshold:.5});
document.querySelectorAll(".stat-num").forEach(el=>io.observe(el));

/* ---------- سبد خرید ---------- */
let cart = [];
const cartDrawer = document.getElementById("cartDrawer"), cartOverlay = document.getElementById("cartOverlay");
function openCart(){ cartDrawer.classList.add("show"); cartOverlay.classList.add("show"); }
function closeCart(){ cartDrawer.classList.remove("show"); cartOverlay.classList.remove("show"); }
document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

function addToCart(id, silent){
  const c = CANS.find(x=>x.id===id);
  const ex = cart.find(it=>it.name===c.name);
  if(ex) ex.qty++; else cart.push({name:c.name, price:c.price, qty:1});
  renderCart();
  if(!silent){ toast(`«${c.name}» به سبد اضافه شد 🛒`); popSound(); }
}
function renderCart(){
  const box = document.getElementById("cartItems");
  const count = cart.reduce((a,i)=>a+i.qty,0);
  document.getElementById("cartCount").textContent = fa(count);
  box.innerHTML = cart.map((it,i)=>`
    <div class="cart-item">
      <div><b>${it.name}</b><br><small>${fa(it.price.toLocaleString("en"))} تومان × ${fa(it.qty)}</small></div>
      <div class="qty-btns">
        <button onclick="chQty(${i},1)">+</button><button onclick="chQty(${i},-1)">−</button>
      </div>
    </div>`).join("") || `<p style="opacity:.7;text-align:center;padding:30px 0">سبد خالیه!</p>`;
  const total = cart.reduce((a,i)=>a+i.price*i.qty,0);
  document.getElementById("cartTotal").textContent = fa(total.toLocaleString("en"))+" تومان";
}
window.chQty = (i,d)=>{ cart[i].qty+=d; if(cart[i].qty<=0) cart.splice(i,1); renderCart(); };

/* ---------- مودال محصول ---------- */
let modalCanId = null;
function openProductModal(id){
  const c = CANS.find(x=>x.id===id); modalCanId=id;
  const mc = document.getElementById("modalCan");
  mc.style.background = `linear-gradient(180deg,${c.color},${c.color}cc)`;
  document.getElementById("modalName").textContent = c.name;
  document.getElementById("modalDesc").textContent = c.desc;
  document.getElementById("modalSpecs").innerHTML =
    `<li>طعم: ${c.taste}</li><li>کافئین: ${fa(c.caf)} mg</li><li>قند: ${c.sugar===0?"صفر":fa(c.sugar)+" گرم"}</li><li>کالری: ${fa(c.cal)}</li>`;
  document.getElementById("modalPrice").textContent = fa(c.price.toLocaleString("en"))+" تومان";
  document.getElementById("productModal").classList.add("show");
}
document.getElementById("modalAdd").addEventListener("click", ()=>{ addToCart(modalCanId); document.getElementById("productModal").classList.remove("show"); openCart(); });
document.getElementById("productClose").addEventListener("click", ()=>document.getElementById("productModal").classList.remove("show"));
document.getElementById("productModal").addEventListener("click", e=>{ if(e.target.id==="productModal") e.target.classList.remove("show"); });

/* ---------- شبیه‌ساز پرداخت ---------- */
const ckModal = document.getElementById("checkoutModal");
document.getElementById("checkoutBtn").addEventListener("click", ()=>{ closeCart(); ckModal.classList.add("show"); });
document.getElementById("checkoutClose").addEventListener("click", ()=>ckModal.classList.remove("show"));
ckModal.addEventListener("click", e=>{ if(e.target===ckModal) ckModal.classList.remove("show"); });
function goStep(n){
  document.querySelectorAll(".step").forEach(s=>s.classList.toggle("active", +s.dataset.step<=n));
  [1,2,3].forEach(i=>document.getElementById("pane"+i).hidden = i!==n);
}
document.getElementById("ckNext1").addEventListener("click", ()=>{
  if(!document.getElementById("ckName").value.trim() || !document.getElementById("ckPhone").value.trim()) return toast("نام و موبایل رو وارد کن");
  goStep(2);
});
document.getElementById("ckNext2").addEventListener("click", ()=>{
  if(!document.getElementById("ckAddress").value.trim()) return toast("آدرس رو وارد کن");
  const total = cart.reduce((a,i)=>a+i.price*i.qty,0);
  const ship = +document.querySelector("input[name=ship]:checked").value;
  document.getElementById("ckSummary").innerHTML =
    `<b>${cart.reduce((a,i)=>a+i.qty,0)} قوطی</b> — جمع کالا: ${fa(total.toLocaleString("en"))} تومان<br>
     هزینه ارسال: ${fa(ship.toLocaleString("en"))} تومان<br>
     <b style="font-size:1.05rem">مبلغ نهایی: ${fa((total+ship).toLocaleString("en"))} تومان</b>`;
  goStep(3);
});
document.getElementById("ckPay").addEventListener("click", ()=>{
  document.getElementById("ckSuccess").hidden = false;
  cart = []; renderCart();
  setTimeout(()=>{ ckModal.classList.remove("show"); goStep(1); document.getElementById("ckSuccess").hidden = true; }, 2200);
});

/* ---------- توست ---------- */
let toastTimer;
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove("show"), 2200);
}

/* شروع: تم پیش‌فرض بنفش */
selectCan(1);
