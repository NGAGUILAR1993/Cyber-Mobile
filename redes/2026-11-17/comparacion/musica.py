# Pista instrumental original, sintetizada (106 BPM, La menor). Uso: python3 musica.py salida.wav golpes_en_beats(coma)  -- caida del bajo en el compas 9 (beat 36)
import sys
HITS=[float(x)*60/106 for x in sys.argv[2].split(',')] if len(sys.argv)>2 else []
DB=8.55; FB=10.5
import math, random, struct, sys, wave
from array import array
R=44100; DUR=30.0; N=int(R*DUR); BT=60/106; BAR=4*BT
L=array('d',[0.0])*N; Rr=array('d',[0.0])*N
random.seed(21); TAU=2*math.pi; sin=math.sin; exp=math.exp
def mix(buf,t,pan=0.0,g=1.0,dst=None):
    a=L if dst is None else dst[0]; b=Rr if dst is None else dst[1]
    i0=int(t*R); gl=g*math.cos((pan+1)*math.pi/4); gr=g*math.sin((pan+1)*math.pi/4)
    for i,v in enumerate(buf):
        j=i0+i
        if 0<=j<N: a[j]+=v*gl; b[j]+=v*gr
def kick(amp=1.0):
    n=int(.34*R); o=[]; ph=0.0
    for i in range(n):
        t=i/R; f=46+95*exp(-t/.028); ph+=TAU*f/R; o.append(amp*(exp(-t/.16)*sin(ph)+.25*exp(-t/.004)*random.uniform(-1,1)))
    return o
def noise(n): return [random.uniform(-1,1) for _ in range(n)]
def hp(x):  # pasa-altos simple
    return [x[i]-x[i-1] if i else x[0] for i in range(len(x))]
def clap(amp=.5):
    n=int(.22*R); z=hp(noise(n)); o=[0.0]*n
    for d in (0,.011,.023):
        k=int(d*R)
        for i in range(n-k): o[i+k]+=z[i]*exp(-(i/R)/.085)
    return [amp*.5*v for v in o]
def hat(amp=.1,dec=.022):
    n=int(dec*7*R); z=hp(hp(noise(n))); return [amp*.5*z[i]*exp(-(i/R)/dec) for i in range(n)]
def tone(f,d,amp,harm,att=.004,dec=.25,dk=0.0):
    n=int(d*R); o=[0.0]*n
    for h,(ha) in enumerate(harm,1):
        w=TAU*f*h/R; td=dec/(h**dk) if dk else dec
        for i in range(n): o[i]+=ha*sin(w*i)*exp(-(i/R)/td)
    ai=int(att*R)
    for i in range(n):
        e=min(1.0,i/ai) if ai else 1.0; rel=min(1.0,(n-i)/(0.01*R)); o[i]*=amp*e*rel
    return o
CH=[(110.0,[220.0,261.63,329.63]),(87.31,[174.61,220.0,261.63]),(130.81,[196.0,261.63,329.63]),(98.0,[196.0,246.94,293.66])]
nbars=int(DUR/BAR)+1
kicks=[]
# --- bateria y bajo ---
K=kick(); KS=kick(.6); C=clap(); H=hat(); HO=hat(.12,.06)
for b in range(nbars):
    t0=b*BAR; root,ch=CH[b%4]
    for q in range(4):
        t=t0+q*BT
        if t>=DUR-1.6: continue
        full = DB*BAR<=t<FB*BAR; pre = 2*BAR<=t<DB*BAR; fin = t>=FB*BAR
        if full or (fin and q in (0,2)) or (pre and q==0): mix(K if (full or fin) else KS,t,0,.9); kicks.append(t)
        if full and q in (1,3): mix(C,t,0,.8)
        if fin and q==2: mix(C,t,0,.5)
        for e in range(4 if full else 2):
            th=t+e*(BT/4 if full else BT/2)
            if full or pre or fin: mix(HO if (full and e==2) else H,th,.3 if e%2 else -.3,1.0 if full else .6)
        if full or pre or fin:
            for e in range(2):
                tb=t+e*BT/2; mix(tone(root if e==0 or not full else root*2,BT*.48,.34 if full else .22,[1,.5,.22],dec=.22),tb,0)
# --- pad (acordes largos) ---
PL=array('d',[0.0])*N; PR=array('d',[0.0])*N
for b in range(nbars):
    t0=b*BAR; root,ch=CH[b%4]
    if t0>=DUR-1.2: break
    g=.05 if t0<DB*BAR else (.045 if t0<FB*BAR else .07)
    for k,f in enumerate(ch):
        for det,pan in ((.997,-.6),(1.003,.6)):
            n=int((BAR+.3)*R); o=[0.0]*n; w1=TAU*f*det/R
            for i in range(n):
                tt=i/R; env=min(1,tt/.5)*min(1,(n-i)/(.45*R)); o[i]=g*env*(sin(w1*i)+.33*sin(2*w1*i)+.14*sin(3*w1*i))
            mix(o,t0,pan,1.0,(PL,PR))
# sidechain del pad con el bombo
for tk in kicks:
    i0=int(tk*R)
    for i in range(int(.28*R)):
        j=i0+i
        if j<N:
            d=1-.55*exp(-(i/R)/.09); PL[j]*=d; PR[j]*=d
for i in range(N): L[i]+=PL[i]; Rr[i]+=PR[i]
# --- arpegio con eco ---
AL=array('d',[0.0])*N; AR=array('d',[0.0])*N
pat=[0,1,2,1,0,2,1,2]
for b in range(nbars):
    t0=b*BAR; root,ch=CH[b%4]
    for s in range(16):
        t=t0+s*BT/4
        if t>=DUR-2.2: continue
        intro=t<2*BAR; pre=2*BAR<=t<DB*BAR
        if intro and s%4!=0: continue
        if pre and s%2!=0: continue
        f=ch[pat[s%8]]*(2 if s%8 in (2,5) else 1)*2
        mix(tone(f,.34,.11 if not intro else .09,[1,.6,.4,.28,.18,.1],att=.002,dec=.16,dk=.9),t,(-.5 if s%2 else .5),1.0,(AL,AR))
dl=int(.75*BT*R)
for i in range(dl,N):
    AL[i]+=.36*AR[i-dl]; AR[i]+=.36*AL[i-dl]
for i in range(N): L[i]+=AL[i]; Rr[i]+=AR[i]
# --- subida y golpe antes del veredicto ---
t0=DB*BAR-1.5; n=int(1.5*R); z=hp(noise(n))
mix([.16*(i/n)**2*z[i]+.05*(i/n)*sin(TAU*(200+900*(i/n)**2)*i/R) for i in range(n)],t0,0)
n=int(1.4*R); mix([.75*exp(-(i/R)/.45)*sin(TAU*(38+30*exp(-(i/R)/.05))*i/R)+.18*exp(-(i/R)/.25)*random.uniform(-1,1) for i in range(n)],DB*BAR,0)
# --- golpes de texto sobre el compas ---
for th in HITS: mix(tone(70,.2,.22,[1,.4],dec=.07),th,0)
# --- cierre: acorde final ---
tf=10.6*BAR
for f in (110,220,329.63,440,659.26): mix(tone(f,1.7,.10,[1,.45,.2,.1],att=.004,dec=.7),tf,0)
mix(kick(1.0),tf,0)
# --- master ---
m=max(max(abs(x) for x in L),max(abs(x) for x in Rr)) or 1; g=1.5/m
fo=int(.5*R)
w=wave.open(sys.argv[1],'w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(R)
out=bytearray()
for i in range(N):
    f=min(1.0,(N-i)/fo)
    out+=struct.pack('<hh',int(math.tanh(L[i]*g)*.93*f*32767),int(math.tanh(Rr[i]*g)*.93*f*32767))
w.writeframes(bytes(out)); w.close()
