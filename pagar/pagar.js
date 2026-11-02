// Checkout internacional de Vera (Paddle Billing).
// El token de abajo es el CLIENT-SIDE TOKEN de Paddle: es PÚBLICO, va en el frontend (no es la API key secreta).
// Los Price ID también son públicos.
// PASO A PRODUCCIÓN: quitar Paddle.Environment.set('sandbox'), poner el token 'live_...' y los Price ID de producción.
(function () {
  var ENTORNO = 'sandbox';                                   // 'sandbox' | producción: borrar esta línea de set()
  var TOKEN = 'test_7ae130f5f2c230fa34c596f7fb9';            // client-side token (público)
  var PRECIOS = {
    individual: 'pri_01m6ev8f3ftc2jznq5fss0z452',           // USD 5/mes
    familiar: 'pri_01m6ev9s2xht4ks2y7wve6kmvx'              // USD 10/mes (hasta 5 personas)
  };

  var estado = document.getElementById('estado');
  function msg(t, clase) { if (estado) { estado.textContent = t || ''; estado.className = clase || ''; } }

  var listo = false;
  try {
    if (typeof Paddle !== 'undefined') {
      if (ENTORNO === 'sandbox') Paddle.Environment.set('sandbox');
      Paddle.Initialize({
        token: TOKEN,
        eventCallback: function (ev) {
          if (!ev || !ev.name) return;
          if (ev.name === 'checkout.completed') {
            msg('¡Listo! Tu suscripción quedó registrada. En breve te llega la confirmación por mail.', 'ok');
          } else if (ev.name === 'checkout.closed') {
            msg('');
          }
        }
      });
      listo = true;
    }
  } catch (e) { listo = false; }

  function abrir(plan) {
    var pid = PRECIOS[plan];
    if (!listo || !pid) { msg('No se pudo abrir el pago. Probá de nuevo o escribinos a info@cybermobile.com.ar', 'err'); return; }
    msg('');
    try {
      Paddle.Checkout.open({ items: [{ priceId: pid, quantity: 1 }], settings: { displayMode: 'overlay', theme: 'dark', locale: 'es' } });
    } catch (e) { msg('No se pudo abrir el pago. Probá de nuevo en un rato.', 'err'); }
  }

  document.querySelectorAll('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function () { abrir(b.dataset.plan); });
  });

  // Si llega con ?plan=individual|familiar, resalta ese plan (no abre solo, para no chocar con el bloqueador de pop-ups).
  try {
    var qp = new URLSearchParams(location.search).get('plan');
    if (qp && PRECIOS[qp]) {
      var b = document.querySelector('[data-plan="' + qp + '"]');
      if (b) b.classList.add('dest');
    }
  } catch (e) { /* sin query */ }

  if (!listo) msg('No se pudo cargar el procesador de pagos. Revisá tu conexión y recargá.', 'err');
})();
