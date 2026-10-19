import wave, struct, math, random
R=44100; N=23*R; a=[0.0]*N
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
for t in (2.2,16.55,17.05): tap(t)
for t in (2.35,3.85,7.25,7.9,11.6): thump(t)
for t in (2.9,6.65,10.35,10.85,15.25,17.05,20.7): whoosh(t)
shutter(14.28); ding(16.05); pop(17.75)
m=max(abs(x) for x in a); a=[x/m*.8 for x in a]
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(x*32000)) for x in a)); w.close()
