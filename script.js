// Christmas card: particle tree (spinning 3D spiral), twinkling sky, layered snow, wishes and shareable cards.
//   ?to=Name&from=You&msg=...   opens the page as a personal card
const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const to = (params.get('to') || '').trim().slice(0, 40), from = (params.get('from') || '').trim().slice(0, 40), msg = (params.get('msg') || '').trim().slice(0, 90);

const WISHES = ['Wishing you joy and peace', 'May your days be merry and bright', 'Stay warm and cozy', 'Peace on earth, cocoa in hand',
  'Here’s to slow mornings and full hearts', 'May all your bugs be features', 'Happy holidays from my heart to yours'];
const LOVE = ['I love you so much baeee! 🎅', 'Moahzzz 🎊'];          // the original page's lines, only on personal cards
const wishes = to ? [...(msg ? [msg] : []), ...WISHES.slice(0, 4), ...LOVE] : WISHES;

if (to) { const d = $('#dear'); d.hidden = false; d.textContent = `Dear ${to},`; document.title = `Merry Christmas, ${to} ✦`; }
if (from) { const f = $('#from'); f.hidden = false; f.textContent = `— with love, ${from}`; }

let wi = 0;
const showWish = () => { $('#wish').textContent = wishes[wi % wishes.length]; };
showWish();
setInterval(() => { const w = $('#wish'); w.classList.add('swap'); setTimeout(() => { wi++; showWish(); w.classList.remove('swap'); }, 600); }, 4800);

// days until Christmas (viewer's local date)
(function chip() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  let text;
  if (m === 11 && d === 24) text = 'It’s Christmas Eve ✦';
  else if (m === 11 && d === 25) text = 'It’s Christmas Day ✦';
  else {
    const xmas = new Date(m === 11 && d > 25 ? y + 1 : y, 11, 25), today = new Date(y, m, d);
    const n = Math.round((xmas - today) / 864e5);
    text = `${n} ${n === 1 ? 'sleep' : 'sleeps'} until Christmas`;
  }
  $('#chip').textContent = text;
})();

// ---------- canvas ----------
const c = $('#sky'), x = c.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W, H, DPR, tree;
const stars = [], flakes = [], shooting = [], sparks = [];
function size() {
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  c.width = W * DPR; c.height = H * DPR; x.setTransform(DPR, 0, 0, DPR, 0, 0);
  const top = $('.card').getBoundingClientRect().bottom + 18;
  const base = H * .86, h = Math.max(160, Math.min(base - top, H * .52));
  tree = { cx: W / 2, base, top: base - h, h, R: Math.min(h * .42, W * .36) };
  stars.length = 0;
  for (let i = 0; i < Math.round(W * H / 5200); i++) stars.push({ x: Math.random() * W, y: Math.random() * H * .75, r: Math.random() * 1.3 + .2, p: Math.random() * 6.28, s: .5 + Math.random() * 1.5 });
  flakes.length = 0;
  for (let i = 0; i < Math.round(W / (W < 600 ? 9 : 7)); i++) flakes.push(flake(true));
}
function flake(any) {
  const z = Math.random();                        // depth: 0 far .. 1 near
  return { x: Math.random() * W, y: any ? Math.random() * H : -10, z, r: .6 + z * 2.6, vy: .25 + z * 1.1, sw: Math.random() * 6.28, a: .35 + z * .55 };
}

// tree particles: a cone spiral (garland) + scattered needles + ornaments
const N = 900, parts = [];
for (let i = 0; i < N; i++) {
  const t = Math.random() ** .8;                 // 0 top .. 1 bottom, denser near the base
  const kind = i % 9 === 0 ? 'orn' : i % 3 === 0 ? 'garland' : 'needle';
  const ang = kind === 'garland' ? t * 6.28 * 7 : Math.random() * 6.28;
  const rr = kind === 'needle' ? .55 + Math.random() * .45 : 1;
  const orn = ['#ff5a5a', '#ffd36b', '#8fd3ff', '#ff9ed0', '#ffffff'][i % 5];
  parts.push({ t, ang, rr, kind, col: kind === 'orn' ? orn : kind === 'garland' ? '#ffe7a3' : (Math.random() < .5 ? '#5fe0a0' : '#2fbf86'), ph: Math.random() * 6.28 });
}

let rot = 0, last = performance.now(), boost = 0;
function frame(now) {
  const dt = Math.min(50, now - last) / 16.7; last = now;
  x.clearRect(0, 0, W, H);
  // stars
  for (const s of stars) { const a = .35 + .65 * Math.abs(Math.sin(now / 1000 * s.s + s.p)); x.globalAlpha = a; x.fillStyle = '#e8eeff'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill(); }
  x.globalAlpha = 1;
  // shooting stars
  for (let i = shooting.length - 1; i >= 0; i--) {
    const s = shooting[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= .012 * dt;
    if (s.life <= 0) { shooting.splice(i, 1); continue; }
    const g = x.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
    g.addColorStop(0, `rgba(255,243,207,${s.life})`); g.addColorStop(1, 'rgba(255,243,207,0)');
    x.strokeStyle = g; x.lineWidth = 2.2; x.beginPath(); x.moveTo(s.x, s.y); x.lineTo(s.x - s.vx * 14, s.y - s.vy * 14); x.stroke();
  }
  // tree glow
  const { cx, base, top, h, R } = tree;
  const glow = x.createRadialGradient(cx, base - h * .45, 10, cx, base - h * .45, R * 1.6);
  glow.addColorStop(0, 'rgba(255,214,120,.16)'); glow.addColorStop(1, 'rgba(255,214,120,0)');
  x.fillStyle = glow; x.fillRect(cx - R * 2, top - 40, R * 4, h + 80);
  // particles, back to front
  rot += (.006 + boost * .05) * dt; boost *= .96;
  const pts = parts.map(p => {
    const a = p.ang + rot, r = (p.t * R) * p.rr;
    const z = Math.sin(a), px = cx + Math.cos(a) * r, py = top + p.t * h + z * r * .12;
    return { p, px, py, z };
  }).sort((a, b) => a.z - b.z);
  x.globalCompositeOperation = 'lighter';
  for (const { p, px, py, z } of pts) {
    const depth = .45 + .55 * (z + 1) / 2;
    const tw = p.kind === 'orn' ? .6 + .4 * Math.sin(now / 400 + p.ph) : 1;
    const size = (p.kind === 'orn' ? 3.4 : p.kind === 'garland' ? 1.9 : 1.6) * (.7 + depth * .6);
    x.globalAlpha = depth * tw * (p.kind === 'needle' ? .8 : 1);
    x.fillStyle = p.col; x.beginPath(); x.arc(px, py, size, 0, 7); x.fill();
    if (p.kind !== 'needle' && depth > .7) { x.globalAlpha = .18 * depth * tw; x.beginPath(); x.arc(px, py, size * 3.5, 0, 7); x.fill(); }
  }
  // star on top
  const sp = 1 + .08 * Math.sin(now / 500);
  x.globalAlpha = 1;
  const sg = x.createRadialGradient(cx, top - 6, 0, cx, top - 6, 46 * sp);
  sg.addColorStop(0, 'rgba(255,240,190,.9)'); sg.addColorStop(.25, 'rgba(255,210,110,.35)'); sg.addColorStop(1, 'rgba(255,210,110,0)');
  x.fillStyle = sg; x.beginPath(); x.arc(cx, top - 6, 46 * sp, 0, 7); x.fill();
  x.globalCompositeOperation = 'source-over';
  x.save(); x.translate(cx, top - 6); x.rotate(Math.sin(now / 1500) * .08); x.scale(sp, sp);
  x.fillStyle = '#fff1c2'; x.beginPath();
  for (let k = 0; k < 10; k++) { const rr = k % 2 ? 6 : 15, a = -Math.PI / 2 + k * Math.PI / 5; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  x.closePath(); x.fill(); x.restore();
  // sparks from taps
  x.globalCompositeOperation = 'lighter';
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]; s.vx *= .97; s.vy = s.vy * .97 + .05; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= .02 * dt;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    x.globalAlpha = s.life; x.fillStyle = s.c; x.beginPath(); x.arc(s.x, s.y, 1.8, 0, 7); x.fill();
  }
  x.globalCompositeOperation = 'source-over';
  // snow (near flakes on top)
  for (const f of flakes) {
    f.sw += .01 * dt; f.y += f.vy * dt; f.x += Math.sin(f.sw) * .4 * f.z * dt;
    if (f.y > H + 10) Object.assign(f, flake(false));
    x.globalAlpha = f.a; x.fillStyle = '#ffffff'; x.beginPath(); x.arc(f.x, f.y, f.r, 0, 7); x.fill();
  }
  x.globalAlpha = 1;
  if (!reduce) requestAnimationFrame(frame);
}
size(); addEventListener('resize', size);
requestAnimationFrame(frame);

// interactions
function sparkle(px, py, n = 40) {
  const cols = ['#ffd36b', '#ffffff', '#ff9ed0', '#8fd3ff'];
  for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, v = 1 + Math.random() * 4; sparks.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, c: cols[k % 4] }); }
}
addEventListener('pointerdown', e => {
  if (e.target.closest('button, a, dialog, input')) return;
  boost = 1; sparkle(e.clientX, e.clientY);
});
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }
$('#wish-btn').onclick = () => {
  shooting.push({ x: W * (.15 + Math.random() * .3), y: H * (.06 + Math.random() * .12), vx: 9, vy: 3.2, life: 1 });
  boost = 1.2; sparkle(tree.cx, tree.top - 6, 60);
  toast('Your wish is on its way ✦');
};

// card maker
const dlg = $('#maker');
$('#card-btn').onclick = () => { dlg.showModal(); setTimeout(() => $('#to-in').focus(), 50); };
$('#cancel-btn').onclick = () => dlg.close();
$('#maker-form').addEventListener('submit', async e => {
  e.preventDefault();
  const u = new URL(location.origin + location.pathname);
  u.searchParams.set('to', $('#to-in').value.trim());
  if ($('#from-in').value.trim()) u.searchParams.set('from', $('#from-in').value.trim());
  if ($('#msg-in').value.trim()) u.searchParams.set('msg', $('#msg-in').value.trim());
  dlg.close();
  if (navigator.share && matchMedia('(pointer: coarse)').matches) { try { await navigator.share({ title: 'Merry Christmas ✦', url: u.href }); return; } catch {} }
  try { await navigator.clipboard.writeText(u.href); toast('Card link copied — send it with love ✦'); }
  catch { prompt('Copy this link:', u.href); }
});
