import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const R='/home/user/Cyber-Mobile', D=process.cwd();
const CREMA='#f1ebdf',NEG='#0b0b0b',ROJO='#ff2d1f',AMA='#ffd400',TUR='#19e6c4';
const css=`
@font-face{font-family:AN;src:url(${R}/tarjetas/fuentes/Anton-Regular.ttf)}
@font-face{font-family:SG;font-weight:700;src:url(${R}/tarjetas/fuentes/SpaceGrotesk-Bold.ttf)}
@font-face{font-family:SG;font-weight:400;src:url(${R}/tarjetas/fuentes/SpaceGrotesk-Regular.ttf)}
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;font-family:SG,sans-serif;position:relative}
.h{font-family:AN;text-transform:uppercase;line-height:1;letter-spacing:.5px}
.pad{position:absolute;left:80px;right:80px}
.brand{position:absolute;left:80px;top:70px;font-family:AN;font-size:34px;letter-spacing:4px}
.tag{display:inline-block;font-family:AN;font-size:42px;padding:10px 26px;background:${ROJO};color:#fff;transform:rotate(-2deg);text-transform:uppercase}
.mk{background:linear-gradient(transparent 55%,${AMA} 55%)}
.src{font-size:29px;line-height:1.35}
.url{font-family:AN;font-size:54px;letter-spacing:1px}
.img{position:absolute;box-shadow:0 24px 70px rgba(0,0,0,.35);border:5px solid ${NEG};background:#fff}
.img img{display:block;width:100%}
.mkb{position:absolute;border:8px solid ${ROJO};border-radius:22px;transform:rotate(-.8deg)}
.mkl{position:absolute;font-family:AN;font-size:40px;background:${ROJO};color:#fff;padding:6px 20px;text-transform:uppercase;transform:rotate(-2deg);white-space:nowrap}
`;
const page=(bg,fg,body)=>`<html><head><meta charset=utf-8><style>${css}body{background:${bg};color:${fg}}</style></head><body><div class=brand>CYBER MOBILE · VERA</div>${body}</body></html>`;
// imagen real: w=ancho en pantalla, sw/sh = px de origen
const img=(f,top,left,w,sw,sh,marks=[])=>{const k=w/sw;return `<div class="img" style="top:${top}px;left:${left}px;width:${w}px;height:${Math.round(sh*k)}px"><img src="${D}/real/${f}">${marks.map(m=>`<div class=mkb style="left:${m.x*k-8}px;top:${m.y*k-8}px;width:${m.w*k+16}px;height:${m.h*k+16}px"></div><div class=mkl style="left:${m.lx??10}px;top:${m.below?(m.y+m.h)*k+10:m.y*k-34}px;${m.right?'left:auto;right:10px;':''}">${m.t}</div>`).join('')}</div>`;};
const list=(items,col)=>items.map(t=>`<div style="border-left:14px solid ${ROJO};padding-left:30px;margin-bottom:34px">${t}</div>`).join('');
const casos={
multa:{
 f1:page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Acta real denunciada · Berisso</span><div class=h style="font-size:100px;margin-top:30px">NO LA DEJÓ <span class=mk>EL MUNICIPIO.</span> LA DEJÓ UN ESTAFADOR.</div></div>
 ${img('multa-falsa.png',700,120,840,716,472)}
 <div class="pad src" style="top:1380px;font-size:46px;line-height:1.3;font-weight:700">“Vehículo en infracción” en el parabrisas, con fecha 13/10/2026. La Municipalidad avisó que no la emitió su personal.</div>
 <div class="pad src" style="bottom:80px;font-size:26px">Fuente: 0221.com.ar, 17/10/2026 (hace 35 días). Imagen de la nota; dominio, oblea e inspector tapados en origen.</div>`),
 f2:page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${AMA};color:${NEG}">Lo que mira Vera</span><div class=h style="font-size:96px;margin-top:30px">LA FALSA VS.<br><span style="color:${AMA}">LA OFICIAL.</span></div></div>
 ${img('multa-falsa.png',590,130,640,716,472)}
 <div class=mkl style="left:90px;top:565px;transform:rotate(-3deg)">Falsa: blanca y roja</div>
 ${img('multa-oficial.png',1060,310,640,716,472)}
 <div class=mkl style="left:300px;top:1030px;background:#19b8a0;transform:rotate(2deg)">Oficial: celeste y blanca</div>
 <div class="pad" style="top:1560px;font-size:44px;line-height:1.3;font-weight:700">Según la Secretaría de Seguridad Ciudadana de Berisso, esa es la diferencia que hay que mirar.</div>
 <div class="pad src" style="bottom:90px;color:${CREMA};font-size:28px">Fuente: 0221.com.ar, 17/10/2026. Foto de la multa oficial: nota original.</div>`),
 f3:page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag style="background:${NEG};color:${AMA}">Así lo verifica Vera</span><div class=h style="font-size:104px;margin-top:30px">SUBÍS LA FOTO.<br><span class=mk>VERA REVISA.</span></div></div>
 <div class="pad" style="top:660px;font-size:44px;line-height:1.28;font-weight:700">
 ${[['1','Lee el acta: quién la emite, municipio, fecha, monto y cómo piden pagar.'],['2','Revisa cada dato de pago: link, QR, CBU o alias, y la antigüedad y reputación del dominio.'],['3','Lo cruza con las estafas que ya registra el Observatorio.'],['4','Te responde con un semáforo y qué hacer, paso a paso.']].map(([n,t])=>`<div style="display:flex;gap:28px;align-items:flex-start;margin-bottom:46px"><div class=h style="font-size:84px;color:${ROJO};min-width:70px">${n}</div><div style="padding-top:8px">${t}</div></div>`).join('')}</div>
 <div class="pad src" style="bottom:90px;font-size:28px">Vera orienta con señales y fuentes; la confirmación final es siempre del municipio, por su canal oficial.</div>`),
 f4:page(NEG,CREMA,`<div class="pad" style="top:170px"><span class=tag style="background:${AMA};color:${NEG}">Respuesta real en WhatsApp</span><div class=h style="font-size:96px;margin-top:26px">ESTO RESPONDIÓ <span style="color:${AMA}">VERA.</span></div></div>
 <div style="position:absolute;left:222px;top:520px;width:636px;height:1210px;overflow:hidden;border:5px solid ${CREMA};border-radius:18px;background:#000"><img src="${D}/real/vera-whatsapp.png" style="display:block;width:636px;margin-top:-60px"></div>
 <div class="pad src" style="bottom:70px;color:${CREMA};font-size:28px">Captura real de WhatsApp, 21/11/2026. Vera marca riesgo alto y explica por qué.</div>`),
 f5:page(AMA,NEG,`<div class="pad" style="top:190px"><div class=h style="font-size:150px">NO PAGUES.<br>NO DES<br>DATOS.</div><div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:50px">Consultá el acta solo por los canales oficiales del municipio. Si aparece una, llamá al organismo antes de transferir.</div>
 <div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:46px;border-top:8px solid ${NEG};padding-top:34px">Subí la foto del acta a Vera y mirá qué encuentra.</div></div>
 <div class="pad url" style="bottom:200px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div><div class="pad src" style="bottom:90px;font-size:34px;font-weight:700">Modalidad: cybermobile.com.ar/observatorio/falsa-multa</div>`)}
};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
fs.mkdirSync('html',{recursive:true});
for(const [c,fr] of Object.entries(casos))for(const [f,h] of Object.entries(fr)){fs.writeFileSync(`html/${c}-${f}.html`,h);
 await p.goto('file://'+D+`/html/${c}-${f}.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:`${c}-${f}.jpg`,type:'jpeg',quality:92});}
for(const c of Object.keys(casos)){
 const h=`<html><body style="margin:0;background:#222;display:flex;gap:30px;padding:30px">${['f1','f2','f3','f4','f5'].map(f=>`<img src="file://${D}/${c}-${f}.jpg" style="width:340px">`).join('')}</body></html>`;
 fs.writeFileSync('html/m.html',h);const q=await b.newPage({viewport:{width:1900,height:700}});await q.goto('file://'+D+'/html/m.html');await q.waitForTimeout(500);await q.screenshot({path:`preview-${c}.jpg`,type:'jpeg',quality:90});}
await b.close();
