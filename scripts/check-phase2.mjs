import assert from 'node:assert/strict';
import * as THREE from 'three';
import { initialLanding, initialMars, stepLanding, stepWalker, terrainHeight, sites, boulders } from '../src/mars.ts';
import { accelerateFlight, steerFlight } from '../src/flight.ts';

const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const {useGame}=await import('../src/store.ts');const state=()=>useGame.getState();
const fly=(held)=>{const velocity=new THREE.Vector3(),rotation=new THREE.Quaternion();for(let i=0;i<180;i++)accelerateFlight(velocity,rotation,new Set(held),1/60);return velocity;};
assert(fly(['KeyW']).z < -9.9);assert(fly(['KeyS']).z>9.9);assert(fly(['KeyD']).x>9.9);assert(fly(['KeyA']).x< -9.9);
assert(fly(['KeyW','ShiftLeft']).length()>37);assert(fly(['KeyW','KeyD']).length()<10.01);
const velocity=fly(['KeyW']);accelerateFlight(velocity,new THREE.Quaternion(),new Set(['Space']),.1);assert(velocity.length()<2);
for(const held of [['ArrowUp'],['ArrowLeft'],[]]){const q=new THREE.Quaternion();steerFlight(q,new Set(held),held.length?0:40,0,.03);assert(Math.abs(q.y)+Math.abs(q.x)>0);assert(Math.abs(q.length()-1)<1e-10);}

const descend=(assisted=true,fuel=100,dt=1/60)=>{let l={...initialLanding(),assisted,fuel};for(let i=0;i<15000&&l.result==='flying';i++)l=stepLanding(l,dt,false);return l;};
const safe=descend();assert.equal(safe.result,'safe');assert(safe.impact<=3&&safe.fuel>0&&safe.altitude===0);
assert.equal(descend(false).result,'crashed');assert.equal(descend(true,0).result,'crashed');
assert(Math.abs(descend(true,100,1/30).impact-safe.impact)<.05,'Landing must be stable across frame rates');

let w={x:0,y:0,z:5,vx:0,vz:0,vy:0};w.y=terrainHeight(w.x,w.z);w=stepWalker(w,{x:0,z:0,jump:true,sprint:false},1/60);assert(w.vy>0);let maxY=w.y;
for(let i=0;i<240;i++){w=stepWalker(w,{x:0,z:0,jump:false,sprint:false},1/60);maxY=Math.max(maxY,w.y);assert(w.y>=terrainHeight(w.x,w.z));}assert(maxY>1.5);assert.equal(w.vy,0);
const rock=boulders[0];const blocked=stepWalker({x:rock.x,y:0,z:rock.z,vx:0,vz:0,vy:0},{x:0,z:0,jump:false,sprint:false},.02);assert(Math.hypot(blocked.x-rock.x,blocked.z-rock.z)>=rock.r+.39);

state().set({started:true,target:'Mars',distance:25});state().enterOrbit();assert.equal(state().mars.stage,'space');
state().set({distance:9});state().enterOrbit();assert.equal(state().mars.stage,'orbit');state().beginLanding();assert.equal(state().mars.stage,'approach');state().atmosphere();state().updateLanding(safe);assert.equal(state().mars.stage,'landed');assert.equal(state().points,100);
state().exitShip();assert.equal(state().mars.stage,'eva');state().interact();assert.equal(state().points,125,'Returning early must not complete the mission');assert.equal(state().mars.stage,'landed');state().exitShip();
for(const site of sites){
 state().set({mars:{...state().mars,player:[90,0,90]}});state().interact();assert(!state().mars.objectives.includes(site.id),'Remote interaction must fail');
 state().set({mars:{...state().mars,player:[site.x,terrainHeight(site.x,site.z),site.z]}});state().interact();const score=state().points;state().interact();assert.equal(state().points,score,'Duplicate interaction must not award science');
}
state().set({mars:{...state().mars,player:[0,0,5]}});state().interact();assert.equal(state().mars.stage,'complete');assert.equal(state().mars.objectives.length,10);assert.equal(state().mars.earned,600);assert.equal(state().points,600);
state().set({paused:true});const elapsed=state().elapsed;state().tick(10);assert.equal(state().elapsed,elapsed);state().set({paused:false,uiBlocked:true});state().tick(10);assert.equal(state().elapsed,elapsed);state().set({uiBlocked:false});state().tick(2);assert.equal(state().elapsed,elapsed+2);
await new Promise(r=>setTimeout(r,250));const saved=JSON.parse(memory.get('pamir-space-lab-v2'));assert.equal(saved.state.points,600);assert.equal(saved.state.mars.stage,'complete');assert.equal(saved.state.mars.demo,false);
const snapshot=memory.get('pamir-space-lab-v2');state().set({points:0,mars:initialMars()});memory.set('pamir-space-lab-v2',snapshot);await useGame.persist.rehydrate();assert.equal(state().points,600);assert.equal(state().mars.stage,'complete');assert.equal(state().started,false,'Reload must return to the menu while retaining the expedition');
state().returnSpace();assert.equal(state().surface,null);assert.equal(state().target,'Mars');state().replay();assert.equal(state().points,0);assert.equal(state().mars.stage,'orbit');assert.equal(state().samples.length,0);assert(state().history.length>0);
state().startDemo();assert(state().mars.demo);assert.deepEqual(state().flightPosition,[58,7,-42]);
// Walk the actual deterministic demo corridor through the same collision model.
w={x:0,y:0,z:5,vx:0,vz:0,vy:0};let steps=0;
for(const target of [...sites,{x:0,z:5}]){let remaining=20000;while(Math.hypot(w.x-target.x,w.z-target.z)>1.8&&remaining-->0){const dx=target.x-w.x,dz=target.z-w.z,d=Math.hypot(dx,dz);w=stepWalker(w,{x:dx/d*.42,z:dz/d*.42,jump:false,sprint:false},1/60);steps++;}assert(remaining>0,'Demo route must remain reachable through collision geometry');for(let i=0;i<240;i++)w=stepWalker(w,{x:0,z:0,jump:false,sprint:false},1/60);}
const demoDuration=steps/60+safe.elapsed+10+8+6+5*4;assert(demoDuration>=180&&demoDuration<=300,`Expected a 3–5 minute demo, got ${demoDuration}s`);
assert.equal(initialMars().earned,0);
console.log(`Phase 2 checks passed: flight, boost, braking, steering, safe/failed/fuel-starved landings, gravity, ground/rock collision, proximity, mission transitions, 600-point scoring, pause, persistence, replay, and ${demoDuration.toFixed(0)}s demo route.`);
