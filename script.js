/* File: script.js */
let currentTheme = 'light';
function toggleTheme(){
  currentTheme = currentTheme === 'light' ? 'dark':'light';
  document.body.setAttribute('data-theme',currentTheme);
}

/* Theme selection on Settings page */
function applyTheme(){
  const val = document.getElementById('themeSelect').value;
  switch(val){
    case 'classic':
      document.documentElement.style.setProperty('--accent','#1a73e8');
      document.documentElement.style.setProperty('--secondary','#34a853');
      break;
    case 'sunset':
      document.documentElement.style.setProperty('--accent','#ff5722');
      document.documentElement.style.setProperty('--secondary','#ff9800');
      break;
    case 'purple':
      document.documentElement.style.setProperty('--accent','#9c27b0');
      document.documentElement.style.setProperty('--secondary','#00bfa5');
      break;
    case 'steel':
      document.documentElement.style.setProperty('--accent','#757575');
      document.documentElement.style.setProperty('--secondary','#333');
      break;
    case 'ocean':
      document.documentElement.style.setProperty('--accent','#00acc1');
      document.documentElement.style.setProperty('--secondary','#1565c0');
      break;
    case 'midnight':
      document.documentElement.style.setProperty('--accent','#eee');
      document.documentElement.style.setProperty('--secondary','#bbb');
      break;
  }
}

/* Contact page service hint update */
function updateHint(){
  const service = document.getElementById('service').value;
  const details = document.getElementById('details');
  switch(service){
    case 'Diagnostics': details.placeholder="Describe the issue and symptoms..."; break;
    case 'Repair': details.placeholder="Explain what needs repairing, symptoms, or errors..."; break;
    case 'Upgrade': details.placeholder="Specify parts you want upgraded or performance goals..."; break;
    case 'Build': details.placeholder="Your budget, needs, and preferred components..."; break;
    case 'Tech Support': details.placeholder="Explain the tech support you require..."; break;
    case 'Mobile Service': details.placeholder="Location & service details..."; break;
    case 'Other': details.placeholder="Describe your request in detail..."; break;
    default: details.placeholder="Describe what you need, your budget, or plan here...";
  }
}

/* Secret game menu Easter egg */
let secretClickCount = 0;
function secretClick(){
  secretClickCount++;
  if(secretClickCount>=5){
    alert("Secret Game Menu Unlocked!"); 
    // Here you can expand to open game overlay with Flappy-bird & Mario clones
    secretClickCount=0;
  }
}
