// Utilidades compartidas por las páginas de estafas y el sitemap.
// Los archivos con "_" adelante no se publican como funciones en Vercel.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SITIO = 'https://www.cybermobile.com.ar';

let cache = null;
let cacheTs = 0;

// Lee observatorio/datos.json. En Vercel el archivo viaja con la función
// (ver "includeFiles" en vercel.json); cada actualización de n8n genera un
// deploy nuevo, así que siempre está al día.
export function cargarDatos() {
    if (cache && Date.now() - cacheTs < 60_000) return cache;
    const ruta = join(process.cwd(), 'observatorio', 'datos.json');
    cache = JSON.parse(readFileSync(ruta, 'utf8'));
    cacheTs = Date.now();
    return cache;
}

// "phishing_pami" -> "phishing-pami". Se usa la clave (estable entre meses)
// y no el nombre, que puede cambiar de redacción.
export function slugDe(key) {
    return String(key || '')
        .split('@')[0]
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Todas las modalidades nacionales con página propia: ranking + vigilancia.
export function modalidades(d) {
    const top = (d.top10 || []).map((x) => ({ ...x, seccion: 'top' }));
    const watch = (d.watch || []).map((x) => ({ ...x, seccion: 'watch' }));
    const vistos = new Set();
    return top.concat(watch).filter((x) => {
        const s = slugDe(x.key);
        if (!s || vistos.has(s)) return false;
        vistos.add(s);
        x.slug = s;
        return true;
    });
}

const CANAL = {
    WHATSAPP: { lbl: 'WhatsApp', frase: 'por WhatsApp' },
    REDES: { lbl: 'Redes', frase: 'en redes sociales' },
    TELEFONO: { lbl: 'Teléfono', frase: 'por teléfono' },
    'TELÉFONO': { lbl: 'Teléfono', frase: 'por teléfono' },
    SMS: { lbl: 'SMS', frase: 'por SMS' },
    MAIL: { lbl: 'Email', frase: 'por correo' },
    MARKETPLACE: { lbl: 'Marketplace', frase: 'en marketplaces' },
    APP: { lbl: 'App', frase: 'en apps' }
};
export function canal(c) {
    return CANAL[String(c || '').toUpperCase()] || { lbl: String(c || ''), frase: '' };
}

// Corrige tildes frecuentes que llegan sin acentuar desde la recopilación.
const TILDES = [
    [/\binversion\b/gi, 'inversión'], [/\bSextorsion\b/g, 'Sextorsión'], [/\bsextorsion\b/g, 'sextorsión'],
    [/\bfalsificacion\b/gi, 'falsificación'], [/\bsuplantacion\b/g, 'suplantación'], [/\bSuplantacion\b/g, 'Suplantación'],
    [/\bprestamo\b/g, 'préstamo'], [/\bPrestamo\b/g, 'Préstamo'], [/\brapido\b/g, 'rápido'],
    [/\bromantico\b/g, 'romántico'], [/\btelefono\b/g, 'teléfono'], [/\bTelefono\b/g, 'Teléfono']
];
export function conTildes(t) {
    let s = String(t || '');
    for (const [re, rep] of TILDES) s = s.replace(re, rep);
    return s;
}

export function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
