import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const d='/home/user/Cyber-Mobile/scripts/redes/propuestas/2026-11-16/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files','--force-color-profile=srgb','--disable-gpu']});
for(const n of process.argv.slice(2)){const pg=await b.newPage({viewport:{width:1080,height:1920}});await pg.goto('file://'+d+n+'.html');await pg.waitForSelector('html[data-listo]');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(300);await pg.screenshot({path:d+n+'.png'});await pg.close();}
await b.close();
