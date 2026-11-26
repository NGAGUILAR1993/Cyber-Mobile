# Arma el reel de 30 s (1080x1920, 30 fps) con las 7 pantallas de la historia + musica.wav.
# Uso: python3 armar.py   (desde esta carpeta; requiere ffmpeg y los paso-N.jpg)
import subprocess
DUR = [3.6, 4.2, 4.8, 5.6, 4.8, 3.8, 2.6]   # segundos en pantalla (antes de la transicion de 0.6 s)
X = 0.6
FPS = 30
args = ['ffmpeg', '-y', '-loglevel', 'error']
filt = []
for i, d in enumerate(DUR):
    frames = int((d + X) * FPS)
    args += ['-i', f'paso-{i+1}.jpg']
    filt.append(f"[{i}:v]scale=1080:1920,zoompan=z='min(1+0.0004*on,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps={FPS},setsar=1[v{i}]")
prev = 'v0'
for i in range(1, len(DUR)):
    off = round(sum(DUR[:i]), 3)   # offset de la transicion i = suma de las duraciones previas
    out = f'x{i}'
    filt.append(f"[{prev}][v{i}]xfade=transition=fade:duration={X}:offset={off}[{out}]")
    prev = out
total = sum(DUR) + X
args += ['-i', 'musica.wav']
args += ['-filter_complex', ';'.join(filt), '-map', f'[{prev}]', '-map', f'{len(DUR)}:a',
         '-t', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', 'reel-ig.mp4']
print('duracion total aprox', round(total, 2))
subprocess.run(args, check=True)
