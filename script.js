/* ===== ابزار ===== */
const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const money=n=>fa(n.toLocaleString('en-US'))+' تومان';
const store={
  get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2600)}

/* ===== صدا (وب‌اودیو) ===== */
let actx=null,noiseBuf=null;
function getAC(){
  if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)();
    noiseBuf=actx.createBuffer(1,actx.sampleRate*1.5,actx.sampleRate);
    const d=noiseBuf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }
  if(actx.state==='suspended')actx.resume();
  return actx;
}
function playFizz(i){ /* فس‌فسک اختصاصی هر قوطی */
  try{
    const ac=getAC(),t=ac.currentTime;
    const src=ac.createBufferSource();src.buffer=noiseBuf;
    const bp=ac.createBiquadFilter();bp.type='bandpass';
    bp.frequency.value=CANS[i].fizz;bp.Q.value=1.2;
    const g=ac.createGain();
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(.5,t+.05);
    g.gain.exponentialRampToValueAtTime(.001,t+1.1);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(t);src.stop(t+1.2);
    const o=ac.createOscillator(),og=ac.createGain();o.type='sine';
    o.frequency.setValueAtTime(CANS[i].fizz*4,t);
    o.frequency.exponentialRampToValueAtTime(CANS[i].fizz*2,t+.3);
    og.gain.setValueAtTime(.08,t);og.gain.exponentialRampToValueAtTime(.001,t+.35);
    o.connect(og).connect(ac.destination);o.start(t);o.stop(t+.4);
  }catch(e){}
}
function popSound(){
  try{const ac=getAC(),t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();
    o.type='triangle';o.frequency.setValueAtTime(600,t);o.frequency.exponentialRampToValueAtTime(200,t+.12);
    g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);
    o.connect(g).connect(ac.destination);o.start(t);o.stop(t+.16);}catch(e){}
}

/* ===== قوطی‌ها ===== */
const CANS=[
  {name:'کولا نایت',color:'#1c1c24',price:85000,fizz:700, light:false, caf:150, desc:'تیره و مرموز، شب‌های بیداری 🌙'},
  {name:'بنفش برقی',color:'#7C3AED',price:90000,fizz:1400,light:false, caf:160, desc:'محبوب‌ترین! شارژ خالص انرژی 💜'},
  {name:'نارنجی آتش',color:'#F25C05',price:92000,fizz:2200,light:false, caf:180, desc:'آتش‌بازی تو دهنت! 🔥'},
  {name:'زرد لیمویی',color:'#EAE32B',price:88000,fizz:2900,light:true, caf:120, desc:'ترش و تازه، انرژی سبک 🍋'},
  {name:'آبی یخی',color:'#38BDF8',price:90000,fizz:1800,light:false, caf:140, desc:'یخی خنک، مخصوص تابستان ❄️'},
  {name:'سفید وانیلی',color:'#f2f0ea',price:95000,fizz:950, light:true, caf:100, desc:'نرم و وانیلی، شبیه دسر 🍦'}
];
/* قوطی روز + کد DAY10 */
const CODES={HAPPY20:20,LIFE15:15,LIFE10:10,LIFE5:5,FALL25:25,BDAY30:30,FREESHIP:'ship'};
const dayIdx=new Date().getDate()%6;
CODES.DAY10=10;
$('dayCanTxt').innerHTML=`امروز نوبت <b style="color:${CANS[dayIdx].color}">${CANS[dayIdx].name}</b> است!`;

/* ===== ساخت قوطی‌های آویزون + فیزیک پاندول ===== */
const canRow=$('canRow'),hangs=[];
CANS.forEach((c,i)=>{
  const h=document.createElement('div');
  h.className='hang';
  h.innerHTML=`<div class="string"></div><div class="can ${c.light?'light':''}" style="background:linear-gradient(105deg,${c.color},${c.color} 60%,rgba(255,255,255,.15))"><span>${c.name}</span></div>`;
  h.title=c.name+' — کلیک: تغییر رنگ | دابل‌کلیک: شوک انرژی ⚡';
  h.addEventListener('click',()=>{h._vel+=(Math.random()>.5?1:-1)*2.4;selectCan(i)});
  h.addEventListener('dblclick',()=>energyShock(i));
  canRow.appendChild(h);
  hangs.push({el:h,angle:(i%2?1:-1)*.12,vel:0});
});
let lastT=0,noMotion=false;
function tick(t){
  const dt=Math.min((t-lastT)/1000,.05)||.016;lastT=t;
  if(!noMotion)hangs.forEach(h=>{
    h.vel+=(-6*Math.sin(h.angle)-.35*h.vel)*dt; // فیزیک پاندول: جاذبه + میرایی
    h.angle+=h.vel*dt;
    h.el.style.transform=`rotate(${h.angle}rad)`;
  });
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
/* باد با حرکت موس */
document.addEventListener('mousemove',e=>{
  if(noMotion)return;
  hangs.forEach(h=>{
    const r=h.el.getBoundingClientRect();
    const d=Math.abs(e.clientX-(r.left+r.width/2));
    if(d<160)h._vel=h.vel+=(e.movementX||0)*.0016*(1-d/160);
  });
});

/* ===== انتخاب قوطی: رنگ کل سایت + فس‌فسک ===== */
function selectCan(i,silent){
  document.documentElement.style.setProperty('--brand',CANS[i].color);
  hangs.forEach((h,j)=>h.el.classList.toggle('active',j===i));
  document.querySelectorAll('.canCard').forEach((c,j)=>c.classList.toggle('active',j===i));
  $('brandWord').textContent=CANS[i].name;
  renderRate();
  if(!silent){
    playFizz(i);
    toast('🎨 رنگ سایت شد: '+CANS[i].name+' '+CANS[i].desc);
  }
}
function energyShock(i){
  playFizz(i);
  burstConfetti(CANS[i].color);
  document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.6)'},{filter:'brightness(1)'}],{duration:450});
  toast('⚡ شوک انرژی! '+CANS[i].name);
  const c=store.get('hl_coins',0);store.set('hl_coins',c+2);renderCoins();
}
selectCan(1,true); // لود اولیه بدون صدا (سیاست autoplay مرورگر)

/* ===== کارت‌های قوطی ===== */
const cardsBox=$('canCards');
CANS.forEach((c,i)=>{
  const d=document.createElement('div');
  d.className='canCard';
  d.innerHTML=`<div class="mini" style="background:linear-gradient(105deg,${c.color},rgba(255,255,255,.15))"></div><b>${c.name}</b><p>${c.desc}</p><p class="pr">${money(c.price)}</p><button class="cta">افزودن به سبد</button>`;
  d.querySelector('button').onclick=e=>{e.stopPropagation();addCart(i)};
  d.onclick=()=>selectCan(i);
  cardsBox.appendChild(d);
});
document.querySelectorAll('.card,.canCard,.secT').forEach(el=>el.classList.add('reveal'));

/* ===== امتیاز ستاره‌ای ===== */
function renderRate(){
  const r=store.get('hl_ratings',{});
  const row=$('rateRow');row.innerHTML='';
  for(let s=1;s<=5;s++){
    const st=document.createElement('span');
    st.textContent=s<=(r[dayIdx]||0)?'⭐':'☆';
    st.onclick=()=>{r[dayIdx]=s;store.set('hl_ratings',r);renderRate();toast('⭐ ممنون! به '+CANS[dayIdx].name+' '+fa(s)+' ستاره دادی')};
    row.appendChild(st);
  }
  $('rateInfo').textContent='امتیاز فعلی '+CANS[dayIdx].name+': '+fa(r[dayIdx]||0)+' از ۵ — می‌تونی عوضش کنی!';
}

/* ===== مقایسه‌گر ===== */
['vsA','vsB'].forEach((id,k)=>{
  CANS.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=c.name;$(id).appendChild(o)});
  $(id).value=k===0?1:2;
  $(id).onchange=updVs;
});
function updVs(){
  const a=CANS[+$('vsA').value],b=CANS[+$('vsB').value];
  $('vsOut').innerHTML=`<table><tr><th></th><th>${a.name}</th><th>${b.name}</th></tr>
  <tr><td>قیمت</td><td>${money(a.price)}</td><td>${money(b.price)}</td></tr>
  <tr><td>کافئین</td><td>${fa(a.caf)}mg</td><td>${fa(b.caf)}mg</td></tr>
  <tr><td>فس‌فسک</td><td>${fa(a.fizz)}Hz</td><td>${fa(b.fizz)}Hz</td></tr></table>`;
}
updVs();

/* ===== طعم‌سنج ===== */
const QUIZ=[
  {q:'معمولاً چقدر خسته‌ای؟',a:[['خیلی! 🔥',2],['متوسط 😐',1],['اصلاً 🌙',0]]},
  {q:'طعم موردعلاقه‌ات؟',a:[['تند و پرحجم 🔥',2],['شیرین و دسر 🍦',5],['ترش و تازه 🍋',3]]},
  {q:'شب‌بیداری یا روز؟',a:[['شب 🌙',0],['روز ☀️',3],['همیشه ⚡',1]]}
];
let qi=0;const qAns=[];
function showQ(){
  if(qi>=QUIZ.length){
    const win=+qAns.sort((a,b)=>a-b)[0]??1;
    selectCan(win);
    $('quizQ').innerHTML=`<p>🍹 طعم تو: <b style="color:${CANS[win].color}">${CANS[win].name}</b> — ${CANS[win].desc}</p><button class="cta" onclick="addCart(${win})">همینو بگیر!</button>`;
    missionDone('quiz');return;
  }
  $('quizQ').innerHTML=`<p><b>${fa(qi+1)}/${fa(QUIZ.length)}</b> — ${QUIZ[qi].q}</p>`;
  QUIZ[qi].a.forEach(([txt,idx])=>{
    const b=document.createElement('button');b.className='cta ghost';b.textContent=txt;
    b.onclick=()=>{qAns.push(idx);qi++;showQ()};
    $('quizQ').appendChild(b);
  });
}
$('flavorQuizBtn').onclick=()=>{$('quizBox').scrollIntoView({behavior:'smooth'});qi=0;qAns.length=0;showQ()};

/* ===== کافئین‌سنج ===== */
$('wRange').oninput=e=>{
  const w=+e.target.value;$('wVal').textContent=fa(w);
  const mg=w*3;
  $('cafOut').innerHTML=`حداکثر کافئین مجاز روزانه‌ی تو: <b style="color:var(--brand)">${fa(mg)}mg</b> ≈ ${fa(Math.floor(mg/160))} قوطی هپی‌لایف (هر قوطی ۱۶۰mg) ☕`;
};
$('wRange').oninput({target:$('wRange')});

/* ===== باکس ترکیبی ===== */
const mixSel=new Set([1,2,3]);
CANS.forEach((c,i)=>{
  const l=document.createElement('label');
  l.innerHTML=`<input type="checkbox" ${mixSel.has(i)?'checked':''}> ${c.name}`;
  l.querySelector('input').onchange=e=>{e.target.checked?mixSel.add(i):mixSel.delete(i);updMix()};
  $('mixRow').appendChild(l);
});
function updMix(){
  let sum=0;mixSel.forEach(i=>sum+=CANS[i].price);
  if(mixSel.size===6){$('mixOut').innerHTML=`۶ طعم انتخاب شد ✅ قیمت با ٪۱۵ تخفیف: <b style="color:var(--brand)">${money(Math.round(sum*.85))}</b>`;return true}
  $('mixOut').textContent=`${fa(mixSel.size)} از ۶ قوطی انتخاب شده — با کامل شدن باکس ٪۱۵ تخفیف می‌گیری!`;
  return false;
}
updMix();
$('mixAdd').onclick=()=>{
  if(!updMix())return toast('اول ۶ قوطی انتخاب کن! 🎁');
  let s=0;mixSel.forEach(i=>addCart(i,true));
  mixSel.forEach(i=>{const c=store.get('hl_cart',[]);c.push({i,box:true});store.set('hl_cart',c)});
  renderCart();toast('🎁 باکس ترکیبی با ٪۱۵ تخفیف اضافه شد!');
};

/* ===== چرخ شانس ===== */
const WHEEL=[10,0,20,5,0,15];
let spinning=false;
$('spinBtn').onclick=()=>{
  if(spinning)return;
  const c=store.get('hl_coins',0);
  if(c<15)return toast('کوین کافی نداری! 🪙');
  store.set('hl_coins',c-15);renderCoins();
  spinning=true;
  const deg=1800+Math.random()*360;
  $('wheel').style.transform=`rotate(${-deg}deg)`;
  setTimeout(()=>{
    const seg=Math.floor(((deg%360)/60))%6;
    const prize=WHEEL[5-seg<0?5-seg+6:5-seg];
    if(prize){const nc=store.get('hl_coins',0);store.set('hl_coins',nc+prize);renderCoins();$('wheelOut').textContent='🎉 '+fa(prize)+' هپی‌کوین بردی!'}
    else $('wheelOut').textContent='😅 این بار چیزی نشد، دوباره امتحان کن!';
    spinning=false;missionDone('spin');
  },4100);
};

/* ===== ماموریت‌های روزانه ===== */
const MISSIONS=[['spin','چرخ شانس بچرخون',15],['quiz','طعم‌سنج رو کامل کن',15],['cart','یه خرید انجام بده',30],['share','سایت رو به اشتراک بذار',10],['gift','جعبه هدیه رو باز کن',10],['news','عضو خبرنامه شو',10]];
function todayStr(){return new Date().toISOString().slice(0,10)}
function missionDone(name){
  const m=store.get('hl_missions',{date:todayStr(),done:[]});
  if(m.date!==todayStr()){m.date=todayStr();m.done=[]}
  if(m.done.includes(name))return;
  m.done.push(name);store.set('hl_missions',m);
  const mi=MISSIONS.find(x=>x[0]===name);
  const c=store.get('hl_coins',0);store.set('hl_coins',c+mi[2]);renderCoins();
  toast('📋 ماموریت انجام شد: '+mi[1]+' (+'+fa(mi[2])+' کوین)');
  renderMissions();
}
function renderMissions(){
  const m=store.get('hl_missions',{date:todayStr(),done:[]});
  $('missionList').innerHTML=MISSIONS.map(x=>`<li class="${m.done.includes(x[0])?'done':''}"><span>${x[1]}</span><b>+${fa(x[2])} 🪙</b></li>`).join('');
}
renderMissions();

/* ===== جعبه هدیه ===== */
let giftOpen=false;
$('giftBox').onclick=()=>{
  if(giftOpen)return toast('جعبه امروز باز شده! فردا بیا 🎁');
  giftOpen=true;
  const codes=Object.keys(CODES);
  const code=codes[Math.floor(Math.random()*codes.length)];
  $('giftOut').innerHTML=`🎉 هدیه‌ات: کد تخفیف <b style="color:var(--brand)">${code}</b>!`;
  burstConfetti('#EAE32B');missionDone('gift');
};

/* ===== نمودار فروش ===== */
[42,55,61,78,84,96].forEach((v,i)=>{
  const b=document.createElement('div');b.className='bar';
  b.style.height=v+'%';
  b.innerHTML=`<b>${fa(v)}</b><i>${['فرور','ارد','خرد','تیر','مرد','شهر'][i]}</i>`;
  $('chart').appendChild(b);
});

/* ===== گالری + لایت‌باکس ===== */
const GAL=[['💜','linear-gradient(135deg,#7C3AED,#3b1d73)'],['🔥','linear-gradient(135deg,#F25C05,#7a2a00)'],['🍋','linear-gradient(135deg,#EAE32B,#8a8410)'],['❄️','linear-gradient(135deg,#38BDF8,#0c4a6e)'],['🍦','linear-gradient(135deg,#f2f0ea,#8a8880)'],['🌙','linear-gradient(135deg,#1c1c24,#4a4a58)']];
GAL.forEach(([em,bg])=>{
  const t=document.createElement('div');t.className='gTile';t.style.background=bg;t.textContent=em;
  t.onclick=()=>{$('lbContent').style.background=bg;$('lbContent').textContent=em;$('lightbox').classList.add('open')};
  $('gallery').appendChild(t);
});
$('lbClose').onclick=()=>$('lightbox').classList.remove('open');
$('lightbox').onclick=e=>{if(e.target===$('lightbox'))$('lightbox').classList.remove('open')};

/* ===== لیدربورد ===== */
function renderLB(){
  const lb=[['سارا',980],['امیر',860],['نگین',740],['رضا',620]];
  lb.push(['تو ✨',store.get('hl_coins',0)]);
  lb.sort((a,b)=>b[1]-a[1]);
  $('lbList').innerHTML=lb.map((x,i)=>`<li class="${x[0]==='تو ✨'?'me':''}"><span>${fa(i+1)}. ${x[0]}</span><b>${fa(x[1])} 🪙</b></li>`).join('');
}
renderLB();

/* ===== هپی‌لایفرها ===== */
[['سارا از شیراز','بنفش برقی زندگی‌م رو عوض کرد! 💜'],['امیر از تهران','فس‌فسک آبی یخی تو گرما معرکه‌ست ❄️'],['نگین از مشهد','طعم‌سنج دقیقاً طعم منو پیدا کرد!']],
$('fans').innerHTML=[['سارا از شیراز','بنفش برقی زندگی‌م رو عوض کرد! 💜'],['امیر از تهران','فس‌فسک آبی یخی تو گرما معرکه‌ست ❄️'],['نگین از مشهد','طعم‌سنج دقیقاً طعم منو پیدا کرد!']].map(f=>`<div class="fan"><b>${f[0]}</b><p>${f[1]}</p></div>`).join('');

/* ===== وبلاگ آکاردئون ===== */
[['چرا بدون شکر اضافه؟','شکر اضافه انرژی کاذب میده؛ ما از شیرین‌کننده‌های طبیعی استفاده می‌کنیم تا انرژی واقعی و پایدار داشته باشی.'],
['کافئین چقدر کافیه؟','متخصصان حداکثر ۳mg بر کیلوگرم وزن بدن رو توصیه می‌کنن. با کافئین‌سنج سایت محاسبه‌ش کن!'],
['راز فس‌فسک قوطی‌ها','هر طعم فرکانس گاز متفاوتی داره؛ روی قوطی‌ها کلیک کن و صداها رو مقایسه کن! 🔊']]
.forEach(([t,b])=>{
  const d=document.createElement('div');d.className='acc';
  d.innerHTML=`<div class="accH"><span>${t}</span><span>▼</span></div><div class="accB">${b}</div>`;
  d.querySelector('.accH').onclick=()=>d.classList.toggle('open');
  $('blogAcc').appendChild(d);
});

/* ===== نقشه + رادار ===== */
$('osmMap').src='https://www.openstreetmap.org/export/embed.html?bbox=51.33,35.68,51.42,35.75&layer=mapnik&marker=35.715,51.375';
$('radarBtn').onclick=()=>{
  if(!navigator.geolocation)return $('radarOut').textContent='مرورگرت موقعیت‌یاب نداره 📡';
  navigator.geolocation.getCurrentPosition(p=>{
    const stores=[['فروشگاه مرکزی',35.72,51.38],['شعبه سعادت‌آباد',35.78,51.37],['شعبه ونک',35.76,51.41]];
    const near=stores.map(s=>[s[0],Math.hypot((p.coords.latitude-s[1])*111,(p.coords.longitude-s[2])*111)]).sort((a,b)=>a[1]-b[1])[0];
    $('radarOut').innerHTML=`📡 نزدیک‌ترین فروشگاه: <b style="color:var(--brand)">${near[0]}</b> (حدود ${fa(Math.round(near[1]))} کیلومتر)`;
  },()=>{$('radarOut').textContent='دسترسی به موقعیت رد شد 📡'});
};

/* ===== فرم‌ها ===== */
$('agBtn').onclick=()=>{
  let ok=true;
  [['agName'],['agCity'],['agPhone']].forEach(([id])=>{const el=$(id);el.classList.toggle('err',!el.value.trim());if(!el.value.trim())ok=false});
  if(ok){toast('🤝 درخواست نمایندگی ثبت شد! باهات تماس می‌گیریم');missionDone('share')}
};
$('ctBtn').onclick=()=>{
  let ok=true;
  $('ctName').classList.toggle('err',!$('ctName').value.trim());
  $('ctMail').classList.toggle('err',!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('ctMail').value));
  $('ctMsg').classList.toggle('err',!$('ctMsg').value.trim());
  document.querySelectorAll('#contact .err').forEach(()=>ok=false);
  if(ok){toast('✉️ پیامت رسید! زود جواب می‌دیم');$('ctMsg').value=''}
};
$('nlBtn').onclick=()=>{
  const em=$('nlMail').value;
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ $('nlMail').classList.add('err');return toast('ایمیل معتبر وارد کن! 📮') }
  $('nlMail').classList.remove('err');
  const nl=store.get('hl_news',[]);
  if(nl.includes(em))return toast('قبلاً عضو شدی! 😊');
  nl.push(em);store.set('hl_news',nl);
  const c=store.get('hl_coins',0);store.set('hl_coins',c+10);renderCoins();
  toast('📮 عضو خبرنامه شدی! +۱۰ هپی‌کوین');missionDone('news');
};

/* ===== بازی قوطی‌گیر ===== */
const cv=$('catchCv'),cx=cv.getContext('2d');
let falling=[],cscore=0,catchOn=true;
function newFall(){falling.push({x:Math.random()*300+10,y:-15,v:1+Math.random()*2.4,c:CANS[Math.floor(Math.random()*6)]})}
setInterval(()=>{if(catchOn&&!noMotion&&falling.length<5)newFall()},900);
cv.addEventListener('click',e=>{
  const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*(340/r.width),my=(e.clientY-r.top)*(220/r.height);
  for(let k=falling.length-1;k>=0;k--){
    const f=falling[k];
    if(Math.abs(mx-f.x)<24&&Math.abs(my-f.y)<26){
      falling.splice(k,1);cscore++;playFizz(Math.floor(Math.random()*6));burstConfetti(f.c.color);
      $('catchScore').textContent=fa(cscore);
      if(cscore%5===0){const c=store.get('hl_coins',0);store.set('hl_coins',c+5);renderCoins();toast('🪙 +۵ هپی‌کوین!')}
      return;
    }
  }
});
(function catchLoop(){
  cx.clearRect(0,0,340,220);
  falling.forEach(f=>{f.y+=f.v;
    cx.fillStyle=f.c.color;cx.fillRect(f.x-14,f.y-18,28,36);
    cx.fillStyle='#8a8a96';cx.fillRect(f.x-7,f.y-22,14,5);
  });
  falling=falling.filter(f=>f.y<240);
  requestAnimationFrame(catchLoop);
})();

/* ===== چت‌بات ===== */
$('botFab').onclick=()=>$('botBox').classList.toggle('open');
$('botClose').onclick=()=>$('botBox').classList.remove('open');
function botMsg(txt,me){
  const d=document.createElement('div');d.className='m'+(me?' me':'');d.textContent=txt;
  $('botLog').appendChild(d);$('botLog').scrollTop=1e6;
}
function botReply(q){
  q=q.toLowerCase();
  if(q.includes('سلام'))return 'سلام! خوش اومدی به هپی‌لایف ⚡ چطور می‌تونم کمکت کنم؟';
  if(q.includes('قیمت'))return 'قوطی‌ها از '+money(85000)+' تا '+money(95000)+' هستن 🍹';
  if(q.includes('طعم'))return 'ما ۶ طعم داریم: کولا نایت، بنفش برقی، نارنجی آتش، زرد لیمویی، آبی یخی و سفید وانیلی! طعم‌سنج رو امتحان کن 🍹';
  if(q.includes('کافئین'))return 'هر قوطی ۱۰۰ تا ۱۸۰ میلی‌گرم کافئین داره. کافئین‌سنج سایت محاسبه‌ش می‌کنه ☕';
  if(q.includes('ارسال')||q.includes('پست'))return 'پست پیشتاز ۲۵ هزار تومان، پیک اختصاصی ۶۰ هزار تومان 🚚';
  if(q.includes('فس')||q.includes('صدا'))return 'هر قوطی فس‌فسک اختصاصی خودشو داره! روی قوطی‌های آویزون کلیک کن و گوش کن 🔊';
  if(q.includes('تخفیف')||q.includes('کد'))return 'کدهای فعال: HAPPY20، LIFE15، FALL25 و DAY10 🎟️';
  if(q.includes('نمایندگی'))return 'فرم نمایندگی پایین صفحه هست! 🤝';
  return 'اینو دقیق نمی‌دونم 😅 برای سوالات بیشتر به @hooshahelp پیام بده!';
}
function botSend(){
  const v=$('botIn').value.trim();if(!v)return;
  botMsg(v,true);$('botIn').value='';
  setTimeout(()=>botMsg(botReply(v)),500);
}
$('botSend').onclick=botSend;
$('botIn').onkeydown=e=>{if(e.key==='Enter')botSend()};
botMsg('سلام! من دستیار هپی‌لایفم 🤖 درباره قیمت، طعم، کافئین و ارسال بپرس!');

/* ===== سبد خرید و چک‌اوت ===== */
let discount=0,freeShip=false;
function cartCount(){return store.get('hl_cart',[]).length}
function renderCoins(){const c=store.get('hl_coins',0);$('coinVal').textContent=fa(c);renderLB()}
function renderCart(){
  const c=store.get('hl_cart',[]);
  $('cartBadge').textContent=fa(c.length);
  $('cartList').innerHTML=c.length?c.map((x,k)=>`<div class="ci"><span>${CANS[x.i].name}${x.box?' (باکس)':''}</span><span>${money(CANS[x.i].price)} <b style="cursor:pointer" onclick="rmCart(${k})">🗑️</b></span></div>`).join(''):'<p>سبدت خالیه! 🛒</p>';
}
function rmCart(k){const c=store.get('hl_cart',[]);c.splice(k,1);store.set('hl_cart',c);renderCart()}
function addCart(i,quiet){
  const c=store.get('hl_cart',[]);c.push({i});store.set('hl_cart',c);renderCart();
  if(!quiet){popSound();playFizz(i);toast('🛒 '+CANS[i].name+' به سبد اضافه شد!')}
}
$('cartBtn').onclick=()=>{showCo(1);$('cartModal').classList.add('open');renderCart()};
$('cartClose').onclick=()=>$('cartModal').classList.remove('open');
$('heroBuy').onclick=()=>$('cartBtn').onclick();
function showCo(n){[1,2,3].forEach(i=>$('coStep'+i).style.display=i===n?'block':'none');if(n===2)updShip();if(n===3)updPay()}
function cartSum(){let s=0;store.get('hl_cart',[]).forEach(x=>s+=CANS[x.i].price);return s}
$('toStep2').onclick=()=>{
  let ok=true;
  [['coName'],['coAddr'],['coTel']].forEach(([id])=>{const el=$(id);el.classList.toggle('err',!el.value.trim());if(!el.value.trim())ok=false});
  if(ok)showCo(2);else toast('اطلاعات آدرس رو کامل کن! 🚚');
};
function shipCost(){return freeShip?0:(document.querySelector('input[name=ship]:checked').value==='post'?25000:60000)}
function updShip(){$('shipOut').innerHTML='هزینه ارسال: <b style="color:var(--brand)">'+(freeShip?'رایگان! 🎉':money(shipCost()))+'</b>'}
document.querySelectorAll('input[name=ship]').forEach(r=>r.onchange=updShip);
function total(){let s=cartSum();if(discount)s-=Math.round(s*discount/100);return s+shipCost()}
function updPay(){$('paySum').innerHTML=`جمع سبد: ${money(cartSum())}<br>تخفیف: ${discount?'٪'+fa(discount):'ندارد'}<br>ارسال: ${freeShip?'رایگان':money(shipCost())}<br><b style="font-size:18px;color:var(--brand)">قابل پرداخت: ${money(total())}</b>`}
$('toStep3').onclick=()=>{updPay();showCo(3)};
$('payBtn').onclick=()=>{
  const orders=store.get('hl_orders',[]);
  const o={id:Date.now(),date:new Date().toLocaleDateString('fa-IR'),items:store.get('hl_cart',[]).map(x=>CANS[x.i].name),total:total(),ship:document.querySelector('input[name=ship]:checked').value==='post'?'پست':'پیک'};
  orders.push(o);store.set('hl_orders',orders);store.set('hl_cart',[]);
  const c=store.get('hl_coins',0);store.set('hl_coins',c+Math.round(total()/10000));renderCoins();
  renderCart();missionDone('cart');
  $('invoice').innerHTML=`<h2>🧾 فاکتور هپی‌لایف</h2><p>شماره: ${fa(o.id)} | تاریخ: ${o.date}</p><table><tr><th>محصول</th></tr>${o.items.map(n=>`<tr><td>${n}</td></tr>`).join('')}</table><p>ارسال: ${o.ship} | جمع کل: <b>${money(o.total)}</b></p><p style="color:#7C3AED">ممنون از خریدت! ⚡ هپی‌لایف</p><button class="cta" onclick="window.print()">🖨️ چاپ فاکتور</button> <button class="cta" onclick="document.getElementById('invoice').classList.remove('show')">بستن</button>`;
  $('invoice').classList.add('show');
  $('cartModal').classList.remove('open');
  burstConfetti('#7C3AED');playFizz(dayIdx);
  toast('✅ سفارش ثبت شد! هپی‌کوین هم گرفتی 🪙');
  discount=0;freeShip=false;
};
/* کدهای تخفیف */
function applyCode(code){
  code=(code||$('codeIn').value).trim().toUpperCase();
  if(!CODES[code])return $('codeOut').textContent='❌ کد نامعتبر!';
  if(CODES[code]==='ship'){freeShip=true;discount=0;$('codeOut').textContent='🎉 ارسال رایگان فعال شد!'}
  else{discount=CODES[code];freeShip=false;$('codeOut').textContent='🎉 ٪'+fa(CODES[code])+' تخفیف فعال شد!'}
  toast('🎟️ کد '+code+' اعمال شد!');
}
$('codeBtn').onclick=()=>applyCode();

/* ===== سفارش‌های من ===== */
const ords=store.get('hl_orders',[]);
if(ords.length){
  const d=document.createElement('div');d.className='card';
  d.innerHTML='<h2>📦 سفارش‌های من</h2>'+ords.map(o=>`<div class="ci"><span>${o.date} — ${o.items.join('، ')}</span><b>${money(o.total)}</b></div>`).join('');
  document.querySelector('footer').before(d);
}

/* ===== اشتراک‌گذاری ===== */
function shareSite(){
  const data={title:'هپی‌لایف',text:'انرژی واقعی، بدون شکر اضافه ⚡',url:location.href};
  if(navigator.share)navigator.share(data).catch(()=>{});
  else{navigator.clipboard.writeText(location.href);toast('🔗 لینک کپی شد!')}
}
window.shareSite=shareSite;
document.querySelector('#topbar .hbtns').insertAdjacentHTML('afterbegin','<button class="hbtn" onclick="shareSite()" title="اشتراک‌گذاری">🔗</button>');

/* ===== جشن تولد ===== */
$('bdayBtn').onclick=()=>{
  applyCode('BDAY30');burstConfetti('#F25C05');playFizz(2);playFizz(3);
  toast('🎂 تولد هپی‌لایف مبارک! کد BDAY30 فعال شد');
};

/* ===== تم / موشن / موزیک ===== */
$('themeBtn').onclick=()=>document.body.classList.toggle('manual-light');
$('motionBtn').onclick=()=>{noMotion=!noMotion;document.body.classList.toggle('no-motion',noMotion);toast(noMotion?'🐢 حالت کم‌حرکت فعال شد':'⚡ حرکت برگشت!')};
let musicOn=false,musicInt=null;
function toggleMusic(){
  musicOn=!musicOn;
  if(musicOn){
    const ac=getAC();let step=0;
    const notes=[262,330,392,523,392,330];
    musicInt=setInterval(()=>{
      const o=ac.createOscillator(),g=ac.createGain();
      o.type='sine';o.frequency.value=notes[step%6];
      g.gain.setValueAtTime(.06,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.4);
      o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+.45);step++;
    },350);
  }else clearInterval(musicInt);
  toast(musicOn?'🎵 موزیک پخش شد':'🔇 موزیک خاموش شد');
}
$('musicBtn').onclick=toggleMusic;

/* ===== جستجو و ۴۰۴ ===== */
const KNOWN=['خانه','قوطی','قوطی‌ها','درباره','درباره ما','وبلاگ','گالری','نمایندگی','تماس','طعم','کافئین','چرخ','هدیه','ماموریت'];
$('siteSearch').addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const q=e.target.value.trim();if(!q)return;
  if(KNOWN.some(k=>q.includes(k)||k.includes(q))){
    toast('🔍 پیداش کردم! اسکرول کن پایین');document.getElementById('cans').scrollIntoView({behavior:'smooth'});
  }else{
    $('nfMsg').textContent='«'+q+'» توی سایت ما وجود نداره! 😵';
    $('nf404').classList.add('open');
  }
});
$('nfBack').onclick=()=>$('nf404').classList.remove('open');

/* ===== ایستر اِگ: تایپ happy ===== */
let buf='';
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  buf=(buf+e.key).toLowerCase().slice(-10);
  if(buf.includes('happy')){buf='';burstConfetti('#7C3AED');toast('🤫 ایستر اِگ! کد LIFE15 یادت نره 😉')}
});

/* ===== خریدهای زنده ===== */
const CITIES=['شیراز','تهران','مشهد','اصفهان','تبریز','کرج','رشت','یزد'];
const NAMES=['علی','سارا','رضا','نگین','امیر','مریم','حسین','درسا'];
setInterval(()=>{
  if(document.hidden)return;
  const n=NAMES[Math.floor(Math.random()*8)],c=CITIES[Math.floor(Math.random()*8)],i=Math.floor(Math.random()*6);
  toast('🛍️ '+n+' از '+c+'، '+fa(1+Math.floor(Math.random()*3))+' قوطی '+CANS[i].name+' خرید!');
},9000);

/* ===== توست اولیه دکمه‌ها ===== */
document.querySelector('#topbar .hbtns').addEventListener('click',()=>{});

/* ===== reveal ===== */
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)x.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ===== کانفتی ===== */
const cCv=$('confettiCv'),cCx=cCv.getContext('2d');
function sizeCv(){cCv.width=innerWidth;cCv.height=innerHeight}
sizeCv();addEventListener('resize',sizeCv);
let parts=[];
function burstConfetti(color){
  for(let i=0;i<50;i++)parts.push({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*12,vy:-Math.random()*11-3,g:.32,s:4+Math.random()*5,c:color||CANS[Math.floor(Math.random()*6)].color,life:70});
}
(function confLoop(){
  cCx.clearRect(0,0,cCv.width,cCv.height);
  parts=parts.filter(p=>p.life-->0&&p.y<cCv.height+20);
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;
    cCx.fillStyle=p.c;cCx.fillRect(p.x,p.y,p.s,p.s);
  });
  requestAnimationFrame(confLoop);
})();

/* ===== لود اولیه ===== */
renderCoins();renderCart();renderRate();
</script>
