# Efectos sintetizados para "Las faltas ya no te avisan" (30 s)
import numpy as np, wave
np.random.seed(9)
R=44100; D=30; a=np.zeros(R*D)
def add(t,s,g=1.0):
    i=int(t*R); n=min(len(s),len(a)-i); a[i:i+n]+=s[:n]*g
def env(n,at=.005,dc=.1):
    t=np.arange(n)/R; return np.minimum(t/at,1)*np.exp(-t/dc)
def boom():
    n=int(1.2*R); t=np.arange(n)/R; return np.sin(2*np.pi*(55-20*t)*t)*env(n,.005,.35)
def ding(f=880):
    n=int(.8*R); t=np.arange(n)/R; return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2*t))*env(n,.005,.25)*.4
def mark(): n=int(.12*R); t=np.arange(n)/R; return np.sin(2*np.pi*(900+1800*t)*t)*env(n,.002,.04)*.5
def whoosh():
    n=int(.9*R); s=np.random.randn(n); s=np.convolve(s,np.ones(40)/40,'same'); t=np.arange(n)/n
    return s*np.sin(np.pi*t)**2*.9
t=np.arange(R*D)/R
for i in range(6): add(.8+i*.6,mark(),.9)
add(7.4,whoosh(),1.0); add(7.95,boom(),.8)
for f in [523,784]: add(8.6,ding(f),.35)
add(12.1,mark(),.9)
dr=(np.sin(2*np.pi*48*t)+.5*np.sin(2*np.pi*72.3*t))*.08*np.clip((t-12)/2,0,1)*np.clip((22.6-t)/.4,0,1)
a+=dr
for x in [16.0,18.0,20.0]: add(x,mark(),.8); add(x+.05,ding(660),.6)
add(22.6,boom(),1.0)
for f in [523,659,784]: add(26.6,ding(f),.5)
a=a/np.max(np.abs(a))*.85
w=wave.open('sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
