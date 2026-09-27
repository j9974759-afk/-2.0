const {chromium}=require('C:/Users/21086/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}); const results=[];
 for(const [name,viewport,reducedMotion] of [['desktop',{width:1440,height:900},'no-preference'],['mobile',{width:390,height:844},'no-preference'],['reduced',{width:1440,height:900},'reduce']]){
 const page=await browser.newPage({viewport,reducedMotion});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:4173/');await page.waitForTimeout(3000);
 const initial=await page.evaluate(()=>({requests:performance.getEntriesByType('resource').length,bytes:performance.getEntriesByType('resource').reduce((s,e)=>s+e.transferSize,0),words:document.querySelectorAll('.dream-overline .editorial-word').length,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),aurora:document.querySelector('canvas.aurora').dataset.state||'not-started'}));
 await page.screenshot({path:'.review/performance-'+name+'.png'});
 await page.evaluate(()=>window.scrollTo({top:document.querySelector('#works').offsetTop,behavior:'instant'}));await page.locator('[data-project="alipay"]').scrollIntoViewIfNeeded();await page.waitForTimeout(1800);
 await page.locator('[data-project="alipay"]').click();await page.waitForTimeout(400);
 const videos=await page.locator('#project-detail video').evaluateAll(vs=>vs.map(v=>({preload:v.preload,src:v.querySelector('source').src})));
 await page.locator('#project-detail video').first().evaluate(v=>v.play());await page.waitForTimeout(700);const played=await page.locator('#project-detail video').first().evaluate(v=>v.currentTime>0&&!v.error);
 await page.locator('#close-dialog').click();await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(600);
 const returned=await page.locator('.dream-stage').evaluate(el=>!el.classList.contains('is-complete'));
 results.push({name,initial,videos,played,returned,errors});await page.close();
 }
 await browser.close();fs.writeFileSync('.review/performance-browser.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
