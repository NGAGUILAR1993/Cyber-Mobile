import wave, struct, math, random, sys
R=44100; DUR=30.0; N=int(DUR*R); a=[0.0]*N; random.seed(7)
def add(t,f):
    i0=int(t*R)
    for i,v in enumerate(f):
        j=i0+i
        if 0<=j<N: a[j]+=v
def tone(f,d,amp,att=.01,dec=.3): 
    n=int(d*R); return [amp*min(1,i/(att*R))*math.exp(-i/(dec*R))*math.sin(2*math.pi*f*i/R) for i in range(n)]
# colchon calido 0-9.2 (ilusion), tension 9.2-11.9, calma 14.5-30
for i in range(N):
    t=i/R
    warm = (min(1,t/1.5)*max(0,1-max(0,t-8.6)/1.0)) if t<9.6 else 0
    calm = min(1,max(0,t-14.3)/1.5)*(1 if t<29 else max(0,(30-t)))
    g=0.10*warm+0.11*calm
    a[i]+= g*(math.sin(2*math.pi*130.8*t)+.7*math.sin(2*math.pi*164.8*t)+.6*math.sin(2*math.pi*196*t)+.3*math.sin(2*math.pi*261.6*t))*(.8+.2*math.sin(2*math.pi*.25*t))
    ten = min(1,max(0,t-9.0)/.8)*max(0,1-max(0,t-11.7)/.4) if 9.0<t<12.2 else 0
    a[i]+= ten*.22*(math.sin(2*math.pi*55*t)+.6*math.sin(2*math.pi*58.3*t))
# latido en la tension
t=9.3
while t<11.8:
    n=int(.4*R); add(t,[.7*math.exp(-i/(.09*R))*math.sin(2*math.pi*(70-30*i/n)*i/R) for i in range(n)]); add(t+.16,[.4*math.exp(-i/(.09*R))*math.sin(2*math.pi*(66-30*i/n)*i/R) for i in range(n)])
    t+=0.52
# mensajes entrantes (pop)
for tt in (3.9,4.3,4.7,5.1): add(tt,tone(880,.12,.18,dec=.05))
# rebobinar: barrido descendente + ruido
n=int(2.4*R)
add(11.9,[.22*math.sin(2*math.pi*(1400-1100*(i/n))*i/R*(.5+.5*(1-i/n)))*(1-i/n)**.5 + .06*random.uniform(-1,1)*(1-i/n) for i in range(n)])
# enviados y respuesta de Vera
for tt in (17.8,18.3): add(tt,tone(660,.1,.16,dec=.04))
add(19.4,tone(784,.5,.3,dec=.25)); add(19.55,tone(1046.5,.7,.3,dec=.3))
# cierre
add(26.3,tone(523.3,1.6,.22,dec=.8)); add(26.5,tone(659.3,1.6,.2,dec=.8)); add(26.7,tone(784,2.0,.2,dec=1.0))
m=max(abs(x) for x in a) or 1
w=wave.open(sys.argv[1],'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,x/m*.85))*32767)) for x in a)); w.close()
