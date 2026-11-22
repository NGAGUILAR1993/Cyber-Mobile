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
const f1=page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Sitio real capturado · Observatorio</span><div class=h style="font-size:100px;margin-top:30px">“DESCARGÁ GTA 6 PARA CELULAR.” <span class=mk>NO HAY VERSIÓN OFICIAL.</span></div></div>
${img('gta6mobile.png',760,90,900,708,468)}
<div class="pad src" style="bottom:95px;font-size:27px">Fuente: Netcraft, 03/11/2026 (actualizado 18/11). Captura de gta6mobile.app del 27/10/2026. El juego salió el 19/11 solo para PS5 y Xbox Series X|S.</div>`);
const f2=page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${AMA};color:${NEG}">Lo que mira Vera</span><div class=h style="font-size:104px;margin-top:30px">TRES SEÑALES<br><span style="color:${AMA}">EN UNA WEB.</span></div></div>
${img('gta6mobile.png',600,90,900,708,468,[{x:10,y:0,w:140,h:20,t:'1',lx:20,below:true},{x:226,y:90,w:255,h:64,t:'2',lx:20,right:true,below:true},{x:204,y:212,w:104,h:34,t:'3',lx:300,below:true}])}
<div class="pad" style="top:1290px;font-size:44px;line-height:1.3;font-weight:700"><div style="margin-bottom:18px"><span class=h style="color:${ROJO}">1</span>  Dominio que no es de Rockstar</div><div style="margin-bottom:18px"><span class=h style="color:${ROJO}">2</span>  Promete una versión que no se anunció</div><div><span class=h style="color:${ROJO}">3</span>  Pide instalar un APK</div></div>
<div class="pad src" style="bottom:95px;font-size:29px;color:${CREMA}">Netcraft documentó páginas con este formato: imitan una tienda de apps y mandan a instalar un APK desde afuera de las tiendas oficiales.</div>`);
const paso=(n,t)=>`<div style="display:flex;gap:28px;align-items:flex-start;margin-bottom:34px"><div class=h style="font-size:70px;color:${ROJO};min-width:56px">${n}</div><div style="font-size:42px;line-height:1.25;font-weight:700">${t}</div></div>`;
const f3=page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Así lo verifica Vera</span><div class=h style="font-size:96px;margin:30px 0 50px">CINCO PASOS<br>ANTES DE TOCAR.</div>
${paso(1,'Lee el mensaje, la captura o el link que le mandás.')}
${paso(2,'Revisa el link y el dominio con VirusTotal, Cloudflare y PhishStats.')}
${paso(3,'Mira desde cuándo existe el dominio.')}
${paso(4,'Lo cruza con los casos del Observatorio.')}
${paso(5,'Te da el semáforo y qué hacer.')}</div>
<div class="pad src" style="bottom:110px;font-size:31px;border-top:6px solid ${NEG};padding-top:26px">Vera orienta. La confirmación final es de la empresa u organismo oficial (acá, Rockstar Games y las tiendas de tu consola).</div>`);
const f5=page(AMA,NEG,`<div class="pad" style="top:190px"><div class=h style="font-size:160px">NO INSTALES<br>ESE APK.</div><div style="font-size:50px;line-height:1.3;font-weight:700;margin-top:50px">Bajá juegos solo de las tiendas oficiales de tu consola.</div>
<div style="font-size:50px;line-height:1.3;font-weight:700;margin-top:50px;border-top:8px solid ${NEG};padding-top:36px">¿Un sitio te ofrece GTA 6 en el celular? Pegá el link en Vera antes de tocar nada.</div></div>
<div class="pad url" style="bottom:230px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div><div class="pad src" style="bottom:130px;font-size:34px;font-weight:700">Modalidad: cybermobile.com.ar/observatorio/ecommerce-falso</div>`);
const f4=page(NEG,CREMA,`<div class="pad" style="top:170px"><span class=tag style="background:${AMA};color:${NEG}">Respuesta real en WhatsApp</span><div class=h style="font-size:96px;margin-top:26px">ESTO RESPONDIÓ <span style="color:${AMA}">VERA.</span></div></div>
<div style="position:absolute;left:222px;top:520px;width:636px;height:1210px;overflow:hidden;border:5px solid ${CREMA};border-radius:18px;background:#000"><img src="${D}/real/vera-whatsapp.png" style="display:block;width:636px;margin-top:-60px"></div>
<div class="pad src" style="bottom:50px;color:${CREMA};font-size:27px;line-height:1.3">Captura real de WhatsApp, 22/11/2026. Riesgo alto: dominio no oficial y un APK de un juego que no existe en celulares. En VirusTotal, 5 motores lo marcan peligroso y 2 sospechoso, sobre 92.</div>`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
fs.mkdirSync('html',{recursive:true});
const fr={f1,f2,f3,f4,f5};
for(const [f,h] of Object.entries(fr)){fs.writeFileSync(`html/${f}.html`,h);await p.goto('file://'+D+`/html/${f}.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:`historia-gta6-${f.slice(1)}.jpg`,type:'jpeg',quality:92});}
fs.writeFileSync('html/m.html',`<html><body style="margin:0;background:#222;display:flex;gap:24px;padding:24px">${[1,2,3,4,5].map(i=>`<img src="file://${D}/historia-gta6-${i}.jpg" style="width:340px">`).join('')}</body></html>`);
const q=await b.newPage({viewport:{width:1900,height:700}});await q.goto('file://'+D+'/html/m.html');await q.waitForTimeout(500);await q.screenshot({path:'preview-gta6.jpg',type:'jpeg',quality:90});
await b.close();
