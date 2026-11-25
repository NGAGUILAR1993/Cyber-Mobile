import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:4320,height:3840}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/p.html');await p.evaluate(()=>document.fonts.ready);
await p.waitForSelector('html[data-listo]',{timeout:20000});await p.waitForTimeout(500);
await p.screenshot({path:'full.png'});await b.close();
