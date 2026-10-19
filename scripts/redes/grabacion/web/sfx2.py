# python3 sfx2.py <dia> <dur> <salida.wav> : efectos sintetizados (toques, barridos, golpes, notificación)
import wave, struct, math, random, sys
dia, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
K = dur/23.0
R=44100; N=int(dur*R); a=[0.0]*N
random.seed(7)
def add(t, f):
    i0=int(t*K*R)
    for i,v in enumerate(f):
        if 0<=i0+i<N: a[i0+i]+=v
def env(n,att,dec): return [min(1,i/(att*R+1))*math.exp(-i/(dec*R)) for i in range(n)]
def tap(t): n=int(.04*R); e=env(n,.001,.008); add(t,[.5*e[i]*math.sin(2*math.pi*1800*i/R) for i in range(n)])
def thump(t):
    n=int(.45*R); e=env(n,.002,.12); add(t,[.8*e[i]*math.sin(2*math.pi*(70-30*i/n)*i/R) for i in range(n)])
def whoosh(t,v=.35):
    n=int(.4*R); p=0; out=[]
    for i in range(n):
        p=.85*p+.15*random.uniform(-1,1); out.append(v*p*math.sin(math.pi*i/n))
    add(t,out)
def ding(t):
    for d,f in ((0,880),(.13,1320)):
        n=int(.5*R); e=env(n,.003,.15); add(t+d,[.3*e[i]*math.sin(2*math.pi*f*i/R) for i in range(n)])
def pop(t): n=int(.08*R); e=env(n,.002,.02); add(t,[.4*e[i]*math.sin(2*math.pi*(600+900*i/n)*i/R) for i in range(n)])
if dia=='1':
    for t in (6.75,7.95,8.75,14.35): tap(t)
    for t in (2.7,5.9,6.95,13.55,14.7,19.55): whoosh(t)
    for t in (0.05,11.35,19.65): thump(t)
    pop(15.35); ding(16.9)
else:
    for t in (11.25,19.15): tap(t)
    for t in (2.6,5.0,7.6,9.9,11.45,14.8,17.3,19.55): whoosh(t,.28)
    for t in (0.05,8.45,19.65): thump(t)
m=max(abs(x) for x in a); a=[x/m*.8 for x in a]
w=wave.open(out,'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(x*32000)) for x in a)); w.close()
