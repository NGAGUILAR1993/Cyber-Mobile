import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:3240,height:1920}});
p.on('console',m=>console.log(m.text())); p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/p.html');await p.evaluate(()=>document.fonts.ready);
await p.waitForSelector('html[data-listo]',{timeout:15000});
await p.screenshot({path:'preview.jpg',type:'jpeg',quality:92});await b.close();
