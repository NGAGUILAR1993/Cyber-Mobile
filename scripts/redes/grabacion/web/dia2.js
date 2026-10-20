// Miércoles 21/10 · "El Observatorio"
function mk(n,src){const f=document.createElement('iframe');f.src=src;f.id='f'+n;document.getElementById('vp').appendChild(f);FR[n]=f;return new Promise(r=>f.onload=r);}
const U='cybermobile.com.ar<span class="gr">/observatorio</span>';
const L=(a,b)=>`<span class="l">${a}</span>`+(b?`<br><span class="s">${b}</span>`:'');
const CH={sel:'#resumen figure.chart',i:0,off:95}, PR={sel:'#resumen figure.chart',i:1,off:95};
C={
  scenes:[
    {from:0,to:11.5,frame:'O',url:U,scroll:[[0,0],[2.6,0],[3.5,CH],[5.0,CH],[5.9,PR],[7.6,PR],[8.4,{sel:'#topList',off:150}],[9.9,{sel:'#topList',off:150}],[10.9,{sel:'#topList a.ficha',off:330}],[11.5,{sel:'#topList a.ficha',off:330}]]},
    {from:11.5,to:99,frame:'F',url:U+'<span class="gr">/acceso-remoto-app</span>',load:true,scroll:[[11.5,0],[12.3,0],[13.1,{sel:'#resumen',off:95}],[14.8,{sel:'#resumen',off:95}],[15.6,{sel:'#que-hacer',off:95}],[17.3,{sel:'#que-hacer',off:95}],[18.2,{sel:'aside .cta',off:170}],[19.6,{sel:'aside .cta',off:170}]]}
  ],
  cam:[[0,[1.14,80,700]],[0.7,[1,540,960]],[6.0,[1,540,960]],[6.6,[1.1,120,1150]],[7.5,[1.1,120,1150]],[8.0,[1,540,960]],
       [8.5,[1,540,960]],[9.0,[1.16,120,760]],[9.9,[1.16,120,760]],[10.4,[1,540,960]],
       [13.1,[1,540,960]],[13.6,[1.08,100,900]],[14.8,[1.08,100,900]],[15.2,[1,540,960]],
       [15.7,[1,540,960]],[16.2,[1.1,100,900]],[17.3,[1.1,100,900]],[17.7,[1,540,960]]],
  hits:[8.45],
  flashes:[],
  taps:[
    {t:11.25,frame:'O',sel:'#topList a.ficha'},
    {t:19.15,frame:'F',sel:'aside .cta a'}
  ],
  ev:[],
  tits:[
    [0,2.75,L('La estafa nº1 de octubre<br>no te llega por WhatsApp','¿Sabés cuál es? 👇'),262],
    [2.85,5.7,L('Medimos por dónde<br>llegan las estafas'),262],
    [5.8,8.1,L('y en qué provincias<br>se reportan'),262],
    [8.2,11.4,L('#1: te llaman \"del banco\"<br>y te hacen instalar una app'),262],
    [11.6,14.9,L('Cada estafa tiene su ficha:<br>cómo reconocerla'),262],
    [15.0,17.6,L('y qué hacer si te pasa'),262],
    [17.7,19.55,L('¿Te llegó algo así?<br>Consultá a Vera'),262]
  ],
  labs:[],
  ctaFrom:19.6,
  // Cierre pedido por el dueño (20/10): invitar a escribirle a Vera, con los 7 días gratis.
  cta:{
    ig:`<img src="/cyber_agent_logo.png"><div class="a">Animate a<br>escribirle</div><div class="b">Mandale a Vera ese mensaje<br>que te hizo dudar</div><div class="c">7 días gratis</div><div class="d">Comentá VERA y te paso el link</div>`,
    wa:`<img src="/cyber_agent_logo.png"><div class="a">Animate a<br>escribirle</div><div class="b">Vera por WhatsApp<br>+54 9 11 7059-8505</div><div class="c">7 días gratis</div>`,
    tt:`<img src="/cyber_agent_logo.png"><div class="a">Animate a<br>escribirle</div><div class="b">Mandale a Vera ese mensaje<br>que te hizo dudar</div><div class="c">7 días gratis</div><div class="d">Link en el perfil</div>`
  }
};
(async()=>{
  await Promise.all([mk('O','/observatorio'),mk('F','/observatorio/acceso-remoto-app')]);
  await document.fonts.ready;
  for(const n in FR){try{await FR[n].contentDocument.fonts.ready}catch(e){}}
  document.documentElement.dataset.listo=1;
})();
