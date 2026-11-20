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
arca:{
 f1:page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Mail real · Observatorio #4</span><div class=h style="font-size:96px;margin-top:30px">“LA ENCOMIENDA <span class=mk>ESTÁ RETENIDA.</span>” NO LO ESCRIBIÓ ARCA.</div></div>
 ${img('arca-mail.png',640,190,700,626,945)}
 <div class="pad src" style="bottom:95px;font-size:27px">Fuente: Infobae, 05/11/2026 (hace 15 días). Mail apócrifo con el sello “FALSO” de la nota; datos tapados en origen.</div>`),
 f2:page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${AMA};color:${NEG}">Lo que mira Vera</span><div class=h style="font-size:104px;margin-top:30px">TRES SEÑALES<br><span style="color:${AMA}">EN UN SOLO MAIL.</span></div></div>
 ${img('arca-mail.png',620,190,700,626,945,[{x:20,y:302,w:590,h:245,t:'Cobra “aranceles” por mail',lx:20},{x:20,y:566,w:590,h:84,t:'Pide foto del DNI',lx:20,right:true},{x:20,y:666,w:590,h:60,t:'Apura: 3 días',lx:20}])}
 <div class="pad src" style="bottom:95px;font-size:28px;color:${CREMA}">ARCA lo dijo en sus redes: “Nunca solicitamos pagos ni datos personales por correo electrónico” (@ARCA_informa, según Infobae 05/11/2026).</div>`),
 f3:page(AMA,NEG,`<div class="pad" style="top:190px"><div class=h style="font-size:150px">NO PAGUES.<br>NO MANDES<br>EL DNI.</div><div style="font-size:50px;line-height:1.3;font-weight:700;margin-top:50px">Reenvialo a phishing@arca.gob.ar y consultá tus avisos solo en tu Domicilio Fiscal Electrónico.</div>
 <div style="font-size:50px;line-height:1.3;font-weight:700;margin-top:50px;border-top:8px solid ${NEG};padding-top:36px">¿Te llegó algo parecido? Pegalo en Vera antes de tocar nada.</div></div>
 <div class="pad url" style="bottom:230px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div><div class="pad src" style="bottom:130px;font-size:36px;font-weight:700">Ficha del caso: cybermobile.com.ar/observatorio/phishing-arca</div>`)},
hotel:{
 f1:page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag>Perfil real denunciado · Observatorio</span><div class=h style="font-size:104px;margin-top:30px">EL HOTEL <span style="color:${AMA}">NO ERA</span> EL HOTEL.</div></div>
 ${img('hotel-instagram.png',620,160,760,966,1250)}
 <div class="pad src" style="bottom:70px;font-size:26px">Fuente: La Nación, 13/10/2026 (hace 38 días). Captura de una víctima; seguidor de terceros tapado.</div>`),
 f2:page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Lo que mira Vera</span><div class=h style="font-size:104px;margin-top:30px">NOMBRE, FOTOS Y<br><span class=mk>PEDIDO DE PLATA.</span></div></div>
 ${img('hotel-instagram.png',560,190,700,966,1250,[{x:190,y:112,w:480,h:80,t:'Usurpa el nombre',lx:20,right:true,below:true},{x:50,y:515,w:850,h:105,t:'Copia dirección y fotos',lx:20,below:true}])}
 <div class="pad src" style="bottom:70px;font-size:28px">Según La Nación, pedían transferir $500.000 como seña para reservar durante la visita papal. El establecimiento real confirmó la suplantación.</div>`),
 f3:page(TUR,NEG,`<div class="pad" style="top:190px"><div class=h style="font-size:150px">ANTES DE<br>TRANSFERIR,<br>VERIFICÁ.</div><div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:50px">Confirmá el alojamiento por el sitio y teléfono oficiales, y no pagues una seña a una cuenta de un tercero.</div>
 <div style="font-size:48px;line-height:1.3;font-weight:700;margin-top:46px;border-top:8px solid ${NEG};padding-top:34px">Pegá el perfil o el link en Vera y mirá qué encuentra.</div></div>
 <div class="pad url" style="bottom:200px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div><div class="pad src" style="bottom:90px;font-size:34px;font-weight:700">Modalidad: cybermobile.com.ar/observatorio/alquiler-inexistente</div>`)},
google:{
 f1:page(CREMA,NEG,`<div class="pad" style="top:190px"><span class=tag>Mail real · aviso falso de Google</span><div class=h style="font-size:100px;margin-top:30px">“NUEVO INICIO DE SESIÓN.” <span class=mk>NO FUE GOOGLE.</span></div></div>
 ${img('google-mail.png',680,100,880,590,400)}
 <div class="pad src" style="bottom:110px;font-size:27px">Fuente: La Gaceta (Tucumán), 28/10/2026 (hace 23 días); imagen: Redes.Zone. Dirección tapada en origen.</div>`),
 f2:page(NEG,CREMA,`<div class="pad" style="top:190px"><span class=tag style="background:${AMA};color:${NEG}">Lo que mira Vera</span><div class=h style="font-size:104px;margin-top:30px">EL BOTÓN<br><span style="color:${AMA}">ES LA TRAMPA.</span></div></div>
 ${img('google-mail.png',560,100,880,590,400,[{x:180,y:330,w:230,h:52,t:'Lleva a una web falsa',lx:60}])}
 <div style="position:absolute;left:80px;right:80px;top:1250px;font-size:46px;line-height:1.3;font-weight:700">Simula un aviso de seguridad, apura a “comprobar actividad” y, según la nota, termina en una página que imita a Google para robar usuario y contraseña.</div>`),
 f3:page(AMA,NEG,`<div class="pad" style="top:190px"><div class=h style="font-size:150px">NO TOQUES<br>EL BOTÓN.</div><div style="font-size:50px;line-height:1.3;font-weight:700;margin-top:50px">Revisá la actividad entrando vos a tu cuenta desde la app o el sitio oficial. Google solo pide la contraseña en accounts.google.com.</div>
 <div style="font-size:50px;line-height:1.3;font-weight:700;margin-top:50px;border-top:8px solid ${NEG};padding-top:36px">Pegá el mail o el link en Vera y mirá qué encuentra.</div></div>
 <div class="pad url" style="bottom:140px;font-size:62px">CYBERMOBILE.COM.AR/AGENTE</div>`)}
};
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
fs.mkdirSync('html',{recursive:true});
for(const [c,fr] of Object.entries(casos))for(const [f,h] of Object.entries(fr)){fs.writeFileSync(`html/${c}-${f}.html`,h);
 await p.goto('file://'+D+`/html/${c}-${f}.html`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:`${c}-${f}.jpg`,type:'jpeg',quality:92});}
for(const c of Object.keys(casos)){
 const h=`<html><body style="margin:0;background:#222;display:flex;gap:30px;padding:30px">${['f1','f2','f3'].map(f=>`<img src="file://${D}/${c}-${f}.jpg" style="width:540px">`).join('')}</body></html>`;
 fs.writeFileSync('html/m.html',h);const q=await b.newPage({viewport:{width:1740,height:1080}});await q.goto('file://'+D+'/html/m.html');await q.waitForTimeout(500);await q.screenshot({path:`preview-${c}.jpg`,type:'jpeg',quality:90});}
await b.close();
