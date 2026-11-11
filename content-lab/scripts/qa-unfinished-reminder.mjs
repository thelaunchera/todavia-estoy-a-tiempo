// Actual notification component with isolated API fixtures; no auth or deliveries.
// Run: node scripts/qa-unfinished-reminder.mjs (requires Playwright).
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const temp=await mkdtemp(join(tmpdir(),'lab-reminder-qa-'));
const mock=`
window.qaActions=[];
const alerts=['unfinished','scheduled'].map((kind,i)=>({id:String(i),kind,
 project_title:kind==='unfinished'?'Unfinished fixture':'Calendar fixture',snoozed_until:null}));
export const labNotificationApi={
 setup:async()=>({email_enabled:false,push_enabled:false}),list:async()=>alerts,
 act:async(id,action)=>{window.qaActions.push({id,action});return true;}
};`;
let browser,server;
try{
 await build({stdin:{contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';
 import LabNotifications from './src/LabNotifications';
 createRoot(document.getElementById('root')).render(<LabNotifications email="fixture@example.invalid"
 locale={new URL(location.href).searchParams.get('locale')||'es'} notify={()=>{}}
 onOpen={alert=>{window.qaOpened=alert.id}}/>);`,
  loader:'tsx',resolveDir:root},bundle:true,outfile:join(temp,'app.js'),
  plugins:[{name:'fixture-api',setup(b){
   b.onResolve({filter:/^\.\/platform\/client$/},args=>args.importer.endsWith('LabNotifications.tsx')?
    {path:'fixture-api',namespace:'fixture'}:undefined);
   b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:mock,loader:'js'}));
  }}]});
 await writeFile(join(temp,'index.html'),'<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script>');
 server=createServer(async(req,res)=>{
  const file=new URL(req.url,'http://localhost').pathname;
  const name=file==='/app.js'?'app.js':file==='/app.css'?'app.css':'index.html';
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');
  res.end(await readFile(join(temp,name)));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=await chromium.launch({headless:true,args:['--no-sandbox'],
  ...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 for(const locale of ['es','en'])for(const width of [390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/?locale=${locale}`);
  await page.locator('.lab-alert-bell').click();
  await page.locator('.lab-alert-item').last().waitFor();
  const unfinished=page.locator('.lab-alert-item').filter({hasText:'Unfinished fixture'});
  const scheduled=page.locator('.lab-alert-item').filter({hasText:'Calendar fixture'});
  assert.equal(await unfinished.locator('button').count(),1,'Unfinished post must only offer Open');
  assert.equal(await scheduled.locator('button').count(),2,'Calendar retains Open and Snooze');
  assert.match(await page.locator('.lab-alert-preferences').innerText(),/12 h|12 hours/);
  await scheduled.locator('button').nth(1).click();
  assert.deepEqual(await page.evaluate(()=>window.qaActions),[{id:'1',action:'snooze'}]);
  await unfinished.locator('button').click();
  assert.equal(await page.evaluate(()=>window.qaOpened),'0');
  assert.equal(await page.locator('.lab-alert-panel').count(),0);
  assert.deepEqual(errors,[]);
  console.log(`PASS notification actions / ${locale} / ${width}px`);
  await page.close();
 }
}finally{
 await browser?.close();
 if(server)await new Promise(r=>server.close(r));
 await rm(temp,{recursive:true,force:true});
}
