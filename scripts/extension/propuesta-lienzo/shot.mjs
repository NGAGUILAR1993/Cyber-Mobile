import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:780,height:620},deviceScaleFactor:2});
for(const n of [1,2]){await p.goto('file://'+process.cwd()+'/lienzo.html#'+n);await p.reload();await p.waitForTimeout(500);await p.screenshot({path:`l${n}.png`});}
await b.close();
