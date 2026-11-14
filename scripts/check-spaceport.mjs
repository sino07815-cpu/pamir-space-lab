import assert from 'node:assert/strict';
import { PORT_SPAWN,PORT_BOARDING,PORT_START_RANGE,PORT_OBSTACLES,spaceportHeight,resolveSpaceport,boardingDistance,launchAltitude } from '../src/spaceport.ts';
import { stepWalker } from '../src/mars.ts';
assert(PORT_START_RANGE>40);assert.equal(boardingDistance(PORT_SPAWN[0],PORT_SPAWN[2]),PORT_START_RANGE);assert.equal(boardingDistance(...PORT_BOARDING),0);
for(let x=-70;x<=70;x+=2)for(let z=-65;z<=70;z+=2){const h=spaceportHeight(x,z);assert(h>=0&&h<=.55);const p=resolveSpaceport(x,z);assert(p.every(Number.isFinite));assert(Math.hypot(...p)>=3.39);}
for(const obstacle of PORT_OBSTACLES){const [x,z]=resolveSpaceport(obstacle.x,obstacle.z);assert(Math.abs(x-obstacle.x)>=obstacle.w+.34||Math.abs(z-obstacle.z)>=obstacle.d+.34,'Solid facility collision');}
assert.deepEqual(resolveSpaceport(NaN,2,3,4),[3,4]);
let player={x:PORT_SPAWN[0],y:0,z:PORT_SPAWN[2],vx:0,vz:0,vy:0};let reached=false;
for(let i=0;i<3000;i++){const dx=PORT_BOARDING[0]-player.x,dz=PORT_BOARDING[1]-player.z,d=Math.hypot(dx,dz);if(d<4){reached=true;break;}player=stepWalker(player,{x:dx/d,z:dz/d,jump:false,sprint:true},1/60,{gravity:9.81,height:spaceportHeight,resolve:resolveSpaceport});assert(player.y>=spaceportHeight(player.x,player.z)-.001);}
assert(reached,'The boarding access must be reachable on foot');
assert.equal(launchAltitude(0),0);assert.equal(launchAltitude(1.7),0);assert(launchAltitude(6)>launchAltitude(3));assert(launchAltitude(12)>180);
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const {useGame}=await import('../src/store.ts');const {usePort,enterEarthPort,launchEarth,finishEarthLaunch}=await import('../src/earthPortState.ts');const g=()=>useGame.getState();g().set({started:false,surface:null,paused:false,uiBlocked:false});enterEarthPort();assert.equal(usePort.getState().range,PORT_START_RANGE);launchEarth();assert.equal(usePort.getState().phase,'walk','Cannot board from the distant spawn');usePort.setState({range:3,portrait:true});launchEarth();assert.equal(usePort.getState().phase,'launch');assert(!usePort.getState().portrait);finishEarthLaunch();assert.equal(g().surface,null);assert.equal(g().target,'Earth');
console.log('Spaceport checks passed: reachable boarding access, smooth pad height, facility/hull collision, grounded walking, distant spawn boarding guard, ignition/ascent and preserved orbital transition.');
