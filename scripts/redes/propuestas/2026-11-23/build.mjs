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
const f1=page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Anuncio real en Gmail · Observatorio</span><div class=h style="font-size:104px;margin-top:30px">“DE 100.000 A 386.000 EN 7 DÍAS.” <span class=mk>NO ERA UNA JUBILADA.</span></div></div>
${img(IM,820,60,960,700,205)}
<div class="pad src" style="top:1180px;font-size:46px;line-height:1.3;font-weight:700">Anuncios patrocinados que aparecían en la bandeja de Gmail de usuarios en Argentina entre mayo y septiembre de 2026, según ESET.</div>
<div class="pad src" style="bottom:95px;font-size:27px">Fuente: ESET Latinoamérica (We Live Security), 15/10/2026. Imagen 1 del informe, recortada.</div>`);
const f2=page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${AMA};color:${NEG}">Lo que mira Vera</span><div class=h style="font-size:104px;margin-top:30px">TRES SEÑALES<br><span style="color:${AMA}">EN UN ANUNCIO.</span></div></div>
${img(IM,560,90,900,700,205,[{x:76,y:30,w:104,h:22,t:'1',lx:20,below:true},{x:76,y:55,w:218,h:42,t:'2',lx:440},{x:246,y:143,w:212,h:24,t:'3',lx:560,below:true}])}
<div class="pad" style="top:1010px;font-size:42px;line-height:1.28;font-weight:700"><div style="margin-bottom:26px"><span class=h style="color:${ROJO}">1</span>  Usa el nombre y el logo de un medio. Los medios no tienen relación con la oferta.</div><div style="margin-bottom:26px"><span class=h style="color:${ROJO}">2</span>  Promete ganancias en pocos días. Ninguna inversión real las garantiza.</div><div><span class=h style="color:${ROJO}">3</span>  “Verificá tu edad y cobrá”: apunta a jubilados.</div></div>
<div class="pad src" style="bottom:95px;font-size:28px;color:${CREMA}">Al hacer clic, ESET llegó a páginas que imitaban a La Nación, CNN Argentina, TN, Clarín e Infobae, con figuras públicas usadas sin autorización.</div>`);
const paso=(n,t)=>`<div style="display:flex;gap:28px;align-items:flex-start;margin-bottom:34px"><div class=h style="font-size:70px;color:${ROJO};min-width:56px">${n}</div><div style="font-size:42px;line-height:1.25;font-weight:700">${t}</div></div>`;
const f3=page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Así sigue después del clic</span><div class=h style="font-size:96px;margin:30px 0 50px">CUATRO ETAPAS<br>DEL ENGAÑO.</div>
${paso(1,'Una falsa nota con aspecto de medio y un formulario: nombre, apellido y teléfono.')}
${paso(2,'A los pocos minutos llama un “asesor” de una empresa financiera.')}
${paso(3,'Te manda un mail con acceso a una plataforma. Usa el nombre de VT Markets, una empresa real que también es víctima.')}
${paso(4,'Te pide un mínimo de 150.000 pesos para empezar. El panel muestra ganancias que no existen.')}</div>
<div class="pad src" style="bottom:95px;font-size:28px;border-top:6px solid ${NEG};padding-top:26px">Fuente: ESET Latinoamérica, 15/10/2026. Ellos completaron los formularios y recibieron las llamadas.</div>`);
const f4=page(AMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Así lo verifica Vera</span><div class=h style="font-size:96px;margin:30px 0 50px">CINCO PASOS<br>ANTES DE DEPOSITAR.</div>
${paso(1,'Lee el anuncio, la captura o el link que le mandás.')}
${paso(2,'Revisa el link y el dominio con VirusTotal, Cloudflare y PhishStats.')}
${paso(3,'Mira desde cuándo existe el dominio.')}
${paso(4,'Lo cruza con los casos del Observatorio.')}
${paso(5,'Te da el semáforo y qué hacer.')}</div>
<div class="pad src" style="bottom:100px;font-size:31px;border-top:6px solid ${NEG};padding-top:26px">Vera orienta. La confirmación final es de la CNV, que publica qué entidades están autorizadas, y de la empresa por sus canales oficiales.</div>`);
const f5=page(NEG,CREMA,`<div class="pad" style="top:190px"><div class=h style="font-size:150px;color:${AMA}">ANTES DE<br>DEPOSITAR,<br>VERIFICÁ.</div><div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:50px">¿Te llegó un anuncio, una nota o una llamada con una inversión “segura”? Pegá el link o la captura en Vera.</div></div>
<div class="pad url" style="bottom:230px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div><div class="pad src" style="bottom:130px;font-size:34px;font-weight:700">Modalidad: cybermobile.com.ar/observatorio/inversion-falsa</div>`);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
fs.mkdirSync('html',{recursive:true});
const fr={f1,f2,f3,f4,f5};
for(const [f,h] of Object.entries(fr)){fs.writeFileSync(`html/${f}.html`,h);await p.goto('file://'+D+`/html/${f}.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:`historia-inversion-${f.slice(1)}.jpg`,type:'jpeg',quality:92});}
fs.writeFileSync('html/m.html',`<html><body style="margin:0;background:#222;display:flex;gap:24px;padding:24px">${[1,2,4].map(i=>`<img src="file://${D}/historia-inversion-${i}.jpg" style="width:560px">`).join('')}</body></html>`);
const q=await b.newPage({viewport:{width:1860,height:1060}});await q.goto('file://'+D+'/html/m.html');await q.waitForTimeout(500);await q.screenshot({path:'preview-inversion.jpg',type:'jpeg',quality:90});
await b.close();
