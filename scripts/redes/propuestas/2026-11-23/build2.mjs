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

const IM='gmail.png';

const paso=(n,t)=>`<div style="display:flex;gap:28px;align-items:flex-start;margin-bottom:34px"><div class=h style="font-size:70px;color:${ROJO};min-width:56px">${n}</div><div style="font-size:42px;line-height:1.25;font-weight:700">${t}</div></div>`;
const cap=(f,top,mt,h)=>`<div style="position:absolute;left:222px;top:${top}px;width:636px;height:${h}px;overflow:hidden;border:5px solid ${CREMA};border-radius:18px;background:#000"><img src="${D}/real/${f}" style="display:block;width:636px;margin-top:-${mt}px"></div>`;
const f1=page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Anuncios reales · Gmail</span><div class=h style="font-size:100px;margin-top:30px">“DE 100.000 A 386.000 EN <span class=mk>7 DÍAS.</span>” NO ERA UNA JUBILADA.</div></div>
<div class="img" style="top:830px;left:80px;width:920px"><img src="${D}/real/anuncios-gmail-completo.png" style="display:block;width:100%"></div>
<div class="pad src" style="top:1425px;font-size:44px;line-height:1.3;font-weight:700">Anuncios patrocinados que llegaron a la bandeja de Gmail, con marcas de medios y bancos que no los emitieron.</div>
<div class="pad src" style="bottom:90px;font-size:26px">Fuente: ESET Latinoamérica (WeLiveSecurity), 15/10/2026. Imagen 1 del informe. Anuncios activos entre mayo y septiembre de 2026.</div>`);
const f2=page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${AMA};color:${NEG}">Así lo verifica Vera</span><div class=h style="font-size:96px;margin:30px 0 50px">SUBÍS LA IMAGEN.<br><span style="color:${AMA}">VERA REVISA.</span></div>
${paso(1,'Lee los anuncios: quién dice emitirlos, qué prometen y a quién apuntan.')}
${paso(2,'Revisa links, dominios y datos de pago, y la reputación de cada uno.')}
${paso(3,'Lo cruza con las estafas que ya registra el Observatorio.')}
${paso(4,'Te responde con un semáforo y qué hacer.')}</div>
<div class="pad src" style="bottom:100px;font-size:30px;color:${CREMA}">Vera orienta con señales y fuentes; la confirmación final es siempre del medio, del banco y de los organismos oficiales.</div>`);
const f3=page(NEG,CREMA,`<div class="pad" style="top:170px"><span class=tag style="background:${AMA};color:${NEG}">Respuesta real en WhatsApp</span><div class=h style="font-size:96px;margin-top:26px">ESTO RESPONDIÓ <span style="color:${AMA}">VERA.</span></div></div>
${cap('vera-analisis.png',520,60,1210)}
<div class="pad src" style="bottom:50px;color:${CREMA};font-size:27px;line-height:1.3">Captura real de WhatsApp, 23/11/2026. Riesgo alto: anuncios que suplantan a un medio y a un banco, con ganancias imposibles.</div>`);
const f4=page(CREMA,NEG,`<div class="pad" style="top:170px"><span class=tag>Y además</span><div class=h style="font-size:96px;margin-top:26px">ARMA UNA <span class=mk>TARJETA</span> PARA COMPARTIR.</div></div>
${cap('vera-tarjeta.png',560,70,1160)}
<div class="pad src" style="bottom:50px;font-size:27px;line-height:1.3">Captura real de WhatsApp, 23/11/2026. Reenviála a tu familia o a tus grupos: cada aviso suma a la red de alerta.</div>`);
const f5=page(ROJO,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${NEG}">Promo de noviembre</span><div class=h style="font-size:150px;margin-top:40px">ENCONTRÁ<br>2 ESTAFAS.</div><div class=h style="font-size:150px;margin-top:20px;color:${AMA}">GANÁS<br>1 MES DE<br>VERA.</div></div>
<div class="pad" style="top:1210px;font-size:48px;line-height:1.3;font-weight:700">Cada estafa distinta que Vera te marca en rojo suma. Con la segunda, tu prueba pasa a ser de 1 mes.</div>
<div class="pad src" style="bottom:100px;font-size:30px;font-weight:700">Escribile a Vera por WhatsApp: +54 9 11 7059-8505. Promo de noviembre.</div>`);
const f6=page(AMA,NEG,`<div class="pad" style="top:190px"><div class=h style="font-size:150px">NO TOQUES<br>ESE ANUNCIO.</div><div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:50px">Una inversión que promete ganancias seguras en días es una estafa. Un banco o un medio no te piden plata por un anuncio.</div>
<div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:46px;border-top:8px solid ${NEG};padding-top:34px">¿Te llegó algo así? Mandáselo a Vera antes de hacer nada.</div></div>
<div class="pad url" style="bottom:230px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div><div class="pad src" style="bottom:130px;font-size:34px;font-weight:700">Modalidad: cybermobile.com.ar/observatorio/inversion-falsa</div>`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
fs.mkdirSync('html',{recursive:true});
const fr={f1,f2,f3,f4,f5,f6};
for(const [f,h] of Object.entries(fr)){fs.writeFileSync(`html/v2-${f}.html`,h);await p.goto('file://'+D+`/html/v2-${f}.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:`historia-inversion-v2-${f.slice(1)}.jpg`,type:'jpeg',quality:92});}
fs.writeFileSync('html/m2.html',`<html><body style="margin:0;background:#222;display:flex;gap:20px;padding:20px">${[1,2,3,4,5,6].map(i=>`<img src="file://${D}/historia-inversion-v2-${i}.jpg" style="width:300px">`).join('')}</body></html>`);
const q=await b.newPage({viewport:{width:1940,height:560}});await q.goto('file://'+D+'/html/m2.html');await q.waitForTimeout(500);await q.screenshot({path:'preview-inversion-v2.jpg',type:'jpeg',quality:90});
await b.close();
