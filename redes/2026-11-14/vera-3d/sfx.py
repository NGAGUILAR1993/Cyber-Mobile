import wave, struct, math, random, sys
R=44100; N=30*R; a=[0.0]*N; random.seed(3)
def add(t,f):
    i0=int(t*R)
    for i,v in enumerate(f):
        j=i0+i
        if 0<=j<N: a[j]+=v
def tone(f,d,amp,att=.01,dec=.3): n=int(d*R); return [amp*min(1,i/(att*R))*math.exp(-i/(dec*R))*math.sin(2*math.pi*f*i/R) for i in range(n)]
def whoosh(d,amp): n=int(d*R); o=[];y=0
def whoosh(d,amp):
    n=int(d*R); o=[]; y=0.0
    for i in range(n):
        x=i/n; k=.02+.25*math.sin(math.pi*x); y+=k*(random.uniform(-1,1)-y); o.append(amp*math.sin(math.pi*x)**2*y)
    return o
# colchon grave + pulso
for i in range(N):
    t=i/R; g=min(1,t/1.5)*(1 if t<28.5 else max(0,(30-t)/1.5))
    a[i]+=.10*g*(math.sin(2*math.pi*65.4*t)+.6*math.sin(2*math.pi*98*t)+.35*math.sin(2*math.pi*130.8*t))*(.75+.25*math.sin(2*math.pi*.2*t))
t=0.5
while t<26: add(t,tone(49,.35,.16,dec=.12)); t+=1.1
S=[3,9.6,16.2]; V=[(196,233.1),(392,523.3),(523.3,659.3,784)]
for k,s in enumerate(S):
    add(s-.7,whoosh(1.3,.5))
    n=int(1.5*R); add(s+1.3,[.07*math.sin(2*math.pi*(700+500*i/n)*i/R)*math.sin(math.pi*i/n) for i in range(n)])
    add(s+2.8,tone(1200,.08,.12,dec=.03)); add(s+3.3,tone(1320,.08,.12,dec=.03))
    for j,f in enumerate(V[k]): add(s+3.9+j*.09,tone(f,1.4,.3,dec=.55))
    if k==0: add(s+3.9,tone(73.4,.9,.5,dec=.3))
add(22.3,whoosh(1.3,.5))
for j,f in enumerate((440,554.4,659.3)): add(23.3+j*.3,tone(f,.5,.16,dec=.2))
for j,f in enumerate((523.3,659.3,784,1046.5)): add(26.0+j*.12,tone(f,2.2,.2,dec=1.0))
m=max(abs(x) for x in a) or 1
w=wave.open(sys.argv[1],'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,x/m*.85))*32767)) for x in a)); w.close()
