// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Hamburger menu toggle
function toggleNav() {
  const nav = document.getElementById('nav-links');
  nav.classList.toggle('nav-open');
}

// Theme system
function toggleTheme() {
  const body = document.body;
  body.dataset.theme = body.dataset.theme === 'light' ? 'dark' : 'light';
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
}

// Secret click to open games
let secretCounter = 0;
function secretClick() {
  secretCounter++;
  if(secretCounter === 5) { // Click 5 times to unlock
    window.location.href = "games.html";
  }
}

// Contact form submission
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
      alert("Bug report submitted! Thank you for helping us improve.");
      bugForm.reset();
    });
  }
});

// Game loading
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

// Simple Flappy Bird game
function startFlappy() {
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');

  let bird = { x: 50, y: 150, width: 30, height: 30, gravity: 1.2, velocity: 0 };
  let pipes = [];
  let score = 0;
  let gameOver = false;

  function createPipe() {
    const gap = 120;
    const y = Math.random() * (canvas.height - gap - 100) + 50;
    pipes.push({ x: canvas.width, y: y });
  }

  document.addEventListener('keydown', () => { bird.velocity = -12; });
  setInterval(createPipe, 2000);

  function update() {
    if(gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Pipes
    for(let i=0;i<pipes.length;i++) {
      pipes[i].x -= 2;
      ctx.fillStyle = "green";
      ctx.fillRect(pipes[i].x, 0, 50, pipes[i].y);
      ctx.fillRect(pipes[i].x, pipes[i].y + 120, 50, canvas.height - pipes[i].y - 120);

      // Collision
      if(bird.x < pipes[i].x + 50 && bird.x + bird.width > pipes[i].x &&
         (bird.y < pipes[i].y || bird.y + bird.height > pipes[i].y + 120)) {
        gameOver = true;
        alert("Game Over! Score: " + score);
        return;
      }

      if(pipes[i].x + 50 < bird.x && !pipes[i].scored) {
        score++;
        pipes[i].scored = true;
      }
    }

    // Ground / ceiling
    if(bird.y + bird.height > canvas.height || bird.y < 0) {
      gameOver = true;
      alert("Game Over! Score: " + score);
      return;
    }

    // Score
    ctx.fillStyle = "black";
    ctx.font = "20px Poppins";
    ctx.fillText("Score: " + score, 10, 25);

    requestAnimationFrame(update);
  }

  update();
}

// Simple Mario-style platformer
function startMario() {
  const canvas = document.getElementById('marioCanvas');
  const ctx = canvas.getContext('2d');

  const player = { x: 50, y: 350, width: 30, height: 50, vy: 0, gravity: 1.5, onGround: false };
  const platforms = [{x:0,y:380,width:600,height:20},{x:150,y:300,width:100,height:10},{x:300,y:250,width:100,height:10}];
  let keys = {};

  document.addEventListener('keydown', e => keys[e.key] = true);
  document.addEventListener('keyup', e => keys[e.key] = false);

  function update() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Player physics
    player.vy += player.gravity;
    player.y += player.vy;

    if(keys['ArrowLeft']) player.x -= 3;
    if(keys['ArrowRight']) player.x += 3;
    if(keys['ArrowUp'] && player.onGround) {
      player.vy = -12;
      player.onGround = false;
    }

    // Platforms collision
    player.onGround = false;
    for(let plat of platforms) {
      if(player.x < plat.x + plat.width && player.x + player.width > plat.x &&
         player.y + player.height > plat.y && player.y + player.height < plat.y + plat.height) {
        player.y = plat.y - player.height;
        player.vy = 0;
        player.onGround = true;
      }
      ctx.fillStyle = "brown";
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Draw player
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
  }

  update();
                            }
