/* ====== helpers ====== */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

/* ====== year ====== */
(() => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

/* ====== mobile nav ====== */
function toggleNav(){
  const nav = $('#site-nav'); const btn = $('.nav-toggle');
  if(!nav || !btn) return;
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
}

/* ====== theme + accent ====== */
const THEME_KEY='ppc_theme', ACCENT_KEY='ppc_accent';

function applyTheme(theme){
  const b = document.body;
  b.classList.remove('theme-light','theme-auto'); // default dark
  if(theme==='light') b.classList.add('theme-light');
  if(theme==='auto') b.classList.add('theme-auto');
  localStorage.setItem(THEME_KEY, theme);
}
function setTheme(theme){ applyTheme(theme); }

function setAccent(color){
  document.documentElement.style.setProperty('--accent', color);
  localStorage.setItem(ACCENT_KEY, color);
}
function resetAccent(){
  localStorage.removeItem(ACCENT_KEY);
  document.documentElement.style.setProperty('--accent', '#4f8cff');
  const p = $('#accentPicker'); if (p) p.value = '#4f8cff';
}

/* init theme/accent on load */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  const saved = localStorage.getItem(ACCENT_KEY);
  if(saved) document.documentElement.style.setProperty('--accent', saved);
  const picker = $('#accentPicker');
  if(picker){ picker.value = saved || '#4f8cff'; picker.addEventListener('input', e => setAccent(e.target.value)); }
});

/* ====== scroll reveal ====== */
(() => {
  const io = new IntersectionObserver((ents)=>{
    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
  }, {threshold:.18});
  $$('.section-inview').forEach(el=>io.observe(el));
})();

/* ====== forms: contact + bug (mailto; email kept in JS only) ====== */
const CONTACT_TO = 'mrmattgardiner@gmail.com'; // test-only; not printed in HTML
const mailto = (sub, body) => `mailto:${CONTACT_TO}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;

document.addEventListener('DOMContentLoaded', ()=>{
  const cf = $('#contactForm');
  if(cf){
    cf.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = $('#name').value.trim();
      const contact = $('#contact').value.trim();
      const service = $('#service').value;
      const budget = $('#budget').value.trim();
      const details = $('#details').value.trim();
      const subject = `Service Request — ${service || 'General'}`;
      const body = `Name: ${name}
Contact: ${contact}
Service: ${service}
Budget: ${budget || 'n/a'}

Details:
${details}

— Sent from Precision PC site`;
      window.location.href = mailto(subject, body);
      cf.reset();
      alert('Draft opened in your email app. Send it to confirm — thanks!');
    });
  }

  const bf = $('#bugForm');
  if(bf){
    bf.addEventListener('submit', (e)=>{
      e.preventDefault();
      const n = $('#bname').value.trim();
      const c = $('#bcontact').value.trim();
      const d = $('#bdetails').value.trim();
      const subject = 'Website Bug Report';
      const body = `Name: ${n}
Contact: ${c}

Details:
${d}

— Site bug report (Precision PC)`;
      window.location.href = mailto(subject, body);
      bf.reset();
      alert('Bug draft opened in your email app. Send it to confirm — thanks!');
    });
  }
});

/* ====== Games ====== */
function loadFlappy(){
  const mount = $('#game-container'); if(!mount) return;
  mount.innerHTML = `<canvas id="flappy" width="420" height="640" aria-label="Flappy game canvas"></canvas>`;
  const c = $('#flappy'), ctx = c.getContext('2d');
  let bird = {x:80,y:200,w:30,h:24,vy:0};
  let pipes = []; let score=0; let over=false; const G=0.55, gap=140, pipeW=58, speed=2.2;

  const flap = ()=>{ if(over) return; bird.vy = -8.6; };
  c.addEventListener('pointerdown', flap);
  window.addEventListener('keydown', e=>{ if(e.code==='Space') flap(); });

  function spawn(){
    const topH = 40 + Math.random()*(c.height - gap - 120);
    pipes.push({x:c.width, top:topH, scored:false});
  }
  let lastSpawn = 0;

  function loop(ts){
    if(over) return;
    ctx.clearRect(0,0,c.width,c.height);

    // bird
    bird.vy += G; bird.y += bird.vy;
    ctx.fillStyle = '#ffd84f';
    ctx.beginPath(); ctx.ellipse(bird.x, bird.y, bird.w/2, bird.h/2, 0, 0, Math.PI*2); ctx.fill();

    // pipes
    if(ts - lastSpawn > 1700){ spawn(); lastSpawn = ts; }
    ctx.fillStyle = '#45a049';
    for(const p of pipes){
      p.x -= speed;
      ctx.fillRect(p.x, 0, pipeW, p.top);
      const bottomY = p.top + gap;
      ctx.fillRect(p.x, bottomY, pipeW, c.height - bottomY);

      const hitX = bird.x + bird.w/2 > p.x && bird.x - bird.w/2 < p.x + pipeW;
      const hitY = bird.y - bird.h/2 < p.top || bird.y + bird.h/2 > bottomY;
      if(hitX && hitY) over = true;
      if(!p.scored && p.x + pipeW < bird.x - bird.w/2){ score++; p.scored = true; }
    }
    pipes = pipes.filter(p => p.x + pipeW > 0);

    if(bird.y > c.height - 8 || bird.y < 0) over = true;

    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui';
    ctx.fillText(`Score: ${score}`, 12, 28);

    if(over){
      ctx.fillText('Game Over — tap to restart', 80, c.height/2);
      c.addEventListener('pointerdown', ()=>location.reload(), {once:true});
      window.addEventListener('keydown', ()=>location.reload(), {once:true});
      return;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function loadPlatform(){
  const mount = $('#game-container'); if(!mount) return;
  mount.innerHTML = `<canvas id="plat" width="720" height="400" aria-label="Platformer game canvas"></canvas>`;
  const c = $('#plat'), ctx=c.getContext('2d'); const k={};
  let player = {x:40,y:320,w:28,h:38,vy:0,on:false};
  const G=.7, J=-11, S=3.1;
  const plats = [
    {x:0,y:360,w:900,h:40},{x:140,y:300,w:120,h:12},{x:320,y:260,w:120,h:12},
    {x:520,y:220,w:120,h:12},{x:640,y:320,w:120,h:12},
  ];
  addEventListener('keydown',e=>k[e.code]=true);
  addEventListener('keyup',e=>k[e.code]=false);

  function step(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle='#0e1220'; ctx.fillRect(0,0,c.width,c.height);

    player.vy += G;
    player.x += (k['ArrowRight']||k['KeyD']?S:0) - (k['ArrowLeft']||k['KeyA']?S:0);
    player.y += player.vy;

    if((k['ArrowUp']||k['Space']||k['KeyW']) && player.on){ player.vy = J; player.on=false; }

    ctx.fillStyle='#2e374f'; player.on=false;
    for(const p of plats){
      ctx.fillRect(p.x,p.y,p.w,p.h);
      const withinX = player.x < p.x+p.w && player.x+player.w > p.x;
      const hitsTop = player.y+player.h >= p.y && player.y+player.h <= p.y+14 && player.vy>=0;
      if(withinX && hitsTop){ player.y=p.y-player.h; player.vy=0; player.on=true; }
    }

    ctx.fillStyle='#ff5a7a'; ctx.fillRect(player.x,player.y,player.w,player.h);
    requestAnimationFrame(step);
  }
  step();
}
