# Efectos sintetizados para "El celu que se maneja solo" (30 s)
import numpy as np, wave
R=44100; D=30; a=np.zeros(R*D)
def add(t,s,g=1.0):
    i=int(t*R); n=min(len(s),len(a)-i); a[i:i+n]+=s[:n]*g
def env(n,at=.005,dc=.1):
    t=np.arange(n)/R; return np.minimum(t/at,1)*np.exp(-t/dc)
def tap(): n=int(.06*R); return np.random.randn(n)*env(n,.001,.008)*.5
def boom():
    n=int(1.2*R); t=np.arange(n)/R; return np.sin(2*np.pi*(55-20*t)*t)*env(n,.005,.35)
def ding(f=880):
    n=int(.8*R); t=np.arange(n)/R; return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2*t))*env(n,.005,.25)*.4
def whoosh(rev=False):
    n=int(1.0*R); t=np.arange(n)/R; s=np.random.randn(n); s=np.convolve(s,np.ones(30)/30,'same')
    e=np.sin(np.pi*t/1.0)**2; s=s*e*.8; return s[::-1] if rev else s
t=np.arange(R*D)/R
# zumbido grave de tensión hasta las 17 s, sube de a poco
dr=(np.sin(2*np.pi*48*t)+.5*np.sin(2*np.pi*72.3*t))*.10*np.clip(t/3,0,1)*np.clip((17.4-t)/.6,0,1)
a+=dr*(1+.6*np.clip((t-5)/6,0,1))
for x in [2.0]+[6.3+i*.36 for i in range(7)]+[9.2]: add(x,tap(),.9)
add(9.45,boom(),.9); add(14.4,boom(),.6)
add(11.1,whoosh(True),.7)
add(12.4,ding(1046)); add(13.1,ding(1046))
add(17.2,boom(),.5)
for x in [20.8,21.6,22.4]: add(x,ding(660),.7)
for f in [523,659,784]: add(25.3,ding(f),.5)
a=a/np.max(np.abs(a))*.85
w=wave.open('sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
