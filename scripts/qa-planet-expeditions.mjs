// Records a cut gameplay montage in an isolated profile; normal player saves are untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
const out=path.resolve('artifacts/planet-expeditions'),wait=ms=>new Promise(r=>setTimeout(r,ms));await fs.mkdir(out,{recursive:true});
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
 await evaluate(`Promise.all([import(${JSON.stringify(url('/src/planetMissionStore.ts'))}),import(${JSON.stringify(url('/src/store.ts'))})]).then(([m,g])=>{window.research=m.usePlanetMissions;window.worlds=g.planets;})`);
 const frames=n=>evaluate(`new Promise(resolve=>{let n=${n};function tick(){if(--n<=0)resolve(true);else requestAnimationFrame(tick);}requestAnimationFrame(tick);})`);
 const key=(code,down)=>send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:code.replace('Key','').toLowerCase(),code});
 const waitForJuno=async()=>{await evaluate("videoExp.getState().set({graphics:'MEDIUM'})");for(let i=0;i<80;i++){const status=await evaluate(`import(${JSON.stringify(url('/src/NasaJuno.tsx'))}).then(m=>m.nasaJunoStatus)`);if(status.failed)throw Error('NASA Juno model failed');if(status.ready&&status.meshes>0)return;await frames(2);}throw Error('NASA Juno model did not render');};
 const fixture=async name=>{await evaluate(`(()=>{videoExp.getState().set({mode:'flight',dock:'free',presentation:false,panel:null,navStation:false});const p=worlds.find(p=>p.name===${JSON.stringify(name)}),g=videoGame.getState();g.set({started:true,paused:false,uiBlocked:false,target:p.name,surface:null,autopilot:false,cockpit:false,speed:0,distance:10,mars:{...g.mars,stage:'space',demo:false},flightPosition:[p.position[0],p.position[1],p.position[2]+p.radius+10],flightRotation:[0,0,0,1],flightReset:g.flightReset+1});research.setState({robot:null,probe:null,hold:0,transmit:0});})()`);await frames(5);};
 const calibrate=async()=>{await key('KeyF',true);await frames(5);if(!await evaluate('research.getState().hold>0'))throw Error('Real F input did not progress the survey');await key('KeyF',false);await evaluate('(()=>{for(let i=0;i<65;i++)research.getState().tick(.05,true,false);})()');await frames(3);};
 const capture=async name=>{counts[name]=0;await fs.mkdir(path.join(out,name),{recursive:true});active=name;await send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1280,maxHeight:720,everyNthFrame:1});await wait(3000);await send('Page.stopScreencast');active=null;await Promise.all(writes.splice(0));if(!counts[name])throw Error('No rendered frames: '+name);console.log('Rendered '+name+' '+counts[name]+' frames');};
 for(const name of ['Mercury','Venus']){
  await fixture(name);await calibrate();await evaluate("Array.from(document.querySelectorAll('.planet-operation-card button')).find(b=>b.textContent.includes('DEPLOY ROBOTIC LANDER')).click()");await frames(4);
  if(!await evaluate(`research.getState().robot?.planet===${JSON.stringify(name)}&&!!document.querySelector('.robotics-active')`))throw Error('Robot descent did not open');
  await capture(name.toLowerCase()+'-descent');
  await evaluate("(()=>{const r=research.getState().robot;research.getState().updateRobot({...r,stage:'landed',landing:{...r.landing,altitude:0,velocity:0,vx:0,vz:0,result:'safe',x:0,z:0}});})()");await frames(3);
  await evaluate("Array.from(document.querySelectorAll('.robot-operation button')).find(b=>b.textContent.includes('DEPLOY / REJOIN ROVER')).click()");await frames(4);
  const before=await evaluate('research.getState().robot.player');await key('KeyW',true);await frames(12);await key('KeyW',false);await frames(4);const after=await evaluate('research.getState().robot.player');if(Math.hypot(after[0]-before[0],after[2]-before[2])<.1)throw Error('Rover did not drive');
  await capture(name.toLowerCase()+'-rover');
  await evaluate("Array.from(document.querySelectorAll('.robot-operation button')).find(b=>b.textContent.includes('RETURN TO ORBIT')).click()");await frames(4);if(!await evaluate('research.getState().robot===null&&videoGame.getState().surface===null'))throw Error('Orbit return failed');
 }
 await fixture('Jupiter');await calibrate();await evaluate("Array.from(document.querySelectorAll('.planet-operation-card button')).find(b=>b.textContent.includes('DEPLOY INSTRUMENT PROBE')).click()");await frames(4);if(!await evaluate('!!research.getState().probe'))throw Error('Probe did not deploy');await waitForJuno();await capture('jupiter-probe');
 await evaluate('(()=>{for(let i=0;i<210;i++)research.getState().tick(.05,false,false);})()');await frames(3);await key('KeyE',true);await frames(10);await key('KeyE',false);if(await evaluate('videoGame.getState().speed')>.8)throw Error('Transmission input incorrectly ascended spacecraft');
 await evaluate('(()=>{for(let i=0;i<65;i++)research.getState().tick(.05,false,true);})()');await frames(3);if(!await evaluate("research.getState().records.Jupiter.done.includes('complete')"))throw Error('Jupiter mission did not complete');
 await evaluate("Array.from(document.querySelectorAll('.planet-operation-card button')).find(b=>b.textContent.includes('ALL WORLD MISSIONS')).click()");await frames(4);if(await evaluate("document.querySelectorAll('.planet-expedition-grid article').length")!==9)throw Error('Expected all nine mission cards');await capture('mission-catalog');
 if(errors.length)throw Error(errors.join('\n'));
 await fs.writeFile(path.join(out,'qa-results.json'),JSON.stringify({passed:true,checks:['two robotic scenes','actual F survey input','lander deployment','rover deployment and actual W driving','orbit return','giant probe deployment','E transmission without ascent','nine mission cards'],fixtures:'Arrival and touchdown fixtures; model tests cover complete descent and science loops.',errors},null,2));
 console.log('Planet expedition browser checks passed with zero runtime exceptions.');await send('Browser.close').catch(()=>{});
}finally{ws?.close();chrome?.kill();vite.kill();}
