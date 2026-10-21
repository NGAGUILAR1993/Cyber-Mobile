// Celular 3D de la portada: gira en loop y, al bajar un poco (o a los 4 s), se frena de frente y la alerta sale de la pantalla.
(() => {
  const box = document.getElementById('v3d'), vid = document.getElementById('v3d-vid'), cv = document.getElementById('v3d-cv');
  if (!box || !vid || !cv) return;
  const N = 30, fr = [], cx = cv.getContext('2d');
  const red = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let loaded = false;
  function load() { if (loaded) return; loaded = true; for (let i = 1; i <= N; i++) { const im = new Image(); im.src = '/media/vera3d/e/f_' + String(i).padStart(4, '0') + '.jpg'; fr.push(im); } }
  let state = 'spin', auto = false, autoT = 0, e = 0, last = -1, lastT = 0, t0 = performance.now(), idle = 0;
  const prog = () => Math.max(0, Math.min(1, scrollY / (innerHeight * .6)));
  function draw(i) { if (!fr.length) return; i = Math.max(0, Math.min(N - 1, Math.round(i))); if (i === last || !fr[i].complete) return; cx.drawImage(fr[i], 0, 0, cv.width, cv.height); last = i; }
  function toEmerge() { load(); if (!fr[0].complete) return; state = 'emerge'; vid.pause(); draw(0); cv.hidden = false; vid.style.visibility = 'hidden'; }
  function toSpin() { state = 'spin'; auto = false; e = 0; last = -1; cv.hidden = true; vid.style.visibility = ''; vid.currentTime = 0; vid.play().catch(() => {}); t0 = performance.now(); }
  vid.addEventListener('timeupdate', () => { const t = vid.currentTime; if (state === 'stopping' && t < lastT) toEmerge(); lastT = t; });
  function tick(now) {
    const p = prog();
    if (state === 'spin' && (p > .02 || now - t0 > 4000 || red)) { if (p <= .02) { auto = true; autoT = now; } state = 'stopping'; load(); if (red) toEmerge(); }
    if (state === 'emerge') {
      let target = Math.min(1, p / .35);
      if (auto) target = Math.max(target, Math.min(1, (now - autoT) / 1300));
      e += (target - e) * .18; draw(e * (N - 1));
      if (!auto && p < .005 && e < .02) { if (++idle > 90) { idle = 0; toSpin(); } } else idle = 0;
    }
    requestAnimationFrame(tick);
  }
  setTimeout(load, 2500);
  requestAnimationFrame(tick);
})();
