import assert from 'node:assert/strict';
import { earthOrbitObjects,representativeSatellites,orbitPosition,orbitPeriod,EARTH_RADIUS } from '../src/earthOrbits.ts';
import { PORT,REPAIR,STATION_APPROACH,STATION_FLIGHT_SCALE,distance,docking } from '../src/expedition.ts';
assert.equal(earthOrbitObjects.length,4);assert.equal(representativeSatellites.length,16);
for(const orbit of [...earthOrbitObjects,...representativeSatellites]){
  const period=orbitPeriod(orbit.altitudeKm)/60,p0=orbitPosition(orbit,0),p1=orbitPosition(orbit,1),loop=orbitPosition(orbit,period);
  assert(distance(p0,p1)>.0001,'Each craft moves');assert(distance(p0,loop)<.000001,'One accelerated revolution closes the orbit');
  for(let i=0;i<240;i++){const p=orbitPosition(orbit,i*1.7);assert(p.every(Number.isFinite));assert(Math.abs(Math.hypot(...p)-orbit.radius)<1e-9);assert(Math.hypot(...p)>EARTH_RADIUS+2,'Craft have a clear gap above Earth');}
}
assert(orbitPeriod(400)>5400&&orbitPeriod(400)<5700);assert(orbitPeriod(20200)>orbitPeriod(1336));
assert(STATION_FLIGHT_SCALE<.1,'Gateway is much smaller in orbital view');assert(Math.hypot(...PORT)-EARTH_RADIUS>20,'Gateway moved away from Earth');assert(distance(REPAIR,PORT)<12,'Repair remains reachable on the EVA tether');assert(docking(STATION_APPROACH,[0,0,0,1],.2).ready);
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const {useExpedition}=await import('../src/expeditionStore.ts');const e=()=>useExpedition.getState();
const legacy={...e(),mode:'eva',evaOrigin:'station',anchor:[14,3,10],suit:{...e().suit,position:[20,5,7]},resources:{...e().resources,research:31}};
memory.set('pamir-expedition-v3',JSON.stringify({state:legacy,version:1}));await useExpedition.persist.rehydrate();assert.deepEqual(e().anchor,PORT);assert.deepEqual(e().suit.position,REPAIR);assert.equal(e().resources.research,31);assert.equal(JSON.parse(memory.get('pamir-expedition-v3')).version,2);
const current=memory.get('pamir-expedition-v3');await useExpedition.persist.rehydrate();assert.deepEqual(e().suit.position,REPAIR,'Migration must not shift a current save twice');
memory.set('pamir-expedition-v3',JSON.stringify({state:{...legacy,evaOrigin:'ship'},version:1}));await useExpedition.persist.rehydrate();assert.deepEqual(e().anchor,[14,3,10],'Ship EVA anchors remain in place');memory.set('pamir-expedition-v3',current);
console.log('Earth orbit checks passed: four named missions, 16 representative craft, moving closed orbits, clear Earth separation, smaller Gateway, reachable docking/EVA and versioned save migration.');
