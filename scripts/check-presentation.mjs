import assert from 'node:assert/strict';
import * as THREE from 'three';
import { guideRendezvous,docking,stepEva,REPAIR,distance,presentationBaseRoute,baseCollision } from '../src/expedition.ts';
import { stepLanding,stepWalker,terrainHeight,sites } from '../src/mars.ts';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const {useGame}=await import('../src/store.ts');const {useExpedition}=await import('../src/expeditionStore.ts');const g=()=>useGame.getState(),e=()=>useExpedition.getState();
g().set({points:123,visited:['Earth'],samples:['Moon-0']});e().set({resources:{energy:37,oxygen:62,materials:49,research:17},graphics:'LOW',built:['solar']});const originalResources={...e().resources};const normalGame=memory.get('pamir-space-lab-v2');e().startPresentation();let elapsed=0;
const tick=(dt)=>{elapsed+=dt;g().tick(dt);e().advance(dt);};
const pos=new THREE.Vector3(...g().flightPosition),q=new THREE.Quaternion(),v=new THREE.Vector3();
for(let i=0;i<3000&&e().dock==='free';i++){guideRendezvous(pos,q,v,1/60);pos.addScaledVector(v,1/60);assert(pos.length()>7.4,'Rendezvous must avoid Earth');g().set({flightPosition:pos.toArray(),flightRotation:q.toArray(),speed:v.length()});tick(1/60);}
assert.notEqual(e().dock,'free','Rendezvous must reach the actual docking envelope');while(e().mode!=='eva'&&elapsed<100)tick(.1);assert.equal(e().mode,'eva');
let suit=e().suit;
for(let i=0;i<12000&&e().mode==='eva';i++){
 const target=new THREE.Vector3(...(e().repaired?e().anchor:REPAIR)).sub(new THREE.Vector3(...suit.position));const input=target.length()>(e().repaired?1.8:1.6)?target.normalize():new THREE.Vector3();
 suit=stepEva(suit,input.toArray(),false,e().anchor,1/60);e().set({suit:{...suit,repair:e().suit.repair}});
 if(distance(suit.position,REPAIR)<2.2&&!e().repaired)e().repair(1/60);
 if(e().repaired&&distance(suit.position,e().anchor)<2.7)e().recover();tick(1/60);
}
assert.equal(e().missions.orbital.status,'complete');assert(suit.oxygen>25);assert.equal(g().mars.stage,'orbit');
while(g().mars.stage==='orbit')tick(.1);assert.equal(g().mars.stage,'approach');for(let i=0;i<100;i++)tick(.1);g().atmosphere();
let landing=g().mars.landing;while(landing.result==='flying'){landing=stepLanding(landing,1/60);g().updateLanding(landing);tick(1/60);}assert.equal(landing.result,'safe');assert.equal(g().mars.stage,'eva');
let w={x:0,y:0,z:5,vx:0,vz:0,vy:0};let routeIndex=0,dwell=0;
for(let i=0;i<20000&&e().missions.mars.status!=='complete';i++){
 const pending=sites.find(site=>site.id!=='research'&&!g().mars.objectives.includes(site.id));const target=pending??presentationBaseRoute[Math.min(3,routeIndex)];const dx=target.x-w.x,dz=target.z-w.z,d=Math.hypot(dx,dz);let ix=0,iz=0;
 if(d>1.8){ix=dx/d*.75;iz=dz/d*.75;dwell=0;}else{dwell+=1/60;if(dwell>1){if(pending)g().interact();else if(routeIndex<3)routeIndex++;else if(!e().analyzing)e().analyze();dwell=0;}}
 w=stepWalker(w,{x:ix,z:iz,jump:false,sprint:false},1/60);g().set({mars:{...g().mars,player:[w.x,w.y,w.z]}});tick(1/60);
 assert(w.y>=terrainHeight(w.x,w.z));
}
assert.equal(e().missions.mars.status,'complete','Presentation must reach the lab through real walls and the doorway');assert.equal(e().demoPhase,'results');assert(elapsed<300,`Presentation exceeded five minutes: ${elapsed}`);assert.equal(g().points,1023);assert.equal(memory.get('pamir-space-lab-v2'),normalGame);
e().endPresentation();assert.equal(g().points,123);assert.deepEqual(g().visited,['Earth']);assert.deepEqual(g().samples,['Moon-0']);assert.equal(g().started,false);assert.deepEqual(e().resources,originalResources);assert.equal(e().graphics,'LOW');assert.deepEqual(e().built,['solar']);
e().startPresentation();e().checkpointMars();assert.notEqual(e().missions.orbital.status,'complete');assert.equal(g().points,123,'A checkpoint must not fabricate mission rewards');const resetCount=g().flightReset;e().checkpointMars();assert.equal(g().flightReset,resetCount,'Repeated transfer checkpoint must not restart Mars or farm rewards');e().endPresentation();
// The laboratory back wall blocks entry; the front door permits it.
assert.notDeepEqual(baseCollision(53,12,53,11.3),[53,12]);assert.deepEqual(baseCollision(53,20,53,20.7),[53,20]);
console.log(`Presentation checks passed: Earth departure → real rendezvous/capture → EVA repair/recovery → physical Mars landing → samples → base doorway → analysis/results in ${elapsed.toFixed(0)} simulated seconds; normal saves restored exactly.`);
