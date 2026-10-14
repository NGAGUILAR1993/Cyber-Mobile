// Datos de la alerta semanal (el #1 del ranking del Observatorio) para la tarjeta y el texto de WhatsApp.
// Misma lógica que scripts/alerta-semanal/generar.mjs, pero se calcula en el momento del envío.
export const SITIO = 'https://www.cybermobile.com.ar';

const CANAL = {
    WHATSAPP: { lbl: 'WhatsApp', frase: 'por WhatsApp', pasos: ['No respondas ni abras el link.', 'Bloqueá y reportá el número.', 'Si ya diste datos, llamá a tu banco.'] },
    REDES: { lbl: 'Redes', frase: 'en redes sociales', pasos: ['No transfieras dinero ni hagas clic.', 'Reportá el perfil o la publicación.', 'Si ya pagaste, llamá a tu banco.'] },
    TELEFONO: { lbl: 'Teléfono', frase: 'por teléfono', pasos: ['Cortá la llamada.', 'No instales apps ni compartas pantalla.', 'Si ya diste datos, llamá a tu banco.'] },
    SMS: { lbl: 'SMS', frase: 'por SMS', pasos: ['No abras el link del mensaje.', 'Bloqueá el número y borrá el SMS.', 'Si ya diste datos, llamá a tu banco.'] },
    MAIL: { lbl: 'Email', frase: 'por correo', pasos: ['No abras links ni adjuntos.', 'Marcalo como correo no deseado.', 'Si ya diste datos, llamá a tu banco.'] },
    MARKETPLACE: { lbl: 'Marketplace', frase: 'en marketplaces', pasos: ['No pagues por fuera de la plataforma.', 'Reportá la publicación.', 'Si ya pagaste, llamá a tu banco.'] }
};
CANAL['TELÉFONO'] = CANAL.TELEFONO;
const TILDES = [[/\binversion\b/gi, 'inversión'], [/\bSextorsion\b/g, 'Sextorsión'], [/\bsextorsion\b/g, 'sextorsión'],
    [/\bsuplantacion\b/g, 'suplantación'], [/\bSuplantacion\b/g, 'Suplantación'], [/\bprestamo\b/g, 'préstamo'], [/\bPrestamo\b/g, 'Préstamo'],
    [/\bromantico\b/g, 'romántico'], [/\btelefono\b/g, 'teléfono'], [/\bTelefono\b/g, 'Teléfono']];
export const tildes = (t) => TILDES.reduce((s, [re, r]) => s.replace(re, r), String(t || ''));
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const slugDe = (k) => String(k || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const limpio = (t) => tildes(t).replace(/\s+/g, ' ').trim();

// Corta en la última oración (o palabra) que entra en "max" caracteres.
export function recortar(t, max) {
    t = limpio(t);
    if (t.length <= max) return t;
    const corte = t.slice(0, max);
    const punto = corte.lastIndexOf('. ');
    if (punto > max * 0.5) return corte.slice(0, punto + 1);
    return corte.slice(0, corte.lastIndexOf(' ')) + '…';
}

export function alertaSemanal(datos, claves = {}) {
    const x = (datos.top10 || []).find((t) => Number(t.pos) === 1) || (datos.top10 || [])[0];
    if (!x) return null;
    const c0 = CANAL[String(x.canal || '').toUpperCase()] || { lbl: String(x.canal || ''), frase: '', pasos: ['No respondas ni abras links.', 'Bloqueá el contacto.', 'Si ya diste datos, llamá a tu banco.'] };
    const nombre = limpio(x.nombre);
    const frase = norm(nombre).includes(norm(c0.lbl)) ? '' : c0.frase;
    const clave = claves[String(x.key || '').split('@')[0]] || recortar(x.detectar, 170);
    return {
        mes: (datos.meta && datos.meta.mes) || '',
        slug: slugDe(x.key),
        nombre, frase,
        riesgo: String(x.riesgo || 'medio').toUpperCase(),
        como: limpio(x.como),
        clave: limpio(clave),
        pasos: c0.pasos
    };
}

export function textoWhatsApp(a) {
    const pasos = a.pasos.map((p, i) => `${['1️⃣', '2️⃣', '3️⃣'][i]} ${p}`).join('\n');
    return `🚨 *ALERTA: ${a.nombre}${a.frase ? ' ' + a.frase : ''}*\n_#1 del ranking del Observatorio de Fraude Digital${a.mes ? ' · ' + a.mes : ''}_\n\n`
        + `${recortar(a.como, 420)}\n\n`
        + `✅ *Cómo reconocerla:* ${a.clave}\n\n`
        + `*Si te llegó:*\n${pasos}\n\n`
        + `📲 *¿Te llegó algo así? Verificalo con Vera, 7 días gratis:*\n${SITIO}/vera?o=alerta\n\n`
        + `📊 *Ranking completo:* ${SITIO}/observatorio\n\n`
        + `Reenviá este mensaje a tu familia 🙏`;
}
