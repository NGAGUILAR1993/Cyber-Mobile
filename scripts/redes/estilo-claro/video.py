import subprocess,sys
def video(imgs, pesos, trans, salida, total=23.0, tr=0.8):
    n=len(imgs); k=(total+tr*(n-1))/sum(pesos); dur=[round(p*k,2) for p in pesos]
    args=[]
    for i in imgs: args+=['-i',i]
    f=''
    for i,t in enumerate(dur):
        f+=f"[{i}:v]scale=1080:1920,zoompan=z='min(1+0.0004*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={round(t*30)}:s=1080x1920:fps=30,format=yuv420p,setsar=1[v{i}];"
    prev='v0'; fin=dur[0]
    for i in range(1,n):
        nom='out' if i==n-1 else f'a{i}'
        f+=f"[{prev}][v{i}]xfade=transition={trans[i-1]}:duration={tr}:offset={fin-tr:.2f}[{nom}];"; fin+=dur[i]-tr; prev=nom
    subprocess.run(['ffmpeg','-y','-loglevel','error',*args,'-f','lavfi','-t',str(total),'-i','anullsrc=channel_layout=stereo:sample_rate=44100',
      '-filter_complex',f[:-1],'-map','[out]','-map',f'{n}:a','-t',str(total),'-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-r','30',
      '-c:a','aac','-b:a','128k','-movflags','+faststart','-crf','21',salida],check=True)
o='out/'
video([o+'ig-1.jpg',o+'ig-2.jpg',o+'ig-3.jpg',o+'ig-4.jpg',o+'ig-5.jpg'],[3.2,4.6,4.6,6.2,5.0],['fadeblack','slideleft','slideleft','fadeblack'],o+'reel-instagram.mp4')
video([o+'ig-1.jpg',o+'ig-2.jpg',o+'ig-3.jpg',o+'ig-4.jpg',o+'wa-5.jpg'],[3.2,4.6,4.6,6.2,5.0],['fadeblack','slideleft','slideleft','fadeblack'],o+'reel-whatsapp.mp4')
video([o+'m-1.jpg',o+'m-2.jpg',o+'m-3.jpg',o+'ig-m4.jpg'],[4.5,5.5,5.5,7.0],['fadeblack','slideup','fadeblack'],o+'historia-mama-instagram.mp4')
video([o+'m-1.jpg',o+'m-2.jpg',o+'m-3.jpg',o+'wa-m4.jpg'],[4.5,5.5,5.5,7.0],['fadeblack','slideup','fadeblack'],o+'historia-mama-whatsapp.mp4')
