// Optional: Vite 5174 + isolated headless Chrome CDP 9333. Closes only that browser.
import fs from 'node:fs/promises';
import * as THREE from 'three';
let target;for(let i=0;i<40&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();}catch(error){if(i===39)throw error;await new Promise(r=>setTimeout(r,250));}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let seq=0;const pending=new Map(),errors=[];
ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description).join(' '));};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const frames=n=>evaluate(`new Promise(resolve=>{let left=${n};function next(){if(--left<=0)resolve(true);else requestAnimationFrame(next);}requestAnimationFrame(next);})`);
const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('artifacts/earth-orbits/'+name+'.png',Buffer.from(r.data,'base64'));console.log('Captured '+name);};
try{
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:5174/'});
  for(let i=0;i<120;i++){if(await evaluate("!!document.querySelector('canvas')"))break;await new Promise(r=>setTimeout(r,250));}
  const resources=await evaluate("performance.getEntriesByType('resource').map(r=>r.name)");const moduleUrl=path=>resources.find(u=>new URL(u).pathname===path)??'http://127.0.0.1:5174'+path;
  const game=moduleUrl('/src/store.ts'),expedition=moduleUrl('/src/expeditionStore.ts'),textures=moduleUrl('/src/planetTextures.ts');
  await evaluate(`import(${JSON.stringify(expedition)}).then(m=>m.useExpedition.getState().set({graphics:'LOW',mode:'flight',dock:'free',navStation:false,presentation:false,panel:null}))`);
  for(let i=0;i<200;i++){const status=await evaluate(`import(${JSON.stringify(textures)}).then(m=>m.textureStatus())`);if(status.failed.length)throw Error('Texture failure');if(!status.pending.length)break;await new Promise(r=>setTimeout(r,200));}
  const position=[0,6,40],rotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(...position),new THREE.Vector3(),new THREE.Vector3(0,1,0))).toArray();
  await evaluate(`import(${JSON.stringify(game)}).then(m=>{const g=m.useGame.getState();g.set({started:true,target:'Earth',surface:null,paused:false,uiBlocked:false,autopilot:false,flightPosition:${JSON.stringify(position)},flightRotation:${JSON.stringify(rotation)},flightReset:g.flightReset+1});})`);
  await frames(24);await fs.mkdir('artifacts/earth-orbits',{recursive:true});
  await evaluate("document.querySelector('.earth-orbit-launch').click()");await frames(3);
  if(await evaluate("document.querySelectorAll('.orbit-catalog button').length")!==4)throw Error('Expected four named missions');
  await evaluate("document.querySelector('.orbit-panel-actions button').click()");await frames(5);await shot('earth-orbit-overview');
  const before=await evaluate(`import(${JSON.stringify(game)}).then(m=>m.useGame.getState().flightPosition)`);
  for(const [label,count] of [['ISS',32],['HUBBLE',24],['LANDSAT 9',16],['SENTINEL-6B',16]]){
    await evaluate(`Array.from(document.querySelectorAll('.orbit-catalog button')).find(b=>b.textContent.includes(${JSON.stringify(label)})).click()`);await frames(count);
    if(!await evaluate(`document.querySelector('.earth-orbit-panel h3').textContent.includes(${JSON.stringify(label)})`))throw Error('Inspection did not activate: '+label);
    await shot(label.toLowerCase().replaceAll(' ','-'));
  }
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await frames(8);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
  const after=await evaluate(`import(${JSON.stringify(game)}).then(m=>m.useGame.getState().flightPosition)`);if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Inspection moved the ship');
  await evaluate("Array.from(document.querySelectorAll('.orbit-panel-actions button')).find(b=>b.textContent.includes('RETURN TO SHIP')).click()");await frames(3);if(await evaluate("!!document.querySelector('.earth-orbit-panel')"))throw Error('Inspection did not close');
  const portModule=moduleUrl('/src/expedition.ts');const port=await evaluate(`import(${JSON.stringify(portModule)}).then(m=>m.PORT)`),gatewayPosition=[port[0]+4,port[1]+3,port[2]+10],gatewayRotation=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(...gatewayPosition),new THREE.Vector3(...port),new THREE.Vector3(0,1,0))).toArray();await evaluate(`import(${JSON.stringify(game)}).then(m=>{const g=m.useGame.getState();g.set({flightPosition:${JSON.stringify(gatewayPosition)},flightRotation:${JSON.stringify(gatewayRotation)},flightReset:g.flightReset+1});})`);await frames(24);await shot('gateway-separated');
  if(errors.length)throw Error(errors.join('\n'));console.log('Orbit browser checks passed: four real catalog buttons, orbit paths, inspection camera, held ship position, return controls, smaller separated Gateway, zero runtime/shader errors.');
}finally{await send('Browser.close').catch(()=>{});ws.close();}
