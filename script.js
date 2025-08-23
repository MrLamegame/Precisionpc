// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Hamburger menu toggle
function toggleNav() {
  const nav = document.getElementById('nav-links');
  nav.classList.toggle('nav-open');
}

// Theme system
function setTheme(theme) {
  document.body.dataset.theme = theme;
  document.body.style.background = '';
  document.body.style.color = '';
}

function setCustomTheme(color) {
  document.body.style.background = color;
  const brightness = (parseInt(color.substr(1,2),16)*299 +
                      parseInt(color.substr(3,2),16)*587 +
                      parseInt(color.substr(5,2),16)*114) / 1000;
  document.body.style.color = (brightness > 125) ? "#222" : "#f9f9f9";
}

// Secret click to open games (5 clicks)
let secretCounter = 0;
function secretClick() {
  secretCounter++;
  if(secretCounter === 5) window.location.href = "games.html";
}

// Contact and bug forms
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if(contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Form submitted! We'll contact you soon.");
      contactForm.reset();
    });
  }

  const bugForm = document.getElementById('bugForm');
  if(bugForm) {
    bugForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Bug report submitted! Thank you.");
      bugForm.reset();
    });
  }
});

// Game loader functions
function loadFlappy() {
  const container = document.getElementById('game-container');
  container.innerHTML = `<canvas id="flappyCanvas" width="400" height="600"></canvas>`;
  startFlappy();
}

function loadMario() {
  const container = document.getElementById('game-container');
  container.innerHTML = `<canvas id="marioCanvas" width="600" height="400"></canvas>`;
  startMario();
}

// (Flappy and Mario code remains the same as previously provided)
