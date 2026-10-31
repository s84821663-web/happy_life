/* ===== helpers ===== */
const $ = id => document.getElementById(id);
const fa = n => Number(n).toLocaleString('fa-IR');
const money = n => fa(n) + ' تومان';
function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2600); }
function popSound(){ try{ const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(),g=a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value=880; g.gain.setValueAtTime(.15,a.currentTime); g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.2); o.start(); o.stop(a.currentTime+.2);}catch(e){} }
function confetti(n=30){ for(let i=0;i<n;i++){ const c=document.createElement('div'); c.textContent=['🎉','⭐','🪙','💛'][i%4]; c.style.cssText=`position:fixed;z-index:400;left:${Math.random()*100}vw;top:-30px;font-size:${12+Math.random()*14}px;pointer-events:none;transition:transform 2.5s linear,opacity 2.5s`; document.body.appendChild(c); requestAnimationFrame(()=>{ c.style.transform=`translateY(${innerHeight+60}px) rotate(${Math.random()*720}deg)`; c.style.opacity='0'; }); setTimeout(()=>c.remove(),2600); } }

/* ===== داده‌ها ===== */
const CANS = [
 {name:'کولا نایت', color:'#1c1c24', price:90000, caf:150, tag:'کلاسیک شبانه'},
 {name:'بنفش برقی', color:'#7C3AED', price:85000, caf:120, tag:'پرفروش‌ترین'},
 {name:'نارنجی آتش', color:'#F25C05', price:95000, caf:180, tag:'انرژی حداکثری'},
 {name:'زرد لیمویی (بدون شکر)', color:'#EAE32B', price:88000, caf:90, tag:'رژیمی'},
 {name:'آبی یخی', color:'#38BDF8', price:90000, caf:140, tag:'خنک و ملایم'},
 {name:'سفید وانیلی', color:'#f2f0ea', price:92000, caf:110, tag:'کرمی و نرم'},
];
const CODES = { HAPPY20:20, LIFE15:15, LIFE10:10, LIFE5:5, FALL25:25, BDAY30:30, FREESHIP:'ship' };

/* ===== storage ===== */
const store = {
  get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};
let cart = store.get('hl_cart',[]);
let coins = store.get('hl_coins',0);
let disc = null;

/* ===== قوطی هرو + فیزیک پاندول ===== */
let angle=0, vel=0.02, pendOn=true;
function pendulum(){
  if(pendOn && !document.body.classList.contains('no-motion')){
    vel += Math.sin(angle)*0.0006;
    vel *= 0.995;
    angle += vel;
    $('heroCan').style.transform = `rotate(${angle*14}deg)`;
  }
  requestAnimationFrame(pendulum);
}
function selectCan(i){
  const c=CANS[i];
  document.documentElement.style.setProperty('--brand', c.color);
  $('can').style.background=`linear-gradient(120deg,color-mix(in srgb,${c.color} 90%,#000),${c.color} 55%,color-mix(in srgb,${c.color} 70%,#fff))`;
  $('canLabel').textContent=c.name.split(' (')[0];
  if(c.color==='#f2f0ea'||c.color==='#EAE32B') $('canLabel').style.color='#333'; else $('canLabel').style.color='#fff';
  toast('قوطی «'+c.name+'» انتخاب شد ⚡');
}
$('can').addEventListener('dblclick',()=>{
  confetti(45); popSound();
  document.body.animate([{filter:'none'},{filter:'brightness(1.6) saturate(1.5)'},{filter:'none'}],{duration:500});
  toast('شوک انرژی! ⚡');
});
let typed='';
addEventListener('keydown',e=>{ typed=(typed+e.key).slice(-5); if(typed==='happy'){ confetti(80); toast('🎉 بارون قوطی!'); for(let i=0;i<15;i++)setTimeout(()=>confetti(8),i*120); } });

/* ===== محصولات ===== */
function renderCans(){
  $('cansGrid').innerHTML = CANS.map((c,i)=>`
    <div class="can-card">
      <div class="can-mini" style="background:linear-gradient(120deg,color-mix(in srgb,${c.color} 85%,#000),${c.color})"></div>
      <h3>${c.name}</h3>
      <p>${c.tag} • کافئین ${fa(c.caf)}mg</p>
      <b>${money(c.price)}</b><br>
      <button class="btn main" style="margin-top:8px" onclick="addCart(${i})">🛒 خرید</button>
      <button class="btn tiny" onclick="shareCan(${i})" style="margin-top:8px">اشتراک ↗</button>
      <div class="rate" data-can="${i}">${rateStars(i)}</div>
    </div>`).join('');
}
function shareCan(i){
  const c=CANS[i], txt=`من قوطی ${c.name} هپی‌لایف رو پیشنهاد می‌کنم! ⚡`;
  if(navigator.share){ navigator.share({title:'هپی‌لایف',text:txt}).catch(()=>{}); }
  else{ navigator.clipboard?.writeText(txt); toast('متن اشتراک کپی شد 📋'); }
}

/* ===== سبد ===== */
function addCart(i){ cart.push({i,qty:1}); saveCart(); popSound(); toast('به سبد اضافه شد 🛒'); }
function saveCart(){ store.set('hl_cart',cart); renderCart(); }
function toggleCart(){ $('cartDrawer').classList.toggle('open'); renderCart(); }
function cartSum(){ return cart.reduce((s,l)=>s+CANS[l.i].price*l.qty,0); }
function renderCart(){
  $('cartCount').textContent = fa(cart.length);
  $('cartItems').innerHTML = cart.length? cart.map((l,idx)=>`
    <div class="cart-line"><span>${CANS[l.i].name} ×${fa(l.qty)}</span>
      <span>${money(CANS[l.i].price*l.qty)}
      <button class="btn tiny" onclick="cart.splice(${idx},1);saveCart()">🗑</button></span>
    </div>`).join('') : '<p>سبد خالیه برادر!</p>';
  let total = cartSum();
  if(typeof disc==='number') total = Math.round(total*(1-disc/100));
  $('cartTotal').textContent = money(total);
}
function applyDisc(){
  const code = $('discIn').value.trim().toUpperCase();
  if(!(code in CODES)){ $('discMsg').innerHTML='<span style="color:var(--err)">کد نامعتبره ❌</span>'; return; }
  disc = CODES[code];
  $('discMsg').innerHTML = `<span style="color:var(--ok)">کد ${code} اعمال شد ✅</span>`;
  renderCart();
}
function copyCode(){ navigator.clipboard?.writeText($('dailyCode').textContent); toast('کد کپی شد 📋'); }
function copyCodeF(c){ navigator.clipboard?.writeText(c); toast('کد '+c+' کپی شد 📋'); }

/* ===== چک‌اوت ۳ مرحله‌ای ===== */
let step=1, shipCost=0;
function startCheckout(){ if(!cart.length){ toast('سبد خالیه!'); return; } step=1; renderCheckout(); $('checkoutModal').classList.add('open'); }
function renderCheckout(){
  const box=$('checkoutBox');
  if(step===1){
    box.innerHTML=`<h3>۱) روش ارسال</h3>
      <label><input type="radio" name="ship" value="25000" onchange="shipCost=+this.value;goStep2()"> پست (۲۵٬۰۰۰)</label>
      <label><input type="radio" name="ship" value="60000" onchange="shipCost=+this.value;goStep2()"> پیک (۶۰٬۰۰۰)</label>
      <button class="x" onclick="closeCheckout()">✕</button>`;
  } else if(step===2){
    box.innerHTML=`<h3>۲) اطلاعات گیرنده</h3>
      <input id="ckName" placeholder="نام و نام خانوادگی">
      <input id="ckAddr" placeholder="آدرس">
      <input id="ckPhone" placeholder="موبایل">
      <button class="btn main" onclick="goStep3()">ادامه</button>
      <button class="x" onclick="closeCheckout()">✕</button>`;
  } else {
    const total = cartSum() + shipCost;
    box.innerHTML=`<h3>۳) تأیید و پرداخت (شبیه‌سازی)</h3>
      <p>اقلام: ${fa(cart.length)} قوطی</p><p>ارسال: ${money(shipCost)}</p>
      <p><b>جمع نهایی: ${money(total)}</b></p>
      <button class="btn main" onclick="payDone()">پرداخت و ثبت</button>
      <button class="x" onclick="closeCheckout()">✕</button>`;
  }
}
function goStep2(){ step=2; renderCheckout(); }
function goStep3(){
  if(!$('ckName').value || !$('ckAddr').value || !$('ckPhone').value){ toast('همه فیلدها رو پر کن!'); return; }
  step=3; renderCheckout();
}
function payDone(){
  const total = cartSum() + shipCost;
  const earned = Math.floor(total/10000);
  coins += earned; store.set('hl_coins',coins);
  const orders = store.get('hl_orders',[]);
  orders.unshift({date:new Date().toLocaleDateString('fa-IR'), items:cart.length, total});
  store.set('hl_orders',orders);
  printInvoice(total);
  cart=[]; disc=null; saveCart();
  $('checkoutModal').classList.remove('open');
  confetti(); toast(`سفارش ثبت شد! ${fa(earned)} هپی‌کوین گرفتی 🪙`);
  renderOrders(); renderBoard();
}
function printInvoice(total){
  $('invoice').innerHTML=`<h2>فاکتور فروش هپی‌لایف</h2>
    <p>تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
    <table><tr><th>محصول</th><th>تعداد</th><th>قیمت</th></tr>
    ${cart.map(l=>`<tr><td>${CANS[l.i].name}</td><td>${fa(l.qty)}</td><td>${fa(CANS[l.i].price*l.qty)}</td></tr>`).join('')}
    <tr><th>ارسال</th><th>—</th><th>${fa(shipCost)}</th></tr>
    <tr><th>جمع</th><th>—</th><th>${fa(total)}</th></tr></table>
    <p>⚠️ پرداخت شبیه‌سازی‌شده است.</p>`;
  window.print();
}
function closeCheckout(){ $('checkoutModal').classList.remove('open'); }

/* ===== قوطی امروز ===== */
(function(){
  const idx = new Date().getDate() % CANS.length;
  $('dailyName').textContent = CANS[idx].name + ' — ' + money(Math.round(CANS[idx].price*0.9));
  CODES.DAY10 = 10;
})();

/* ===== مقایسه‌گر ===== */
(function(){
  const opts = CANS.map((c,i)=>`<option value="${i}">${c.name}</option>`).join('');
  $('vsA').innerHTML=opts; $('vsB').innerHTML=opts; $('vsA').value=1; $('vsB').value=2;
  [$('vsA'),$('vsB')].forEach(s=>s.onchange=vsGo); vsGo();
})();
function vsGo(){
  const a=CANS[+$('vsA').value], b=CANS[+$('vsB').value];
  const w=(x)=>x.caf>=b.caf?`<b style="color:var(--ok)">${x.name}</b>`:x.name;
  $('vsResult').innerHTML=`کافئین: ${w(a)} (${fa(a.caf)}) در برابر ${w(b)} (${fa(b.caf)})<br>قیمت: ${money(a.price)} در برابر ${money(b.price)}<br>برنده انرژی: <b>${a.caf>=b.caf?a.name:b.name}</b> 🏆`;
}

/* ===== اسلایدر شدت ===== */
function filterByIntensity(v){
  $('intVal').textContent = fa(v);
  $('intList').innerHTML = CANS.filter(c=>c.caf<=+v).map(c=>`<label>✅ ${c.name} (${fa(c.caf)}mg)</label>`).join('') || '<p>هیچ طعمی اینقدر کافئین نداره!</p>';
}

/* ===== کافئین‌سنج ===== */
$('weight').oninput = function(){
  const max = Math.round(3 * (+this.value||70));
  $('caffeineResult').innerHTML = `حداکثر کافئین مجاز روزانه تو حدود <b>${fa(max)} میلی‌گرم</b> است.`;
};
$('weight').oninput();

/* ===== طعم‌سنج ===== */
const QUIZ=[
 {q:'شیرینی دوست داری یا تلخی؟',a:[['شیرین','sweet'],['تلخ','bitter'],['نرم','soft']]},
 {q:'چقدر انرژی لازم داری؟',a:[['خفیف','low'],['متوسط','mid'],['راکت','high']]},
 {q:'قند محدود می‌کنی؟',a:[['بله','nosugar'],['نه','sugar']]},
];
let qi=0, ans={};
function renderQuiz(){
  if(qi>=QUIZ.length){ showQuizResult(); return; }
  const q=QUIZ[qi];
  $('quiz').innerHTML=`<h3>سوال ${fa(qi+1)} از ${fa(QUIZ.length)}</h3><p><b>${q.q}</b></p>`+
    q.a.map(([t,k])=>`<button class="btn ghost" style="margin:5px" onclick="quizAns('${k}')">${t}</button>`).join('');
}
function quizAns(k){ ans[qi]=k; qi++; renderQuiz(); }
function showQuizResult(){
  const nosugar = Object.values(ans).includes('nosugar');
  const high = Object.values(ans).includes('high');
  const bitter = Object.values(ans).includes('bitter');
  let pick = nosugar? CANS[3] : high? CANS[2] : bitter? CANS[0] : CANS[1];
  $('quiz').innerHTML=`<h3>🥁 پیشنهاد ما:</h3><p><b style="color:var(--brand);font-size:1.3rem">${pick.name}</b></p>
    <button class="btn main" onclick="addCart(${CANS.indexOf(pick)})">همینو بگیر!</button>
    <button class="btn tiny" onclick="qi=0;ans={};renderQuiz()">دوباره</button>`;
}
renderQuiz();

/* ===== باکس ترکیبی ===== */
function renderMix(){
  $('mixPick').innerHTML = CANS.map((c,i)=>`<label><input type="checkbox" class="mixChk" value="${i}" onchange="updMix()"> ${c.name} (${fa(c.price)})</label>`).join('');
  updMix();
}
function mixSel(){ return [...document.querySelectorAll('.mixChk:checked')].map(c=>+c.value); }
function updMix(){
  const sel=mixSel();
  const sum=sel.reduce((s,i)=>s+CANS[i].price,0);
  if(sum>0){ $('mixInfo').innerHTML=`${fa(sel.length)} قوطی — ${money(sum)} → با ۱۵٪ تخفیف: <b>${money(Math.round(sum*0.85))}</b> ✅`; }
  else { $('mixInfo').textContent='حداقل یک طعم انتخاب کن'; }
}
function addMix(){
  const sel=mixSel();
  if(!sel.length){ toast('اول طعم‌ها رو انتخاب کن!'); return; }
  sel.forEach(i=>cart.push({i,qty:1}));
  saveCart(); confetti(15); toast('باکس ترکیبی به سبد اضافه شد 🎁');
}

/* ===== چرخ شانس ===== */
const WHEEL_PRIZES=[['۵٪ تخفیف',5],['۱ کوین','coin'],['۱۵٪ تخفیف',15],['۲ کوین','coin2'],['ارسال رایگان','ship'],['بخت کم!','no']];
let spinning=false, wheelDeg=0;
function spinWheel(){
  if(spinning) return; spinning=true;
  wheelDeg += 1080 + Math.random()*360;
  $('wheelEl').style.transform=`rotate(${wheelDeg}deg)`;
  setTimeout(()=>{
    spinning=false;
    const idx = Math.floor(((360 - (wheelDeg%360)) % 360) / 60);
    const [label,val]=WHEEL_PRIZES[idx];
    if(val==='no'){ $('wheelMsg').textContent='ای بابا، دفعه بعد 🍀'; }
    else{
      if(typeof val==='number'){ disc=val; if(cart.length) renderCart(); }
      else if(val==='coin'){ coins+=1; store.set('hl_coins',coins); }
      else if(val==='coin2'){ coins+=2; store.set('hl_coins',coins); renderBoard(); }
      else if(val==='ship'){ disc='ship'; }
      $('wheelMsg').textContent=`🎉 جایزه: ${label}`;
      confetti(20);
    }
  },3100);
}

/* ===== ماموریت‌ها ===== */
function todayKey(){ return new Date().toISOString().slice(0,10); }
function missions(){
  let m=store.get('hl_missions',null);
  if(!m || m.date!==todayKey()){ m={date:todayKey(),view:false,spin:false,mix:false}; store.set('hl_missions',m); }
  return m;
}
function renderMissions(){
  const m=missions();
  const done=k=>m[k]?'✅ انجام شد':'⬜ در انتظار';
  $('missionsBox').innerHTML=`
    <div class="cart-line"><span>بازدید سه بخش مختلف — ${done('view')}</span></div>
    <div class="cart-line"><span>یک‌بار چرخ شانس — ${done('spin')}</span></div>
    <div class="cart-line"><span>ساخت باکس ترکیبی — ${done('mix')}</span></div>
    <p>هر ماموریت = ۵ هپی‌کوین 🪙</p>`;
}
function missionDone(k){ const m=missions(); if(!m[k]){ m[k]=true; store.set('hl_missions',m); coins+=5; store.set('hl_coins',coins); toast('ماموریت کامل شد! +۵ کوین 🪙'); renderMissions(); renderBoard(); } }

/* ===== لیدربورد ===== */
function renderBoard(){
  const rows=[['سارا',142],['امیر',128],['نگار',97],['تو',coins]].sort((a,b)=>b[1]-a[1]);
  $('boardBox').innerHTML='<div class="cart-line"><b>نام</b><b>کوین 🪙</b></div>'+rows.map(([n,c],i)=>
    `<div class="cart-line ${n==='تو'?'me':''}"><span>${['🥇','🥈','🥉','🏅'][i]} ${n}</span><b>${fa(c)}</b></div>`).join('');
}

/* ===== امتیازدهی ===== */
function ratings(){ return store.get('hl_ratings',{}); }
function rateStars(i){
  const r=ratings(); const mine=r[i]||0;
  const all=Object.values(r); const avg = all.length? (all.reduce((a,b)=>a+b,0)/all.length).toFixed(1) : 4.5;
  return [1,2,3,4,5].map(s=>`<span style="cursor:pointer;color:${s<=mine?'gold':'var(--muted)'}" onclick="setRate(${i},${s})">★</span>`).join('')
    + ` <small>میانگین ${fa(avg)}</small>`;
}
function setRate(i,s){ const r=ratings(); r[i]=s; store.set('hl_ratings',r); renderCans(); toast('امتیازت ثبت شد ⭐'); }

/* ===== سفارش‌های من ===== */
function renderOrders(){
  const o=store.get('hl_orders',[]);
  $('ordersBox').innerHTML = o.length? o.map(x=>`<div class="cart-line"><span>🗓 ${x.date} — ${fa(x.items)} قوطی</span><b>${money(x.total)}</b></div>`).join('') : '<p>هنوز سفارشی ثبت نکردی.</p>';
}

/* ===== جعبه هدیه ===== */
function addGift(){
  cart.push({i:1,qty:6});
  saveCart(); toast('جعبه هدیه به سبد اضافه شد 🎁');
}

/* ===== شمارنده‌ها ===== */
setInterval(()=>{
  const now=new Date(), mid=new Date(now); mid.setHours(24,0,0,0);
  const d=mid-now, h=Math.floor(d/3.6e6), m=Math.floor(d%3.6e6/6e4), s=Math.floor(d%6e4/1000);
  $('sugTimer').textContent = `${fa(h)}:${fa(m)}:${fa(s)}`;
  const camp=new Date(now); camp.setDate(camp.getDate()+ (7-((camp.getDay()+1)%7)));
  camp.setHours(23,59,59);
  const dc=camp-now;
  $('campTimer').textContent=`${fa(Math.floor(dc/8.64e7))} روز و ${fa(Math.floor(dc%8.64e7/3.6e6))} ساعت`;
},1000);

/* ===== بازی ===== */
let gameScore=0, gameRun=false;
function startGame(){
  gameScore=0; gameRun=true; $('gameScore').textContent='۰';
  const area=$('gameArea'); area.innerHTML='';
  setInterval(()=>{
    if(!gameRun) return;
    const bomb=Math.random()<0.3;
    const el=document.createElement('div');
    el.className='faller';
    el.textContent=bomb?'💡':'🥫';
    el.style.left=Math.random()*85+'%';
    el.style.top='0px';
    area.appendChild(el);
    let y=0;
    const fall=setInterval(()=>{
      y+=8; el.style.top=y+'px';
      if(y>area.clientHeight-40){ clearInterval(fall); el.remove(); }
    },40);
    el.addEventListener('pointerdown',()=>{
      clearInterval(fall); el.remove(); popSound();
      if(bomb){ gameScore=Math.max(0,gameScore-2); }
      else{ gameScore++; if(gameScore%5===0){ coins++; store.set('hl_coins',coins); renderBoard(); toast('+۱ هپی‌کوین 🪙'); } }
      $('gameScore').textContent=fa(gameScore);
    });
  },700);
}

/* ===== رادار فروشگاه ===== */
const STORES=[
 {name:'فروشگاه ونک',x:35.757,y:51.410},
 {name:'شعبه تجریش',x:35.803,y:51.434},
 {name:'هپی‌مار صادقیه',x:35.717,y:51.340},
];
function findStore(){
  if(!navigator.geolocation){ $('storeResult').textContent='مرورگرت موقعیت‌یاب نداره.'; return; }
  navigator.geolocation.getCurrentPosition(p=>{
    const {latitude:la,longitude:lo}=p.coords;
    const near=STORES.map(s=>({...s,d:Math.hypot(s.x-la,s.y-lo)})).sort((a,b)=>a.d-b.d)[0];
    $('storeResult').innerHTML=`نزدیک‌ترین: <b>${near.name}</b> (حدود ${fa(Math.round(near.d*111))} کیلومتر)`;
    const m=$('map'); m.style.display='block';
    const d=0.08;
    m.src=`https://www.openstreetmap.org/export/embed.html?bbox=${lo-d}%2C${la-d}%2C${lo+d}%2C${la+d}&layer=mapnik&marker=${la}%2C${lo}`;
    missionDone('view');
  },()=>{ $('storeResult').textContent='اجازه موقعیت ندادی 🙈'; });
}

/* ===== وبلاگ ===== */
const BLOGS=[
 ['چطور انرژی سالم داشته باشیم؟','خواب کافی، آب زیاد و یک هپی‌لایف در میانه روز! کافئین متعادل یعنی خواب شب رو به هم نریزونی.'],
 ['کافئین چقدر کافیه؟','۳ میلی‌گرم به ازای هر کیلو وزن بدن، سقف توصیه‌شده‌ی روزانه است. با کافئین‌سنج ما حسابش کن.'],
 ['داستان طعم ۷','بعد از ۴۰ ترکیب ردشده، نوبت به ترکیب محرمانه‌ای رسید که تیم تولید اشکش دراومد...'],
 ['بدون شکر، بدون کم‌بودن طعم','زرد لیمویی با شیرین‌کننده طبیعی، ثابت کرد سالم می‌تونه خوشمزه هم باشه.'],
];
$('blogBox').innerHTML=BLOGS.map(([t,b])=>`<div class="acc-item"><div class="acc-head" onclick="this.parentElement.classList.toggle('open')"><span>${t}</span><span>＋</span></div><div class="acc-body"><p>${b}</p></div></div>`).join('');

/* ===== گالری ===== */
$('galleryBox').innerHTML=CANS.map((c,i)=>`<div class="g-item" style="background:linear-gradient(135deg,color-mix(in srgb,${c.color} 70%,#000),${c.color})" onclick="openLB(${i})" title="${c.name}"></div>`).join('');
function openLB(i){
  const c=CANS[i];
  const img=$('lbImg');
  img.style.background=`linear-gradient(135deg,color-mix(in srgb,${c.color} 70%,#000),${c.color})`;
  img.src='data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${c.color}"/><text x="200" y="210" text-anchor="middle" font-size="30" fill="#fff" font-family="sans-serif">${c.name}</text></svg>`);
  $('lightbox').classList.add('open');
}

/* ===== نمودار فروش ===== */
const SALES=[420,655,530,700,810,640,905], DAYS=['ش','ی','د','س','چ','پ','ج'];
$('salesBars').innerHTML=SALES.map((v,i)=>`<div class="bar" style="height:${Math.round(v/905*100)}%"><span>${DAYS[i]}</span></div>`).join('');

/* ===== جشن تولد ===== */
function simBday(){ confetti(60); toast('🎂 تولد هپی‌لایف مبارک! کد BDAY30 فعاله'); }

/* ===== فرم‌ها ===== */
function submitContact(){
  const n=$('cName').value, e=$('cEmail').value, m=$('cMsg').value;
  [ $('cName'),$('cEmail'),$('cMsg') ].forEach(x=>x.classList.remove('err'));
  let bad=false;
  if(!n){ $('cName').classList.add('err'); bad=true; }
  if(!/^\S+@\S+\.\S+$/.test(e)){ $('cEmail').classList.add('err'); bad=true; }
  if(m.length<5){ $('cMsg').classList.add('err'); bad=true; }
  if(bad){ toast('فیلدهای قرمز رو درست کن!'); return; }
  $('cMsgOut').textContent='پیامت رسید! به‌زودی جواب می‌دیم ✅';
  missionDone('view');
}
function submitReseller(){
  if(!$('resName').value||!$('resPhone').value||!$('resCity').value){ toast('همه فیلدها رو پر کن!'); return; }
  $('resMsg').textContent=`درخواست ${$('resCity').value} ثبت شد ✅`;
}
function joinNews(){
  if(store.get('hl_news')){ $('newsOut').textContent='قبلاً عضو شدی و کوینت رو گرفتی!'; return; }
  if(!/^\S+@\S+\.\S+$/.test($('newsEmail').value)){ toast('ایمیل معتبر بذار!'); return; }
  store.set('hl_news',true);
  coins+=10; store.set('hl_coins',coins); renderBoard();
  $('newsOut').textContent='عضویت انجام شد! +۱۰ هپی‌کوین 🪙'; confetti(15);
}

/* ===== چت‌بات ===== */
const CHAT_RULES=[
 [['قیمت','چند'],'قوطی‌ها بین ۸۵ تا ۹۵ هزار تومن هستن 🥫'],
 [['ارسال','پست','پیک'],'پست ۲۵ هزار و پیک ۶۰ هزار تومنه 🚚'],
 [['تخفیف','کد'],'کد HAPPY20 الان فعاله! کدهای دیگه: LIFE15 ، FALL25 ، BDAY30 🎟'],
 [['کافئین'],'کافئین‌سنج بالای صفحه رو امتحان کن ☕'],
 [['تماس','پشتیبان','سوال'],'برای پشتیبانی واقعی به @hooshahelp در تلگرام پیام بده 💬'],
];
function toggleChat(){ $('chatbot').classList.toggle('open'); }
function botReply(t){
  t=t.toLowerCase();
  for(const [keys,ans] of CHAT_RULES) if(keys.some(k=>t.includes(k))) return ans;
  return 'نشد بگیرم منظورت رو 😅 از این کلمات استفاده کن: قیمت، ارسال، تخفیف، کافئین، پشتیبانی';
}
function sendChat(){
  const v=$('chatIn').value.trim(); if(!v) return;
  $('chatBody').insertAdjacentHTML('beforeend',`<div class="me">${v}</div>`);
  $('chatIn').value='';
  setTimeout(()=>{ $('chatBody').insertAdjacentHTML('beforeend',`<div class="bot">${botReply(v)}</div>`); $('chatBody').scrollTop=9e5; },400);
}
$('chatIn')?.addEventListener('keydown',e=>{ if(e.key==='Enter') sendChat(); });
$('chatBody').innerHTML='<div class="bot">سلام! من پشتیبان هپی‌لایفم 🤖 بپرس!</div>';

/* ===== خریدهای زنده ===== */
const BUYERS=['علی از تهران','مهدی از شیراز','زهرا از اصفهان','کیانا از تبریز','حسین از مشهد'];
setInterval(()=>{
  const c=CANS[Math.floor(Math.random()*6)];
  toast(`🔥 ${BUYERS[Math.floor(Math.random()*5)]} چند قوطی ${c.name} خرید!`);
},12000);

/* ===== ۴۰۴ ===== */
const KNOWN=['home','about','products','daily','compare','intensity','caffeine','flavors','mixbox','game','wheel','missions','leaderboard','ratings','orders','gift','campaign','lifers','store','blog','gallery','chart','bday','reseller','contact','news'];
addEventListener('hashchange',()=>{
  const h=location.hash.slice(1);
  if(h && !KNOWN.includes(h)) toast(`صفحه «${h}» پیدا نشد — به خانه برگشتی 🏠`);
});

/* ===== تم / حرکت / ریویل ===== */
$('themeBtn').onclick=()=>{ document.body.classList.toggle('manual-light'); missionDone('view'); };
$('motionBtn').onclick=()=>{ document.body.classList.toggle('no-motion'); toast(document.body.classList.contains('no-motion')?'حالت کم‌حرکت فعال شد 🐢':'حرکت برگشت 🏃'); };
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); missionDone('view'); } }),{threshold:.2});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ===== موزیک پس‌زمینه (WebAudio) ===== */
let musicOn=false, ac=null, musicNodes=[];
function toggleMusic(){
  if(!musicOn){
    ac = ac || new (window.AudioContext||window.webkitAudioContext)();
    const notes=[220,277,330,440];
    let i=0;
    musicNodes.push(setInterval(()=>{
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='triangle'; o.frequency.value=notes[i++%4];
      g.gain.setValueAtTime(.04,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.5);
      o.start(); o.stop(ac.currentTime+.5);
    },500));
    musicOn=true; toast('موزیک روشن شد 🎵');
  } else {
    musicNodes.forEach(clearInterval); musicNodes=[];
    musicOn=false; toast('موزیک خاموش شد 🔇');
  }
}

/* ===== init ===== */
renderCans(); renderCart(); renderBoard(); renderMissions(); renderOrders(); renderMix(); filterByIntensity(200);
document.querySelector('.suggestion-bar')?.addEventListener('click',toggleMusic);
selectCan(1);
requestAnimationFrame(pendulum);
