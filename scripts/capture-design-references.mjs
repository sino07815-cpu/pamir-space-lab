import fs from 'node:fs/promises';
let target;for(let i=0;i<50&&!target;i++){try{target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();}catch(error){if(i===49)throw error;await new Promise(r=>setTimeout(r,250));}}
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});let count=0;const pending=new Map();socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}}};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++count;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
try{await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await fs.mkdir('artifacts/design-references',{recursive:true});
  for(const [name,url] of [['starship','https://new.spacex.com/vehicles/starship'],['gagarin','https://airandspace.si.edu/albums/yuri-gagarin-training-spacesuit']]){
    await send('Page.navigate',{url});for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,500));const state=await send('Runtime.evaluate',{expression:'document.readyState',returnByValue:true});if(state.result.value==='complete')break;}
    const page=await send('Runtime.evaluate',{expression:'JSON.stringify({title:document.title,url:location.href,text:document.body?.innerText?.slice(0,140)})',returnByValue:true});console.log(name+': '+page.result.value);const screenshot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('artifacts/design-references/'+name+'.png',Buffer.from(screenshot.data,'base64'));
  }
}finally{await send('Browser.close').catch(()=>{});socket.close();}
