// Records a cut gameplay montage in an isolated profile; normal player saves are untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
const out=path.resolve('artifacts/video'),wait=ms=>new Promise(r=>setTimeout(r,ms));await fs.mkdir(out,{recursive:true});
const run=(exe,args,cwd)=>new Promise((resolve,reject)=>{const p=spawn(exe,args,{windowsHide:true,cwd,stdio:['ignore','pipe','pipe']});let log='';p.stdout.on('data',b=>log+=b);p.stderr.on('data',b=>log+=b);p.on('error',reject);p.on('exit',code=>code?reject(Error(log.slice(-3000))):resolve(log));});
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5177','--strictPort'],{windowsHide:true,stdio:'pipe'});let viteLog='';vite.stdout.on('data',b=>viteLog+=b);vite.stderr.on('data',b=>viteLog+=b);
let chrome,ws,seq=0,active=null;const pending=new Map(),counts={},writes=[],errors=[],scenes=[];
const ffmpeg=path.resolve('artifacts/video-tools/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
try{
 for(let i=0;i<150;i++){try{if((await fetch('http://127.0.0.1:5177/')).ok)break;}catch{}if(i===149)throw Error(viteLog);await wait(400);}
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'pamir-video-'));
 chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--ignore-gpu-blocklist','--enable-webgl','--remote-debugging-port=9337','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let target;for(let i=0;i<150&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9337/json/new?about:blank',{method:'PUT'})).json();}catch{await wait(200);}}if(!target)throw Error('Chrome did not start');
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},45000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);if(m.method==='Page.screencastFrame'){const p=m.params;send('Page.screencastFrameAck',{sessionId:p.sessionId}).catch(()=>{});if(active){const name=active,index=counts[name]++;writes.push(fs.writeFile(path.join(out,name,`${String(index).padStart(5,'0')}.jpg`),Buffer.from(p.data,'base64')));}}};
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:5177/'});
 for(let i=0;i<120;i++){if(await evaluate("!!document.querySelector('.hero')"))break;await wait(400);}
 const resources=await evaluate("performance.getEntriesByType('resource').map(r=>r.name)");const url=p=>resources.find(u=>new URL(u).pathname===p)??'http://127.0.0.1:5177'+p;
 await evaluate(`Promise.all([import(${JSON.stringify(url('/src/store.ts'))}),import(${JSON.stringify(url('/src/expeditionStore.ts'))}),import(${JSON.stringify(url('/src/earthPortState.ts'))}),import(${JSON.stringify(url('/src/mars.ts'))})]).then(([a,b,c,d])=>{window.videoGame=a.useGame;window.videoExp=b.useExpedition;window.videoPort=c;window.videoMars=d;videoExp.getState().set({graphics:'LOW'});})`);
 await wait(4000);
 const scene=async(name,duration,title,setup)=>{if((process.argv.includes('--dashboard-only')&&name!=='08-mission-control')||(process.argv.includes('--resume')&&!name.startsWith('10-')&&!name.startsWith('11-'))){const n=(await fs.readdir(path.join(out,name))).filter(f=>f.endsWith('.jpg')).length;scenes.push({name,duration,frames:n});return;}if(setup)await evaluate(setup);await evaluate(`(()=>{let b=document.getElementById('video-caption');if(!b){b=document.createElement('div');b.id='video-caption';b.style='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:10000;background:#07121dec;border:1px solid #deb28277;color:#f0d0a4;font:600 13px Arial;letter-spacing:1.5px;padding:11px 22px;pointer-events:none;white-space:nowrap';document.body.appendChild(b);}b.textContent=${JSON.stringify(title)};})()`);await wait(1800);await fs.mkdir(path.join(out,name),{recursive:true});counts[name]=0;active=name;await send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1280,maxHeight:720,everyNthFrame:1});await wait(6000);await send('Page.stopScreencast');active=null;await Promise.all(writes.splice(0));if(!counts[name])throw Error('No video frames for '+name);scenes.push({name,duration,frames:counts[name]});console.log(`Recorded ${name}: ${counts[name]} frames`);};
 await scene('01-menu',3,'PAMIR SPACE LAB / BEYOND EARTH');
 await scene('02-briefing',2,'LEARN THROUGH REAL EXPLORATION MISSIONS',"document.querySelector('.judge-open-button').click()");
 await scene('03-campus',3,'EARTH / PAMIR LAUNCH COMPLEX',"videoExp.getState().set({panel:null});videoPort.enterEarthPort()");
 await scene('04-launch',3,'BOARD. LAUNCH. GO BEYOND.',"videoPort.usePort.setState({overview:false,range:4});videoPort.launchEarth();videoPort.usePort.setState({time:3.5})");
 await scene('05-space',3,'EXPLORE THE SOLAR SYSTEM',"videoPort.finishEarthLaunch();videoGame.getState().set({surface:null,target:'Earth',autopilot:false,flightPosition:[0,0,20],flightRotation:[0,0,0,1],flightReset:videoGame.getState().flightReset+1})");
 await scene('06-descent',4,'MARS / CONTROL YOUR DESCENT',"{const g=videoGame.getState();g.set({surface:'Mars',target:'Mars',autopilot:false,mars:{...videoMars.initialMars(),stage:'descent',landing:{...videoMars.initialLanding(),altitude:48,velocity:-4}}});}");
 await scene('07-exploration',4,'WALK. COLLECT SAMPLES. DISCOVER.',"{const g=videoGame.getState();g.set({surface:'Mars',target:'Mars',mars:{...videoMars.initialMars(),stage:'eva',demo:true,objectives:['reach','land','exit'],landing:{...videoMars.initialLanding(),altitude:0,velocity:0,result:'safe'},player:[3,0,5]}});}");
 await scene('08-mission-control',3,'MISSION CONTROL / TRACK EVERY DISCOVERY',"document.querySelector('nav button:nth-child(2)').click()");
 await scene('09-science',2,'NASA SCIENCE SOURCES / LEARN BY DOING',"document.querySelector('nav button:first-child').click();videoExp.getState().set({panel:'science'})");
 await scene('10-controls',1,'PAMIR SPACE LAB / EXPLORE. DISCOVER. INNOVATE.',"videoExp.getState().set({panel:null});videoGame.getState().set({surface:null,started:false,paused:false,uiBlocked:false,mars:videoMars.initialMars(),target:'Earth'});setTimeout(()=>document.querySelector('.how-button')?.click(),250)");
 await scene('11-systems',2,'READY FOR YOUR NEXT MISSION',"document.querySelector('.modal .close-button')?.click();videoExp.getState().set({panel:'settings'})");
 await fs.writeFile(path.join(out,'capture.json'),JSON.stringify({scenes,errors,note:'Edited gameplay montage captured in an isolated recording profile; cuts use staged scene entry points.'},null,2));
 await send('Browser.close').catch(()=>{});ws.close();chrome.kill();vite.kill();
 if(process.argv.includes('--dashboard-only'))process.exit(0);
 for(const s of scenes){await run(ffmpeg,['-y','-framerate',String(s.frames/s.duration),'-i',path.join(out,s.name,'%05d.jpg'),'-t',String(s.duration),'-vf','scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1','-r','30','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',path.join(out,s.name+'.mp4')]);}
 await fs.writeFile(path.join(out,'segments.txt'),scenes.map(s=>`file '${s.name}.mp4'`).join('\n'));
 await run(ffmpeg,['-y','-f','concat','-safe','0','-i','segments.txt','-vf','tpad=stop_mode=clone:stop_duration=1','-t','30','-r','30','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','PAMIR-SPACE-LAB-30s.mp4']);
 console.log('VIDEO READY: '+path.join(out,'PAMIR-SPACE-LAB-30s.mp4'));if(errors.length)console.log('Captured runtime diagnostics: '+errors.join('\n'));
}finally{ws?.close();chrome?.kill();vite.kill();}
