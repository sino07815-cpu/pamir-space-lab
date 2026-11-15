// Records a cut gameplay montage in an isolated profile; normal player saves are untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
const out=path.resolve('artifacts/audio-diagnostic'),wait=ms=>new Promise(r=>setTimeout(r,ms));await fs.mkdir(out,{recursive:true});
const run=(exe,args,cwd)=>new Promise((resolve,reject)=>{const p=spawn(exe,args,{windowsHide:true,cwd,stdio:['ignore','pipe','pipe']});let log='';p.stdout.on('data',b=>log+=b);p.stderr.on('data',b=>log+=b);p.on('error',reject);p.on('exit',code=>code?reject(Error(log.slice(-3000))):resolve(log));});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5181','--strictPort'],{windowsHide:true,stdio:'pipe'});let viteLog='';vite.stdout.on('data',b=>viteLog+=b);vite.stderr.on('data',b=>viteLog+=b);
let chrome,ws,seq=0,active=null;const pending=new Map(),counts={},writes=[],errors=[],scenes=[];
const ffmpeg=path.resolve('artifacts/video-tools/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
try{
 for(let i=0;i<150;i++){try{if((await fetch('http://127.0.0.1:5181/')).ok)break;}catch{}if(i===149)throw Error(viteLog);await wait(400);}
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'pamir-video-'));
 chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--ignore-gpu-blocklist','--enable-webgl','--remote-debugging-port=9341','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let target;for(let i=0;i<150&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9341/json/new?about:blank',{method:'PUT'})).json();}catch{await wait(200);}}if(!target)throw Error('Chrome did not start');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},45000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);if(m.method==='Page.screencastFrame'){const p=m.params;send('Page.screencastFrameAck',{sessionId:p.sessionId}).catch(()=>{});if(active){const name=active,index=counts[name]++;writes.push(fs.writeFile(path.join(out,name,`${String(index).padStart(5,'0')}.jpg`),Buffer.from(p.data,'base64')));}}};
 const evaluate=async expression=>{console.log('Evaluating: '+expression.slice(0,80));const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 console.log('Navigating bare audio harness.');await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:5181/artifacts/audio/harness.html'});
 for(let i=0;i<120;i++){if(await evaluate("!!document.querySelector('.hero')"))break;await wait(400);}
 await wait(4000);
 await send('Page.bringToFront');for(let i=0;i<100;i++){if(await evaluate('!!window.synth'))break;await wait(200);}console.log('Bare audio page loaded.');
 console.log('Timer check: '+await evaluate('new Promise(r=>setTimeout(()=>r(true),200))'));
 const rendered=await evaluate('synth.renderSoundDemo(false).then(r=>({stats:r.stats,duration:r.duration}))');console.log('Offline cue range: '+JSON.stringify({count:rendered.stats.length,minRms:Math.min(...rendered.stats.map(s=>s.rms)),maxPeak:Math.max(...rendered.stats.map(s=>s.peak))}));
 const p=await evaluate("(()=>{const r=document.getElementById('start').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()");await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});await wait(250);console.log('After click: '+JSON.stringify(await evaluate('({ready:window.ready,meter:synth.audioMeter()})')));
 const probe=await evaluate('new Promise(resolve=>{let max=0;const timer=setInterval(()=>{max=Math.max(max,synth.audioMeter().rms)},50);setTimeout(()=>{clearInterval(timer);resolve({maximum:max,last:synth.audioMeter()})},2200)})');console.log('Bare live audio: '+JSON.stringify(probe));await fs.writeFile(path.join(out,'diagnostic.json'),JSON.stringify({rendered,probe,errors},null,2));await send('Browser.close').catch(()=>{});
}finally{ws?.close();chrome?.kill();vite.kill();}