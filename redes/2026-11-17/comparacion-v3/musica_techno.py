# Techno original, sintetizado solo con stdlib. 126 BPM, Fa# menor. 30 s. Uso: python3 musica_techno.py salida.wav
import sys, math, random, struct, wave
from array import array
R=44100; DUR=30.0; N=int(R*DUR); BPM=126; BT=60/BPM; S16=BT/4; TAU=2*math.pi
sin=math.sin; exp=math.exp
random.seed(7)
def buf(): return array('d',[0.0])*N
KICK=buf(); HATS=buf(); CLAP=buf(); BASS=buf(); ACID=buf(); PAD=buf(); FX=buf()
def add(dst,t,x,g=1.0):
    i0=int(t*R)
    for i,v in enumerate(x):
        j=i0+i
        if 0<=j<N: dst[j]+=v*g
        elif j>=N: break
def kick(a=1.0,long=False):
    n=int((.55 if long else .30)*R); o=[]; ph=0.0
    for i in range(n):
        t=i/R; f=48+110*exp(-t/.022); ph+=TAU*f/R
        o.append(a*(exp(-t/(.22 if long else .13))*sin(ph)+.2*exp(-t/.003)*random.uniform(-1,1)))
    return o
def noise_hp(n,env,a):
    o=[];p=0.0;q=0.0
    for i in range(n):
        x=random.uniform(-1,1); y=x-p; p=x; y2=y-q; q=y; o.append(a*y*env(i/R)*.8+0*y2)
    return o
def hat(a,dec=.03): return noise_hp(int(dec*6*R),lambda t:exp(-t/dec),a)
def clap(a=.6):
    n=int(.25*R); o=[0.0]*n
    base=noise_hp(n,lambda t:1,1)
    for k,off in enumerate((0,.011,.022,.034)):
        for i in range(n):
            t=i/R-off
            if t>=0: o[i]+=base[i]*a*exp(-t/(.004 if k<3 else .07))*.55
    return o
SINE=lambda f,t:sin(TAU*f*t)
def bass_note(f,dur,a):
    n=int(dur*R); o=[]
    for i in range(n):
        t=i/R; e=min(1,t/.004)*min(1,(dur-t)/.02) if dur>t else 0
        o.append(a*e*(sin(TAU*f*t)+.18*sin(TAU*2*f*t)))
    return o
def acid_note(f,dur,a,c0,c1,res=.8):
    n=int(dur*R); o=[]; lo=0.0; bp=0.0; ph=0.0
    for i in range(n):
        t=i/R; ph=(ph+f/R)%1.0; s=2*ph-1
        cut=c0+(c1-c0)*exp(-t/.09); F=2*sin(math.pi*min(cut,9000)/R)
        hi=s-lo-(1-res)*bp; bp+=F*hi; lo+=F*bp
        e=min(1,t/.003)*min(1,(dur-t)/.015) if dur>t else 0
        o.append(a*e*lo)
    return o
def pad_stab(freqs,dur,a,cut):
    n=int(dur*R); o=[0.0]*n
    for f in freqs:
        lo=0.0; ph=0.0; ph2=0.0
        for i in range(n):
            t=i/R; ph=(ph+f/R)%1.0; ph2=(ph2+f*1.006/R)%1.0
            s=(2*ph-1)+(2*ph2-1); lo+=min(1,2*sin(math.pi*cut/R))*(s-lo)
            o[i]+=a*lo*min(1,t/.01)*exp(-t/(dur*.45))*min(1,(dur-t)/.05)/len(freqs)
    return o
def ramp_noise(t0,t1,a0,a1):
    n=int((t1-t0)*R); o=[];lo=0.0
    for i in range(n):
        x=i/n; cut=300+7000*x*x; k=min(1,2*sin(math.pi*cut/R)); lo+=k*(random.uniform(-1,1)-lo)
        o.append((a0+(a1-a0)*x)*lo*3)
    return o

DROP=24.0; RISE=22.2
NF=dict(F=92.50,A=110.0,E=82.41,C=138.59,B=123.47)
ACIDPAT=['F',None,'F','A',None,'F','E',None,'F',None,'C','F',None,'A',None,'E']
BASSPAT=['F','F','F','F']
kicks=[]
# rejillas: [0,RISE) desde 0 ; [DROP,30) desde DROP
def grid(origin,start,end):
    t=origin;i=0
    while t<end:
        if t>=start-1e-9: yield i,t
        i+=1; t=origin+i*S16
for origin,start,end in ((0.0,0.0,RISE),(DROP,DROP,DUR)):
    for i,t in grid(origin,start,end):
        beat=i%4==0; step=i%16; bar=i//16; sec=t
        if beat:
            kicks.append(t); add(KICK,t,kick(1.0,long=(origin==DROP and i==0)),1.0)
        # hats
        if i%2==1 or True:
            cl=hat(.20 if beat else .26,.018)
            if sec>=1.9: add(HATS,t,cl,.55 if step%2==0 else .8)
        if step%4==2 and sec>=3.8: add(HATS,t,hat(.55,.075),.8)    # abierto a contratiempo
        if step in (4,12) and (sec>=11.4 or origin==DROP): add(CLAP,t,clap(.7))
        # bajo: rodante en contratiempos
        if step%4==2 and (sec>=3.8 or origin==DROP):
            f=NF['F'] if (bar%4!=3 or step<10) else NF['A']; add(BASS,t,bass_note(f/2,S16*1.7,.95))
        # acid
        if sec>=7.6 or origin==DROP:
            nt=ACIDPAT[step]
            if nt:
                x=min(1,max(0,(sec-7.6)/16)) if origin==0 else 1.0
                c0=260+520*x; c1=c0+700+1800*x
                add(ACID,t,acid_note(NF[nt],S16*.85,.32,c0,c1),1.0)
        # pads cortos
        if step in (3,10) and (sec>=11.4 or origin==DROP):
            add(PAD,t,pad_stab([185.0,220.0,277.2],.34,.5,1800),1.0)
# riser y redoble previo al golpe
add(FX,RISE,ramp_noise(RISE,DROP,.05,.55),.5)
t=RISE+.2; step=.26
while t<DROP-.02:
    add(CLAP,t,clap(.5*(.4+(t-RISE)/(DROP-RISE)))); step=max(.07,step*.86); t+=step
# golpe en 24.0: sub-boom + crash
boom=[ .9*exp(-(i/R)/.5)*sin(TAU*(38+60*exp(-(i/R)/.06))*(i/R)) for i in range(int(1.2*R))]
add(FX,DROP,boom,1.0); add(FX,DROP,hat(.9,.35),.7)
# cierre
add(FX,29.0,hat(.6,.25),.35)
# sidechain
duck=array('d',[1.0])*N
for tk in kicks:
    i0=int(tk*R)
    for i in range(int(.30*R)):
        j=i0+i
        if j>=N: break
        d=1-.8*exp(-(i/R)/.07)
        if d<duck[j]: duck[j]=d
# delay corto para pads/acid
def echo(x,dt,fb,mixv):
    d=int(dt*R)
    for i in range(d,N): x[i]+=x[i-d]*fb*mixv
echo(PAD,BT*.75,.5,1.0); echo(ACID,BT*.75,.35,.5)
# mezcla (segundo plano) + crecimiento hacia el cierre
out=array('d',[0.0])*N
for i in range(N):
    t=i/R
    grow=.78+.22*min(1,max(0,t/22.0)) if t<DROP else 1.0
    m=KICK[i]*.95+HATS[i]*.5+CLAP[i]*.55+FX[i]*.6+(BASS[i]*.85+ACID[i]*.55+PAD[i]*.5)*duck[i]
    out[i]=m*grow
pk=max(abs(x) for x in out) or 1
g=(10**(-3.0/20))/pk  # pico provisional ~ -3 dBFS; se ajusta abajo
import os
target_mean=float(os.environ.get('TARGET_MEAN','-15.2'))
# normalizar a media ~target (RMS aprox. con compensacion), pico < -1.5 dB via tanh
def rms(x,k): 
    s=0.0
    for v in x: s+=(v*k)**2
    return 20*math.log10(math.sqrt(s/len(x))+1e-12)
k=g
for _ in range(6):
    y=[math.tanh(v*k*1.0) for v in out[::7]]
    cur=20*math.log10(math.sqrt(sum(v*v for v in y)/len(y))+1e-12)
    k*=10**((target_mean-cur)/20)
fo=int(.5*R)
w=wave.open(sys.argv[1],'w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(R)
o=bytearray()
peak=0.0
for i in range(N):
    f=min(1.0,(N-i)/fo); v=math.tanh(out[i]*k)*.88*f
    peak=max(peak,abs(v)); s=int(v*32767); o+=struct.pack('<hh',s,s)
w.writeframes(bytes(o)); w.close()
print('pico dBFS',20*math.log10(peak))
