// Optional Windows visual smoke test. Tests the production build at a repository subpath.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
const root=path.resolve('dist'),prefix='/pamir-space-lab/';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return;}const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html',file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`,url=origin+prefix;
for(const file of await fs.readdir('public/textures')){const response=await fetch(url+'textures/'+file);if(!response.ok)throw Error('Missing hosted asset: '+file);}
console.log('Production subpath HTTP checks passed for all bundled textures.');
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'pamir-release-'));
const browser=spawn(process.env.CHROME_PATH??'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--enable-unsafe-swiftshader','--use-angle=swiftshader','--remote-debugging-port=9336','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,seq=0;const pending=new Map(),errors=[];
const cleanup=()=>{ws?.close();browser.kill();server.close();};
const watchdog=setTimeout(()=>{cleanup();console.error('Visual smoke test timed out.');process.exitCode=1;},120000);
try{
 let target;for(let i=0;i<150&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9336/json/new?about:blank',{method:'PUT'})).json();}catch{await new Promise(r=>setTimeout(r,200));}}if(!target)throw Error('Isolated Chrome unavailable');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+m.params.exceptionDetails.exception?.description);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description).join(' '));};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},25000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=()=>new Promise(r=>setTimeout(r,500));
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.mkdir('artifacts/release',{recursive:true});await fs.writeFile(`artifacts/release/${name}.png`,Buffer.from(r.data,'base64'));};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1366,height:850,deviceScaleFactor:1,mobile:false});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.clear();localStorage.setItem(\"pamir-language-v1\",JSON.stringify({language:\"en\",chosen:true}));localStorage.setItem('pamir-expedition-v3',JSON.stringify({state:{graphics:'LOW'},version:2}));"});
 await send('Page.navigate',{url});
 for(let i=0;i<80;i++){if(await evaluate("!!document.querySelector('.judge-open-button')"))break;await wait();}
 if(!await evaluate("!!document.querySelector('.judge-open-button')"))throw Error('Menu failed: '+await evaluate('document.body.innerText.slice(0,1000)'));
 await evaluate("document.querySelector('.judge-open-button').click()");await wait();
 if(!await evaluate("!!document.querySelector('.judge-briefing')"))throw Error('Briefing did not open');if(process.env.CAPTURE_RELEASE==='1')await shot('judge-briefing');
 await evaluate("document.querySelector('.judge-routes .primary').click()");await wait();
 if(!await evaluate("!!document.querySelector('.presentation-strip')"))throw Error('Protected demo did not start');
 await evaluate("Array.from(document.querySelectorAll('.presentation-strip button')).find(b=>b.textContent.includes('RESTORE')).click()");await wait();
 if(!await evaluate("!!document.querySelector('.hero')"))throw Error('Demo did not restore menu');if(process.env.CAPTURE_RELEASE==='1')await shot('main-menu');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('Browser smoke passed: production subpath, menu, briefing, protected presentation start and save restoration; zero runtime errors.');
 await send('Browser.close').catch(()=>{});
}finally{clearTimeout(watchdog);cleanup();}
