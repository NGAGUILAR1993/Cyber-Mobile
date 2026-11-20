import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const c=await b.newContext({viewport:{width:430,height:900},deviceScaleFactor:2.5,isMobile:true});
const p=await c.newPage();
await p.goto('http://localhost:8080/agente',{waitUntil:'networkidle'});
await p.getByText('Cómo funciona',{exact:false}).first().click();await p.waitForTimeout(800);
await p.screenshot({path:'capturas/agente-como-full.png',fullPage:true});
await b.close();
