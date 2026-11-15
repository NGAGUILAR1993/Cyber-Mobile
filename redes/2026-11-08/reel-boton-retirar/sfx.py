# Efectos sintetizados para "El botón Retirar" (30 s)
import numpy as np, wave
np.random.seed(8)
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
def tick(): n=int(.03*R); t=np.arange(n)/R; return np.sin(2*np.pi*2400*t)*env(n,.001,.006)*.35
def glitch():
    n=int(1.3*R); s=np.sign(np.sin(2*np.pi*np.cumsum(np.random.choice([80,160,320,640],n))/R))
    return s*np.repeat(np.random.rand(n//2205+1)>.35,2205)[:n]*.35
t=np.arange(R*D)/R
# subida del saldo: ticks que se aceleran (0-3,2 s)
x=0.0
while x<3.2: add(x,tick(),.8); x+=.16-.11*x/3.2
for f in [523,784]: add(3.2,ding(f),.45)
# zumbido de tensión desde el primer cargo hasta el giro
dr=(np.sin(2*np.pi*48*t)+.5*np.sin(2*np.pi*72.3*t))*.10*np.clip((t-4.8)/2,0,1)*np.clip((15.6-t)/.4,0,1)
a+=dr*(1+.7*np.clip((t-10)/5,0,1))
add(4.4,tap(),.9); add(10.0,tap(),.9)
add(4.9,boom(),.6); add(10.25,boom(),.8)
add(14.6,glitch(),.9); add(15.6,boom(),1.0)
add(19.3,boom(),.45)
for x in [22.8,23.3,23.8]: add(x,ding(660),.7)
for f in [523,659,784]: add(26.9,ding(f),.5)
a=a/np.max(np.abs(a))*.85
w=wave.open('sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((a*32767).astype(np.int16).tobytes()); w.close()
