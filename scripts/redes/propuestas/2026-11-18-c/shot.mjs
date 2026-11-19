import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:3240,height:1920}});
await p.goto('file://'+process.cwd()+'/p.html');await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:'preview-falso-telepase.jpg',type:'jpeg',quality:90});await b.close();
