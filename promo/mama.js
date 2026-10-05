// Promo Día de la Madre 2026: banner en la home y en /agente.
// Se muestra solo entre el 5/10 00:00 y el 18/10 23:59 (hora argentina).
// Para verla fuera de fecha: agregar ?promo=ver a la URL.
(function () {
  var DESDE = Date.parse('2026-10-05T00:00:00-03:00');
  var HASTA = Date.parse('2026-10-19T00:00:00-03:00');
  var ahora = Date.now();
  if (!/[?&]promo=ver\b/.test(location.search) && (ahora < DESDE || ahora >= HASTA)) return;
  try { if (sessionStorage.getItem('cm_promo_mama') === 'cerrada') return; } catch (e) {}

  var WA = 'https://wa.me/5491170598505?text=';
  var SUSCRIBIR = WA + encodeURIComponent('Quiero suscribirme');
  var REGALO = WA + encodeURIComponent('REGALO MAMÁ');
  var enAgente = location.pathname.indexOf('/agente') === 0;

  var css = document.createElement('style');
  css.textContent =
    '.cm-mama{position:relative;z-index:60;margin:0 auto;max-width:1180px;padding:0 16px}' +
    '.cm-mama-in{display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin:14px 0;padding:16px 20px;border-radius:18px;' +
    'background:radial-gradient(120% 140% at 0% 0%,rgba(255,92,138,.22),transparent 60%),#0E1118;border:1px solid rgba(255,92,138,.45);' +
    'padding-right:52px;color:#F2F5FA;font:15px/1.45 inherit;box-shadow:0 18px 50px -24px rgba(255,92,138,.55)}' +
    '.cm-mama-flor{font-size:30px;line-height:1}' +
    '.cm-mama-txt{flex:1 1 320px;min-width:0}' +
    '.cm-mama-txt small{display:block;font-size:11.5px;letter-spacing:.16em;color:#FF5C8A;font-weight:700;margin-bottom:3px}' +
    '.cm-mama-txt b{color:#fff}' +
    '.cm-mama-bt{display:flex;gap:8px;flex-wrap:wrap}' +
    '.cm-mama-bt a{display:inline-flex;align-items:center;min-height:42px;padding:0 16px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none;white-space:nowrap}' +
    '.cm-mama-bt .p{background:#FF5C8A;color:#fff}.cm-mama-bt .s{border:1px solid rgba(255,255,255,.28);color:#fff}' +
    '.cm-mama-x{position:absolute;top:22px;right:24px;background:none;border:0;color:#9AA6B8;font-size:20px;cursor:pointer;line-height:1;padding:4px}' +
    '.cm-mama-nota{margin:14px 0 0;padding:12px 14px;border-radius:12px;background:rgba(255,92,138,.12);border:1px solid rgba(255,92,138,.4);font-size:14px;line-height:1.45;color:#F2F5FA}' +
    '.cm-mama-nota b{color:#fff}.cm-mama-nota a{color:#FF8FB0;font-weight:700}' +
    '@media(max-width:640px){.cm-mama-in{padding:16px 16px 14px}.cm-mama-bt{width:100%}.cm-mama-bt a{flex:1;justify-content:center}.cm-mama-x{top:20px;right:22px}}';
  document.head.appendChild(css);

  var caja = document.createElement('aside');
  caja.className = 'cm-mama';
  caja.setAttribute('aria-label', 'Promo Día de la Madre');
  caja.innerHTML =
    '<div class="cm-mama-in"><span class="cm-mama-flor" aria-hidden="true">💐</span>' +
    '<div class="cm-mama-txt"><small>DÍA DE LA MADRE · HASTA EL 18/10</small>' +
    'Te enseñó a no hablar con extraños; hoy los extraños le escriben por WhatsApp. ' +
    '<b>Suscribite y tu mamá tiene 3 meses de protección antiestafas gratis.</b></div>' +
    '<div class="cm-mama-bt"><a class="p" href="' + SUSCRIBIR + '" target="_blank" rel="noopener" data-track="promo_mama_suscribir">Suscribirme y regalar</a>' +
    '<a class="s" href="' + REGALO + '" target="_blank" rel="noopener" data-track="promo_mama_regalo">Ya soy suscriptor</a></div>' +
    '<button class="cm-mama-x" type="button" aria-label="Cerrar">×</button></div>';
  caja.querySelector('.cm-mama-x').addEventListener('click', function () {
    caja.remove();
    try { sessionStorage.setItem('cm_promo_mama', 'cerrada'); } catch (e) {}
  });

  var nota = '💐 <b>Día de la Madre:</b> con tu suscripción, tu mamá tiene <b>3 meses de protección gratis</b>. ' +
    'Cuando tu plan esté activo, escribile a Vera <a href="' + REGALO + '" target="_blank" rel="noopener">REGALO MAMÁ</a> y te manda el regalo listo para reenviar. Hasta el 18/10.';
  function sumarNota(destino) {
    if (!destino || destino.querySelector('.cm-mama-nota')) return;
    var p = document.createElement('p');
    p.className = 'cm-mama-nota';
    p.innerHTML = nota;
    destino.appendChild(p);
  }

  function montar() {
    if (enAgente) {
      var portada = document.getElementById('portada');
      if (portada) portada.parentNode.insertBefore(caja, portada);
      sumarNota(document.getElementById('p-planes'));
      var muro = document.getElementById('muroPaso');
      if (muro) {
        var n = document.createElement('div');
        muro.parentNode.insertBefore(n, muro);
        sumarNota(n);
      }
    } else {
      var main = document.getElementById('inicio') || document.querySelector('main');
      if (main) main.insertBefore(caja, main.firstChild);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar); else montar();
})();
