# Pista instrumental original, sintetizada con stdlib: thriller oscuro, 90 BPM, Re menor con tensiones (Mib, Lab).
# Uso: python3 musica_thriller.py salida.wav
import math, random, sys, wave, struct
from array import array
R=44100; DUR=30.0; N=int(R*DUR); BT=60/90; TAU=2*math.pi
random.seed(18); sin=math.sin; exp=math.exp
L=array('d',[0.0])*N; Rr=array('d',[0.0])*N
def add(i0,buf,gl=1.0,gr=1.0):
    for i,v in enumerate(buf):
        j=i0+i
        if 0<=j<N: L[j]+=v*gl; Rr[j]+=v*gr
# bajo grave sostenido (D1 + octava, deriva lenta) con respiración
ph1=ph2=0.0
for i in range(N):
    t=i/R; f=36.71*(1+.003*sin(TAU*.11*t)); ph1+=TAU*f/R; ph2+=TAU*f*2.004/R
    env=min(1,t/2.5)*min(1,(DUR-t)/2.0)*(.8+.2*sin(TAU*t/(8*BT)))
    s=env*(.55*sin(ph1)+.16*sin(ph2)+.08*sin(2*ph1+.7*sin(ph1)))
    L[i]+=s; Rr[i]+=s
# pulso suave (latido grave) en beats 1 y 3 de cada compás, tenue al inicio
def thump(a):
    n=int(.3*R); o=[]; ph=0.0
    for i in range(n):
        t=i/R; ph+=TAU*(40+38*exp(-t/.03))/R; o.append(a*exp(-t/.11)*sin(ph))
    return o
k=0
while True:
    t=k*BT*2 if False else k*BT
    if t>DUR-1.5: break
    if k%2==0 or t>=12.0:
        a=.30 if t<6.667 else .42
        if t>=16.667 and t<21.333: a=.5
        add(int(t*R),thump(a*(1 if k%4==0 else .8)))
    k+=1
# pads disonantes: cluster Re3, Mib4, La4, Lab4 con lento vibrato/tremolo, cambian cada 4 compases
CL=[[146.83,311.13,440.0,415.30],[146.83,311.13,415.30,466.16],[130.81,277.18,392.0,415.30],[146.83,329.63,415.30,440.0]]
BAR=4*BT
for i in range(N):
    t=i/R; c=CL[int(t/(2*BAR))%4]; env=min(1,t/3)*min(1,(DUR-t)/2.0)*(.30+.12*min(1,t/12))
    tr=.75+.25*sin(TAU*(.35+.1*(t/DUR))*t)
    s=0.0
    for n,f in enumerate(c):
        d=1+.004*sin(TAU*.13*t+n)
        s+=sin(TAU*f*d*t)+.35*sin(TAU*f*2*d*t)
    s*=env*tr*.12
    L[i]+=s*(1 if i%2 else .9); Rr[i]+=s*(.9 if i%2 else 1)
# riser: ruido filtrado que sube + tono ascendente + silencio antes del golpe
def riser(t0,t1,amp,f0,f1):
    n=int((t1-t0)*R); i0=int(t0*R); lp=0.0; ph=0.0
    for i in range(n):
        u=i/n; a=amp*u**2.2*(1 if u<.97 else (1-u)/.03)
        c=.02+.5*u*u; lp+=c*(random.uniform(-1,1)-lp)
        ph+=TAU*(f0+(f1-f0)*u**2)/R
        v=a*(.9*lp+.35*sin(ph)*0.5)
        if 0<=i0+i<N: L[i0+i]+=v; Rr[i0+i]+=v
riser(11.8,16.667,.55,110,1400)
riser(19.2,21.333,.35,180,1100)
# golpes: impacto en la pantalla del veredicto (16.667) y en Qué hacer (21.333)
def boom(t0,amp):
    n=int(2.2*R); i0=int(t0*R); ph=0.0; lp=0.0
    for i in range(n):
        t=i/R; ph+=TAU*(34+120*exp(-t/.06))/R; lp+=.08*(random.uniform(-1,1)-lp)
        v=amp*(exp(-t/.7)*sin(ph)+.6*exp(-t/.25)*lp+.25*exp(-t/.5)*sin(TAU*73.4*t))
        if 0<=i0+i<N: L[i0+i]+=v; Rr[i0+i]+=v
boom(16.667,.85); boom(17.333,.45); boom(21.333,.6)
# golpes de texto tenues sobre los beats de la portada
def tick(t0,amp):
    n=int(.25*R); i0=int(t0*R); ph=0.0
    for i in range(n):
        t=i/R; ph+=TAU*(70+60*exp(-t/.03))/R; v=amp*exp(-t/.09)*sin(ph)
        if 0<=i0+i<N: L[i0+i]+=v; Rr[i0+i]+=v
for t in (.1,.77,1.43,2.1,2.77,3.6): tick(t,.3)
for t in (21.9,23.5,25.1,26.7): tick(t,.22)
# mezcla: RMS ~ -17 dB, pico < -1 dB
tot=[(L[i],Rr[i]) for i in range(N)]
rms=math.sqrt(sum((a*a+b*b)/2 for a,b in tot)/N)
g=10**(-17/20)/rms
pk=max(max(abs(a),abs(b)) for a,b in tot)*g
if pk>10**(-1.5/20): g*=10**(-1.5/20)/pk
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<hh',int(max(-1,min(1,a*g))*32767),int(max(-1,min(1,b*g))*32767)) for a,b in tot)); w.close()
