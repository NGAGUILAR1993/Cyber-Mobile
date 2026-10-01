// Informe mensual imprimible: informe-observatorio.html?mes=2026-09
// Todo el contenido sale de datos.json. Si un dato no existe para el
// período, la sección lo dice en lugar de mostrar valores de ejemplo.
(function () {
  function param(n) { var m = new RegExp('[?&]' + n + '=([^&]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; }
  var mesId = param('mes');

  // Meses de puesta a punto: no se publican ni se usan para comparar (igual que en app.js).
  var EXCLUIDOS = ['2026-08'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var CANAL = { MAIL: 'Email', WHATSAPP: 'WhatsApp', SMS: 'SMS', REDES: 'Redes', TELEFONO: 'Teléfono', 'TELÉFONO': 'Teléfono', MARKETPLACE: 'Marketplace', APP: 'App' };
  var RC = { alto: 'var(--alto)', medio: 'var(--medio)', bajo: 'var(--bajo)' };
  var RL = { alto: 'Riesgo alto', medio: 'Riesgo medio', bajo: 'Riesgo bajo' };
  // Mismos pasos por canal que las fichas web (api/estafa.js).
  var PASOS = {
    WHATSAPP: ['No respondas ni abras el link; no compartas códigos que te lleguen por SMS.', 'Bloqueá y reportá el número desde WhatsApp.'],
    REDES: ['No hagas clic ni transfieras dinero por ofertas o premios que llegan por privado.', 'Reportá el perfil o la publicación en la red social.'],
    TELEFONO: ['Cortá. No instales apps ni compartas pantalla porque te lo pide alguien por teléfono.', 'Bloqueá el número.'],
    SMS: ['No abras el link: organismos y bancos no piden datos por SMS.', 'Bloqueá el número y borrá el mensaje.']
  };
  var PASOS_FIJOS = ['Si ya diste datos o transferiste, llamá a tu banco o billetera por sus canales oficiales y cambiá tus claves.', 'Hacé la denuncia y avisá a tu familia.'];
  // Tildes que suelen llegar sin acentuar desde la recopilación (igual que en las fichas web).
  var TILDES = [[/\binversion\b/gi, 'inversión'], [/\bSextorsion\b/g, 'Sextorsión'], [/\bsextorsion\b/g, 'sextorsión'],
    [/\bsuplantacion\b/g, 'suplantación'], [/\bSuplantacion\b/g, 'Suplantación'], [/\bprestamo\b/g, 'préstamo'],
    [/\bPrestamo\b/g, 'Préstamo'], [/\bromantico\b/g, 'romántico'], [/\btelefono\b/g, 'teléfono'], [/\bTelefono\b/g, 'Teléfono']];

  function tildes(t) { var s = String(t || ''); TILDES.forEach(function (r) { s = s.replace(r[0], r[1]); }); return s; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function set(sel, txt) { $$(sel).forEach(function (e) { e.textContent = txt; }); }
  function html(sel, h) { var e = $(sel); if (e) e.innerHTML = h; }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function nombreMes(id) { var p = String(id).split('-'); return (MESES[parseInt(p[1], 10) - 1] || '') + ' ' + p[0]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function canal(c) { return CANAL[String(c || '').toUpperCase()] || String(c || ''); }
  function slug(key) { return String(key || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }

  function pintar(inf, d) {
    var informes = (d.informes || []).filter(function (i) { return EXCLUIDOS.indexOf(i.id) === -1; })
      .slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    var previo = informes.filter(function (i) { return i.id < inf.id; }).pop() || null;
    var esPrimero = !previo;
    var top = (inf.top || []).map(function (x) { var y = {}; for (var k in x) y[k] = x[k]; y.nombre = tildes(x.nombre); return y; });
    // Detalle (cómo opera, cómo reconocerla) tomado de la ficha vigente con el mismo nombre.
    var vigentes = (d.top10 || []).concat(d.watch || []);
    function detalle(x) {
      if (x.como) return x;
      return vigentes.filter(function (v) { return norm(tildes(v.nombre)) === norm(x.nombre); })[0] || {};
    }
    var mesTxt = cap(nombreMes(inf.id));

    document.title = 'Observatorio de Fraude Digital — Informe ' + nombreMes(inf.id);
    set('[data-periodo]', mesTxt);
    set('[data-per]', 'Informe ' + nombreMes(inf.id));
    set('[data-edicion]', nombreMes(inf.id));
    set('[data-anio]', inf.id.split('-')[0]);
    html('[data-badge]', esPrimero ? '<span class="badge">Primer informe mensual</span>' : '');
    set('[data-kpi-monit]', inf.totalModalidades != null ? inf.totalModalidades : top.length);
    set('[data-kpi-alto]', inf.riesgo ? inf.riesgo.alto : '—');
    set('[data-kpi-intl]', inf.internacionales != null ? inf.internacionales : '—');

    // Canales del Top 10
    var canales = {};
    top.forEach(function (x) { var k = canal(x.canal); canales[k] = (canales[k] || 0) + 1; });
    var listaCanales = Object.keys(canales).map(function (k) { return { k: k, n: canales[k] }; }).sort(function (a, b) { return b.n - a.n; });

    // Movimientos respecto del informe anterior
    var movs = [];
    if (previo) {
      var antes = {};
      (previo.top || []).forEach(function (x) { antes[norm(tildes(x.nombre))] = x.act; });
      top.forEach(function (x) {
        var a = antes[norm(x.nombre)];
        if (a == null) movs.push({ nombre: x.nombre, delta: null });
        else if (x.act !== a) movs.push({ nombre: x.nombre, delta: x.act - a });
      });
      movs.sort(function (a, b) { return (b.delta == null ? 1000 : Math.abs(b.delta)) - (a.delta == null ? 1000 : Math.abs(a.delta)); });
    }

    // Resumen de portada
    if (inf.resumen) set('[data-resumen]', inf.resumen);
    else if (top.length) {
      set('[data-resumen]', 'En ' + nombreMes(inf.id) + ' el Observatorio siguió ' + (inf.totalModalidades || top.length) +
        ' modalidades de fraude digital en Argentina. Encabezó el ranking ' + top[0].nombre + ' (índice ' + top[0].act + ')' +
        (top[1] ? ', seguida de ' + top[1].nombre + (top[2] ? ' y ' + top[2].nombre : '') : '') + '.' +
        (listaCanales[0] ? ' ' + listaCanales[0].k + ' fue el canal más frecuente del Top 10 (' + listaCanales[0].n + ' de ' + top.length + ').' : ''));
    }

    // Podio
    html('[data-podio]', top.slice(0, 3).map(function (x) {
      return '<div class="pod"><span class="pos">' + ('0' + x.pos).slice(-2) + '</span><span class="nom">' + esc(x.nombre) + '</span>' +
        '<div class="meta"><span>' + esc(canal(x.canal).toUpperCase()) + '</span><span>' + x.act + '/100</span></div>' +
        '<div class="barra"><i style="width:' + Math.max(0, Math.min(100, x.act)) + '%"></i></div></div>';
    }).join(''));

    // Tabla Top 10
    var max = Math.max.apply(null, top.map(function (x) { return x.act; }).concat([1]));
    html('[data-tabla-top]', top.map(function (x) {
      return '<tr><td class="pos">' + ('0' + x.pos).slice(-2) + '</td><td class="nom">' + esc(x.nombre) + '</td>' +
        '<td class="canal"><span class="chip">' + esc(canal(x.canal)) + '</span></td>' +
        '<td class="barcell"><div class="bar"><div class="track"><div class="fill" style="width:' + Math.round(x.act / max * 100) +
        '%;background:' + (RC[x.riesgo] || 'var(--bajo)') + '"></div></div><span class="val">' + x.act + '</span></div></td></tr>';
    }).join(''));

    // Canales
    var maxC = listaCanales.reduce(function (m, c) { return Math.max(m, c.n); }, 1);
    html('[data-canales]', listaCanales.map(function (c) {
      return '<div class="hb"><span>' + esc(c.k) + '</span><span class="t"><i style="width:' + (c.n / maxC * 100) + '%"></i></span><span class="v">' + c.n + '</span></div>';
    }).join(''));

    // Riesgo
    if (inf.riesgo) {
      var r = inf.riesgo, rt = (r.alto + r.medio + r.bajo) || 1;
      html('[data-riesgo]', [['Alto', r.alto, 'var(--alto)'], ['Medio', r.medio, 'var(--medio)'], ['Bajo', r.bajo, 'var(--bajo)']].map(function (f) {
        return '<div class="hb"><span>' + f[0] + '</span><span class="t"><i style="width:' + (f[1] / rt * 100) + '%;background:' + f[2] + '"></i></span><span class="v">' + f[1] + '</span></div>';
      }).join(''));
    }

    // Movimientos
    html('[data-movs]', !previo
      ? '<p class="nota-p">Primer informe: todavía no hay un período anterior para comparar.</p>'
      : movs.length
        ? movs.slice(0, 4).map(function (m) {
          return '<div class="fila"><span>' + esc(m.nombre) + '</span>' + (m.delta == null ? '<span class="up">nueva</span>'
            : '<span class="' + (m.delta > 0 ? 'up">+' : 'dn">−') + Math.abs(m.delta) + '</span>') + '</div>';
        }).join('')
        : '<p class="nota-p">Sin cambios respecto de ' + esc(nombreMes(previo.id)) + '.</p>');

    // Fichas de las tres principales
    function ficha(x) {
      var det = detalle(x);
      var pasos = (PASOS[String(x.canal || '').toUpperCase()] || ['No respondas ni abras links.', 'Bloqueá el contacto.']).concat(PASOS_FIJOS);
      var url = det.key ? 'cybermobile.com.ar/observatorio/' + slug(det.key) : 'cybermobile.com.ar/observatorio';
      return '<article class="ficha">' +
        '<div class="top"><div><div class="tit"><span class="pos">' + ('0' + x.pos).slice(-2) + '</span><h3>' + esc(x.nombre) + '</h3></div>' +
        '<div class="etqs" style="margin-top:2mm"><span class="chip">' + esc(canal(x.canal)) + '</span>' +
        (x.riesgo ? '<span class="rg">' + (RL[x.riesgo] || '') + '</span>' : '') + '</div></div>' +
        '<div class="idx"><b>' + x.act + '</b><span>ÍNDICE</span></div></div>' +
        (det.detectar ? '<div class="reco"><div class="kick">Cómo reconocerla</div><p>' + esc(tildes(det.detectar)) + '</p></div>' : '') +
        (det.como ? '<div class="como"><div class="kick">Cómo opera</div><p>' + esc(tildes(det.como)) + '</p></div>' : '') +
        '<div><div class="kick" style="font-size:7pt;margin-bottom:1.5mm">Qué hacer si te llegó</div><div class="pasos">' +
        pasos.map(function (p, i) { return '<div><b>' + (i + 1) + '</b><span>' + esc(p) + '</span></div>'; }).join('') + '</div></div>' +
        '<div class="url">Ficha completa: ' + esc(url) + '</div></article>';
    }
    html('[data-fichas-a]', top.slice(0, 2).map(ficha).join(''));
    html('[data-fichas-b]', top.slice(2, 3).map(ficha).join(''));

    // Vigilancia
    var vig = (inf.watch || []);
    var resto = (inf.totalModalidades || 0) - top.length;
    html('[data-vigilancia]', vig.length
      ? vig.slice(0, 6).map(function (x) { return '<div class="fila"><span>' + esc(tildes(x.nombre)) + '</span><span class="mono">' + x.act + '</span></div>'; }).join('')
      : '<p class="nota-p">' + (resto > 0 ? resto + ' modalidades más en seguimiento, fuera del Top 10.' : 'Sin modalidades en vigilancia este período.') +
        (inf.internacionales ? ' Además se registraron ' + inf.internacionales + ' modalidades en el exterior con potencial de llegar al país.' : '') + '</p>');

    // Lectura del período: solo hechos que surgen de los datos
    var subas = movs.filter(function (m) { return m.delta > 0; }).slice(0, 2);
    var nuevas = movs.filter(function (m) { return m.delta == null; });
    set('[data-lectura-1]', inf.lectura || (previo
      ? (subas.length ? 'Respecto de ' + nombreMes(previo.id) + ', las mayores subas fueron ' +
          subas.map(function (m) { return m.nombre + ' (+' + m.delta + ')'; }).join(' y ') + '.' : 'Ninguna modalidad del Top 10 subió respecto de ' + nombreMes(previo.id) + '.') +
        (nuevas.length ? ' Ingresaron al Top 10: ' + nuevas.map(function (m) { return m.nombre; }).join(', ') + '.' : '')
      : 'Este es el primer informe mensual del Observatorio, por lo que todavía no hay un período anterior para comparar variaciones.'));
    set('[data-lectura-2]', listaCanales.length
      ? 'Por canal, el Top 10 se repartió entre ' + listaCanales.map(function (c) { return c.k + ' (' + c.n + ')'; }).join(', ') + '.' +
        (inf.riesgo ? ' ' + inf.riesgo.alto + ' de las ' + (inf.riesgo.alto + inf.riesgo.medio + inf.riesgo.bajo) + ' modalidades clasificadas fueron de riesgo alto.' : '')
      : '');

    document.documentElement.setAttribute('data-listo', '1');
  }

  fetch('datos.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      var informes = d.informes || [];
      var inf = mesId ? informes.filter(function (i) { return i.id === mesId && EXCLUIDOS.indexOf(i.id) === -1; })[0] : informes[0];
      if (!inf) throw new Error('sin informe');
      pintar(inf, d);
    })
    .catch(function () {
      document.body.insertAdjacentHTML('afterbegin',
        '<div style="padding:20px;font-family:sans-serif;color:#C2410C">Informe no disponible para el período solicitado.</div>');
      $$('.hoja').forEach(function (h) { h.style.display = 'none'; });
      document.documentElement.setAttribute('data-listo', 'error');
    });
})();
