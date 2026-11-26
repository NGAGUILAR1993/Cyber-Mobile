# Pista instrumental original (sin derechos): lo-fi house, 118 BPM, Re mayor. 30,0 s exactos.
# Uso: python3 musica.py salida.wav   · Golpes sobre el reel v2 (sin personas): whoosh en los zooms 2,7 / 12,0 / 20,0 s, barridos 8,5 / 17,0 s, clics 0,85 / 10,95 / 18,5 / 19,2 s, sello 6,0 s, impacto 25,5 s.
import sys, numpy as np, wave
R=44100; DUR=30.0; N=int(R*DUR); BPM=118; BT=60/BPM; BAR=4*BT
rng=np.random.default_rng(118)
L=np.zeros(N); Rt=np.zeros(N)
def put(x,t,g=1.0,pan=0.0):
    i=int(t*R); 
    if i>=N: return
    x=x[:N-i]; gl=g*np.cos((pan+1)*np.pi/4); gr=g*np.sin((pan+1)*np.pi/4)
    L[i:i+len(x)]+=x*gl; Rt[i:i+len(x)]+=x*gr
def env(n,a,d): t=np.arange(n)/R; e=np.exp(-t/d); ai=max(1,int(a*R)); e[:ai]*=np.linspace(0,1,ai); return e
def lp(x,c):  # pasa-bajos de un polo
    y=np.empty_like(x); a=np.exp(-2*np.pi*c/R); s=0.0
    for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
    return y
def kick():
    n=int(.4*R); t=np.arange(n)/R; f=48+80*np.exp(-t/.03); ph=2*np.pi*np.cumsum(f)/R
    return np.sin(ph)*np.exp(-t/.2)*0.95
def hat(d=.03):
    n=int(d*6*R); z=np.diff(rng.uniform(-1,1,n+1)); return z*env(n,.0005,d)*.35
def clap():
    n=int(.25*R); z=np.diff(rng.uniform(-1,1,n+1)); e=np.zeros(n)
    for k in (0,.012,.024): i=int(k*R); e[i:]+=np.exp(-np.arange(n-i)/R/.07)
    return lp(z*e,3500)*.45
def ep(freqs,d,amp=.12):   # piano eléctrico: seno + armónico con trémolo suave
    n=int(d*R); t=np.arange(n)/R; o=np.zeros(n)
    for f in freqs: o+=np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*2*f*t)*np.exp(-t/.25)+.12*np.sin(2*np.pi*3*f*t)*np.exp(-t/.1)
    o*= (1+.18*np.sin(2*np.pi*5.2*t)) * env(n,.006,.9)
    rel=np.minimum(1,(n-np.arange(n))/(.08*R)); return o*rel*amp/len(freqs)*2.2
def bass(f,d):
    n=int(d*R); t=np.arange(n)/R; o=np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*2*f*t)
    rel=np.minimum(1,(n-np.arange(n))/(.03*R)); return o*env(n,.005,.5)*rel*.42
def pad(freqs,d):
    n=int(d*R); t=np.arange(n)/R; o=np.zeros(n)
    for f in freqs:
        for det in (-.25,.25): o+=np.sign(np.sin(2*np.pi*(f+det)*t))
    o=lp(o,900); a=np.minimum(1,t/.6)*np.minimum(1,(d-t)/.6); return o*a*.022
def whoosh(d=.7,up=True):
    n=int(d*R); z=rng.uniform(-1,1,n); t=np.arange(n)/R
    c=np.linspace(300,6000,n) if up else np.linspace(6000,300,n); y=np.empty(n); s=0.0
    for i in range(n): a=np.exp(-2*np.pi*c[i]/R); s=(1-a)*z[i]+a*s; y[i]=s
    return y*np.sin(np.pi*t/d)**2*.5
def impact():
    n=int(1.2*R); t=np.arange(n)/R; f=40+60*np.exp(-t/.05); return np.sin(2*np.pi*np.cumsum(f)/R)*np.exp(-t/.45)*.9+lp(rng.uniform(-1,1,n),900)*np.exp(-t/.25)*.4
# Re mayor: Dmaj7 · Bm7 · Gmaj7 · A7sus
D=146.83; CH=[(73.42,[293.66,369.99,440.0,554.37]),(61.74,[246.94,293.66,369.99,440.0]),(49.0,[196.0,246.94,293.66,369.99]),(55.0,[220.0,293.66,329.63,392.0])]
K=kick(); C=clap()
nb=int(DUR/BAR)+1; kicks=[]
for b in range(nb):
    t0=b*BAR; root,ch=CH[b%4]
    put(pad(ch,BAR),t0,1.0)
    for q in range(4):
        t=t0+q*BT
        if t>=DUR: break
        intro = t<2.5
        if not intro or q==0: put(K,t,.85 if not intro else .5); kicks.append(t)
        if not intro and q in (1,3): put(C,t,.8)
        for e in range(2):
            th=t+e*BT/2+(.035 if e==1 else 0)
            if not intro or e==1: put(hat(.025 if e==0 else .05),th,.8 if e==1 else .45, .35 if e else -.35)
        # bajo con síncopa
        if not intro: put(bass(root*(2 if q==3 else 1),BT*.45),t+BT*.5 if q in (1,3) else t,1.0)
    # acordes de piano: golpe en 1 y en el "y" del 2
    for off in (0,1.5*BT,3*BT):
        if t0+off<DUR: put(ep(ch,BT*1.2),t0+off,1.0,.15)
# efectos sobre los cortes
for tt in (2.7,12.0,20.0): put(whoosh(.7),tt-.05,1.0)
for tt in (8.5,17.0): put(whoosh(.6,False),tt,.6)
def click():
    n=int(.05*R); t=np.arange(n)/R; return (np.sin(2*np.pi*2400*t)*.5+rng.uniform(-1,1,n)*.5)*np.exp(-t/.006)*.5
for tt in (0.85,10.95,18.5,19.2): put(click(),tt,1.0)
put(impact()*.6,6.0,1.0)
put(impact(),25.5,1.0)
# sidechain (bombeo) desde cada bombo
sc=np.ones(N)
for k in kicks:
    i=int(k*R); n=int(.22*R); seg=1-.45*np.exp(-np.arange(n)/R/.06); j=min(N,i+n); sc[i:j]=np.minimum(sc[i:j],seg[:j-i])
# pasa-bajos que se abre escena a escena (celu → web → navegador)
cut=np.interp(np.arange(N)/R,[0,2.5,8.6,17.2,25.5,30],[1200,2600,4200,7000,12000,12000])
def lpv(x):
    y=np.empty_like(x); s=0.0
    a=np.exp(-2*np.pi*cut/R)
    for i in range(len(x)): s=(1-a[i])*x[i]+a[i]*s; y[i]=s
    return y
L=lpv(L*sc); Rt=lpv(Rt*sc)
# crujido de vinilo
cr=np.zeros(N); idx=rng.integers(0,N,900); cr[idx]=rng.uniform(-.25,.25,900); L+=cr; Rt+=np.roll(cr,37)
m=max(np.abs(L).max(),np.abs(Rt).max()); L=np.tanh(L/m*1.3)*.85; Rt=np.tanh(Rt/m*1.3)*.85
f=int(.03*R); L[-f:]*=np.linspace(1,0,f); Rt[-f:]*=np.linspace(1,0,f)
out=np.empty(2*N,dtype=np.int16); out[0::2]=(L*32767).astype(np.int16); out[1::2]=(Rt*32767).astype(np.int16)
w=wave.open(sys.argv[1] if len(sys.argv)>1 else 'musica.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(R); w.writeframes(out.tobytes()); w.close()
print('ok', N/R)
