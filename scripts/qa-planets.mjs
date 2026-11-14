// Optional real-browser check. Start Vite on 5174 and an isolated Chrome CDP on 9333.
import fs from 'node:fs/promises';
import * as THREE from 'three';
let target;for(let i=0;i<40&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();}catch(error){if(i===39)throw error;await new Promise(r=>setTimeout(r,250));}}
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
let sequence=0;const pending=new Map(),errors=[],assets=new Set();
socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}
  if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));
  if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description).join(' '));
  if(m.method==='Network.responseReceived'&&m.params.response.url.includes('/textures/')){const r=m.params.response;if(r.status>=400)errors.push('HTTP '+r.status+' '+r.url);else assets.add(r.url.split('/').pop());}
};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
try{
  await send('Runtime.enable');await send('Network.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5174/'});
  for(let i=0;i<80;i++){if(await evaluate("!!document.querySelector('canvas')"))break;await new Promise(r=>setTimeout(r,250));}
  const resources=await evaluate("performance.getEntriesByType('resource').map(r=>r.name)");
  const gameUrl=resources.find(u=>new URL(u).pathname==='/src/store.ts')??'http://127.0.0.1:5174/src/store.ts';
  const expeditionUrl=resources.find(u=>new URL(u).pathname==='/src/expeditionStore.ts')??'http://127.0.0.1:5174/src/expeditionStore.ts';
  await evaluate(`import(${JSON.stringify(expeditionUrl)}).then(m=>m.useExpedition.getState().set({graphics:'LOW'}))`);
  const textureUrl=resources.find(u=>new URL(u).pathname==='/src/planetTextures.ts')??'http://127.0.0.1:5174/src/planetTextures.ts';
  for(let i=0;i<200;i++){const status=await evaluate(`import(${JSON.stringify(textureUrl)}).then(m=>m.textureStatus())`);if(status.failed.length)throw new Error('Failed maps: '+status.failed.join());if(!status.pending.length)break;if(i===199)throw new Error('Planet maps did not finish loading');await new Promise(r=>setTimeout(r,200));}
  const frames=n=>evaluate(`new Promise(resolve=>{let left=${n};function next(){if(--left<=0)resolve(true);else requestAnimationFrame(next);}requestAnimationFrame(next);})`);
  await frames(4);await fs.mkdir('artifacts/planets',{recursive:true});
  for(const name of ['Earth','Mars','Jupiter','Saturn','Mercury','Venus','Uranus','Neptune','Moon']){
    await evaluate(`Array.from(document.querySelectorAll('.planet-choice')).find(b=>b.textContent.includes(${JSON.stringify(name)})).click()`);
    const selected=await evaluate("document.querySelector('.planet-choice.selected strong')?.textContent");if(selected!==name)throw new Error('Destination button failed: '+name);
    await frames(4);const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('artifacts/planets/'+name.toLowerCase()+'.png',Buffer.from(shot.data,'base64'));console.log('Rendered '+name);
  }
  const nightPosition=[-20,0,0],nightRotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(...nightPosition),new THREE.Vector3(),new THREE.Vector3(0,1,0))).toArray();
  await evaluate(`import(${JSON.stringify(gameUrl)}).then(m=>{const g=m.useGame.getState();g.set({started:true,target:'Earth',surface:null,autopilot:false,cockpit:false,paused:false,uiBlocked:false,flightPosition:${JSON.stringify(nightPosition)},flightRotation:${JSON.stringify(nightRotation)},flightReset:g.flightReset+1});})`);
  await frames(45);const nightShot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('artifacts/planets/earth-night-scene.png',Buffer.from(nightShot.data,'base64'));
  const state=await evaluate(`import(${JSON.stringify(gameUrl)}).then(m=>({worlds:m.planets.length,target:m.useGame.getState().target,canvas:!!document.querySelector('canvas')}))`);
  const unexpected=errors.filter(e=>!e.includes('favicon.ico'));if(unexpected.length)throw new Error(unexpected.join('\n'));
  if(assets.size<12)throw new Error('Expected 12 local maps, loaded '+assets.size);
  console.log(JSON.stringify({state,assets:[...assets],runtimeErrors:unexpected.length}));
}finally{await send('Browser.close').catch(()=>{});socket.close();}
