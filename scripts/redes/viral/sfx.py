# Efectos del reel "La notificación" (30 s). python3 sfx.py -> sfx.wav
import wave, struct, math, random
R=44100; N=30*R; a=[0.0]*N; random.seed(7)
def add(t,f):
    i0=int(t*R)
    for i,v in enumerate(f):
        if 0<=i0+i<N: a[i0+i]+=v
def env(n,att,dec): return [min(1,i/(att*R+1))*math.exp(-i/(dec*R)) for i in range(n)]
def buzz(t,d=.55):
    n=int(d*R); add(t,[.35*math.sin(2*math.pi*170*i/R)*(1 if (i//int(.09*R))%2==0 else .2)*min(1,(n-i)/(.05*R)) for i in range(n)])
def ding(t):
    for d,f in ((0,1046),(.11,1568)):
        n=int(.45*R); e=env(n,.002,.12); add(t+d,[.3*e[i]*math.sin(2*math.pi*f*i/R) for i in range(n)])
def thump(t):
    n=int(.45*R); e=env(n,.002,.12); add(t,[.8*e[i]*math.sin(2*math.pi*(75-35*i/n)*i/R) for i in range(n)])
def whoosh(t):
    n=int(.3*R); p=0; out=[]
    for i in range(n): p=.85*p+.15*random.uniform(-1,1); out.append(.5*p*math.sin(math.pi*i/n))
    add(t,out)
def pop(t): n=int(.08*R); e=env(n,.002,.02); add(t,[.4*e[i]*math.sin(2*math.pi*(600+900*i/n)*i/R) for i in range(n)])
def tap(t): n=int(.04*R); e=env(n,.001,.008); add(t,[.5*e[i]*math.sin(2*math.pi*1800*i/R) for i in range(n)])
def beat(t0,t1,bpm=112):
    k=t0
    while k<t1:
        n=int(.18*R); e=env(n,.002,.05); add(k,[.22*e[i]*math.sin(2*math.pi*(60-20*i/n)*i/R) for i in range(n)]); k+=60/bpm
beat(2.6,28.6)
ding(.15); buzz(.15)
for x in (.3,.5,.75,1.0): pop(x)
tap(2.35)
for c in (2.6,4.6,9.3,12.8,15.8,17.3,20.4,24.4): whoosh(c-.15); thump(c)
for c in (6.6,7.5,8.4): thump(c); pop(c+.12)
whoosh(11.65); thump(11.8)
tap(16.85)
for x in (21.0,21.8,22.6): pop(x)
tap(25.95); ding(26.05); pop(26.1)
whoosh(28.7)
m=max(abs(x) for x in a); a=[x/m*.8 for x in a]
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(x*32000)) for x in a)); w.close()
