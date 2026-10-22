// Celular 3D de la portada.
// Gira en loop mientras se ve; al bajar un poco (o a los 4 s) se frena de frente y el documento malicioso sale de la pantalla.
// Al volver arriba después de haber bajado (o cuando el bloque vuelve a verse) empieza a girar de nuevo.
// Ahorro: no carga video ni cuadros si el bloque no está a la vista, si el usuario pidió menos movimiento o ahorro de datos.
(() => {
  const box = document.getElementById('v3d'), vid = document.getElementById('v3d-vid'), cv = document.getElementById('v3d-cv');
  if (!box || !vid || !cv) return;
  const base = box.dataset.base, N = 36, cx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData);
  if (still) return;                                   // queda el poster, que ya es la imagen de frente

  const fr = [];
  let loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    const dir = box.clientWidth * (devicePixelRatio || 1) > 760 ? 'e-1080/' : 'e-720/';
    for (let i = 1; i <= N; i++) { const im = new Image(); im.decoding = 'async'; im.src = base + dir + 'f_' + String(i).padStart(4, '0') + '.webp'; fr.push(im); }
  }

  let state = 'spin', auto = false, autoT = 0, e = 0, last = -1, lastT = 0, t0 = 0, idle = 0, visible = false, raf = 0, away = false;
  const prog = () => Math.max(0, Math.min(1, scrollY / (innerHeight * .6)));
  function draw(i) {
    if (!fr.length) return;
    i = Math.max(0, Math.min(N - 1, Math.round(i)));
    if (i === last || !fr[i].complete || !fr[i].naturalWidth) return;
    cx.drawImage(fr[i], 0, 0, cv.width, cv.height); last = i;
  }
  function toEmerge() { load(); if (!fr[0].complete) return; state = 'emerge'; vid.pause(); draw(0); cv.hidden = false; vid.style.visibility = 'hidden'; }
  function toSpin() { state = 'spin'; auto = false; e = 0; last = -1; cv.hidden = true; vid.style.visibility = ''; vid.currentTime = 0; play(); t0 = performance.now(); }
  function play() { if (visible && state !== 'emerge' && !document.hidden) vid.play().catch(() => {}); }
  vid.addEventListener('timeupdate', () => { const t = vid.currentTime; if (state === 'stopping' && t < lastT) toEmerge(); lastT = t; });

  function tick(now) {
    raf = 0; if (!visible) return;
    const p = prog();
    if (state === 'spin' && (p > .02 || now - t0 > 4000)) { if (p <= .02) { auto = true; autoT = now; } state = 'stopping'; load(); }
    if (state === 'emerge') {
      let target = Math.min(1, p / .35);
      if (auto) target = Math.max(target, Math.min(1, (now - autoT) / 1300));
      e += (target - e) * .18; draw(e * (N - 1));
      if (p > .25) away = true;                         // bajó: al volver arriba, gira otra vez
      if (p < .005 && (away || (!auto && e < .02))) { if (++idle > (away ? 20 : 90)) { idle = 0; away = false; toSpin(); } } else idle = 0;
    }
    raf = requestAnimationFrame(tick);
  }

  new IntersectionObserver(([en]) => {
    const was = visible; visible = en.isIntersecting;
    if (visible && !was && state !== 'spin' && vid.preload !== 'none') toSpin();   // volvió a verse: arranca girando
    if (visible) {
      if (vid.preload === 'none') { vid.preload = 'auto'; vid.load(); t0 = performance.now(); setTimeout(load, 2500); }
      play(); if (!raf) raf = requestAnimationFrame(tick);
    } else vid.pause();
  }, { rootMargin: '100px' }).observe(box);
  document.addEventListener('visibilitychange', () => { if (document.hidden) vid.pause(); else play(); });
})();
