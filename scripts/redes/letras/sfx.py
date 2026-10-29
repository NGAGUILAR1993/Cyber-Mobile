# Efectos del reel "6 letras falsas" (30 s). python3 sfx.py -> sfx.wav
import wave, struct, math, random
R=44100; N=30*R; a=[0.0]*N; random.seed(7)
def add(t,f):
    i0=int(t*R)
    for i,v in enumerate(f):
        if 0<=i0+i<N: a[i0+i]+=v
def env(n,att,dec): return [min(1,i/(att*R+1))*math.exp(-i/(dec*R)) for i in range(n)]
def tick(t): n=int(.05*R); e=env(n,.001,.01); add(t,[.45*e[i]*math.sin(2*math.pi*2200*i/R) for i in range(n)])
def thump(t,v=.8):
    n=int(.45*R); e=env(n,.002,.12); add(t,[v*e[i]*math.sin(2*math.pi*(75-35*i/n)*i/R) for i in range(n)])
def whoosh(t):
    n=int(.3*R); p=0; out=[]
    for i in range(n): p=.85*p+.15*random.uniform(-1,1); out.append(.5*p*math.sin(math.pi*i/n))
    add(t,out)
def pop(t,f=600): n=int(.1*R); e=env(n,.002,.03); add(t,[.4*e[i]*math.sin(2*math.pi*(f+900*i/n)*i/R) for i in range(n)])
def pad(t0,t1,f=55):
    n=int((t1-t0)*R); add(t0,[.10*math.sin(2*math.pi*f*i/R)*min(1,i/R,(n-i)/R) for i in range(n)])
pad(0,10,55); pad(19.6,25.4,49)
thump(.3)
for c in (5.2,10.2,19.6,22.0,25.4): whoosh(c-.2); thump(c)
for k in range(5): tick(10.4+k) ; tick(10.9+k)
for i in range(6): pop(15.7+i*.5,500+120*i)
whoosh(29.5)
m=max(abs(x) for x in a); a=[x/m*.8 for x in a]
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(x*32000)) for x in a)); w.close()
