import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT='/home/user/Cyber-Mobile', COMP=path.dirname(new URL(import.meta.url).pathname);
const est=(await import(ROOT+'/api/estafa.js')).default;
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.webmanifest':'application/json','.mp4':'video/mp4','.wav':'audio/wav'};
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x'); let p=decodeURIComponent(u.pathname);
  const m=p.match(/^\/observatorio\/([a-z0-9-]+)$/);
  if(m){ res.status=c=>{res.statusCode=c;return res}; res.send=b=>res.end(b); return est({method:'GET',query:{slug:m[1]}},res); }
  let f;
  if(p.startsWith('/comp/')) f=path.join(COMP,p.slice(6));
  else { if(p==='/agente') p='/agente/index.html'; if(p.endsWith('/')) p+='index.html'; if(p==='/observatorio') p='/observatorio/index.html'; f=path.join(ROOT,p); }
  fs.readFile(f,(e,b)=>{ if(e){res.statusCode=404;return res.end('404')} res.setHeader('Content-Type',T[path.extname(f)]||'application/octet-stream'); res.end(b);});
}).listen(8099,()=>console.log('ok'));
