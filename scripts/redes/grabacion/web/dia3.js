// Reel 30 s · "Vera es un contacto": web real → agendarla → consultas reales (capturas de clientes, datos tapados)
function mk(n,src){const f=document.createElement('iframe');f.src=src;f.id='f'+n;document.getElementById('vp').appendChild(f);FR[n]=f;return new Promise(r=>f.onload=r);}
const U='cybermobile.com.ar';
const L=(a,b)=>`<span class="l">${a}</span>`+(b?`<br><span class="s">${b}</span>`:'');
const st=document.createElement('style');st.textContent=`
#ct{position:absolute;left:0;right:0;top:78px;bottom:0;background:#121316;z-index:41;transform:translateX(100%);color:#e3e3e3;font-family:"Liberation Sans",Arial,sans-serif}
#ct .hd{height:150px;display:flex;align-items:center;gap:40px;padding:0 40px;font-size:44px}
#ct .hd b{flex:1;font-weight:400}#ct .hd .g{background:#a8c7fa;color:#062e6f;font-weight:700;font-size:38px;padding:20px 44px;border-radius:50px}
#ct .av{width:260px;height:260px;border-radius:50%;margin:40px auto 70px;display:block;object-fit:cover;background:#0b0f1a}
#ct .fi{margin:0 50px 46px;border:3px solid #8e918f;border-radius:14px;height:150px;position:relative;display:flex;align-items:center;padding:0 36px;font-size:46px}
#ct .fi.on{border-color:#a8c7fa}#ct .fi span{position:absolute;top:-28px;left:26px;background:#121316;padding:0 12px;font-size:32px;color:#c4c7c5}
#ct .fi.on span{color:#a8c7fa}#ct .cur{display:inline-block;width:4px;height:56px;background:#a8c7fa;margin-left:4px;vertical-align:middle}
#ct .toast{position:absolute;left:50%;bottom:120px;transform:translateX(-50%);background:#e3e3e3;color:#111;font-size:38px;padding:24px 44px;border-radius:16px;opacity:0;white-space:nowrap}
#wa2{position:absolute;left:0;right:0;top:78px;bottom:0;background:#0b141a;z-index:42;transform:translateX(100%)}
#wa2 .wh{position:absolute;left:0;right:0;top:0;height:160px;background:#1f2c33;display:flex;align-items:center;gap:22px;padding:0 30px;z-index:2}
#wa2 .wh .ar{font-size:54px;color:#e9edef}#wa2 .wh img{width:100px;height:100px;border-radius:50%;object-fit:cover}
#wa2 .wh b{font-size:42px;display:block;color:#e9edef;font-weight:400}#wa2 .wh small{font-size:30px;color:#8696a0}
#wa2 .bd{position:absolute;left:0;right:0;top:160px;bottom:150px;overflow:hidden}
#wa2 .col{position:absolute;left:0;top:0;width:1080px}#wa2 .col img{display:block;width:1080px;margin-bottom:24px}
#wa2 .in{position:absolute;left:20px;right:150px;bottom:22px;height:110px;border-radius:55px;background:#1f2c33;font-size:38px;color:#8696a0;display:flex;align-items:center;padding:0 40px}
#wa2 .mic{position:absolute;right:20px;bottom:22px;width:110px;height:110px;border-radius:50%;background:#00a884}
#cta .e{font-family:G;font-size:46px;color:#fff;margin-top:34px;line-height:1.35}`;
document.head.appendChild(st);
const ph=document.getElementById('phone');
ph.insertAdjacentHTML('beforeend',`<div id="ct"><div class="hd"><span>✕</span><b>Crear contacto</b><span class="g">Guardar</span></div>
<img class="av" src="/cyber_agent_logo.png"><div class="fi on"><span>Nombre</span><i id="nom"></i><i class="cur" id="cur"></i></div>
<div class="fi"><span>Empresa</span>Cyber Mobile</div><div class="fi"><span>Teléfono (Móvil)</span>+54 9 11 7059-8505</div>
<div class="toast" id="toast">Contacto guardado</div></div>
<div id="wa2"><div class="wh"><span class="ar">&#8592;</span><img src="/cyber_agent_logo.png"><div><b>Vera AI Antiestafas</b><small>Cuenta de empresa</small></div></div>
<div class="bd"><div class="col" id="col">${[1,2,3,4,5].map(i=>`<img src="/comp/casos-vera/c${i}.png">`).join('')}</div></div>
<div class="in">Mensaje</div><div class="mic"></div></div>`);
// tapa (y) del cuerpo del chat: la tapa de cada caso queda a 260 px del borde
const OFF=[0,624,1210,2680,4086], TOPC=320;
const Y=[[9.0,-TOPC],[12.2,-TOPC],[12.8,OFF[1]-TOPC],[15.4,OFF[1]-TOPC],[16.0,OFF[2]-TOPC],[16.6,OFF[2]-TOPC],[18.6,1124],[19.0,1124],[19.6,OFF[3]-TOPC],[20.2,OFF[3]-TOPC],[21.8,2530],[22.2,2530],[22.8,OFF[4]-TOPC]];
const NOM='Vera AI Antiestafas';
CTA.ig=`<img src="/cyber_agent_logo.png"><div class="a">Comentá<br>VERA</div><div class="b">para conocerla<br>en tu celular</div><div class="e">y compartila con amigos y familia</div><div class="c">7 días gratis</div>`;
CTA.wa=`<img src="/cyber_agent_logo.png"><div class="a">Agendá<br>a Vera</div><div class="b">+54 9 11 7059-8505</div><div class="e">y compartila con amigos y familia</div><div class="c">7 días gratis</div>`;
CTA.tt=`<img src="/cyber_agent_logo.png"><div class="a">Link en<br>el perfil</div><div class="b">Agendá a Vera<br>en tu celular</div><div class="c">7 días gratis</div>`;
C={
  scenes:[{from:0,to:99,frame:'H',url:U,scroll:[[0,0],[2.9,0],[4.2,{sel:'.actions',off:300}]]}],
  cam:[[0,[1.12,540,700]],[0.8,[1,540,960]],[4.3,[1,540,960]],[4.7,[1.08,540,1150]],[5.1,[1.08,540,1150]],[5.4,[1,540,960]]],
  hits:[0.05,9.05],
  taps:[{t:4.85,frame:'H',sel:'a[data-track=cta_whatsapp_hero]'},{t:8.35,pos:[930,306]}],
  tits:[
    [0,2.9,L('Vera no es una app.<br>Es un contacto 📱','Una experta en estafas en tu WhatsApp'),262],
    [3.0,5.3,L('1. Entrás a la web<br>y tocás WhatsApp'),262],
    [5.5,9.0,L('2. La agendás como<br>Vera AI Antiestafas'),1380],
    [9.2,12.2,L('3. Le preguntás:<br>¿Me robaron la clave?','🔴 Tu correo está comprometido'),262],
    [12.8,15.4,L('¿Esta IP es peligrosa?','🔴 Maliciosa según VirusTotal'),262],
    [16.0,19.0,L('Un mail que me amenaza','🔴 Sextorsión: chantaje masivo'),262],
    [19.6,22.2,L('Un SMS de “deuda”','🔴 Smishing: no toques el link'),262],
    [22.8,26.4,L('¿Quién me llama?','🟡 Número con denuncias públicas'),262]
  ],
  labs:[[5.5,9.0,'Recreación de la pantalla de contacto',1780],[9.2,26.5,'Respuestas reales de Vera · datos tapados',1660]],
  ctaFrom:26.5,
  extra(t){
    const ct=document.getElementById('ct');ct.style.transform=`translateX(${(1-eo(cl((t-5.25)/.35,0,1)))*100}%)`;
    const n=Math.round(cl((t-6.0)/1.6,0,1)*NOM.length);document.getElementById('nom').textContent=NOM.slice(0,n);
    document.getElementById('cur').style.opacity=(t<7.6||Math.floor(t*2.5)%2)?1:0;
    document.getElementById('toast').style.opacity=t>8.5&&t<9.1?1:0;
    const w=document.getElementById('wa2');w.style.transform=`translateX(${(1-eo(cl((t-8.75)/.35,0,1)))*100}%)`;
    document.getElementById('col').style.transform=`translateY(${-track(Y,t,v=>v)}px)`;
  }
};
(async()=>{
  await mk('H','/');
  await Promise.all([...document.querySelectorAll('#col img,#ct img,#wa2 img')].map(i=>i.complete?1:new Promise(r=>i.onload=r)));
  await document.fonts.ready;try{await FR.H.contentDocument.fonts.ready}catch(e){}
  document.documentElement.dataset.listo=1;
})();
