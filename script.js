/* File: script.js */

// Year in footer
document.getElementById('year')?.appendChild(document.createTextNode(new Date().getFullYear()));

// Mobile nav toggle
function toggleNav(){document.getElementById('nav-links')?.classList.toggle('active');}

// Theme switching
function toggleTheme(){
  const body=document.body;
  body.dataset.theme = body.dataset.theme==='light'?'dark':'light';
  localStorage.setItem('theme', body.dataset.theme);
}
function setTheme(theme){
  document.body.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}
document.addEventListener('DOMContentLoaded',()=>{const saved=localStorage.getItem('theme'); if(saved){document.body.dataset.theme=saved;}});

// Secret click -> open game menu
function secretClick(){
  if(confirm('Open secret game menu?')){window.location.href='games.html';}
}

// Contact Form
document.getElementById('contactForm')?.addEventListener('submit',function(e){
  e.preventDefault();
  const name=document.getElementById('name').value;
  const email=document.getElementById('email').value;
  const service=document.getElementById('service').value;
  const details=document.getElementById('details').value;
  document.getElementById('formStatus').textContent=`Thank you ${name}, your request for ${service} was submitted!`;
  this.reset();
});

// Bug Report Form
document.getElementById('bugForm')?.addEventListener('submit',function(e){
  e.preventDefault();
  const name=document.getElementById('bugName').value;
  const email=document.getElementById('bugEmail').value;
  const details=document.getElementById('bugDetails').value;
  document.getElementById('bugStatus').textContent=`Thanks ${name}, your bug report was received!`;
  this.reset();
});

// Games
function startFlappy(){
  const container=document.getElementById('gameContainer');
  container.innerHTML='<p>Flappy Bird clone coming soon!</p>';
}
function startMario(){
  const container=document.getElementById('gameContainer');
  container.innerHTML='<p>Mario-style platformer coming soon!</p>';
}
