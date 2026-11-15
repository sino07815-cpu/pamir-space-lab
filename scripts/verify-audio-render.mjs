import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import ts from 'typescript';
import {spawn} from 'node:child_process';
const out=path.resolve('artifacts/audio');await fs.mkdir(out,{recursive:true});
const files=new Map();for(const name of ['audio','audioScene']){const source=await fs.readFile('src/'+name+'.ts','utf8');const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("'./audioScene'","'./audioScene.js'");files.set('/'+name+'.js',js);}
const html=`<!doctype html><html><body><button id="start" style="margin:60px;padding:30px">Enable actual audio</button><script type="module">import * as audio from '/audio.js';window.audio=audio;window.enabled=false;document.getElementById('start').onclick=async()=>{window.enabled=await audio.enableAudio(true);audio.setAudioMix({volume:.65,effects:.85,music:.25,muted:false},true);audio.playSound('engine',true);};</script></body></html>`;
const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':files.has(req.url)?'text/javascript':'text/html'});res.end(files.get(req.url)??html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`,profile=await fs.mkdtemp(path.join(os.tmpdir(),'pamir-audio-render-'));
const browser=spawn(path.join(process.env.ProgramFiles??'C:/Program Files','Google/Chrome/Application/chrome.exe'),['--headless=new','--disable-gpu','--disable-features=AudioServiceOutOfProcess,AudioServiceSandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,seq=0;const pending=new Map(),exceptions=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 let port;for(let i=0;i<150&&!port;i++){try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];}catch{await wait(200);}}if(!port)throw Error('Chrome did not initialize');const tab=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout: '+method));},60000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.exception?.description);};
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Runtime.enable');await send('Page.enable');await send('Page.navigate',{url});await send('Page.bringToFront');for(let i=0;i<80;i++){if(await evaluate('!!window.audio'))break;await wait(100);}console.log('Static audio module loaded without Vite or 3D.');
 for(const [showcase,name] of [[false,'PAMIR-sound-cues.wav'],[true,'showcase-soundtrack.wav']]){
  const result=await evaluate(`audio.renderSoundDemo(${showcase}).then(async r=>({stats:r.stats,duration:r.duration,base64:await new Promise(resolve=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.readAsDataURL(new Blob([r.wav],{type:'audio/wav'}));})}))`);
  if(result.stats.some(s=>s.rms<.000001||s.peak>=.99))throw Error('Silent or clipped generated cue: '+JSON.stringify(result.stats));await fs.writeFile(path.join(out,name),Buffer.from(result.base64,'base64'));await fs.writeFile(path.join(out,name+'.json'),JSON.stringify(result.stats,null,2));console.log('Rendered '+name+'; all '+result.stats.length+' scheduled cue windows have nonzero unclipped waveforms.');
 }
 const p=await evaluate("(()=>{const r=document.getElementById('start').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});
 await wait(200);const live=await evaluate("new Promise(resolve=>{let max=0;const timer=setInterval(()=>{max=Math.max(max,audio.audioMeter().rms)},30);setTimeout(()=>{clearInterval(timer);resolve({maximum:max,last:audio.audioMeter(),enabled:window.enabled})},1600)})");await fs.writeFile(path.join(out,'render-verification.json'),JSON.stringify({offlinePassed:true,live,exceptions},null,2));console.log('Live audio diagnostics: '+JSON.stringify(live));if(exceptions.length)throw Error(exceptions.join('\n'));await send('Browser.close').catch(()=>{});
}finally{ws?.close();browser.kill();server.close();}

