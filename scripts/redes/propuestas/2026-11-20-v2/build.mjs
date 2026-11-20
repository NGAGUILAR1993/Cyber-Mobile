import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const R='/home/user/Cyber-Mobile';
const css=`
@font-face{font-family:AN;src:url(${R}/tarjetas/fuentes/Anton-Regular.ttf)}
@font-face{font-family:SG;font-weight:700;src:url(${R}/tarjetas/fuentes/SpaceGrotesk-Bold.ttf)}
@font-face{font-family:SG;font-weight:400;src:url(${R}/tarjetas/fuentes/SpaceGrotesk-Regular.ttf)}
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;font-family:SG,sans-serif;position:relative}
.h{font-family:AN;text-transform:uppercase;line-height:.98;letter-spacing:.5px}
.pad{position:absolute;left:80px;right:80px}
.src{font-size:30px;line-height:1.35;opacity:.8}
.cap{position:absolute;border-radius:48px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.35);border:6px solid #0b0b0b;background:#050a12}
.cap img{position:absolute;width:100%}
.tag{display:inline-block;font-family:AN;font-size:44px;padding:10px 26px;background:#ff2d1f;color:#fff;transform:rotate(-2deg);text-transform:uppercase}
.mk{background:linear-gradient(transparent 55%,#ffd400 55%)}
.url{font-family:AN;font-size:56px;letter-spacing:1px}
.brand{position:absolute;left:80px;top:70px;font-family:AN;font-size:36px;letter-spacing:4px}
`;
const cap=(img,top,left,w,h,ox,oy,iw)=>`<div class="cap" style="top:${top}px;left:${left}px;width:${w}px;height:${h}px"><img src="${R}/scripts/redes/propuestas/2026-11-20-v2/capturas/${img}" style="width:${iw||100}%;left:${ox||0}px;top:${oy||0}px"></div>`;
const page=(bg,fg,body)=>`<html><head><meta charset=utf-8><style>${css}body{background:${bg};color:${fg}}</style></head><body><div class=brand>CYBER MOBILE · VERA</div>${body}</body></html>`;
const CREMA='#f1ebdf',NEG='#0b0b0b',ROJO='#ff2d1f',AMA='#ffd400',TUR='#19e6c4';
const P={};
// ---- CASO ARCA ----
P['caso-1']=page(CREMA,NEG,`<div class="pad" style="top:230px"><span class=tag>Alerta oficial · ARCA</span>
<div class=h style="font-size:128px;margin-top:50px">“NUNCA SOLICITAMOS <span class=mk>PAGOS NI DATOS PERSONALES</span> POR CORREO.”</div></div>
<div class="pad src" style="bottom:340px;font-size:36px;color:${NEG}">ARCA, en sus redes oficiales, ante la nueva ola de mails falsos con su logo.<br><b>Fuente:</b> Infobae, 05/11/2026 (nota “Envían falsos mails con el logo de ARCA…”)</div>
<div class="pad url" style="bottom:90px">¿TE LLEGÓ UNO? → CYBERMOBILE.COM.AR/AGENTE</div>`);
P['caso-2']=page(NEG,CREMA,`<div class="pad" style="top:230px"><span class=tag>Lo que pedían los mails falsos</span>
<div class=h style="font-size:150px;margin-top:46px;color:${CREMA}">UNA “ENCOMIENDA RETENIDA”<br>Y <span style="color:${AMA}">3 PEDIDOS</span></div>
<div style="margin-top:60px;font-size:62px;line-height:1.25;font-weight:700">
<div style="border-left:14px solid ${ROJO};padding-left:30px;margin-bottom:34px">Pagar aranceles aduaneros: <span style="color:${AMA}">$198.092</span> en el ejemplo</div>
<div style="border-left:14px solid ${ROJO};padding-left:30px;margin-bottom:34px">Mandar una <span style="color:${AMA}">foto del DNI</span> por mail</div>
<div style="border-left:14px solid ${ROJO};padding-left:30px">Actuar en <span style="color:${AMA}">3 días hábiles</span></div></div></div>
<div class="pad src" style="bottom:150px;font-size:34px">Descripción del mail apócrifo tal como lo informó Infobae (nota del 05/11/2026, que recuerda el caso de junio). ARCA respondió: “Se trata de un mail apócrifo”.</div>`);
P['caso-3']=page(AMA,NEG,`<div class="pad" style="top:200px"><div class=h style="font-size:150px;line-height:1.12">PEGALO ANTES<br>DE <span style="background:${NEG};color:${AMA};padding:0 16px">TOCAR.</span></div></div>
${cap('agente.png',640,170,740,700,0,0,100)}
<div class="pad" style="top:1380px;font-size:40px;font-weight:700;line-height:1.3">Captura real de cybermobile.com.ar/agente (entorno de pruebas).</div>
<div class="pad url" style="bottom:210px;font-size:60px">CYBERMOBILE.COM.AR/AGENTE</div>
<div class="pad src" style="bottom:110px;font-size:36px;color:${NEG}">Ficha del caso: cybermobile.com.ar/observatorio/phishing-arca</div>`);
// ---- SET QUE ES VERA ----
P['vera-1']=page(NEG,CREMA,`<div class="pad" style="top:210px"><span class=tag style="background:${TUR};color:${NEG}">¿Qué es Vera?</span>
<div class=h style="font-size:170px;margin-top:40px">TU AGENTE<br><span style="color:${TUR}">ANTIESTAFAS.</span></div>
<div style="font-size:50px;line-height:1.3;margin-top:40px">Pegás lo que te llegó. Vera lo investiga y te dice qué hacer.</div></div>
${cap('agente.png',1000,200,680,760,0,-150,100)}
<div class="pad url" style="bottom:70px;font-size:48px;color:${TUR}">cybermobile.com.ar/agente</div>`);
P['vera-2']=page(CREMA,NEG,`<div class="pad" style="top:210px"><span class=tag>Qué podés analizar</span>
<div class=h style="font-size:150px;margin-top:40px">TODO LO QUE<br>TE LLEGÓ.</div>
<div style="display:flex;flex-wrap:wrap;gap:20px;margin-top:50px">${['Links','Mensajes','Mails','Teléfonos','CBU / alias','Capturas','Archivos'].map((t,i)=>`<span class=h style="font-size:58px;padding:10px 24px;background:${[AMA,TUR,ROJO,AMA,TUR,ROJO,AMA][i]};color:${i==2||i==5?'#fff':NEG}">${t}</span>`).join('')}</div></div>
${cap('agente.png',1180,200,680,520,0,-640,100)}
<div class="pad url" style="bottom:70px;font-size:48px">cybermobile.com.ar/agente</div>`);
P['vera-3']=page(TUR,NEG,`<div class="pad" style="top:260px"><div class=h style="font-size:190px">SIN<br>REGISTRARTE.</div>
<div style="font-size:64px;line-height:1.25;font-weight:700;margin-top:60px">Entrás a la web, pegás y analizás. Las primeras consultas son gratis.</div>
<div style="font-size:50px;line-height:1.3;margin-top:70px;border-top:8px solid ${NEG};padding-top:40px">Lo que pegás o subís en la web <b>no se guarda</b> una vez entregado el resultado.</div></div>
<div class="pad src" style="bottom:260px;font-size:34px;color:${NEG}">En WhatsApp, los datos técnicos del análisis se conservan hasta 30 días. Detalle en cybermobile.com.ar/privacidad</div>
<div class="pad url" style="bottom:110px;font-size:56px">cybermobile.com.ar/agente</div>`);
P['vera-4']=page(ROJO,'#fff',`<div class="pad" style="top:250px"><div class=h style="font-size:235px">LA IA NO<br>DECIDE<br>POR VOS.</div>
<div style="font-size:66px;line-height:1.25;font-weight:700;margin-top:70px">Vera te da el semáforo, las señales y qué hacer. <span style="background:${NEG};padding:0 12px">El resultado es orientativo.</span></div>
<div style="font-size:56px;line-height:1.3;margin-top:50px">La decisión final es tuya.</div></div>
<div class="pad url" style="bottom:110px;font-size:52px">cybermobile.com.ar/agente</div>`);
P['vera-5']=page(NEG,CREMA,`<div class="pad" style="top:210px"><span class=tag style="background:${AMA};color:${NEG}">Para links</span>
<div class=h style="font-size:150px;margin-top:40px">VARIAS CAPAS.<br><span style="color:${AMA}">UN SOLO RESULTADO.</span></div>
<div style="margin-top:50px;font-size:56px;line-height:1.15;font-weight:700">
${['VirusTotal','Resolvedor de Cloudflare','PhishStats','Antigüedad del dominio','Denuncias en la web'].map((t,i)=>`<div style="display:flex;align-items:center;gap:28px;margin-bottom:18px"><span class=h style="font-size:64px;color:${AMA};width:70px">${i+1}</span>${t}</div>`).join('')}</div>
<div style="font-size:40px;margin-top:30px">Y se cruza con el Observatorio de Fraude Digital.</div></div>
<div class="pad url" style="bottom:60px;font-size:44px;color:${AMA}">cybermobile.com.ar/agente</div>`);
P['vera-6']=page(CREMA,NEG,`<div class="pad" style="top:210px"><span class=tag>Cómo funciona</span>
<div class=h style="font-size:140px;margin-top:40px">PEGÁS.<br>VERA INVESTIGA.<br><span class=mk>VOS DECIDÍS.</span></div></div>
${cap('agente-como.png',860,170,740,640,0,-520,100)}
<div class="pad" style="top:1530px;font-size:32px;font-weight:700">Captura real de cybermobile.com.ar/agente (entorno de pruebas).</div>
<div class="pad url" style="bottom:90px;font-size:50px">PROBALA: CYBERMOBILE.COM.AR/AGENTE</div>`);
fs.mkdirSync('html',{recursive:true});
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const [n,h] of Object.entries(P)){fs.writeFileSync(`html/${n}.html`,h);
 await p.goto('file://'+process.cwd()+`/html/${n}.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:(n.startsWith('caso')?`historia-${n.slice(-1)}.jpg`:`set-${n}.jpg`),type:'jpeg',quality:92});}
// montajes
const mont=async(names,out)=>{const h=`<html><body style="margin:0;background:#222;display:flex;gap:30px;padding:30px;width:${names.length*(1080/2+30)+30}px">${names.map(n=>`<img src="file://${process.cwd()}/${n}" style="width:540px">`).join('')}</body></html>`;
 fs.writeFileSync('html/m.html',h);const q=await b.newPage({viewport:{width:names.length*570+30,height:1020}});await q.goto('file://'+process.cwd()+'/html/m.html');await q.waitForTimeout(500);await q.screenshot({path:out,type:'jpeg',quality:90});};
await mont(['historia-1.jpg','historia-2.jpg','historia-3.jpg'],'preview-caso-arca.jpg');
await mont(['set-vera-1.jpg','set-vera-2.jpg','set-vera-3.jpg'],'montaje-set-a.jpg');
await mont(['set-vera-4.jpg','set-vera-5.jpg','set-vera-6.jpg'],'montaje-set-b.jpg');
await b.close();
