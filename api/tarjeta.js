// Tarjetas para WhatsApp (PNG 1080x1350), armadas en el momento:
//   /tarjetas/semana-AAAAMMDD.png        → alerta del lunes: el #1 del ranking del Observatorio.
//   /tarjetas/caso/<datos>.<firma>.png   → "Estafa detectada": tipo y señales que encontró Vera.
// La de caso solo la puede pedir n8n: <datos> va firmado con N8N_SHARED_SECRET (el CM_SHARED_SECRET
// de n8n), así nadie puede fabricar una tarjeta con el nombre de Cyber Mobile y un texto inventado.
// El texto se limpia otra vez acá: sin links, sin números largos, sin mails ni @usuarios.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from '@vercel/og';
import { alertaSemanal, recortar } from './_lib/alerta.js';

const RAIZ = process.cwd();
const leer = (p) => fs.readFileSync(path.join(RAIZ, p));
let recursos;
function cargar() {
    if (recursos) return recursos;
    const png = (p) => 'data:image/png;base64,' + leer(p).toString('base64');
    recursos = {
        fuentes: [
            { name: 'Anton', data: leer('scripts/redes/fuentes/Anton-Regular.ttf'), weight: 400, style: 'normal' },
            { name: 'Grotesk', data: leer('tarjetas/fuentes/SpaceGrotesk-Regular.ttf'), weight: 400, style: 'normal' },
            { name: 'Grotesk', data: leer('tarjetas/fuentes/SpaceGrotesk-Bold.ttf'), weight: 700, style: 'normal' },
            { name: 'Mono', data: leer('tarjetas/fuentes/JetBrainsMono-Medium.ttf'), weight: 400, style: 'normal' }
        ],
        logo: png('logo-cm.png'),
        qr: { tarjeta: png('tarjetas/img/qr-tarjeta.png'), alerta: png('tarjetas/img/qr-alerta.png') }
    };
    return recursos;
}

// ---------- Texto seguro ----------
export function limpiarTexto(t, max) {
    let s = String(t || '')
        .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, ' ')
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, 'un mail')
        .replace(/@[A-Za-z0-9_.]{2,}/g, 'una cuenta')
        .replace(/\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|ar|io|app|info|xyz|buzz|top|online|site|shop|store|link|club|me|co|cc|bond|live|lat|vip)(?:\.[a-z]{2})?\b\S*/gi, 'un link')
        .replace(/[\d][\d\s().-]{4,}\d/g, (m) => (m.replace(/\D/g, '').length >= 6 ? 'un número' : m))
        .replace(/[*_~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    return recortar(s, max);
}

const b64u = (s) => Buffer.from(s, 'utf8').toString('base64url');
export function firmar(datos, secreto) {
    return crypto.createHmac('sha256', secreto).update('tarjeta-v1.' + datos).digest('hex').slice(0, 32);
}
export function codificarCaso(caso, secreto) {
    const d = b64u(JSON.stringify(caso));
    return `${d}.${firmar(d, secreto)}`;
}
function leerCaso(d, s, secreto) {
    if (!/^[A-Za-z0-9_-]{8,1500}$/.test(d || '') || !/^[a-f0-9]{32}$/.test(s || '')) return null;
    const esperada = firmar(d, secreto);
    if (!crypto.timingSafeEqual(Buffer.from(esperada), Buffer.from(s))) return null;
    try {
        const c = JSON.parse(Buffer.from(d, 'base64url').toString('utf8'));
        const fecha = /^\d{4}-\d{2}-\d{2}$/.test(c.f || '') ? c.f : '';
        const tipo = limpiarTexto(c.t, 70) || 'Mensaje sospechoso';
        const senales = (Array.isArray(c.s) ? c.s : []).map((x) => limpiarTexto(x, 95)).filter((x) => x.length > 8).slice(0, 3);
        return { fecha, tipo, senales };
    } catch { return null; }
}

// ---------- Diseño ----------
const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children: children.flat().filter((c) => c !== null && c !== false && c !== undefined) } });
const img = (src, w, hgt, style = {}) => ({ type: 'img', props: { src, width: w, height: hgt, style } });
const C = { fondo: '#06080d', rojo: '#ff3b3b', cian: '#33c6e8', blanco: '#ffffff', gris: '#b9c0cc', caja: 'rgba(255,255,255,0.05)' };

function marco(r, chip, cuerpo, qrTitulo, qr) {
    return h('div', {
        width: 1080, height: 1350, flexDirection: 'column', padding: '56px 68px', color: C.blanco, fontFamily: 'Grotesk',
        backgroundColor: C.fondo,
        backgroundImage: 'radial-gradient(circle at 88% 6%, rgba(255,59,59,0.30), rgba(6,8,13,0) 48%), linear-gradient(180deg, #0c1018 0%, #06080d 100%)'
    },
    h('div', { alignItems: 'center' },
        img(r.logo, 58, 58, { borderRadius: 12 }),
        h('div', { marginLeft: 22, fontFamily: 'Mono', fontSize: 26, letterSpacing: 8, color: C.cian }, 'CYBER MOBILE')),
    h('div', { marginTop: 30 },
        h('div', { backgroundColor: C.rojo, borderRadius: 8, padding: '10px 20px', fontFamily: 'Mono', fontSize: 25, letterSpacing: 4, color: C.blanco }, chip)),
    h('div', { flexDirection: 'column', flexGrow: 1, flexShrink: 1, overflow: 'hidden', paddingBottom: 18 }, cuerpo),
    h('div', { alignItems: 'center', border: `3px solid ${C.cian}`, borderRadius: 24, padding: 22, backgroundColor: 'rgba(8,24,32,0.85)' },
        img(qr, 158, 158, { borderRadius: 12 }),
        h('div', { flexDirection: 'column', marginLeft: 34 },
            h('div', { fontFamily: 'Anton', fontSize: 46, color: C.blanco }, qrTitulo),
            h('div', { fontSize: 27, color: C.gris, marginTop: 4 }, 'Verificalo en segundos con Vera, 7 días gratis.'),
            h('div', { fontFamily: 'Mono', fontSize: 28, color: C.cian, marginTop: 8 }, 'cybermobile.com.ar/vera'))));
}

const etiqueta = (t) => h('div', { fontFamily: 'Mono', fontSize: 22, letterSpacing: 5, color: C.cian, marginBottom: 10 }, t);

function tarjetaCaso(r, caso) {
    const fecha = caso.fecha ? ' · ' + caso.fecha.slice(8, 10) + '/' + caso.fecha.slice(5, 7) : '';
    const tam = caso.senales.length >= 3 ? 30 : 33;
    const cuerpo = [
        h('div', { flexDirection: 'column', marginTop: 18, fontFamily: 'Anton', lineHeight: 1 },
            h('div', { fontSize: 124, color: C.blanco }, 'ESTAFA'),
            h('div', { fontSize: 124, color: C.rojo }, 'DETECTADA')),
        h('div', { marginTop: 18, fontSize: 42, fontWeight: 700, color: C.blanco, lineHeight: 1.2 }, caso.tipo),
        caso.senales.length ? h('div', { flexDirection: 'column', marginTop: 24, padding: '22px 28px', borderRadius: 22, backgroundColor: C.caja, border: '2px solid rgba(255,255,255,0.08)' },
            etiqueta('LO QUE ENCONTRÓ VERA'),
            caso.senales.map((s) => h('div', { alignItems: 'flex-start', marginTop: 8 },
                h('div', { width: 14, height: 14, borderRadius: 4, backgroundColor: C.rojo, marginTop: 12, marginRight: 20, flexShrink: 0 }),
                h('div', { fontSize: tam, color: C.blanco, lineHeight: 1.3, flexShrink: 1 }, s)))) : null,
        h('div', { marginTop: 22, flexDirection: 'column' },
            etiqueta('QUÉ HACER'),
            h('div', { flexWrap: 'wrap' }, ['No respondas', 'No toques links', 'No transfieras'].map((t) =>
                h('div', { marginRight: 14, marginBottom: 10, padding: '8px 20px', borderRadius: 40, border: `2px solid ${C.rojo}`, fontSize: 27, color: C.blanco }, t))))
    ];
    return marco(r, '●  ALERTA DE LA RED CYBER MOBILE' + fecha, cuerpo, '¿TE LLEGÓ ALGO RARO?', r.qr.tarjeta);
}

function tarjetaSemana(r, a) {
    const n = a.nombre.toUpperCase();
    const tam = n.length > 30 ? 78 : n.length > 20 ? 92 : 112;
    const cuerpo = [
        h('div', { flexDirection: 'column', marginTop: 18, fontFamily: 'Anton', lineHeight: 1.02 },
            h('div', { fontSize: tam, color: C.blanco }, n),
            a.frase ? h('div', { fontSize: Math.round(tam * 0.62), color: C.rojo, marginTop: 6 }, a.frase.toUpperCase()) : null),
        h('div', { marginTop: 18, fontSize: 28, color: C.gris, lineHeight: 1.35 }, recortar(a.como, 200)),
        h('div', { flexDirection: 'column', marginTop: 20, padding: '20px 26px', borderRadius: 22, backgroundColor: C.caja, border: '2px solid rgba(255,255,255,0.08)' },
            etiqueta('CÓMO RECONOCERLA'),
            h('div', { fontSize: 29, color: C.blanco, lineHeight: 1.3 }, recortar(a.clave, 150))),
        h('div', { flexDirection: 'column', marginTop: 20 },
            etiqueta('SI TE LLEGÓ'),
            a.pasos.map((p, i) => h('div', { alignItems: 'center', marginTop: 6 },
                h('div', { width: 40, height: 40, borderRadius: 20, backgroundColor: C.rojo, alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 25, marginRight: 16 }, String(i + 1)),
                h('div', { fontSize: 28, color: C.blanco }, p))))
    ];
    const chip = '●  ALERTA DE LA SEMANA · #1 DEL OBSERVATORIO';
    return marco(r, chip, cuerpo, '¿TE LLEGÓ ALGO ASÍ?', r.qr.alerta);
}

export async function dibujar(modo, datos) {
    const r = cargar();
    const arbol = modo === 'caso' ? tarjetaCaso(r, datos) : tarjetaSemana(r, datos);
    const res = new ImageResponse(arbol, { width: 1080, height: 1350, fonts: r.fuentes });
    return Buffer.from(await res.arrayBuffer());
}

let datosObs;
function observatorio() {
    if (!datosObs) {
        const datos = JSON.parse(leer('observatorio/datos.json').toString('utf8'));
        let claves = {};
        try { claves = JSON.parse(leer('scripts/redes/claves.json').toString('utf8')); } catch { /* sin claves */ }
        datosObs = alertaSemanal(datos, claves);
    }
    return datosObs;
}

export default async function handler(req, res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex');
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.setHeader('Allow', 'GET, HEAD'); return res.status(405).end(); }
    const q = req.query || {};
    try {
        let png;
        if (q.modo === 'semana') {
            const a = observatorio();
            if (!a) return res.status(404).end();
            png = await dibujar('semana', a);
            res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600');
        } else if (q.modo === 'caso') {
            const secreto = process.env.N8N_SHARED_SECRET || '';
            const caso = secreto.length >= 32 ? leerCaso(String(q.d || ''), String(q.s || ''), secreto) : null;
            if (!caso) return res.status(404).end();
            png = await dibujar('caso', caso);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
            return res.status(404).end();
        }
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', png.length);
        return res.status(200).end(req.method === 'HEAD' ? undefined : png);
    } catch (e) {
        console.error('tarjeta.js:', e.message);
        return res.status(500).end();
    }
}
