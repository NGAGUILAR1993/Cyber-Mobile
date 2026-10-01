// Informe mensual imprimible: informe-observatorio.html?mes=2026-09
// Todo el contenido sale de datos.json. Si un dato no existe para el
// período, la sección lo dice en lugar de mostrar valores de ejemplo.
(function () {
  function param(n) { var m = new RegExp('[?&]' + n + '=([^&]+)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; }
  var mesId = param('mes');

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
    'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var PAISES = { AR: 'Argentina', ES: 'España', MX: 'México', CL: 'Chile', CO: 'Colombia', PE: 'Perú',
    UY: 'Uruguay', BR: 'Brasil', US: 'EE.UU.', GB: 'Reino Unido' };
  var CANAL = { MAIL: 'MAIL', WHATSAPP: 'WSP', SMS: 'SMS', REDES: 'REDES', TELEFONO: 'TEL', 'TELÉFONO': 'TEL', MARKETPLACE: 'MKT', APP: 'APP' };
  var CANAL_LARGO = { MAIL: 'Correo', WHATSAPP: 'WhatsApp', SMS: 'SMS', REDES: 'Redes', TELEFONO: 'Teléfono', 'TELÉFONO': 'Teléfono', MARKETPLACE: 'Marketplace', APP: 'Apps' };
  var RC = { alto: 'var(--alto)', medio: 'var(--medio)', bajo: 'var(--bajo)' };
  // Meses de puesta a punto: no se publican ni se usan para comparar (igual que en app.js).
  var EXCLUIDOS = ['2026-08'];
  var COLS = ['var(--verde)', 'var(--oro)', 'var(--bajo)', 'var(--medio)', 'var(--alto)', 'var(--tinta3)'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(sel) { return document.querySelector(sel); }
  function set(sel, txt) { var e = $(sel); if (e) e.textContent = txt; }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function nombreMes(id) {
    if (!id) return '';
    var p = id.split('-'); var m = parseInt(p[1], 10) - 1;
    return (MESES[m] || '') + ' ' + p[0];
  }
  function soloMes(id) { var p = String(id).split('-'); return MESES[parseInt(p[1], 10) - 1] || ''; }
  function capitaliza(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function canalCorto(c) { return CANAL[String(c || '').toUpperCase()] || esc(c); }
  function canalLargo(c) { return CANAL_LARGO[String(c || '').toUpperCase()] || String(c || ''); }
  function ocultar(sel) { var e = $(sel); if (e) { var s = e.closest('.seccion') || e; s.style.display = 'none'; } }

  function pintar(inf, d) {
    var informes = (d.informes || []).filter(function (i) { return EXCLUIDOS.indexOf(i.id) === -1; })
      .slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    var previo = informes.filter(function (i) { return i.id < inf.id; }).pop() || null;
    var top = inf.top || [];
    var mesTxt = capitaliza(nombreMes(inf.id));

    set('[data-periodo]', mesTxt);
    set('[data-edicion]', nombreMes(inf.id));
    set('[data-anio]', inf.id.split('-')[0]);
    document.title = 'Observatorio de Fraude Digital — Informe ' + nombreMes(inf.id);

    set('[data-kpi-monit]', inf.totalModalidades != null ? inf.totalModalidades : top.length);
    set('[data-kpi-emerg]', inf.emergentes != null ? inf.emergentes : '—');
    set('[data-kpi-alto]', inf.riesgo ? inf.riesgo.alto : '—');

    // Canales del Top 10
    var canales = {};
    top.forEach(function (x) { var k = canalLargo(x.canal); canales[k] = (canales[k] || 0) + 1; });
    var listaCanales = Object.keys(canales).map(function (k) { return { k: k, n: canales[k] }; })
      .sort(function (a, b) { return b.n - a.n; });

    // Movimientos respecto del informe anterior
    var movs = [];
    if (previo) {
      var antes = {};
      (previo.top || []).forEach(function (x) { antes[norm(x.nombre)] = x.act; });
      top.forEach(function (x) {
        var a = antes[norm(x.nombre)];
        if (a == null) movs.push({ nombre: x.nombre, delta: null });
        else if (x.act !== a) movs.push({ nombre: x.nombre, delta: x.act - a });
      });
      movs.sort(function (a, b) {
        var da = a.delta == null ? 1000 : Math.abs(a.delta), db = b.delta == null ? 1000 : Math.abs(b.delta);
        return db - da;
      });
    }

    // Resumen
    if (inf.resumen) set('[data-resumen]', inf.resumen);
    else if (top.length) {
      var t = 'En ' + nombreMes(inf.id) + ' el Observatorio siguió ' + (inf.totalModalidades || top.length) +
        ' modalidades de fraude digital' + (inf.riesgo ? ', ' + inf.riesgo.alto + ' de ellas de riesgo alto' : '') + '. ' +
        'Encabezó el ranking ' + top[0].nombre + ' (índice ' + top[0].act + ')' +
        (top[1] ? ', seguida de ' + top[1].nombre + (top[2] ? ' y ' + top[2].nombre : '') : '') + '.';
      set('[data-resumen]', t);
    }

    // Top 10 con barras
    var max = Math.max.apply(null, top.map(function (x) { return x.act; }).concat([1]));
    var t1 = $('[data-tabla-top]');
    if (t1) t1.innerHTML = top.map(function (x) {
      return '<tr><td class="pos">' + x.pos + '</td><td>' + esc(x.nombre) + '</td>' +
        '<td class="canal">' + canalCorto(x.canal) + '</td>' +
        '<td class="barcell"><div class="bar"><div class="track">' +
        '<div class="fill" style="width:' + Math.round(x.act / max * 100) + '%;background:' + (RC[x.riesgo] || 'var(--bajo)') + '"></div>' +
        '</div><span class="val">' + x.act + '</span></div></td></tr>';
    }).join('');
    var t2 = $('[data-tabla-completa]');
    if (t2) t2.innerHTML = top.map(function (x) {
      return '<tr><td class="pos">' + x.pos + '</td><td>' + esc(x.nombre) + '</td>' +
        '<td class="canal">' + canalCorto(x.canal) + '</td>' +
        '<td style="width:34px;text-align:right;font-family:var(--serif);color:' + (RC[x.riesgo] || 'var(--bajo)') + '">' + x.act + '</td></tr>';
    }).join('');

    // Ficha de la modalidad del mes (la descripción se toma de la ficha vigente con el mismo nombre)
    var fi = $('[data-ficha]');
    if (fi && top[0]) {
      var f = top[0];
      var det = f.como ? f : ((d.top10 || []).concat(d.watch || []).filter(function (x) { return norm(x.nombre) === norm(f.nombre); })[0] || {});
      fi.querySelector('.nom').textContent = f.nombre;
      fi.querySelector('.act .num').textContent = f.act;
      var etq = fi.querySelectorAll('.etq');
      if (etq[0]) etq[0].textContent = canalCorto(f.canal);
      if (etq[1]) etq[1].textContent = 'RIESGO ' + String(f.riesgo || '').toUpperCase();
      var ps = fi.querySelectorAll('p');
      if (ps[0]) { if (det.como) ps[0].innerHTML = '<span class="dt">Modus operandi.</span> ' + esc(det.como); else ps[0].style.display = 'none'; }
      if (ps[1]) { if (det.detectar) ps[1].innerHTML = '<span class="dt verde">Cómo reconocerla.</span> ' + esc(det.detectar); else ps[1].style.display = 'none'; }
    }

    // Dona de canales
    var dona = $('[data-dona]'), ley = $('[data-leyenda-canal]');
    if (dona && ley) {
      var C = 2 * Math.PI * 46, off = 0, tot = top.length || 1;
      dona.innerHTML = listaCanales.map(function (c, i) {
        var len = c.n / tot * C;
        var s = '<circle cx="60" cy="60" r="46" fill="none" stroke="' + COLS[i % COLS.length] + '" stroke-width="16" stroke-dasharray="' +
          (len - 1.5).toFixed(1) + ' ' + (C - len + 1.5).toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 60 60)"/>';
        off += len; return s;
      }).join('');
      ley.innerHTML = listaCanales.map(function (c, i) {
        return '<div><span class="pt" style="background:' + COLS[i % COLS.length] + '"></span>' + esc(c.k) + ' ' + Math.round(c.n / tot * 100) + '%</div>';
      }).join('');
      var h = dona.closest('.metrica').querySelector('.h');
      if (h) h.textContent = 'Canal de contacto en el Top 10';
    }

    // Riesgo
    if (inf.riesgo) {
      var r = inf.riesgo, rt = (r.alto + r.medio + r.bajo) || 1, cont = $('[data-riesgo]');
      if (cont) cont.innerHTML = fila('Alto', r.alto, rt, 'var(--alto)') + fila('Medio', r.medio, rt, 'var(--medio)') + fila('Bajo', r.bajo, rt, 'var(--bajo)');
    }

    // Mayores movimientos
    var cm = $('[data-movs]');
    if (cm) {
      cm.innerHTML = !previo
        ? '<div class="fila"><span>Primer informe: sin período anterior para comparar.</span></div>'
        : movs.length
          ? movs.slice(0, 4).map(function (m) {
            return '<div class="fila"><span>' + esc(m.nombre) + '</span>' + (m.delta == null
              ? '<span class="up">nueva</span>'
              : '<span class="' + (m.delta > 0 ? 'up">+' : 'dn">−') + Math.abs(m.delta) + '</span>') + '</div>';
          }).join('') + '<div class="fila" style="border:0"><span style="font-size:9px;color:var(--tinta3)">Respecto de ' + esc(nombreMes(previo.id)) + '</span></div>'
          : '<div class="fila"><span>Sin cambios respecto de ' + esc(nombreMes(previo.id)) + '.</span></div>';
    }

    // Vigilancia e internacional
    var cv = $('[data-vigilancia]');
    if (cv) {
      var vig = inf.watch || [];
      var rot = cv.parentNode.querySelector('.rotulo'); if (rot) rot.textContent = 'EN VIGILANCIA';
      cv.innerHTML = vig.length
        ? vig.slice(0, 4).map(function (x) { return '<div class="fila"><span>' + x.pos + ' · ' + esc(x.nombre) + '</span><span class="v">' + x.act + '</span></div>'; }).join('') +
          (vig.length > 4 ? '<div class="mas">y ' + (vig.length - 4) + ' modalidades más</div>' : '')
        : '<div class="mas">' + (inf.totalModalidades > top.length
          ? (inf.totalModalidades - top.length) + ' modalidades más en seguimiento, fuera del Top 10.'
          : 'Sin modalidades en vigilancia este período.') + '</div>';
    }
    var ci = $('[data-internacional]');
    if (ci) {
      var intl = inf.internacional || [];
      ci.innerHTML = intl.length
        ? intl.slice(0, 6).map(function (x) { return '<div class="fila"><span>' + esc(x.nombre) + '</span><span class="v">' + esc(PAISES[x.pais] || x.pais || 'Exterior') + '</span></div>'; }).join('')
        : '<div class="fila"><span>' + (inf.internacionales ? inf.internacionales + ' modalidades del exterior registradas en el período.' : 'Sin modalidades del exterior este período.') + '</span></div>';
    }
    var sub = t2 && t2.closest('.seccion').querySelector('.subtitulo');
    if (sub) sub.textContent = 'Las modalidades del Top 10, ordenadas por índice de actividad';

    // Evolución: índice de las cuatro principales en los últimos tres períodos registrados
    var serie = informes.filter(function (i) { return i.id <= inf.id; }).slice(-3);
    var g = $('[data-grafico]');
    if (g && serie.length > 1) {
      var lineas = top.slice(0, 4).map(function (x) {
        return { nombre: x.nombre, pts: serie.map(function (s) {
          var hit = (s.top || []).filter(function (y) { return norm(y.nombre) === norm(x.nombre); })[0];
          return hit ? hit.act : null;
        }) };
      });
      var X = function (i) { return serie.length === 1 ? 275 : 105 + i * (340 / (serie.length - 1)); };
      var Y = function (v) { return 120 - v * 1.1; };
      var out = '<line x1="40" y1="10" x2="510" y2="10" stroke="#efe9dc"/><line x1="40" y1="65" x2="510" y2="65" stroke="#efe9dc"/>' +
        '<line x1="40" y1="120" x2="510" y2="120" stroke="var(--linea)"/>' +
        '<text x="32" y="14" text-anchor="end" font-family="monospace" font-size="8" fill="#8c8377">100</text>' +
        '<text x="32" y="68" text-anchor="end" font-family="monospace" font-size="8" fill="#8c8377">50</text>' +
        '<text x="32" y="122" text-anchor="end" font-family="monospace" font-size="8" fill="#8c8377">0</text>' +
        serie.map(function (s, i) { return '<text x="' + X(i) + '" y="134" text-anchor="middle" font-family="monospace" font-size="8" fill="#8c8377">' + soloMes(s.id).toUpperCase() + '</text>'; }).join('');
      var cols = ['var(--alto)', 'var(--verde)', 'var(--oro)', 'var(--bajo)'];
      lineas.forEach(function (l, k) {
        var segs = [], cur = [];
        l.pts.forEach(function (v, i) { if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push(X(i) + ',' + Y(v)); });
        if (cur.length) segs.push(cur);
        segs.forEach(function (sg) { out += '<polyline points="' + sg.join(' ') + '" fill="none" stroke="' + cols[k] + '" stroke-width="2"/>'; });
        l.pts.forEach(function (v, i) { if (v != null) out += '<circle cx="' + X(i) + '" cy="' + Y(v) + '" r="3" fill="' + cols[k] + '"/>'; });
      });
      g.innerHTML = out;
      var gl = $('.grafico-leyenda');
      if (gl) gl.innerHTML = lineas.map(function (l, k) { return '<span><span class="ln" style="background:' + cols[k] + '"></span>' + esc(l.nombre) + '</span>'; }).join('');
      var gs = g.closest('.seccion').querySelector('.subtitulo');
      if (gs) gs.textContent = 'Índice de actividad de las cuatro modalidades principales en los últimos períodos registrados';
    } else if (g) {
      ocultar('[data-grafico]');
    }

    // Lectura del período: solo hechos que surgen de los datos
    var l1 = $('[data-lectura-1]'), l2 = $('[data-lectura-2]');
    if (l1) {
      var subas = movs.filter(function (m) { return m.delta > 0; }).slice(0, 2);
      var nuevas = movs.filter(function (m) { return m.delta == null; });
      l1.textContent = inf.lectura || (previo
        ? (subas.length ? 'Respecto de ' + nombreMes(previo.id) + ', las mayores subas del índice fueron ' +
            subas.map(function (m) { return m.nombre + ' (+' + m.delta + ')'; }).join(' y ') + '.' : 'Ninguna modalidad del Top 10 subió su índice respecto de ' + nombreMes(previo.id) + '.') +
          (nuevas.length ? ' Ingresaron al Top 10: ' + nuevas.map(function (m) { return m.nombre; }).join(', ') + '.' : '')
        : 'Este es el primer informe mensual del Observatorio de Fraude Digital, por lo que todavía no hay un período anterior para comparar variaciones.');
    }
    if (l2) {
      l2.textContent = listaCanales.length
        ? 'Por canal de contacto, el Top 10 se repartió entre ' + listaCanales.map(function (c) { return c.k + ' (' + c.n + ')'; }).join(', ') + '.' +
          (inf.riesgo ? ' ' + inf.riesgo.alto + ' de las ' + (inf.riesgo.alto + inf.riesgo.medio + inf.riesgo.bajo) + ' modalidades clasificadas fueron de riesgo alto.' : '')
        : '';
    }
    document.documentElement.setAttribute('data-listo', '1');
  }

  function fila(et, val, tot, col) {
    return '<div class="riesgo-fila"><span class="et">' + et + '</span>' +
      '<div class="track"><div class="fill" style="width:' + Math.round((val / tot) * 100) + '%;background:' + col + '"></div></div>' +
      '<span class="v">' + val + '</span></div>';
  }

  fetch('datos.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) {
      var informes = d.informes || [];
      var inf = mesId ? informes.filter(function (i) { return i.id === mesId && EXCLUIDOS.indexOf(i.id) === -1; })[0] : informes[0];
      if (inf) pintar(inf, d);
      else throw new Error('sin informe');
    })
    .catch(function () {
      document.body.insertAdjacentHTML('afterbegin',
        '<div style="padding:20px;font-family:sans-serif;color:#a3342b">Informe no disponible para el período solicitado.</div>');
      document.querySelectorAll('.hoja').forEach(function (h) { h.style.display = 'none'; });
      document.documentElement.setAttribute('data-listo', 'error');
    });
})();
