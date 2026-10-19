// Martes 20/10 · "Así funciona Cyber Mobile"
function mk(n,src){const f=document.createElement('iframe');f.src=src;f.id='f'+n;document.getElementById('vp').appendChild(f);FR[n]=f;return new Promise(r=>f.onload=r);}
const U='cybermobile.com.ar';
const L=(a,b)=>`<span class="l">${a}</span>`+(b?`<br><span class="s">${b}</span>`:'');
const msgs=[];
function waMsg(cls,html,hora){const d=document.createElement('div');d.className='m '+cls;d.innerHTML=html+`<span class="h">${hora}${cls==='yo'?' <span style="color:#53bdeb">✓✓</span>':''}</span>`;document.getElementById('waBd').appendChild(d);return d;}
C={
  scenes:[
    {from:0,to:7.0,frame:'H',url:U,scroll:[[0,0],[2.7,0],[5.0,{sel:'.bento',off:235}],[5.9,{sel:'.bento',off:235}],[6.5,{sel:'.actions',off:300}],[7,{sel:'.actions',off:300}]]},
    {from:7.0,to:13.6,frame:'A',url:U+'<span class="gr">/agente</span>',load:true,scroll:[[7,0],[7.25,0],[7.65,{sel:'#consola',off:8}],[8.85,{sel:'#consola',off:8}],[8.9,0]]},
    {from:13.6,to:99,frame:'H',url:U,load:true,scroll:[[13.6,{sel:'.actions',off:300}]]}
  ],
  cam:[[0,[1.14,80,760]],[0.7,[1,540,960]],[3.0,[1,540,960]],[3.9,[1.1,200,1300]],[5.6,[1.1,200,1300]],[6.2,[1,540,960]],
       [11.3,[1,540,960]],[11.9,[1.12,540,1000]],[13.4,[1.12,540,1000]],[13.6,[1,540,960]],
       [17.2,[1,540,960]],[17.8,[1.12,60,1150]],[19.4,[1.12,60,1150]],[19.6,[1,540,960]]],
  hits:[11.35,17.0],
  flashes:[11.35],
  taps:[
    {t:6.75,frame:'H',sel:'a[data-track=cta_agente_web_hero]'},
    {t:7.95,frame:'A',sel:'.ej'},
    {t:8.75,frame:'A',sel:'#analizar'},
    {t:14.35,frame:'H',sel:'a[data-track=cta_whatsapp_hero]'}
  ],
  ev:[
    [7.95,()=>doc('A').querySelector('.ej').click()],
    [8.75,()=>doc('A').querySelector('#analizar').click()],
    [11.0,()=>window.__soltar&&window.__soltar()]
  ],
  tits:[
    [0,2.75,L('¿Ese link de PAMI<br>es estafa?','Mirá cómo lo sabés en segundos'),262],
    [2.9,6.0,L('Vera revisa links, CBU,<br>números, mails y archivos'),262],
    [7.1,8.75,L('1. En la web:<br>pegás el link'),262],
    [8.9,11.3,L('Vera lo investiga'),262],
    [11.4,13.55,L('🔴 Riesgo alto<br>y qué hacer'),262],
    [13.7,14.9,L('2. O por WhatsApp'),262],
    [15.0,17.0,L('Le mandás la captura'),262],
    [17.1,19.55,L('y te dice qué hacer 🔴🟡🟢'),262]
  ],
  labs:[[8.9,13.6,'Recreación: consulta de ejemplo'],[14.8,19.6,'Recreación: chat de ejemplo']],
  ctaFrom:19.6,
  extra(t){
    if(t>11.2&&t<13.6){const m=doc('A').querySelector('#mensajes'),v=doc('A').querySelector('.veredicto');
      if(m&&v){const top=v.getBoundingClientRect().top-m.getBoundingClientRect().top+m.scrollTop-12,max=m.scrollHeight-m.clientHeight;const a=Math.min(top,max);
        m.scrollTop=t<12.3?a:lerp(a,max,ez(cl((t-12.3)/1.0,0,1)));}}
    const wa=document.getElementById('wa');
    const k=cl((t-14.75)/.35,0,1);wa.style.transform=`translateX(${(1-eo(k))*100}%)`;
    const est=document.getElementById('waEst');est.textContent=(t>16.0&&t<16.9)?'escribiendo…':'en línea';
    for(const m of msgs){const d=t-m.t;m.el.style.opacity=d<0?0:cl(d/.2,0,1);m.el.style.transform=`translateY(${d<0?30:(1-eo(cl(d/.25,0,1)))*30}px)`;}
  }
};
(async()=>{
  await Promise.all([mk('H','/'),mk('A','/agente')]);
  msgs.push({t:15.35,el:waMsg('yo',`<div class="cap"><div class="n">Mensajes · <i></i></div><div class="bub">PAMI informa: su credencial vence hoy. Actualice sus datos para no perder la cobertura: <u>pami-tramites.online</u></div></div>`,'20:15')});
  msgs.push({t:16.9,el:waMsg('el',`🔴 <b>Es una estafa.</b><br>El link imita a PAMI: <b>pami-tramites.online</b> no es un sitio oficial.<br><br><b>Qué hacer:</b><br>1. No lo abras ni cargues datos.<br>2. Borrá el mensaje.<br>3. PAMI no pide datos por SMS.`,'20:15')});
  await document.fonts.ready;
  for(const n in FR){try{await FR[n].contentDocument.fonts.ready}catch(e){}}
  document.documentElement.dataset.listo=1;
})();
