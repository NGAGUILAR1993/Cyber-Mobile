// Validación y normalización de lo que la app pide verificar.
// Devuelve { ok: true, valor } o { ok: false, error } con un mensaje para mostrar.

export const TIPOS = ['link', 'cbu', 'telefono', 'email', 'mensaje'];

// Dígitos verificadores de CBU/CVU (bloques de 8 y 14 dígitos).
function digitoOk(bloque, pesos) {
    const cuerpo = bloque.slice(0, -1);
    let suma = 0;
    for (let i = 0; i < cuerpo.length; i++) suma += Number(cuerpo[i]) * pesos[i % pesos.length];
    return (10 - (suma % 10)) % 10 === Number(bloque.slice(-1));
}
export function cbuValido(n) {
    if (!/^\d{22}$/.test(n)) return false;
    return digitoOk(n.slice(0, 8), [7, 1, 3, 9, 7, 1, 3]) && digitoOk(n.slice(8), [3, 9, 7, 1]);
}

export function validar(tipo, crudo) {
    if (!TIPOS.includes(tipo)) return { ok: false, error: 'Tipo de verificación no válido.' };
    if (typeof crudo !== 'string') return { ok: false, error: 'Falta el dato a verificar.' };
    const v = crudo.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
    if (!v) return { ok: false, error: 'Falta el dato a verificar.' };

    switch (tipo) {
        case 'link': {
            if (v.length > 2048) return { ok: false, error: 'El link es demasiado largo.' };
            const conEsquema = /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : 'https://' + v;
            let u;
            try { u = new URL(conEsquema); } catch { return { ok: false, error: 'No parece un link válido.' }; }
            if (!['http:', 'https:'].includes(u.protocol)) return { ok: false, error: 'Solo se pueden verificar links web (http o https).' };
            if (!u.hostname.includes('.') || u.hostname.length > 253) return { ok: false, error: 'No parece un link válido.' };
            return { ok: true, valor: u.toString() };
        }
        case 'cbu': {
            const digitos = v.replace(/[\s-]/g, '');
            if (/^\d+$/.test(digitos)) {
                if (digitos.length !== 22) return { ok: false, error: 'El CBU o CVU tiene que tener 22 números.' };
                if (!cbuValido(digitos)) return { ok: false, error: 'Ese CBU o CVU no es válido: revisá los números.' };
                return { ok: true, valor: digitos };
            }
            const alias = v.toLowerCase();
            if (!/^[a-z0-9.-]{6,20}$/.test(alias)) return { ok: false, error: 'Ingresá un CBU/CVU de 22 números o un alias (6 a 20 letras, números, puntos o guiones).' };
            return { ok: true, valor: alias };
        }
        case 'telefono': {
            const t = v.replace(/[\s().-]/g, '');
            if (!/^\+?\d{8,15}$/.test(t)) return { ok: false, error: 'Ingresá un número de teléfono válido (8 a 15 dígitos).' };
            return { ok: true, valor: t };
        }
        case 'email': {
            const e = v.toLowerCase();
            if (e.length > 254 || !/^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[a-z]{2,}$/i.test(e)) return { ok: false, error: 'Ingresá un correo válido.' };
            return { ok: true, valor: e };
        }
        case 'mensaje': {
            if (v.length < 10) return { ok: false, error: 'Pegá el mensaje completo para poder analizarlo.' };
            if (v.length > 4000) return { ok: false, error: 'El mensaje es demasiado largo (máximo 4000 caracteres).' };
            return { ok: true, valor: v };
        }
    }
    return { ok: false, error: 'Tipo de verificación no válido.' };
}

// Normaliza la respuesta de n8n al formato que entiende la app.
const VEREDICTOS = ['seguro', 'precaucion', 'peligro', 'desconocido'];
const txt = (s, n) => (typeof s === 'string' ? s.trim().slice(0, n) : '');
export function normalizarResultado(r) {
    const veredicto = VEREDICTOS.includes(r && r.veredicto) ? r.veredicto : 'desconocido';
    const recomendaciones = Array.isArray(r && r.recomendaciones)
        ? r.recomendaciones.map((x) => txt(x, 300)).filter(Boolean).slice(0, 6)
        : [];
    return {
        veredicto,
        titulo: txt(r && r.titulo, 120) || {
            seguro: 'No encontramos señales de riesgo',
            precaucion: 'Tené precaución',
            peligro: 'Alto riesgo de estafa',
            desconocido: 'No pudimos determinar el riesgo'
        }[veredicto],
        explicacion: txt(r && r.explicacion, 1500),
        recomendaciones
    };
}
