import wave, struct, math, random
R=44100; N=30*R; a=[0.0]*N
random.seed(7)
def add(t, f):
    i0=int(t*R)
    for i,v in enumerate(f):
        if 0<=i0+i<N: a[i0+i]+=v
def env(n,att,dec): return [min(1,i/(att*R+1))*math.exp(-i/(dec*R)) for i in range(n)]
def tap(t): n=int(.04*R); e=env(n,.001,.008); add(t,[.5*e[i]*math.sin(2*math.pi*1800*i/R) for i in range(n)])
def thump(t):
    n=int(.45*R); e=env(n,.002,.12); add(t,[.8*e[i]*math.sin(2*math.pi*(70-30*i/n)*i/R) for i in range(n)])
    n=int(.3*R); e=env(n,.002,.08); add(t,[.25*e[i]*(1 if math.sin(2*math.pi*110*i/R)>0 else -1) for i in range(n)])
def whoosh(t):
    n=int(.35*R); p=0; out=[]
    for i in range(n):
        p=.85*p+.15*random.uniform(-1,1); out.append(.5*p*math.sin(math.pi*i/n))
    add(t,out)
def shutter(t):
    for d in (0,.07):
        n=int(.05*R); e=env(n,.001,.012); add(t+d,[.6*e[i]*random.uniform(-1,1) for i in range(n)])
def ding(t):
    for d,f in ((0,880),(.13,1320)):
        n=int(.5*R); e=env(n,.003,.15); add(t+d,[.35*e[i]*math.sin(2*math.pi*f*i/R) for i in range(n)])
def pop(t): n=int(.08*R); e=env(n,.002,.02); add(t,[.4*e[i]*math.sin(2*math.pi*(600+900*i/n)*i/R) for i in range(n)])
def hum(t0,t1):
    n=int((t1-t0)*R); add(t0,[.06*math.sin(2*math.pi*55*i/R)*min(1,i/R,(n-i)/R) for i in range(n)])
hum(0,30)
for i in range(6): tap(.2+i*.2)
thump(1.35)
pop(1.5); pop(2.0)
whoosh(4.5); thump(5.2)
for i in range(8): pop(5.9+i*.72)
whoosh(12.45); thump(12.6); tap(13.7)
whoosh(15.45); thump(15.6); tap(16.5)
whoosh(18.3); thump(18.5)
for i in range(3): pop(19.0+i*.9)
whoosh(22.7); thump(22.9)
for i in range(4): tap(23.4+i*.35)
whoosh(26.5); ding(27.0); pop(28.3)
m=max(abs(x) for x in a); a=[x/m*.8 for x in a]
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(x*32000)) for x in a)); w.close()
