#!/usr/bin/env python3
# Sonido "El motor de Vera" v4 (30 s, 44100, mono). Sin numpy, sin temas con derechos.
# Musica 100% PROCEDURAL estilo synthwave/cyber (arpegio + sub bass + pad + beat sutil),
# a volumen de fondo con ducking bajo los golpes, y sube en el cierre. Mezclada con los SFX.
# Timeline: intro 0-4 | viaje 4-6.2 | lienzo+ignite 6.2-9.5 | ZOOM 9.9-18.8 | texto 18.9-24.8 | cierre 24.9-30
import wave, struct, math, random
SR=44100; DUR=30.0; N=int(SR*DUR); buf=[0.0]*N; random.seed(9)
def add(t0,dur,fn,g=1.0):
    a=int(t0*SR); b=min(N,int((t0+dur)*SR))
    for i in range(a,b):
        p=(i-a)/(b-a) if b>a else 0
        buf[i]+=g*fn((i-a)/SR,p)
def env(p,atk=0.02,rel=0.3):
    if p<atk: return p/atk
    if p>1-rel: return max(0.0,(1-p)/rel)
    return 1.0
def nz(): return random.random()*2-1

# ====== MUSICA PROCEDURAL (bed) ======
BPM=100.0; beat=60.0/BPM; bar=beat*4
prog=[(55.0,[220.0,261.6,329.6]),   # Am
      (43.65,[174.6,220.0,261.6]),  # F
      (65.41,[261.6,329.6,392.0]),  # C
      (49.0,[196.0,246.9,293.7])]   # G
# ducking: baja la musica en estos instantes (golpes/placas)
duckpts=[(3.9,0.6,0.22),(6.2,0.6,0.2),(10.5,0.5,0.18),(13.2,0.5,0.18),(15.9,0.5,0.18),
         (6.6,0.45,0.16),(18.9,0.5,0.16),(21.6,0.5,0.16),(24.9,0.6,0.2),(25.7,0.65,0.2)]
def duck(t):
    d=0.0
    for c,dep,w in duckpts:
        x=(t-c)/w; d=max(d,dep*math.exp(-x*x))
    return 1.0-d
def mlevel(t):
    base=0.11
    base*= (1.0 - 0.6*max(0.0,min(1.0,(2.0-t)/2.0)))   # fade-in 0-2s
    base*= (1.0 + 1.1*max(0.0,min(1.0,(t-25.2)/1.6)))   # sube en el cierre
    base*= (1.0 - 0.85*max(0.0,min(1.0,(t-29.4)/0.6)))  # fade-out final
    return base*duck(t)
for i in range(N):
    t=i/SR
    root,tones=prog[int(t/bar)%4]
    ph=t*root
    sub=0.62*math.sin(2*math.pi*ph)+0.12*math.sin(2*math.pi*ph*2)
    pad=(sum(math.sin(2*math.pi*fr*t) for fr in tones)/3.0)*(0.6+0.4*math.sin(2*math.pi*0.07*t))
    ei8=beat/2.0
    atone=tones[int(t/ei8)%3]*2.0
    ap=(t%ei8)/ei8
    arp=(0.7*math.sin(2*math.pi*atone*t)+0.3*math.sin(2*math.pi*atone*2*t))*math.exp(-ap*5.0)
    bp=(t%beat)/beat
    kick=math.sin(2*math.pi*(95*math.exp(-bp*20)+46)*t)*math.exp(-bp*13)
    hp=(t%ei8)/ei8
    hat=nz()*math.exp(-hp*34)
    m=0.5*sub+0.26*pad+0.32*arp+0.5*kick+0.10*hat
    buf[i]+=m*mlevel(t)

# ====== CAMA grave + SFX ======
def drone(t,p):
    b=50+7*p
    s=0.5*math.sin(2*math.pi*b*t)+0.22*math.sin(2*math.pi*b*2*t)+0.1*math.sin(2*math.pi*b*1.5*t)
    return s*(0.55+0.45*math.sin(2*math.pi*0.1*t))
add(0.0,30.0,drone,0.08)

# intro: pop reenviado + alerta de Vera
add(0.9,0.4,lambda t,p: math.sin(2*math.pi*(430-120*p)*t)*math.exp(-t*9),0.15)
def alert(t,p):
    f=[587,466,392][min(2,int(p*3))]
    return (math.sin(2*math.pi*f*t)+0.4*math.sin(2*math.pi*f*2*t))*math.exp(-(t%0.5)*7)
add(1.8,1.3,alert,0.11)

# viaje: whoosh + sub-drop + bits
add(3.9,2.4,lambda t,p:(0.55*nz()+0.45*math.sin(2*math.pi*(1700-1350*p)*t))*env(p,0.12,0.45),0.12)
add(4.2,1.4,lambda t,p: math.sin(2*math.pi*(72*math.exp(-t*2.2)+34)*t)*math.exp(-t*2.6),0.46)
def bits(t,p):
    ph=(t*22)%1
    return math.exp(-ph*16)*(0.6*math.sin(2*math.pi*1400*t)+0.4*nz())
add(4.4,5.0,lambda t,p: bits(t,p)*(0.5+0.5*math.sin(2*math.pi*0.3*t)),0.04)

# lienzo: impacto escudo + swell
add(6.2,1.0,lambda t,p: math.sin(2*math.pi*(150*math.exp(-t*4)+62)*t)*math.exp(-t*3.6),0.46)
def swell(fs):
    def f(t,p): return (sum(math.sin(2*math.pi*fr*t) for fr in fs)/len(fs))*env(p,0.3,0.3)
    return f
add(6.3,3.0,swell([131,196,262,330]),0.045)

# ignite: run ascendente corto (nodos encendiendo)
def chime(fr):
    def f(t,p): return (math.sin(2*math.pi*fr*t)+0.5*math.sin(2*math.pi*fr*2*t))*math.exp(-t*6.5)
    return f
run=[392,440,494,523,587,659]
for k,fr in enumerate(run):
    add(6.5+k*0.26,0.4,chime(fr),0.08)

# zoom focus chimes (VirusTotal, PhishStats, Cloudflare)
add(10.5,0.6,chime(523),0.13)
add(13.2,0.6,chime(659),0.13)
add(15.9,0.7,chime(784),0.14)

# acentos de texto
add(6.6,0.5,chime(392),0.09)
add(18.9,0.6,chime(440),0.11)
add(21.6,0.6,chime(523),0.11)
add(24.9,0.6,chime(587),0.12)

# cierre: whoosh + impacto + shimmer (la musica ya sube con mlevel)
add(25.3,0.7,lambda t,p:(0.5*nz()+0.5*math.sin(2*math.pi*(1400-1000*p)*t))*env(p,0.1,0.5),0.1)
add(25.7,1.3,lambda t,p: math.sin(2*math.pi*(92*math.exp(-t*2.4)+42)*t)*math.exp(-t*2.3),0.5)
def shimmer(t,p):
    return (sum(math.sin(2*math.pi*fr*t+0.5*math.sin(2*math.pi*5*t)) for fr in [659,988,1319])/3)*env(p,0.15,0.5)
add(25.9,4.1,shimmer,0.045)

pk=max(1e-6,max(abs(x) for x in buf)); g=0.86/pk
with wave.open('sfx.wav','w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1,min(1, math.tanh(x*g*1.05)))*32767)) for x in buf))
print('sfx.wav ok (musica procedural + sfx)')
