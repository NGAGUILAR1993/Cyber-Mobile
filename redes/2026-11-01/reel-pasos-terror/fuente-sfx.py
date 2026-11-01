import wave, struct, math, random
R=44100; DUR=30.0; N=int(DUR*R); a=[0.0]*N
random.seed(11)
def add(t,f):
    i0=int(t*R)
    for i,v in enumerate(f):
        j=i0+i
        if 0<=j<N: a[j]+=v
def env(n,att,dec): return [min(1,i/(att*R+1))*math.exp(-i/(dec*R)) for i in range(n)]
# drone grave: sube hasta ~17s, baja en el giro (17.5-19.2)
for i in range(N):
    t=i/R
    if t<19.2:
        g=min(1.0,t/5.0)*(0.18+0.22*min(1,t/17.0))
        if t>17.5: g*=max(0,1-(t-17.5)/1.7)
    else:
        g=0.0
    a[i]+= g*(0.6*math.sin(2*math.pi*55*t)+0.4*math.sin(2*math.pi*82.4*t+0.3)+0.15*math.sin(2*math.pi*110*t))
    if t<19.2:
        a[i]+= 0.02*min(1,t/17.0)*random.uniform(-1,1)
# latido, tempo creciente 60->150 bpm hasta 17s
def thump(t,amp):
    n=int(.42*R); e=env(n,.002,.11)
    add(t,[amp*e[i]*math.sin(2*math.pi*(66-30*i/n)*i/R) for i in range(n)])
def bpm(t): return 60+90*min(1,t/17.0)
t=0.4
while t<17.4:
    acc=0.6+0.5*min(1,t/17.0)
    thump(t,acc); thump(t+0.17,acc*0.55)
    t+=60.0/bpm(t)
def riser(t0,t1,f0,f1,amp):
    n=int((t1-t0)*R); out=[]
    for i in range(n):
        u=i/n; f=f0+(f1-f0)*u*u
        out.append(amp*u*u*math.sin(2*math.pi*f*(i/R)))
    add(t0,out)
def boom(t,amp):
    n=int(.6*R); e=env(n,.002,.16)
    add(t,[amp*e[i]*math.sin(2*math.pi*(90-55*i/n)*i/R) for i in range(n)])
    n2=int(.25*R); e2=env(n2,.001,.05)
    add(t,[amp*0.5*e2[i]*random.uniform(-1,1) for i in range(n2)])
HITS=[4.0,7.5,11.0,14.6]
for h in HITS:
    riser(h-0.9,h,120,900,0.18); boom(h,0.7)
# pico (antes de tocar)
riser(16.1,17.0,150,1400,0.22); boom(17.0,0.9)
# giro: whoosh reverso 17.5-19.2
def rev_whoosh(t0,t1,amp):
    n=int((t1-t0)*R); tmp=[]; p=0
    for i in range(n):
        p=.93*p+.07*random.uniform(-1,1); tmp.append(p)
    out=[amp*tmp[i]*(0.1+0.9*(i/n))*(0.5+0.5*math.sin(2*math.pi*6*(i/R))) for i in range(n)]
    add(t0,out)
rev_whoosh(17.5,19.2,0.55)
for k in range(9):
    tt=17.6+k*0.17
    n=int(.03*R); e=env(n,.001,.006); add(tt,[0.3*e[i]*math.sin(2*math.pi*2400*i/R) for i in range(n)])
# pad cálido al llegar a Vera
def pad(t0,dur,freqs,amp):
    n=int(dur*R); buf=[]
    for i in range(n):
        u=i/n; e=min(1,u*4)*max(0,1-max(0,(u-0.6)/0.4))
        s=sum(math.sin(2*math.pi*f*(i/R)) for f in freqs)/len(freqs)
        buf.append(amp*e*s)
    add(t0,buf)
pad(19.3,2.4,[220,277,330],0.12)
# ding por cada respuesta de Vera (semáforo)
def ding(t,amp):
    for d,f in ((0,880),(.12,1320)):
        n=int(.42*R); e=env(n,.003,.14); add(t+d,[amp*e[i]*math.sin(2*math.pi*f*i/R) for i in range(n)])
for tt in (20.1,21.6,23.0,24.6): ding(tt,0.26)
# pop suave por cada mensaje que entra
def pop(t): n=int(.08*R); e=env(n,.002,.02); add(t,[0.22*e[i]*math.sin(2*math.pi*(600+700*i/n)*i/R) for i in range(n)])
for tt in (19.7,21.2,22.6,23.9): pop(tt)
# cierre: swell mayor, calma
pad(26.5,3.2,[261.6,329.6,392.0,523.3],0.16)
m=max(1e-6,max(abs(x) for x in a)); a=[x/m*0.82 for x in a]
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,x))*32000)) for x in a)); w.close()
print("sfx.wav ok")
