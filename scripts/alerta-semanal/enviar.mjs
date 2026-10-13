// Envía la alerta semanal (redes/alerta-semanal: imagen + texto) por WhatsApp con Evolution, sin pasar por n8n.
// Lo corre .github/workflows/alerta-envio.yml los lunes a las 19 (y a mano cuando haga falta).
// Deja el resultado en redes/alerta-semanal/envios/<fecha>.json (números enmascarados) y avisa por mail.
//
// Variables de entorno:
//   EVOLUTION_APIKEY   (secreto) clave de Evolution.
//   ALERTA_DESTINOS    (secreto) números separados por coma: el staff y quien deba recibirla.
//   FORZAR=1           envía aunque ya se haya enviado hoy.
//   CONTROL=1          (martes) revisa que el lunes se haya enviado: si salió, avisa por mail; si no, la envía ahora.
//   SMTP_USER, SMTP_PASS, AVISO_A  para el mail con el resultado (opcional).
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const EVO = (process.env.EVOLUTION_URL || 'https://evolution-api-production-bf51.up.railway.app').replace(/\/+$/, '');
const INST = encodeURIComponent(process.env.EVOLUTION_INSTANCE || 'Agente Ciber');
const KEY = (process.env.EVOLUTION_APIKEY || '').trim();
const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
const dirEnvios = path.join(RAIZ, 'redes', 'alerta-semanal', 'envios');
const reporte = path.join(dirEnvios, `${hoy}.json`);
const enmascarar = (n) => String(n).replace(/\d(?=\d{4})/g, '•');

const destinos = [...new Set(String(process.env.ALERTA_DESTINOS || '').split(/[,\s;]+/).map((n) => {
    let d = n.replace(/\D/g, '');
    if (/^54\d{10}$/.test(d)) d = '549' + d.slice(2);   // móvil AR: 549 + 10 dígitos
    return d;
}).filter((d) => d.length >= 10))];

async function evo(ruta, cuerpo) {
    const r = await fetch(EVO + ruta, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(40000) });
    const t = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${t.slice(0, 300)}`);
    try { return JSON.parse(t); } catch { return t; }
}

// Mail con el resultado (Gmail, contraseña de aplicación). nodemailer lo instala el workflow.
async function correo(asunto, cuerpo) {
    const user = (process.env.SMTP_USER || '').trim(), pass = (process.env.SMTP_PASS || '').replace(/\s/g, '');
    const para = (process.env.AVISO_A || '').trim() || 'cybermobile.ai@gmail.com';
    if (!user || !pass) { console.log('Sin SMTP: no se manda el mail.'); return; }
    try {
        const { default: nodemailer } = await import('nodemailer');
        const t = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } });
        await t.sendMail({ from: `Alertas Cyber Mobile <${user}>`, to: para, subject: asunto, text: cuerpo });
        console.log('Mail enviado a', para);
    } catch (e) { console.error('No se pudo mandar el mail:', e.message); }
}

async function control() {
    const ayer = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(Date.now() - 86400000));
    const f = path.join(dirEnvios, `${ayer}.json`);
    const r = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
    if (r && r.enviados > 0) {
        await correo(`✅ Control del martes: la alerta del lunes salió (${r.enviados}/${r.total})`,
            `La alerta "${r.alerta}" se envió el lunes ${ayer}.

${r.resultados.map((x) => `${x.ok ? '✅' : '❌'} ${x.numero}${x.error ? ' — ' + x.error : ''}`).join('\n')}

— Cyber Mobile`);
        return false;
    }
    console.log(`El lunes ${ayer} no se envió: se envía ahora.`);
    return true;
}

async function main() {
    if (process.env.CONTROL === '1' && !(await control())) return;
    const t = JSON.parse(fs.readFileSync(path.join(RAIZ, 'redes', 'alerta-semanal', 'textos.json'), 'utf8'));
    const img = (t.archivos || []).find((a) => a.nombre === 'whatsapp.jpg');
    let texto = String(t.whatsapp || '');
    if (texto.length > 1024) texto = texto.slice(0, texto.lastIndexOf('\n\n', 1020));
    const problemas = [];
    if (!KEY) problemas.push('Falta el secreto EVOLUTION_APIKEY en GitHub.');
    if (!destinos.length) problemas.push('Falta el secreto ALERTA_DESTINOS (números del staff).');
    if (!img) problemas.push('La alerta no tiene imagen (redes/alerta-semanal/textos.json).');
    if (problemas.length) {
        await correo('🔴 Alerta semanal NO enviada', `No se pudo enviar la alerta de hoy (${hoy}):\n\n- ${problemas.join('\n- ')}\n\n— Cyber Mobile`);
        throw new Error(problemas.join(' '));
    }
    if (fs.existsSync(reporte) && process.env.FORZAR !== '1') {
        const previo = JSON.parse(fs.readFileSync(reporte, 'utf8'));
        if (previo.enviados > 0) { console.log(`Ya se envió hoy (${previo.enviados} destinatarios). No se repite.`); return; }
    }
    const resultados = [];
    for (const numero of destinos) {
        const r = { numero: enmascarar(numero), ok: false };
        try {
            let destino = numero;
            try {
                const chk = await evo(`/chat/whatsappNumbers/${INST}`, { numbers: [numero] });
                const r0 = Array.isArray(chk) ? chk[0] : null;
                if (r0 && r0.exists === false) throw new Error('El número no tiene WhatsApp');
                if (r0 && r0.jid) destino = r0.jid;
            } catch (e) { if (/no tiene WhatsApp/.test(e.message)) throw e; }
            const res = await evo(`/message/sendMedia/${INST}`, {
                number: destino, mediatype: 'image', mimetype: 'image/jpeg', fileName: 'alerta-cyber-mobile.jpg',
                media: img.url, caption: texto, delay: 1500
            });
            r.ok = true; r.id = (res && res.key && res.key.id) || '';
        } catch (e) { r.error = String(e.message || e).slice(0, 300); }
        resultados.push(r);
        console.log(r.ok ? 'OK   ' : 'FALLA', r.numero, r.error || '');
        await new Promise((ok) => setTimeout(ok, Number(process.env.PAUSA_MS || 5000)));   // pausa para que WhatsApp no lo tome como spam
    }
    const enviados = resultados.filter((r) => r.ok).length;
    fs.mkdirSync(dirEnvios, { recursive: true });
    fs.writeFileSync(reporte, JSON.stringify({ fecha: hoy, hora: new Date().toISOString(), alerta: t.nombre, enviados, total: resultados.length, resultados }, null, 2) + '\n');
    const lista = resultados.map((r) => `${r.ok ? '✅' : '❌'} ${r.numero}${r.error ? ' — ' + r.error : ''}`).join('\n');
    await correo(enviados === resultados.length ? `✅ Alerta semanal enviada (${enviados}/${resultados.length})` : `🔴 Alerta semanal con fallas (${enviados}/${resultados.length})`,
        `Alerta: ${t.nombre}\nFecha: ${hoy}\n\n${lista}\n\n— Cyber Mobile`);
    if (!enviados) throw new Error('No se pudo enviar a nadie.');
}
main().catch((e) => { console.error(e.message); process.exit(1); });
