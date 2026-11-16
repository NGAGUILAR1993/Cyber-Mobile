import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const n of [1,2,3]){await p.goto('file://'+process.cwd()+'/c.html#'+n);await p.reload();await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`c-${n}.jpg`,type:'jpeg',quality:90});}
await b.close();
