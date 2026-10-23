// Controles de seguridad que corren en cada cambio (.github/workflows/seguridad.yml).
// Falla (exit 1) si encuentra algo que no debería publicarse.
//  1. Páginas estáticas generadas (guias/): sin JavaScript ejecutable, sin recursos externos,
//     links externos con rel="noopener".
//  2. vercel.json: JSON válido y cada ruta/encabezado con patrón válido.
//  3. Ningún archivo publicado con nombre o contenido típico de exportaciones de n8n o claves.
//  4. GitHub Actions fijadas a un commit (SHA de 40 caracteres), no a una etiqueta que se puede mover.
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const errores = [];
const mal = (archivo, motivo) => errores.push(`${path.relative(RAIZ, archivo)}: ${motivo}`);

function archivos(dir, ext) {
    const out = [];
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, d.name);
        if (d.isDirectory()) { if (!['node_modules', '.git'].includes(d.name)) out.push(...archivos(p, ext)); }
        else if (!ext || ext.some((e) => d.name.endsWith(e))) out.push(p);
    }
    return out;
}

// 1. HTML estático de las guías
for (const f of archivos(path.join(RAIZ, 'guias'), ['.html'])) {
    const h = fs.readFileSync(f, 'utf8');
    for (const m of h.matchAll(/<script\b([^>]*)>/gi)) if (!/type="application\/ld\+json"/i.test(m[1])) mal(f, 'tiene <script> ejecutable');
    if (/\son[a-z]+\s*=/i.test(h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, ''))) mal(f, 'tiene un manejador de eventos inline (on...=)');
    if (/javascript:/i.test(h)) mal(f, 'tiene un link javascript:');
    for (const m of h.matchAll(/<(?:img|script|link|iframe)\b[^>]*(?:src|href)="(https?:)?\/\/(?!www\.cybermobile\.com\.ar)[^"]*"[^>]*>/gi)) {
        if (!/rel="canonical"/.test(m[0])) mal(f, 'carga un recurso externo: ' + m[0].slice(0, 80));
    }
    for (const m of h.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) if (!/rel="[^"]*noopener/.test(m[0])) mal(f, 'link target=_blank sin rel=noopener');
}

// 2. vercel.json
try {
    const v = JSON.parse(fs.readFileSync(path.join(RAIZ, 'vercel.json'), 'utf8'));
    for (const r of [...(v.headers || []), ...(v.rewrites || []), ...(v.redirects || [])]) {
        if (typeof r.source !== 'string' || !r.source.startsWith('/')) mal(path.join(RAIZ, 'vercel.json'), 'ruta inválida: ' + JSON.stringify(r.source));
    }
    const csp = (v.headers || []).find((h) => h.source === '/(.*)');
    if (!csp || !csp.headers.some((x) => x.key === 'Content-Security-Policy')) mal(path.join(RAIZ, 'vercel.json'), 'falta la CSP general');
    if (!csp || !csp.headers.some((x) => x.key === 'Strict-Transport-Security')) mal(path.join(RAIZ, 'vercel.json'), 'falta HSTS');
} catch (e) { mal(path.join(RAIZ, 'vercel.json'), 'JSON inválido: ' + e.message); }

// 3. Exportaciones de n8n o archivos de claves dentro del repo
for (const f of archivos(RAIZ, ['.json', '.env', '.pem', '.key'])) {
    const n = path.basename(f);
    if (/\.(env|pem|key)$/.test(n) && !n.endsWith('.example')) mal(f, 'archivo de claves en el repositorio');
    if (n.endsWith('.json') && fs.statSync(f).size < 20_000_000) {
        const t = fs.readFileSync(f, 'utf8');
        if (/"nodes"\s*:\s*\[/.test(t) && /"connections"\s*:\s*\{/.test(t) && /n8n-nodes-base\./.test(t)) mal(f, 'parece una exportación de n8n (contiene claves): no se sube al repositorio');
        if (/"(EVOLUTION_API_KEY|MP_ACCESS_TOKEN|OPENAI_API_KEY|GEMINI_API_KEY)"\s*:\s*"[^"]{8,}"/.test(t)) mal(f, 'contiene una clave de API');
    }
}

// 4. Acciones de GitHub fijadas a un commit: una etiqueta (@v4) la puede mover quien controle esa acción.
for (const f of archivos(path.join(RAIZ, '.github', 'workflows'), ['.yml', '.yaml'])) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/^\s*-?\s*uses:\s*([^\s#]+)/gm)) {
        if (!m[1].startsWith('./') && !/@[0-9a-f]{40}$/.test(m[1])) mal(f, `acción sin fijar a un commit: ${m[1]}`);
    }
}

if (errores.length) {
    console.error('Controles de seguridad: ' + errores.length + ' problema(s)\n- ' + errores.join('\n- '));
    process.exit(1);
}
console.log('Controles de seguridad: OK');
