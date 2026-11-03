#!/usr/bin/env python3
# Diseno de sonido para "El tablero de Vera" (30 s, 44100, mono). Sin numpy.
import wave, struct, math, random
SR=44100; DUR=30.0; N=int(SR*DUR)
buf=[0.0]*N
def add(t0, dur, fn, gain=1.0):
    a=int(t0*SR); b=min(N,int((t0+dur)*SR))
    for i in range(a,b):
        buf[i]+=gain*fn((i-a)/SR,(i-a)/(b-a) if b>a else 0)
def env(p, atk=0.02, rel=0.3):
    if p<atk: return p/atk
    if p>1-rel: return max(0.0,(1-p)/rel)
    return 1.0
# 1) cama grave (drone) todo el reel
def drone(t,p):
    base=55.0
    s=0.5*math.sin(2*math.pi*base*t)+0.28*math.sin(2*math.pi*base*2*t)+0.14*math.sin(2*math.pi*base*1.5*t)
    lfo=0.6+0.4*math.sin(2*math.pi*0.15*t)
    return s*lfo
add(0.0,30.0,drone,0.10)
# 2) pulso rítmico suave (corchea) que da tensión creciente en los chequeos
def pulse(t,p):
    beat=0.5
    ph=(t%beat)/beat
    click=math.exp(-ph*22)*math.sin(2*math.pi*180*t)
    return click
add(4.2,15.8,lambda t,p: pulse(t,p)*(0.3+0.7*p),0.08)
# 3) barrido del escáner (whoosh) 5.2-7.9
def sweep(t,p):
    f=300+1700*p
    n=(random.random()*2-1)
    tone=math.sin(2*math.pi*f*t)
    return (0.6*tone+0.4*n)*env(p,0.1,0.35)
add(5.2,2.7,sweep,0.09)
# 4) ticks de cada módulo (ping UI descendente = sospechoso)
def ping(freq):
    def f(t,p):
        return math.sin(2*math.pi*freq*(1-0.15*p)*t)*math.exp(-p*6)*env(p,0.005,0.6)
    return f
for ts in (8.6,11.0,13.6,16.2):
    add(ts,0.5,ping(680),0.16)
    add(ts+0.18,0.4,ping(340),0.12)
# 5) impacto rojo (RIESGO ALTO) ~19s
def impact(t,p):
    f=140*math.exp(-p*2.2)
    body=math.sin(2*math.pi*f*t)
    noise=(random.random()*2-1)*math.exp(-p*9)
    return (body*0.8+noise*0.5)*env(p,0.004,0.5)
add(18.9,1.3,impact,0.5)
# riser antes del impacto
def riser(t,p):
    f=120+900*p*p
    return math.sin(2*math.pi*f*t)*p*env(p,0.2,0.1)
add(17.0,1.9,riser,0.12)
# 6) resolución cálida al mostrar la respuesta real (~22s) y cierre (~27s)
def chime(root):
    def f(t,p):
        s=0.0
        for k,g in ((1,1.0),(1.5,0.5),(2.0,0.35)):
            s+=g*math.sin(2*math.pi*root*k*t)
        return s*math.exp(-p*2.2)*env(p,0.01,0.6)
    return f
add(22.0,1.6,chime(330),0.14)
add(27.0,2.0,chime(392),0.16)
add(27.0,2.0,chime(523),0.10)
# normalizar suave (limiter) + fade in/out
mx=max(1e-6,max(abs(x) for x in buf))
norm=0.92/mx if mx>0.92 else 1.0
fi=int(0.15*SR); fo=int(0.5*SR)
with wave.open('/home/user/Cyber-Mobile/redes/2026-11-03/tablero-vera/sfx.wav','w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    out=bytearray()
    for i,x in enumerate(buf):
        v=x*norm
        # soft clip
        v=math.tanh(v*1.1)
        if i<fi: v*=i/fi
        if i>N-fo: v*=max(0.0,(N-i)/fo)
        out+=struct.pack('<h',int(max(-1,min(1,v))*32767))
    w.writeframes(bytes(out))
print('sfx.wav OK')
