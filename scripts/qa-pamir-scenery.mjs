import fs from 'node:fs/promises';
let target;for(let i=0;i<50&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9335/json/new?about:blank',{method:'PUT'})).json();}catch(error){if(i===49)throw error;await new Promise(r=>setTimeout(r,250));}}
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});let seq=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}if(m.method==='Runtime.exceptionThrown')errors.push(JSON.stringify(m.params.exceptionDetails));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description).join(' '));};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const frames=n=>evaluate(`new Promise(resolve=>{let left=${n};function next(){if(--left<=0)resolve(true);else requestAnimationFrame(next);}requestAnimationFrame(next);})`);
const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('artifacts/spaceport/'+name+'.png',Buffer.from(r.data,'base64'));console.log('Captured '+name);};
const key=(code,down)=>send('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key:code==='ShiftLeft'?'Shift':code.replace('Key','').toLowerCase(),code});
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await send('Page.addScriptToEvaluateOnNewDocument',{source:'localStorage.clear()'});await send('Page.navigate',{url:'http://127.0.0.1:5175/'});
 for(let i=0;i<160;i++){if(await evaluate("Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('BEGIN ON EARTH'))"))break;await new Promise(r=>setTimeout(r,250));}
 const resources=await evaluate("performance.getEntriesByType('resource').map(r=>r.name)");const moduleUrl=p=>resources.find(u=>new URL(u).pathname===p)??'http://127.0.0.1:5175'+p;
 const game=moduleUrl('/src/store.ts'),expedition=moduleUrl('/src/expeditionStore.ts'),port=moduleUrl('/src/earthPortState.ts');
 await evaluate("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('BEGIN ON EARTH')).click()");await frames(70);await fs.mkdir('artifacts/spaceport',{recursive:true});
 if(!await evaluate("!!document.querySelector('.campus-overview')"))throw Error('Overview missing');await shot('pamir-alpine-overview');
 await evaluate("Array.from(document.querySelectorAll('.spaceport-actions button')).find(b=>b.textContent.includes('EXPLORE CAMPUS')).click()");await frames(45);
 if(await evaluate("!!document.querySelector('.campus-overview')"))throw Error('Cannot return to walking');await shot('pamir-alpine-walking');
 const before=await evaluate(`import(${JSON.stringify(port)}).then(m=>m.usePort.getState().range)`);await key('KeyW',true);await frames(30);await key('KeyW',false);await frames(8);const after=await evaluate(`import(${JSON.stringify(port)}).then(m=>m.usePort.getState().range)`);if(!(after<before))throw Error('Walking did not approach rocket');
 await key('KeyB',true);await frames(3);await key('KeyB',false);await frames(4);if(!await evaluate("!!document.querySelector('.campus-overview')"))throw Error('B shortcut failed');
 if(errors.length)throw Error(errors.join('\n'));console.log('Pamir scenery browser checks passed: overview, return to walking, actual keyboard movement, B toggle, zero runtime errors.');
}catch(error){console.log(await evaluate("document.body.innerText.slice(0,2500)"));console.log(errors);await fs.mkdir('artifacts/spaceport',{recursive:true});await shot('pamir-error');throw error;}finally{await send('Browser.close').catch(()=>{});ws.close();}