# Pista instrumental original, sintetizada con stdlib: gamer chiptune-synthwave, 128 BPM, La menor (Am-F-C-G).
# Uso: python3 musica_gamer.py salida.wav   (distinta de pop 106, techno 126 y thriller 90 usadas antes)
import math, random, sys, wave, struct
from array import array
R=44100; DUR=30.0; N=int(R*DUR); BT=60/128; TAU=2*math.pi
random.seed(22); sin=math.sin; exp=math.exp
L=array('d',[0.0])*N; Rr=array('d',[0.0])*N
def mix(i0,buf,g=1.0,pan=0.0):
    gl=g*(1-max(0,pan)); gr=g*(1+min(0,pan))
    for i,v in enumerate(buf):
        j=i0+i
        if 0<=j<N: L[j]+=v*gl; Rr[j]+=v*gr
def mf(n): return 440*2**((n-69)/12)
# secciones (en beats): intro 0-12, B 12-30, C 30-44, D 44-54 (riser + golpe), E 54-64
SEC=lambda b: 0 if b<12 else 1 if b<30 else 2 if b<44 else 3 if b<54 else 4
CH=[(57,[57,60,64]),(53,[53,57,60]),(48,[48,52,55]),(55,[55,59,62])]  # Am F C G (raiz, triada)
def sq(f,dur,duty=.25,a=.2,dec=.12):
    n=int(dur*R); o=[]; ph=0.0
    for i in range(n):
        t=i/R; ph=(ph+f/R)%1.0
        v=1 if ph<duty else -1
        o.append(a*v*min(1,t/.004)*exp(-t/dec)*(1 if t<dur-.01 else (dur-t)/.01))
    return o
def saw(f,dur,a=.3,dec=.3):
    n=int(dur*R); o=[]; ph=0.0; lp=0.0
    for i in range(n):
        t=i/R; ph=(ph+f/R)%1.0
        v=2*ph-1; lp+=.18*(v-lp)
        o.append(a*lp*min(1,t/.005)*exp(-t/dec)*(1 if t<dur-.01 else (dur-t)/.01))
    return o
def kick(a=.9):
    n=int(.28*R); o=[]; ph=0.0
    for i in range(n):
        t=i/R; ph+=TAU*(46+120*exp(-t/.025))/R; o.append(a*exp(-t/.09)*sin(ph))
    return o
def snare(a=.5):
    n=int(.2*R); o=[]; lp=0.0
    for i in range(n):
        t=i/R; lp+=.6*(random.uniform(-1,1)-lp); o.append(a*exp(-t/.06)*(lp*.8+.4*sin(TAU*190*t)))
    return o
def hat(a=.18,dec=.025):
    n=int(.08*R); o=[]; prev=0.0
    for i in range(n):
        t=i/R; x=random.uniform(-1,1); o.append(a*exp(-t/dec)*(x-prev)); prev=x
    return o
def blip(f0,f1,dur=.12,a=.25):
    n=int(dur*R); o=[]; ph=0.0
    for i in range(n):
        t=i/R; f=f0 if t<dur/2 else f1; ph=(ph+f/R)%1.0
        o.append(a*(1 if ph<.5 else -1)*exp(-t/.08))
    return o
K=kick();S=snare();H=hat();HO=hat(.14,.07)
for b in range(0,64):
    t=b*BT; i0=int(t*R); sec=SEC(b); bar=(b//4)%4; root,tri=CH[bar]
    # bajo saw en corcheas (desde el beat 4)
    if b>=4 and not (sec==3 and b>=50):
        for h in range(2):
            f=mf(root-12) if h==0 or sec<2 else mf(root-12+(12 if b%2 else 0))
            mix(i0+int(h*BT/2*R),saw(f,BT/2*.9,.34 if sec!=2 else .28,.35),1.0)
    # kick / snare / hats
    if b>=4 and not (sec==3 and b>=50): mix(i0,K,.9 if sec>=1 else .6)
    if sec in (1,2,4) and b%2==1: mix(i0,S,.5)
    if b>=8 and not (sec==3 and b>=50):
        mix(i0+int(BT/2*R),H,.7,.3)
        if sec in(1,4): mix(i0,H,.4,-.3); mix(i0+int(BT*.75*R),H,.3,.3)
    # arpegio chiptune en semicorcheas (25% duty), estéreo alternado
    if sec!=3 or b<50:
        for s16 in range(4):
            nn=tri[s16%3] + (12 if s16==3 else 0) + (12 if sec in (1,4) else 0)
            a=.13 if sec!=2 else .09
            mix(i0+int(s16*BT/4*R),sq(mf(nn),BT/4*.85,.25,a,.09),1.0,.35 if s16%2 else -.35)
    # melodía lead (pulso 50%) en B, E y C (más suave)
    MEL={0:[76,None,79,76],1:[77,None,81,77],2:[79,76,72,None],3:[79,None,83,79]}
    if sec in (1,4) and b>=14 or sec==2:
        m=MEL[bar][b%4]
        if m: mix(i0,sq(mf(m),BT*.9,.5,.16 if sec!=2 else .10,.5),1.0,.1)
# riser 44 -> 54 beats (ruido + barrido) y silencio previo al golpe
def riser(b0,b1):
    t0=b0*BT;n=int((b1-b0)*BT*R);i0=int(t0*R);lp=0.0;ph=0.0
    for i in range(n):
        u=i/n;c=.03+.55*u*u;lp+=c*(random.uniform(-1,1)-lp);ph=(ph+(200+1800*u*u)/R)%1.0
        v=.30*u**1.8*(lp*.9+.4*(1 if ph<.25 else -1)*.35)*(1 if u<.97 else (1-u)/.03)
        if 0<=i0+i<N: L[i0+i]+=v; Rr[i0+i]+=v
riser(44,54)
def boom(b,amp):
    i0=int(b*BT*R);n=int(1.6*R);ph=0.0;lp=0.0
    for i in range(n):
        t=i/R;ph+=TAU*(40+110*exp(-t/.05))/R;lp+=.1*(random.uniform(-1,1)-lp)
        v=amp*(exp(-t/.6)*sin(ph)+.5*exp(-t/.3)*lp)
        if 0<=i0+i<N: L[i0+i]+=v;Rr[i0+i]+=v
boom(44,.9); boom(54,.8)
# stingers tipo "coin" sobre los golpes de texto
for b in (0,1,2,5,8,14,18,22,30,32,36,39,41,44,45,46,47,54,55,56,57,58): mix(int(b*BT*R),blip(1318,1976),.9,.2)
# fade final
for i in range(N):
    t=i/R; f=min(1,(DUR-t)/1.2)
    L[i]*=f; Rr[i]*=f
tot=[(L[i],Rr[i]) for i in range(N)]
rms=math.sqrt(sum((a*a+b*b)/2 for a,b in tot)/N); g=10**(-17/20)/rms
pk=max(max(abs(a),abs(b)) for a,b in tot)*g
if pk>10**(-1.5/20): g*=10**(-1.5/20)/pk
w=wave.open(sys.argv[1],'wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(R)
w.writeframes(b''.join(struct.pack('<hh',int(max(-1,min(1,a*g))*32767),int(max(-1,min(1,b*g))*32767)) for a,b in tot));w.close()
