# Pista instrumental original, sintetizada con stdlib: minimal / lo-fi tenso, 96 BPM, Re menor (Dm-Bb-F-C).
# Distinta de pop 106, techno 126, thriller 90 y chiptune 128 usadas antes.
# Uso: python3 musica.py salida.wav
import math, random, sys, wave
from array import array
R = 44100; DUR = 30.0; N = int(R * DUR); BT = 60 / 96; TAU = 2 * math.pi
random.seed(26)
L = array('d', [0.0]) * N; Rr = array('d', [0.0]) * N
exp = math.exp; sin = math.sin
def mf(n): return 440 * 2 ** ((n - 69) / 12)
def mix(i0, buf, g=1.0, pan=0.0):
    gl = g * (1 - max(0, pan)); gr = g * (1 + min(0, pan))
    for i, v in enumerate(buf):
        j = i0 + i
        if 0 <= j < N:
            L[j] += v * gl; Rr[j] += v * gr
def pluck(f, dur, a=.22, dec=.25):
    n = int(dur * R); o = []
    for i in range(n):
        t = i / R
        v = sin(TAU * f * t) + .35 * sin(TAU * 2 * f * t) + .12 * sin(TAU * 3 * f * t)
        o.append(a * v * min(1, t / .003) * exp(-t / dec))
    return o
def sub(f, dur, a=.34, dec=.55):
    n = int(dur * R); o = []
    for i in range(n):
        t = i / R
        o.append(a * sin(TAU * f * t) * min(1, t / .01) * exp(-t / dec))
    return o
def kick(a=.7):
    n = int(.28 * R); o = []; ph = 0.0
    for i in range(n):
        t = i / R; f = 45 + 110 * exp(-t / .035); ph += TAU * f / R
        o.append(a * sin(ph) * exp(-t / .11))
    return o
def hat(a=.07):
    n = int(.05 * R)
    return [a * (random.random() * 2 - 1) * exp(-(i / R) / .012) for i in range(n)]
def pad(f, dur, a=.05):
    n = int(dur * R); o = []
    for i in range(n):
        t = i / R
        env = min(1, t / .6) * min(1, (dur - t) / .6)
        o.append(a * env * (sin(TAU * f * t) + sin(TAU * f * 1.004 * t)) * .5)
    return o
CH = [(50, [50, 53, 57]), (46, [46, 50, 53]), (53, [53, 57, 60]), (48, [48, 52, 55])]  # Dm Bb F C
total_beats = int(DUR / BT)
for b in range(total_beats):
    t0 = int(b * BT * R); bar = b // 4; ch = CH[bar % 4]
    if b >= 4:
        mix(t0, kick(), .8 if b % 4 in (0, 2) else .0)
    if b >= 8:
        mix(t0 + int(BT * .5 * R), hat(), .9, .3)
    if b % 4 == 0:
        mix(t0, sub(mf(ch[0] - 12), BT * 3.6), 1.0)
        for k, nn in enumerate(ch[1]):
            mix(t0, pad(mf(nn), BT * 4, .05), 1.0, -.3 + .3 * k)
    # arpegio suave
    if b >= 2:
        for s in range(2):
            idx = (b * 2 + s) % 3
            mix(t0 + int(s * BT * .5 * R), pluck(mf(ch[1][idx] + 12), .35), .9, .35 if s else -.35)
# golpe de cierre en el ultimo segundo
mix(int((DUR - 1.2) * R), kick(.9), 1.0)
mix(int((DUR - 1.2) * R), sub(mf(38), 1.2, .3), 1.0)
peak = max(max(abs(x) for x in L), max(abs(x) for x in Rr)) or 1
g = 0.85 / peak
out = sys.argv[1] if len(sys.argv) > 1 else 'musica.wav'
w = wave.open(out, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(R)
fr = array('h')
for i in range(N):
    fade = min(1, (N - i) / (R * .8))
    fr.append(int(max(-1, min(1, L[i] * g * fade)) * 32000))
    fr.append(int(max(-1, min(1, Rr[i] * g * fade)) * 32000))
w.writeframes(fr.tobytes()); w.close()
