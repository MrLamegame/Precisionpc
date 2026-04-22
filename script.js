@@ -1,201 +1,1067 @@
-/* ====== helpers ====== */
-const $ = (s, r=document) => r.querySelector(s);
-const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
+/* =============================
+   Precision IT Front-end Script
+   ============================= */
 
-/* ====== year ====== */
-(() => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();
+const $ = (s, r = document) => r.querySelector(s);
+const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
 
-/* ====== mobile nav ====== */
-function toggleNav(){
-  const nav = $('#site-nav'); const btn = $('.nav-toggle');
-  if(!nav || !btn) return;
-  const open = nav.classList.toggle('open');
-  btn.setAttribute('aria-expanded', String(open));
+const STORAGE = {
+  theme: 'pit_theme',
+  accent: 'pit_accent',
+  motion: 'pit_motion',
+  catalog: 'pit_catalog_v3',
+  ownerSecurity: 'pit_owner_security_v2',
+  adminSession: 'pit_admin_session_v2',
+  adminAttempts: 'pit_admin_attempts_v2'
+};
+
+const SECURITY_DEFAULTS = {
+  iterations: 160000,
+  hash: 'SHA-256',
+  sessionMinutes: 30,
+  maxAttempts: 5,
+  lockWindowMs: 15 * 60 * 1000
+};
+
+const APP = {
+  runtimeCatalog: [],
+  runtimeFiltered: [],
+  runtimeUnlocked: false,
+  runtimeSessionTimer: null,
+  runtimeImageDataUrl: '',
+  runtimeEditingId: ''
+};
+
+function uid() {
+  return window.crypto?.randomUUID
+    ? crypto.randomUUID()
+    : `pc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
 }
 
-/* ====== theme + accent ====== */
-const THEME_KEY='ppc_theme', ACCENT_KEY='ppc_accent';
+function setYear() {
+  const y = $('#year');
+  if (y) y.textContent = new Date().getFullYear();
+}
 
-function applyTheme(theme){
+/* =============
+   Theme / Accent
+   ============= */
+function applyTheme(theme) {
   const b = document.body;
-  b.classList.remove('theme-light','theme-auto'); // default dark
-  if(theme==='light') b.classList.add('theme-light');
-  if(theme==='auto') b.classList.add('theme-auto');
-  localStorage.setItem(THEME_KEY, theme);
+  if (!b) return;
+  b.classList.remove('theme-light', 'theme-auto');
+  if (theme === 'light') b.classList.add('theme-light');
+  if (theme === 'auto') b.classList.add('theme-auto');
+  localStorage.setItem(STORAGE.theme, theme);
+}
+
+function setTheme(theme) {
+  applyTheme(theme);
 }
-function setTheme(theme){ applyTheme(theme); }
 
-function setAccent(color){
+function setAccent(color) {
   document.documentElement.style.setProperty('--accent', color);
-  localStorage.setItem(ACCENT_KEY, color);
+  localStorage.setItem(STORAGE.accent, color);
 }
-function resetAccent(){
-  localStorage.removeItem(ACCENT_KEY);
-  document.documentElement.style.setProperty('--accent', '#4f8cff');
-  const p = $('#accentPicker'); if (p) p.value = '#4f8cff';
+
+function resetAccent() {
+  localStorage.removeItem(STORAGE.accent);
+  document.documentElement.style.setProperty('--accent', '#2f6fff');
+  const picker = $('#accentPicker');
+  if (picker) picker.value = '#2f6fff';
 }
 
-/* init theme/accent on load */
-document.addEventListener('DOMContentLoaded', () => {
-  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
-  const saved = localStorage.getItem(ACCENT_KEY);
-  if(saved) document.documentElement.style.setProperty('--accent', saved);
+
+function applyMotion(mode) {
+  document.body.classList.remove('force-reduced-motion');
+  if (mode === 'reduced') document.body.classList.add('force-reduced-motion');
+  localStorage.setItem(STORAGE.motion, mode);
+}
+
+function setMotion(mode) {
+  applyMotion(mode);
+}
+
+function resetSitePreferences() {
+  localStorage.removeItem(STORAGE.theme);
+  localStorage.removeItem(STORAGE.accent);
+  localStorage.removeItem(STORAGE.motion);
+  document.body.classList.remove('theme-light', 'theme-auto', 'force-reduced-motion');
+  document.documentElement.style.setProperty('--accent', '#2f6fff');
   const picker = $('#accentPicker');
-  if(picker){ picker.value = saved || '#4f8cff'; picker.addEventListener('input', e => setAccent(e.target.value)); }
-});
+  if (picker) picker.value = '#2f6fff';
+  alert('Website preferences reset.');
+}
+
+function initThemeAndAccent() {
+  applyTheme(localStorage.getItem(STORAGE.theme) || 'dark');
+  applyMotion(localStorage.getItem(STORAGE.motion) || 'smooth');
+  const saved = localStorage.getItem(STORAGE.accent);
+  if (saved) document.documentElement.style.setProperty('--accent', saved);
+  const picker = $('#accentPicker');
+  if (!picker) return;
+  picker.value = saved || '#2f6fff';
+  picker.addEventListener('input', (e) => setAccent(e.target.value));
+}
+
+/* =================
+   Mobile Navigation
+   ================= */
+function toggleNav() {
+  const nav = $('#site-nav');
+  const btn = $('.nav-toggle');
+  if (!nav || !btn) return;
+  const open = nav.classList.toggle('open');
+  btn.setAttribute('aria-expanded', String(open));
+}
+
+function closeNavOnSelect() {
+  const nav = $('#site-nav');
+  const btn = $('.nav-toggle');
+  if (!nav || !btn) return;
+
+  const close = () => {
+    nav.classList.remove('open');
+    btn.setAttribute('aria-expanded', 'false');
+  };
 
-/* ====== scroll reveal ====== */
-(() => {
-  const io = new IntersectionObserver((ents)=>{
-    ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} });
-  }, {threshold:.18});
-  $$('.section-inview').forEach(el=>io.observe(el));
-})();
-
-/* ====== forms: contact + bug (mailto; email kept in JS only) ====== */
-const CONTACT_TO = 'mrmattgardiner@gmail.com'; // test-only; not printed in HTML
-const mailto = (sub, body) => `mailto:${CONTACT_TO}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
-
-document.addEventListener('DOMContentLoaded', ()=>{
-  const cf = $('#contactForm');
-  if(cf){
-    cf.addEventListener('submit', (e)=>{
+  $$('#site-nav a').forEach((link) => link.addEventListener('click', close));
+  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
+  document.addEventListener('click', (e) => {
+    if (!nav.contains(e.target) && !btn.contains(e.target)) close();
+  });
+
+  const active = $$('#site-nav a').find((a) => a.classList.contains('active'));
+  if (active) active.setAttribute('aria-current', 'page');
+}
+
+/* ======================
+   Smooth Section Reveals
+   ====================== */
+function initReveal() {
+  const sections = $$('.section-inview');
+  if (!sections.length) return;
+  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
+  if (reduce) {
+    sections.forEach((s) => s.classList.add('visible'));
+    return;
+  }
+
+  const observer = new IntersectionObserver((entries) => {
+    entries.forEach((entry) => {
+      if (!entry.isIntersecting) return;
+      entry.target.classList.add('visible');
+      observer.unobserve(entry.target);
+    });
+  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
+
+  sections.forEach((s) => observer.observe(s));
+}
+
+/* ==================
+   Contact / Bug Form
+   ================== */
+function initForms() {
+  const contactEmail = 'mrmattgardiner@gmail.com';
+  const mailto = (subject, body) => `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
+
+  const contactForm = $('#contactForm');
+  if (contactForm) {
+    contactForm.addEventListener('submit', (e) => {
       e.preventDefault();
-      const name = $('#name').value.trim();
-      const contact = $('#contact').value.trim();
-      const service = $('#service').value;
-      const budget = $('#budget').value.trim();
-      const details = $('#details').value.trim();
-      const subject = `Service Request — ${service || 'General'}`;
-      const body = `Name: ${name}
-Contact: ${contact}
-Service: ${service}
-Budget: ${budget || 'n/a'}
-
-Details:
-${details}
-
-— Sent from Precision PC site`;
+      const subject = `Service Request — ${$('#service')?.value || 'General'}`;
+      const body = `Name: ${$('#name')?.value.trim() || ''}\nContact: ${$('#contact')?.value.trim() || ''}\nService: ${$('#service')?.value || ''}\nBudget: ${$('#budget')?.value.trim() || 'n/a'}\n\nDetails:\n${$('#details')?.value.trim() || ''}\n\n— Sent from Precision IT site`;
       window.location.href = mailto(subject, body);
-      cf.reset();
-      alert('Draft opened in your email app. Send it to confirm — thanks!');
+      contactForm.reset();
+      alert('Your email draft is ready. Send it to complete your request.');
     });
   }
 
-  const bf = $('#bugForm');
-  if(bf){
-    bf.addEventListener('submit', (e)=>{
+  const bugForm = $('#bugForm');
+  if (bugForm) {
+    bugForm.addEventListener('submit', (e) => {
       e.preventDefault();
-      const n = $('#bname').value.trim();
-      const c = $('#bcontact').value.trim();
-      const d = $('#bdetails').value.trim();
-      const subject = 'Website Bug Report';
-      const body = `Name: ${n}
-Contact: ${c}
+      const body = `Name: ${$('#bname')?.value.trim() || ''}\nContact: ${$('#bcontact')?.value.trim() || ''}\n\nDetails:\n${$('#bdetails')?.value.trim() || ''}\n\n— Site bug report (Precision IT)`;
+      window.location.href = mailto('Website Bug Report', body);
+      bugForm.reset();
+      alert('Bug report draft created. Thank you.');
+    });
+  }
+}
 
-Details:
-${d}
+/* ============================
+   Admin Security / Auth Logic
+   ============================ */
+function getAttemptsState() {
+  const raw = localStorage.getItem(STORAGE.adminAttempts);
+  if (!raw) return { attempts: 0, lockedUntil: 0 };
+  try {
+    const parsed = JSON.parse(raw);
+    return {
+      attempts: Number(parsed.attempts || 0),
+      lockedUntil: Number(parsed.lockedUntil || 0)
+    };
+  } catch {
+    return { attempts: 0, lockedUntil: 0 };
+  }
+}
 
-— Site bug report (Precision PC)`;
-      window.location.href = mailto(subject, body);
-      bf.reset();
-      alert('Bug draft opened in your email app. Send it to confirm — thanks!');
+function setAttemptsState(next) {
+  localStorage.setItem(STORAGE.adminAttempts, JSON.stringify(next));
+}
+
+function getOwnerSecurity() {
+  const raw = localStorage.getItem(STORAGE.ownerSecurity);
+  if (!raw) return null;
+  try {
+    const parsed = JSON.parse(raw);
+    if (!parsed.salt || !parsed.hash) return null;
+    return {
+      salt: parsed.salt,
+      hash: parsed.hash,
+      iterations: Number(parsed.iterations || SECURITY_DEFAULTS.iterations),
+      createdAt: Number(parsed.createdAt || Date.now()),
+      sessionMinutes: Number(parsed.sessionMinutes || SECURITY_DEFAULTS.sessionMinutes)
+    };
+  } catch {
+    return null;
+  }
+}
+
+function setOwnerSecurity(config) {
+  localStorage.setItem(STORAGE.ownerSecurity, JSON.stringify(config));
+}
+
+function setAdminSession(minutes) {
+  const now = Date.now();
+  const expiresAt = now + minutes * 60 * 1000;
+  sessionStorage.setItem(STORAGE.adminSession, JSON.stringify({ startedAt: now, expiresAt }));
+}
+
+function getAdminSession() {
+  const raw = sessionStorage.getItem(STORAGE.adminSession);
+  if (!raw) return null;
+  try {
+    const parsed = JSON.parse(raw);
+    if (Date.now() >= Number(parsed.expiresAt || 0)) return null;
+    return parsed;
+  } catch {
+    return null;
+  }
+}
+
+function clearAdminSession() {
+  sessionStorage.removeItem(STORAGE.adminSession);
+}
+
+function bytesToBase64(bytes) {
+  let str = '';
+  bytes.forEach((b) => { str += String.fromCharCode(b); });
+  return btoa(str);
+}
+
+function base64ToBytes(base64) {
+  const bin = atob(base64);
+  return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
+}
+
+function randomBytes(size = 16) {
+  const arr = new Uint8Array(size);
+  crypto.getRandomValues(arr);
+  return arr;
+}
+
+async function deriveHash(passphrase, saltBytes, iterations = SECURITY_DEFAULTS.iterations) {
+  const keyMaterial = await crypto.subtle.importKey(
+    'raw',
+    new TextEncoder().encode(passphrase),
+    { name: 'PBKDF2' },
+    false,
+    ['deriveBits']
+  );
+
+  const bits = await crypto.subtle.deriveBits(
+    {
+      name: 'PBKDF2',
+      salt: saltBytes,
+      iterations,
+      hash: SECURITY_DEFAULTS.hash
+    },
+    keyMaterial,
+    256
+  );
+
+  return bytesToBase64(new Uint8Array(bits));
+}
+
+async function createOwnerSecurity(passphrase, sessionMinutes) {
+  const saltBytes = randomBytes(16);
+  const hash = await deriveHash(passphrase, saltBytes, SECURITY_DEFAULTS.iterations);
+  setOwnerSecurity({
+    salt: bytesToBase64(saltBytes),
+    hash,
+    iterations: SECURITY_DEFAULTS.iterations,
+    createdAt: Date.now(),
+    sessionMinutes
+  });
+  setAttemptsState({ attempts: 0, lockedUntil: 0 });
+}
+
+async function verifyOwnerPassphrase(passphrase) {
+  const sec = getOwnerSecurity();
+  if (!sec) return { ok: false, reason: 'not-configured' };
+
+  const attempts = getAttemptsState();
+  const now = Date.now();
+  if (attempts.lockedUntil > now) {
+    return { ok: false, reason: 'locked', retryAt: attempts.lockedUntil };
+  }
+
+  const candidate = await deriveHash(passphrase, base64ToBytes(sec.salt), sec.iterations);
+  if (candidate !== sec.hash) {
+    const nextAttempts = attempts.attempts + 1;
+    let lockedUntil = 0;
+    if (nextAttempts >= SECURITY_DEFAULTS.maxAttempts) {
+      lockedUntil = now + SECURITY_DEFAULTS.lockWindowMs;
+    }
+    setAttemptsState({ attempts: nextAttempts, lockedUntil });
+    return { ok: false, reason: lockedUntil ? 'locked' : 'invalid', retryAt: lockedUntil || 0 };
+  }
+
+  setAttemptsState({ attempts: 0, lockedUntil: 0 });
+  return { ok: true, reason: 'ok' };
+}
+
+/* ==================
+   Catalog Management
+   ================== */
+const defaultCatalog = [
+  {
+    id: uid(),
+    title: 'Precision Apex 1080p',
+    caption: 'Entry-level high FPS esports performance',
+    description: 'Ryzen 5 / RTX 3060 / 16GB DDR4 / 1TB NVMe SSD / Wi‑Fi + Bluetooth.',
+    price: '$899 CAD',
+    stock: 'In Stock',
+    category: 'Gaming',
+    warranty: '6 months support',
+    featured: false,
+    published: true,
+    image: ''
+  },
+  {
+    id: uid(),
+    title: 'Precision Nova 1440p',
+    caption: 'Smooth 1440p ultra settings',
+    description: 'Ryzen 7 / RTX 4070 Super / 32GB DDR5 / 1TB Gen4 SSD / RGB airflow case.',
+    price: '$1,649 CAD',
+    stock: 'Limited',
+    category: 'Gaming',
+    warranty: '12 months support',
+    featured: true,
+    published: true,
+    image: ''
+  },
+  {
+    id: uid(),
+    title: 'Precision Titan Creator',
+    caption: 'Streaming + editing + AAA powerhouse',
+    description: 'Core i7 / RTX 4080 Super / 32GB DDR5 / 2TB NVMe / 850W Gold PSU.',
+    price: '$2,499 CAD',
+    stock: 'In Stock',
+    category: 'Creator',
+    warranty: '12 months support',
+    featured: true,
+    published: true,
+    image: ''
+  }
+];
+
+function getCatalog() {
+  const raw = localStorage.getItem(STORAGE.catalog);
+  if (!raw) return defaultCatalog;
+  try {
+    const parsed = JSON.parse(raw);
+    if (!Array.isArray(parsed)) return defaultCatalog;
+    return parsed.map((item) => ({
+      id: item.id || uid(),
+      title: item.title || '',
+      caption: item.caption || '',
+      description: item.description || '',
+      price: item.price || '',
+      stock: item.stock || 'In Stock',
+      category: item.category || 'Gaming',
+      warranty: item.warranty || '6 months support',
+      featured: Boolean(item.featured),
+      published: item.published !== false,
+      image: item.image || '',
+      createdAt: Number(item.createdAt || Date.now())
+    }));
+  } catch {
+    return defaultCatalog;
+  }
+}
+
+function saveCatalog(catalog) {
+  localStorage.setItem(STORAGE.catalog, JSON.stringify(catalog));
+}
+
+function parsePriceValue(priceText) {
+  const clean = String(priceText || '').replace(/[^0-9.]/g, '');
+  const val = parseFloat(clean);
+  return Number.isFinite(val) ? val : Number.MAX_SAFE_INTEGER;
+}
+
+function sanitizeText(text = '') {
+  return String(text)
+    .replace(/&/g, '&amp;')
+    .replace(/</g, '&lt;')
+    .replace(/>/g, '&gt;')
+    .replace(/"/g, '&quot;')
+    .replace(/'/g, '&#039;');
+}
+
+function buildPublicCardHtml(pc, isAdmin = false) {
+  const safeTitle = sanitizeText(pc.title);
+  const safeCaption = sanitizeText(pc.caption);
+  const safeDescription = sanitizeText(pc.description);
+  const safePrice = sanitizeText(pc.price);
+  const safeStock = sanitizeText(pc.stock || 'In Stock');
+  const safeCategory = sanitizeText(pc.category || 'Gaming');
+  const safeWarranty = sanitizeText(pc.warranty || '6 months support');
+  const featuredBadge = pc.featured ? '<span class="tag featured-tag">Featured</span>' : '';
+
+  return `
+    <article class="pc-item ${pc.featured ? 'featured-card' : ''}">
+      ${pc.image ? `<img class="listing-image" src="${pc.image}" alt="${safeTitle} listing image" loading="lazy" />` : '<div class="listing-image placeholder">No image uploaded</div>'}
+      <div class="pc-meta">
+        <h3>${safeTitle}</h3>
+        <span class="tag">${safePrice}</span>
+      </div>
+      <strong>${safeCaption}</strong>
+      <p class="muted">${safeDescription}</p>
+      <div class="meta-pills"><span class="stock-pill stock-${safeStock.toLowerCase().replace(/\s+/g, '-')}">${safeStock}</span><span class="stock-pill">${safeCategory}</span><span class="stock-pill">${safeWarranty}</span>${featuredBadge}</div>
+      ${isAdmin ? `<div class="actions"><button class="btn btn--ghost" data-edit-id="${pc.id}">Edit</button><button class="btn btn--danger" data-remove-id="${pc.id}">Remove</button><button class="btn btn--ghost" data-toggle-id="${pc.id}">${pc.published === false ? 'Publish' : 'Hide'}</button></div>` : ''}
+    </article>
+  `;
+}
+
+function renderCatalogPublic(list) {
+  const grid = $('#pcCatalog');
+  if (!grid) return;
+  if (!list.length) {
+    grid.innerHTML = '<p class="muted">No listings matched your search.</p>';
+    return;
+  }
+  grid.innerHTML = list.map((pc) => buildPublicCardHtml(pc, APP.runtimeUnlocked)).join('');
+}
+
+function renderAdminRows(list) {
+  const rows = $('#adminListingRows');
+  if (!rows) return;
+  if (!APP.runtimeUnlocked) {
+    rows.innerHTML = '<p class="muted">Unlock admin to manage listings.</p>';
+    return;
+  }
+  if (!list.length) {
+    rows.innerHTML = '<p class="muted">No listings yet.</p>';
+    return;
+  }
+
+  rows.innerHTML = list.map((pc) => `
+    <div class="admin-row">
+      <div>
+        <strong>${sanitizeText(pc.title)}</strong>
+        <p class="muted">${sanitizeText(pc.price)} • ${sanitizeText(pc.stock || 'In Stock')} • ${sanitizeText(pc.category || 'Gaming')} • ${pc.published === false ? 'Hidden' : 'Public'}</p>
+      </div>
+      <div class="actions">
+        <button class="btn btn--ghost" data-edit-id="${pc.id}">Edit</button>
+        <button class="btn btn--danger" data-remove-id="${pc.id}">Remove</button>
+      </div>
+    </div>
+  `).join('');
+}
+
+function bindAdminActions() {
+  const handler = (event) => {
+    const editId = event.target?.dataset?.editId;
+    const removeId = event.target?.dataset?.removeId;
+    const toggleId = event.target?.dataset?.toggleId;
+
+    if (editId) {
+      const listing = APP.runtimeCatalog.find((item) => item.id === editId);
+      if (!listing) return;
+      APP.runtimeEditingId = listing.id;
+      $('#pcId').value = listing.id;
+      $('#pcTitle').value = listing.title;
+      $('#pcCaption').value = listing.caption;
+      $('#pcDescription').value = listing.description;
+      $('#pcPrice').value = listing.price;
+      $('#pcStock').value = listing.stock || 'In Stock';
+      $('#pcCategory').value = listing.category || 'Gaming';
+      $('#pcWarranty').value = listing.warranty || '';
+      $('#pcPublished').value = String(listing.published !== false);
+      $('#pcFeatured').value = String(Boolean(listing.featured));
+      APP.runtimeImageDataUrl = listing.image || '';
+
+      const preview = $('#pcImagePreview');
+      if (preview) {
+        if (APP.runtimeImageDataUrl) {
+          preview.src = APP.runtimeImageDataUrl;
+          preview.hidden = false;
+        } else {
+          preview.hidden = true;
+        }
+      }
+
+      $('#listingFormTitle').textContent = 'Edit Listing';
+      $('#listingSaveBtn').textContent = 'Save Changes';
+      window.scrollTo({ top: $('#adminTools')?.offsetTop || 0, behavior: 'smooth' });
+      return;
+    }
+
+    
+    if (toggleId) {
+      const idx = APP.runtimeCatalog.findIndex((item) => item.id === toggleId);
+      if (idx < 0) return;
+      APP.runtimeCatalog[idx].published = APP.runtimeCatalog[idx].published === false;
+      saveCatalog(APP.runtimeCatalog);
+      refreshCatalogUI();
+      return;
+    }
+
+if (removeId) {
+      if (!APP.runtimeUnlocked) return;
+      const ok = confirm('Remove this listing?');
+      if (!ok) return;
+      APP.runtimeCatalog = APP.runtimeCatalog.filter((item) => item.id !== removeId);
+      saveCatalog(APP.runtimeCatalog);
+      refreshCatalogUI();
+    }
+  };
+
+  $('#pcCatalog')?.addEventListener('click', handler);
+  $('#adminListingRows')?.addEventListener('click', handler);
+}
+
+function applyCatalogFilters() {
+  const q = ($('#catalogSearch')?.value || '').trim().toLowerCase();
+  const sort = $('#catalogSort')?.value || 'newest';
+  const stockFilter = $('#catalogFilterStock')?.value || 'all';
+
+  let list = [...APP.runtimeCatalog];
+
+  if (!APP.runtimeUnlocked) {
+    list = list.filter((item) => item.published !== false);
+  }
+
+  if (stockFilter !== 'all') {
+    list = list.filter((item) => (item.stock || 'In Stock') === stockFilter);
+  }
+
+  if (q) {
+    list = list.filter((item) => {
+      const hay = `${item.title} ${item.caption} ${item.description} ${item.stock} ${item.category || ''} ${item.warranty || ''}`.toLowerCase();
+      return hay.includes(q);
     });
   }
-});
 
-/* ====== Games ====== */
-function loadFlappy(){
-  const mount = $('#game-container'); if(!mount) return;
-  mount.innerHTML = `<canvas id="flappy" width="420" height="640" aria-label="Flappy game canvas"></canvas>`;
-  const c = $('#flappy'), ctx = c.getContext('2d');
-  let bird = {x:80,y:200,w:30,h:24,vy:0};
-  let pipes = []; let score=0; let over=false; const G=0.55, gap=140, pipeW=58, speed=2.2;
+  if (sort === 'price-low') list.sort((a, b) => parsePriceValue(a.price) - parsePriceValue(b.price));
+  if (sort === 'price-high') list.sort((a, b) => parsePriceValue(b.price) - parsePriceValue(a.price));
+  if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
+  if (sort === 'newest') list.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
+
+  APP.runtimeFiltered = list;
+}
+
+function refreshCatalogUI() {
+  applyCatalogFilters();
+  renderCatalogPublic(APP.runtimeFiltered);
+  renderAdminRows(APP.runtimeCatalog);
+  const metrics = $('#adminMetrics');
+  if (metrics) {
+    const total = APP.runtimeCatalog.length;
+    const live = APP.runtimeCatalog.filter((x) => x.published !== false).length;
+    const featured = APP.runtimeCatalog.filter((x) => x.featured).length;
+    metrics.innerHTML = `<span class="stock-pill">Total: ${total}</span><span class="stock-pill">Public: ${live}</span><span class="stock-pill">Featured: ${featured}</span>`;
+  }
+}
+
+/* =======================
+   Image Upload Processing
+   ======================= */
+function readFileAsDataURL(file) {
+  return new Promise((resolve, reject) => {
+    const reader = new FileReader();
+    reader.onload = () => resolve(String(reader.result || ''));
+    reader.onerror = reject;
+    reader.readAsDataURL(file);
+  });
+}
+
+function loadImage(src) {
+  return new Promise((resolve, reject) => {
+    const img = new Image();
+    img.onload = () => resolve(img);
+    img.onerror = reject;
+    img.src = src;
+  });
+}
+
+async function compressImageToDataUrl(file) {
+  const rawUrl = await readFileAsDataURL(file);
+  const img = await loadImage(rawUrl);
+  const maxWidth = 1100;
+  const ratio = Math.min(1, maxWidth / img.width);
+  const width = Math.round(img.width * ratio);
+  const height = Math.round(img.height * ratio);
+  const canvas = document.createElement('canvas');
+  canvas.width = width;
+  canvas.height = height;
+  const ctx = canvas.getContext('2d', { alpha: false });
+  ctx.drawImage(img, 0, 0, width, height);
+  return canvas.toDataURL('image/jpeg', 0.82);
+}
+
+function bindImageUpload() {
+  const input = $('#pcImage');
+  const preview = $('#pcImagePreview');
+  if (!input || !preview) return;
+
+  input.addEventListener('change', async () => {
+    const file = input.files?.[0];
+    if (!file) {
+      APP.runtimeImageDataUrl = '';
+      preview.hidden = true;
+      return;
+    }
+    if (!file.type.startsWith('image/')) {
+      alert('Please upload a valid image file.');
+      input.value = '';
+      return;
+    }
+
+    try {
+      APP.runtimeImageDataUrl = await compressImageToDataUrl(file);
+      preview.src = APP.runtimeImageDataUrl;
+      preview.hidden = false;
+    } catch {
+      alert('Image upload failed. Please try a different file.');
+      input.value = '';
+      APP.runtimeImageDataUrl = '';
+      preview.hidden = true;
+    }
+  });
+}
+
+/* =====================
+   Admin UI State/Logic
+   ===================== */
+function setAdminUI(unlocked) {
+  APP.runtimeUnlocked = unlocked;
+  const tools = $('#adminTools');
+  const status = $('#adminStatus');
+  const hint = $('#unlockHint');
+
+  if (tools) {
+    tools.classList.toggle('visible', unlocked);
+    tools.setAttribute('aria-hidden', String(!unlocked));
+  }
+
+  if (status) status.textContent = unlocked ? 'Unlocked' : 'Locked';
+  if (hint && unlocked) hint.textContent = 'Admin unlocked. Session will auto-lock when it expires.';
+  refreshCatalogUI();
+}
+
+function scheduleSessionTimeout() {
+  if (APP.runtimeSessionTimer) {
+    clearTimeout(APP.runtimeSessionTimer);
+    APP.runtimeSessionTimer = null;
+  }
 
-  const flap = ()=>{ if(over) return; bird.vy = -8.6; };
+  const session = getAdminSession();
+  if (!session) {
+    clearAdminSession();
+    setAdminUI(false);
+    return;
+  }
+
+  const msLeft = Math.max(500, Number(session.expiresAt) - Date.now());
+  APP.runtimeSessionTimer = setTimeout(() => {
+    clearAdminSession();
+    setAdminUI(false);
+    alert('Admin session expired and was locked automatically.');
+  }, msLeft);
+}
+
+function resetListingForm() {
+  APP.runtimeEditingId = '';
+  APP.runtimeImageDataUrl = '';
+  const form = $('#pcForm');
+  form?.reset();
+  const preview = $('#pcImagePreview');
+  if (preview) preview.hidden = true;
+  $('#pcId').value = '';
+  $('#listingFormTitle').textContent = 'Add New Listing';
+  $('#listingSaveBtn').textContent = 'Publish Listing';
+  if ($('#pcCategory')) $('#pcCategory').value = 'Gaming';
+  if ($('#pcPublished')) $('#pcPublished').value = 'true';
+  if ($('#pcFeatured')) $('#pcFeatured').value = 'false';
+}
+
+function bindAdminForms() {
+  const setupForm = $('#ownerSetupForm');
+  const unlockForm = $('#ownerUnlockForm');
+  const lockBtn = $('#adminLockBtn');
+  const listingForm = $('#pcForm');
+  const resetBtn = $('#listingResetBtn');
+
+  setupForm?.addEventListener('submit', async (e) => {
+    e.preventDefault();
+    const pass = $('#ownerPassCreate').value.trim();
+    const confirmPass = $('#ownerPassConfirm').value.trim();
+    const sessionMinutes = Math.max(5, Math.min(240, Number($('#ownerSessionMinutes').value || SECURITY_DEFAULTS.sessionMinutes)));
+
+    if (pass.length < 12) {
+      alert('For security, use at least 12 characters.');
+      return;
+    }
+    if (pass !== confirmPass) {
+      alert('Passphrases do not match.');
+      return;
+    }
+
+    await createOwnerSecurity(pass, sessionMinutes);
+    setupForm.reset();
+    $('#ownerSessionMinutes').value = String(sessionMinutes);
+    alert('Owner security was saved successfully.');
+  });
+
+  unlockForm?.addEventListener('submit', async (e) => {
+    e.preventDefault();
+    const pass = $('#ownerPassUnlock').value.trim();
+    const hint = $('#unlockHint');
+
+    const verify = await verifyOwnerPassphrase(pass);
+    if (!verify.ok) {
+      if (verify.reason === 'not-configured') {
+        alert('Please complete owner setup first.');
+      } else if (verify.reason === 'locked') {
+        const mins = Math.ceil((verify.retryAt - Date.now()) / 60000);
+        if (hint) hint.textContent = `Too many attempts. Try again in about ${Math.max(mins, 1)} minute(s).`;
+        alert('Admin temporarily locked after repeated failed attempts.');
+      } else {
+        const state = getAttemptsState();
+        const left = Math.max(0, SECURITY_DEFAULTS.maxAttempts - state.attempts);
+        if (hint) hint.textContent = `Invalid passphrase. Attempts left before lock: ${left}.`;
+        alert('Invalid passphrase.');
+      }
+      return;
+    }
+
+    const sec = getOwnerSecurity();
+    const minutes = sec?.sessionMinutes || SECURITY_DEFAULTS.sessionMinutes;
+    setAdminSession(minutes);
+    unlockForm.reset();
+    setAdminUI(true);
+    scheduleSessionTimeout();
+  });
+
+  lockBtn?.addEventListener('click', () => {
+    clearAdminSession();
+    setAdminUI(false);
+    scheduleSessionTimeout();
+  });
+
+  resetBtn?.addEventListener('click', resetListingForm);
+
+  listingForm?.addEventListener('submit', (e) => {
+    e.preventDefault();
+    if (!APP.runtimeUnlocked) {
+      alert('Unlock admin first.');
+      return;
+    }
+
+    const item = {
+      id: $('#pcId').value || uid(),
+      title: $('#pcTitle').value.trim(),
+      caption: $('#pcCaption').value.trim(),
+      description: $('#pcDescription').value.trim(),
+      price: $('#pcPrice').value.trim(),
+      stock: $('#pcStock').value,
+      category: $('#pcCategory')?.value || 'Gaming',
+      warranty: $('#pcWarranty')?.value.trim() || '6 months support',
+      featured: $('#pcFeatured')?.value === 'true',
+      published: $('#pcPublished')?.value !== 'false',
+      image: APP.runtimeImageDataUrl || '',
+      createdAt: Date.now()
+    };
+
+    if (!item.title || !item.caption || !item.description || !item.price) {
+      alert('Please fill all required listing fields.');
+      return;
+    }
+
+    const existingIndex = APP.runtimeCatalog.findIndex((x) => x.id === item.id);
+    if (existingIndex >= 0) {
+      item.createdAt = APP.runtimeCatalog[existingIndex].createdAt || Date.now();
+      APP.runtimeCatalog[existingIndex] = item;
+    } else {
+      APP.runtimeCatalog.unshift(item);
+    }
+
+    saveCatalog(APP.runtimeCatalog);
+    refreshCatalogUI();
+    resetListingForm();
+  });
+}
+
+function debounce(fn, wait = 140) {
+  let timer;
+  return (...args) => {
+    clearTimeout(timer);
+    timer = setTimeout(() => fn(...args), wait);
+  };
+}
+
+function bindCatalogToolbar() {
+  const debouncedSearch = debounce(refreshCatalogUI, 160);
+  $('#catalogSearch')?.addEventListener('input', debouncedSearch, { passive: true });
+  $('#catalogSort')?.addEventListener('change', refreshCatalogUI);
+  $('#catalogFilterStock')?.addEventListener('change', refreshCatalogUI);
+
+  $('#removeSoldOutBtn')?.addEventListener('click', () => {
+    if (!APP.runtimeUnlocked) return;
+    APP.runtimeCatalog = APP.runtimeCatalog.filter((x) => (x.stock || 'In Stock') !== 'Sold Out');
+    saveCatalog(APP.runtimeCatalog);
+    refreshCatalogUI();
+  });
+
+  $('#exportCatalogBtn')?.addEventListener('click', () => {
+    if (!APP.runtimeUnlocked) return;
+    const blob = new Blob([JSON.stringify(APP.runtimeCatalog, null, 2)], { type: 'application/json' });
+    const a = document.createElement('a');
+    a.href = URL.createObjectURL(blob);
+    a.download = `precision-it-catalog-${new Date().toISOString().slice(0,10)}.json`;
+    a.click();
+    URL.revokeObjectURL(a.href);
+  });
+
+  $('#importCatalogInput')?.addEventListener('change', async (e) => {
+    if (!APP.runtimeUnlocked) return;
+    const file = e.target.files?.[0];
+    if (!file) return;
+    try {
+      const text = await file.text();
+      const data = JSON.parse(text);
+      if (!Array.isArray(data)) throw new Error('Invalid file');
+      APP.runtimeCatalog = data.map((item) => ({
+        id: item.id || uid(),
+        title: item.title || '',
+        caption: item.caption || '',
+        description: item.description || '',
+        price: item.price || '',
+        stock: item.stock || 'In Stock',
+        category: item.category || 'Gaming',
+        warranty: item.warranty || '6 months support',
+        featured: Boolean(item.featured),
+        published: item.published !== false,
+        image: item.image || '',
+        createdAt: Number(item.createdAt || Date.now())
+      }));
+      saveCatalog(APP.runtimeCatalog);
+      refreshCatalogUI();
+      alert('Catalog imported successfully.');
+    } catch {
+      alert('Import failed. Use a valid exported catalog JSON file.');
+    }
+  });
+}
+
+function initGamingPage() {
+  if (!$('#pcCatalog')) return;
+
+  if (!window.crypto || !window.crypto.subtle) {
+    const panel = $('.admin-panel');
+    if (panel) {
+      const warn = document.createElement('p');
+      warn.className = 'muted';
+      warn.textContent = 'Secure admin mode requires a modern browser with Web Crypto support.';
+      panel.prepend(warn);
+    }
+
+    APP.runtimeCatalog = getCatalog();
+    bindCatalogToolbar();
+    refreshCatalogUI();
+    return;
+  }
+
+  APP.runtimeCatalog = getCatalog();
+  bindCatalogToolbar();
+  bindImageUpload();
+  bindAdminForms();
+  bindAdminActions();
+
+  const hasValidSession = Boolean(getAdminSession());
+  setAdminUI(hasValidSession);
+  scheduleSessionTimeout();
+  refreshCatalogUI();
+}
+
+/* =======
+   Games
+   ======= */
+function loadFlappy() {
+  const mount = $('#game-container');
+  if (!mount) return;
+  mount.innerHTML = '<canvas id="flappy" width="420" height="640" aria-label="Flappy game canvas"></canvas>';
+
+  const c = $('#flappy');
+  const ctx = c.getContext('2d');
+
+  let bird = { x: 80, y: 200, w: 30, h: 24, vy: 0 };
+  let pipes = [];
+  let score = 0;
+  let over = false;
+  const G = 0.55;
+  const gap = 140;
+  const pipeW = 58;
+  const speed = 2.2;
+
+  const flap = () => { if (!over) bird.vy = -8.6; };
   c.addEventListener('pointerdown', flap);
-  window.addEventListener('keydown', e=>{ if(e.code==='Space') flap(); });
+  window.addEventListener('keydown', (e) => { if (e.code === 'Space') flap(); });
 
-  function spawn(){
-    const topH = 40 + Math.random()*(c.height - gap - 120);
-    pipes.push({x:c.width, top:topH, scored:false});
+  function spawn() {
+    pipes.push({ x: c.width, top: 40 + Math.random() * (c.height - gap - 120), scored: false });
   }
+
   let lastSpawn = 0;
 
-  function loop(ts){
-    if(over) return;
-    ctx.clearRect(0,0,c.width,c.height);
+  function loop(ts) {
+    if (over) return;
+
+    ctx.clearRect(0, 0, c.width, c.height);
 
-    // bird
-    bird.vy += G; bird.y += bird.vy;
+    bird.vy += G;
+    bird.y += bird.vy;
     ctx.fillStyle = '#ffd84f';
-    ctx.beginPath(); ctx.ellipse(bird.x, bird.y, bird.w/2, bird.h/2, 0, 0, Math.PI*2); ctx.fill();
+    ctx.beginPath();
+    ctx.ellipse(bird.x, bird.y, bird.w / 2, bird.h / 2, 0, 0, Math.PI * 2);
+    ctx.fill();
+
+    if (ts - lastSpawn > 1700) {
+      spawn();
+      lastSpawn = ts;
+    }
 
-    // pipes
-    if(ts - lastSpawn > 1700){ spawn(); lastSpawn = ts; }
     ctx.fillStyle = '#45a049';
-    for(const p of pipes){
+    for (const p of pipes) {
       p.x -= speed;
       ctx.fillRect(p.x, 0, pipeW, p.top);
       const bottomY = p.top + gap;
       ctx.fillRect(p.x, bottomY, pipeW, c.height - bottomY);
 
-      const hitX = bird.x + bird.w/2 > p.x && bird.x - bird.w/2 < p.x + pipeW;
-      const hitY = bird.y - bird.h/2 < p.top || bird.y + bird.h/2 > bottomY;
-      if(hitX && hitY) over = true;
-      if(!p.scored && p.x + pipeW < bird.x - bird.w/2){ score++; p.scored = true; }
+      const hitX = bird.x + bird.w / 2 > p.x && bird.x - bird.w / 2 < p.x + pipeW;
+      const hitY = bird.y - bird.h / 2 < p.top || bird.y + bird.h / 2 > bottomY;
+      if (hitX && hitY) over = true;
+
+      if (!p.scored && p.x + pipeW < bird.x - bird.w / 2) {
+        score += 1;
+        p.scored = true;
+      }
     }
-    pipes = pipes.filter(p => p.x + pipeW > 0);
 
-    if(bird.y > c.height - 8 || bird.y < 0) over = true;
+    pipes = pipes.filter((p) => p.x + pipeW > 0);
 
-    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui';
+    if (bird.y > c.height - 8 || bird.y < 0) over = true;
+
+    ctx.fillStyle = '#fff';
+    ctx.font = 'bold 22px system-ui';
     ctx.fillText(`Score: ${score}`, 12, 28);
 
-    if(over){
-      ctx.fillText('Game Over — tap to restart', 80, c.height/2);
-      c.addEventListener('pointerdown', ()=>location.reload(), {once:true});
-      window.addEventListener('keydown', ()=>location.reload(), {once:true});
+    if (over) {
+      ctx.fillText('Game Over — tap to restart', 72, c.height / 2);
+      c.addEventListener('pointerdown', () => location.reload(), { once: true });
+      window.addEventListener('keydown', () => location.reload(), { once: true });
       return;
     }
+
     requestAnimationFrame(loop);
   }
+
   requestAnimationFrame(loop);
 }
 
-function loadPlatform(){
-  const mount = $('#game-container'); if(!mount) return;
-  mount.innerHTML = `<canvas id="plat" width="720" height="400" aria-label="Platformer game canvas"></canvas>`;
-  const c = $('#plat'), ctx=c.getContext('2d'); const k={};
-  let player = {x:40,y:320,w:28,h:38,vy:0,on:false};
-  const G=.7, J=-11, S=3.1;
+function loadPlatform() {
+  const mount = $('#game-container');
+  if (!mount) return;
+  mount.innerHTML = '<canvas id="plat" width="720" height="400" aria-label="Platformer game canvas"></canvas>';
+
+  const c = $('#plat');
+  const ctx = c.getContext('2d');
+  const k = {};
+
+  let player = { x: 40, y: 320, w: 28, h: 38, vy: 0, on: false };
+  const G = 0.7;
+  const J = -11;
+  const S = 3.1;
+
   const plats = [
-    {x:0,y:360,w:900,h:40},{x:140,y:300,w:120,h:12},{x:320,y:260,w:120,h:12},
-    {x:520,y:220,w:120,h:12},{x:640,y:320,w:120,h:12},
+    { x: 0, y: 360, w: 900, h: 40 },
+    { x: 140, y: 300, w: 120, h: 12 },
+    { x: 320, y: 260, w: 120, h: 12 },
+    { x: 520, y: 220, w: 120, h: 12 },
+    { x: 640, y: 320, w: 120, h: 12 }
   ];
-  addEventListener('keydown',e=>k[e.code]=true);
-  addEventListener('keyup',e=>k[e.code]=false);
 
-  function step(){
-    ctx.clearRect(0,0,c.width,c.height);
-    ctx.fillStyle='#0e1220'; ctx.fillRect(0,0,c.width,c.height);
+  addEventListener('keydown', (e) => { k[e.code] = true; });
+  addEventListener('keyup', (e) => { k[e.code] = false; });
+
+  function step() {
+    ctx.clearRect(0, 0, c.width, c.height);
+    ctx.fillStyle = '#0e1220';
+    ctx.fillRect(0, 0, c.width, c.height);
 
     player.vy += G;
-    player.x += (k['ArrowRight']||k['KeyD']?S:0) - (k['ArrowLeft']||k['KeyA']?S:0);
+    player.x += (k.ArrowRight || k.KeyD ? S : 0) - (k.ArrowLeft || k.KeyA ? S : 0);
     player.y += player.vy;
 
-    if((k['ArrowUp']||k['Space']||k['KeyW']) && player.on){ player.vy = J; player.on=false; }
+    if ((k.ArrowUp || k.Space || k.KeyW) && player.on) {
+      player.vy = J;
+      player.on = false;
+    }
 
-    ctx.fillStyle='#2e374f'; player.on=false;
-    for(const p of plats){
-      ctx.fillRect(p.x,p.y,p.w,p.h);
-      const withinX = player.x < p.x+p.w && player.x+player.w > p.x;
-      const hitsTop = player.y+player.h >= p.y && player.y+player.h <= p.y+14 && player.vy>=0;
-      if(withinX && hitsTop){ player.y=p.y-player.h; player.vy=0; player.on=true; }
+    player.on = false;
+    ctx.fillStyle = '#2e374f';
+    for (const p of plats) {
+      ctx.fillRect(p.x, p.y, p.w, p.h);
+      const withinX = player.x < p.x + p.w && player.x + player.w > p.x;
+      const hitsTop = player.y + player.h >= p.y && player.y + player.h <= p.y + 14 && player.vy >= 0;
+      if (withinX && hitsTop) {
+        player.y = p.y - player.h;
+        player.vy = 0;
+        player.on = true;
+      }
     }
 
-    ctx.fillStyle='#ff5a7a'; ctx.fillRect(player.x,player.y,player.w,player.h);
+    ctx.fillStyle = '#ff5a7a';
+    ctx.fillRect(player.x, player.y, player.w, player.h);
+
     requestAnimationFrame(step);
   }
+
   step();
 }
+
+/* ==================
+   Global Entrypoint
+   ================== */
+document.addEventListener('DOMContentLoaded', () => {
+  setYear();
+  initThemeAndAccent();
+  closeNavOnSelect();
+  initReveal();
+  initForms();
+  initGamingPage();
+});
