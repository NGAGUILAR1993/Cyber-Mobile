import re
R='/home/user/Cyber-Mobile'
src=open(R+'/scripts/redes/propuestas/2026-11-14/preview-chat-vera-foto.html').read()
css=re.search(r'<style>(.*?)</style>',src,re.S).group(1)
js=re.search(r'<script>(.*?)</script>',src,re.S).group(1)
css+="""
.big{font-family:AN;text-transform:uppercase;line-height:1.02;position:absolute;left:62px;right:50px}
.chip{position:absolute;font-family:JB;letter-spacing:.1em;font-size:28px}
.foot{position:absolute;left:62px;right:62px;bottom:120px;font-family:JB;font-size:27px;letter-spacing:.08em}
.bar{position:absolute;left:0;right:0}
.fwd{background:#d9fdd3}.nm{font-size:21px;font-weight:700;color:#128c7e;margin-bottom:3px}.nm.t{color:#c2410c}
.mini{font-size:19px;color:#6b7479;font-style:italic;margin-bottom:6px;border-left:4px solid #19e6c4;padding-left:9px}
"""
head='<!doctype html><html lang="es"><head><meta charset="utf-8"><style>'+css+'</style></head><body>'
def phone(h1,top,screen,stickers):
    return head+'<canvas id="ph"></canvas><div class="top"><b>CYBER MOBILE</b><span class="mono">%s</span></div><h1>%s</h1><div id="scr"><div class="sb"><span>09:13</span><span>5G ▮</span></div>%s<div class="inp"><div>Mensaje</div><span></span></div></div><div id="cam"></div><div id="glare"></div>%s<script>%s</script></body></html>'%(top,h1,screen,stickers,js)
def plain(bg,body):
    return head.replace('background:#f1ebdf','background:'+bg)+body+'<script>document.documentElement.setAttribute("data-listo","1")</script></body></html>'
AV=R+'/redes/2026-11-13/vacaciones-vera/vera-perfil.png'
hdv='<div class="hd"><span class="bk">‹</span><img src="%s"><div><b>Vera AI Antiestafas</b><small>en línea</small></div></div>'%AV
# A1 historia
rows=[('1','Plataforma de inversión falsa','93'),('2','App de acceso remoto','92'),('3','Phishing bancario','91')]
rh=''.join('<div style="display:flex;align-items:center;gap:26px;background:#0b0b0b;color:#f1ebdf;border-radius:18px;padding:26px 34px;margin-bottom:16px"><span style="font-family:AN;font-size:86px;color:#ffd400;width:70px">%s</span><span style="font-family:SG;font-weight:700;font-size:40px;line-height:1.1;flex:1">%s</span><span style="font-family:AN;font-size:92px;color:#19e66b">%s</span></div>'%r for r in rows)
A1=plain('#f1ebdf','''<div class="top" style="top:230px"><b>OBSERVATORIO DE FRAUDE DIGITAL</b><span class="mono">NOV 2026</span></div>
<div class="big" style="top:290px;font-size:170px">Lo vemos <span style="background:#ffd400;padding:0 14px;display:inline-block;transform:rotate(-2deg)">antes</span> que vos.</div>
<div style="position:absolute;left:62px;right:62px;top:900px">%s</div>
<span class="st" style="right:70px;top:850px;transform:rotate(4deg)">FUENTE PROPIA</span>
<div style="position:absolute;left:62px;right:62px;top:1580px;background:#fff;border-radius:26px;padding:26px 34px;box-shadow:8px 8px 0 #0b0b0b;font-family:SG;font-weight:700;font-size:42px">¿Te llegó alguna de estas?<div style="display:flex;gap:18px;margin-top:22px"><div style="flex:1;text-align:center;background:#19e66b;padding:20px;border-radius:14px">SÍ</div><div style="flex:1;text-align:center;background:#e9e3d6;padding:20px;border-radius:14px">NO</div></div></div>
<div class="mono" style="position:absolute;left:62px;top:1830px;font-size:22px">ÍNDICE DE ACTIVIDAD 0-100 · cybermobile.com.ar/observatorio</div>'''%rh)
# A2 f1
A2a=plain('#0b0b0b','''<div class="top" style="color:#f1ebdf"><b>CYBER MOBILE</b><span class="mono">OBSERVATORIO · NOV 2026</span></div>
<div class="big" style="top:230px;font-size:130px;color:#f1ebdf">N.º 1 en Argentina este mes</div>
<div class="big" style="top:620px;font-size:110px;color:#ffd400;background:none">Plataforma de inversión falsa</div>
<div style="position:absolute;left:62px;top:1010px;font-family:AN;font-size:560px;line-height:.9;color:#19e66b">93</div>
<div class="mono" style="position:absolute;left:70px;top:1560px;font-size:32px;color:#f1ebdf">/100 ÍNDICE DE ACTIVIDAD</div>
<div class="bar" style="top:1660px;height:120px;background:#ffd400;display:flex;align-items:center;padding:0 62px;font-family:SG;font-weight:700;font-size:38px;color:#0b0b0b">NUEVA EN EL RANKING: PHISHING DE ARCA (EMERGENTE)</div>
<div class="mono" style="position:absolute;left:62px;top:1830px;font-size:22px;color:#9a9a9a">Fuente: Observatorio de Fraude Digital de Cyber Mobile</div>''')
scrA='''%s<div class="chat">
<div class="b out"><div class="fw">↪ Reenviado</div>Duplicá tu dinero en 7 días. <span class="hl">Ganancia asegurada.</span> Transferí para activar tu cuenta:<br><span class="dm">inversion-segura-ar.online</span><time style="margin-top:12px">09:13 ✓✓</time>
<svg class="ink" fill="none" stroke="#ff2d1f" stroke-width="5.5" stroke-linecap="round"><path d="M18,140 q11.5,-11 23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0 t23,0"/></svg></div>
<div class="b in"><span class="tag">🔴 RIESGO ALTO</span><br>Es la <b>inversión falsa</b>: la modalidad N.º 1 del Observatorio.<p>🚩 Promete ganancias rápidas y altas</p><p>🚩 Te pide transferir para “activar”</p><div class="do">✋ No transfieras.</div><time>09:13</time></div></div>'''%hdv
A2b=phone('Así la analiza <span class="k">Vera.</span>','RECREACIÓN ILUSTRATIVA',scrA,'<span class="st" style="left:300px;top:1395px;transform:rotate(-4deg);font-size:32px">LA RECONOCE POR EL PATRÓN</span>')
A2c=plain('#ff2d1f','''<div class="top" style="color:#fff"><b>VERA · ANTIESTAFAS</b><span class="mono">RIESGO ALTO</span></div>
<div class="big" style="top:300px;font-size:330px;color:#fff;transform:rotate(-3deg);transform-origin:0 0">Es<br>estafa.</div>
<div style="position:absolute;left:0;right:0;top:1150px"><div style="height:130px;background:#ff2d1f;border:6px solid #fff;display:flex;align-items:center;padding:0 62px;font-family:SG;font-weight:700;font-size:44px;color:#fff">🔴 NO TOQUES · NO TRANSFIERAS</div><div style="height:100px;background:#ffd400;opacity:.9"></div><div style="height:100px;background:#19e66b;opacity:.9"></div></div>
<div class="big" style="top:1560px;font-size:84px;color:#0b0b0b;line-height:1.05">Lo vimos primero<br>en el Observatorio.</div>
<div class="foot" style="color:#fff;bottom:90px">ESCRIBILE A VERA · 7 DÍAS GRATIS</div>''')
# B
B1=plain('#f1ebdf','''<div class="top" style="top:230px"><b>CYBER MOBILE</b><span class="mono">1 DE 3</span></div>
<div class="big" style="top:330px;font-size:250px">La estafa<br>vive en el <span style="background:#ff2d1f;color:#fff;padding:0 16px;display:inline-block;transform:rotate(-2deg)">silencio.</span></div>
<div class="big" style="top:1220px;font-size:110px">Te llega.<br>No se lo contás a nadie.<br><span style="color:#ff2d1f">Le llega a otro.</span></div>
<div class="mono" style="position:absolute;left:62px;top:1740px;font-size:28px">HASTA QUE ALGUIEN LO CUENTA.</div>''')
scrB='''<div class="hd"><span class="bk">‹</span><div style="width:76px;height:76px;border-radius:50%;background:#19e6c4;display:flex;align-items:center;justify-content:center;font-size:40px">👨‍👩‍👧</div><div><b>Familia</b><small>Mamá, Hermano, Tía, Vos</small></div></div><div class="chat">
<div class="b out fwd"><div class="nm">Vos</div><div class="mini">Respuesta de Vera · recreación</div><div class="fw">↪ Reenviado</div><span class="tag">🔴 RIESGO ALTO</span><br>Es una <b>estafa</b>. No toques el link.<time>09:15 ✓✓</time></div>
<div class="b out">Me llegó recién. <b>Antes de abrir nada, se lo mando a Vera.</b><time>09:15 ✓✓</time></div>
<div class="b in"><div class="nm t">Mamá</div>A mí me había llegado. Menos mal, no lo abrí 🙏<time>09:16</time></div>
<div class="b in"><div class="nm">Hermano</div>Se lo paso a la tía ahora<time>09:16</time></div></div>'''
B2=phone('Uno avisa. <span class="k">Todos.</span>','RECREACIÓN ILUSTRATIVA',scrB,'<span class="st" style="left:260px;top:1395px;transform:rotate(-4deg);font-size:30px">REENVIÁS Y LISTO</span>')
import math
nodes='';lines=''
cx,cy=540,900
ring=[(r,n) for r,n in ((170,6),(300,10))]
pts=[]
for r,n in ring:
    for i in range(n):
        a=2*math.pi*i/n+(0.3 if r>200 else 0); pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
for x,y in pts:
    lines+='<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#19e6c4" stroke-width="4" opacity=".6"/>'%(cx,cy,x,y)
for i in range(6,len(pts)):
    x,y=pts[i];j=min(range(6),key=lambda k:(pts[k][0]-x)**2+(pts[k][1]-y)**2);lines+='<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="#19e6c4" stroke-width="3" opacity=".45"/>'%(x,y,pts[j][0],pts[j][1])
for x,y in pts: nodes+='<circle cx="%d" cy="%d" r="22" fill="#19e66b"/>'%(x,y)
B3=plain('#0b0b0b','''<div class="top" style="top:200px;color:#f1ebdf"><b>VERA · ANTIESTAFAS</b><span class="mono">3 DE 3</span></div>
<svg style="position:absolute;left:0;top:0" width="1080" height="1320">%s%s<circle cx="540" cy="900" r="46" fill="#ffd400"/><text x="540" y="988" font-family="AN" font-size="34" fill="#ffd400" text-anchor="middle" letter-spacing="3">VOS</text></svg>
<div class="big" style="top:290px;font-size:130px;color:#f1ebdf;line-height:1">Una red<br>que cuida.</div>
<div class="big" style="top:1330px;font-size:130px;line-height:1.02"><span style="color:#ffd400">Tu plata.</span><br><span style="color:#19e66b">Tu tranquilidad.</span><br><span style="color:#19e6c4">Tus datos.</span></div>
<div class="foot" style="color:#f1ebdf;bottom:90px;line-height:1.5">NADIE TIENE QUE QUEDARSE SIN PROTECCIÓN.<br>VERA · 7 DÍAS GRATIS · PACK FAMILIAR PARA 5</div>'''%(lines,nodes))
for n,h in [('A1-historia',A1),('A2a',A2a),('A2b',A2b),('A2c',A2c),('B1',B1),('B2',B2),('B3',B3)]:
    open(n+'.html','w').write(h)
