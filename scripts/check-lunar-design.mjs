import assert from 'node:assert/strict';
import {lunarHeight,lunarScenicHeight,lunarCraters,lunarEarth,lunarNoise} from '../src/lunarLandscape.ts';
import {moonHeight,moonSamples,resolveMoonGround} from '../src/surfacePhysics.ts';
import {stepWalker} from '../src/mars.ts';
for(let r=0;r<=6;r+=.5)for(let a=0;a<Math.PI*2;a+=.17)assert(Math.abs(lunarHeight(Math.cos(a)*r,13+Math.sin(a)*r))<1e-12,'The full safe landing zone remains level');
for(let x=-105;x<=105;x+=3)for(let z=-105;z<=105;z+=3){assert(Number.isFinite(moonHeight(x,z)));assert.equal(moonHeight(x,z),lunarHeight(x,z),'Physics uses the same lunar ground height as the rendered mesh');assert(Math.abs(moonHeight(x+.1,z)-moonHeight(x,z))<.15,'Playable crater walls have bounded slopes');}
for(let a=0;a<Math.PI*2;a+=.1){const x=Math.cos(a)*160,z=Math.sin(a)*160;assert(Math.abs(lunarScenicHeight(x,z)-lunarHeight(x,z))<1e-9,'Near ground and distant highlands meet without a step');}
assert(lunarHeight(28,-30)<lunarHeight(41,-30),'Crater bowl lies below the rim');assert(lunarCraters.length>=20);assert.equal(lunarNoise(12.34,-9.3),lunarNoise(12.34,-9.3));
const earthDistance=Math.hypot(...lunarEarth.position);assert(earthDistance>1000);assert(2*lunarEarth.radius/earthDistance<.03,'Earth stays small in the lunar sky');
for(const site of moonSamples){const y=moonHeight(site.x,site.z);const p=stepWalker({x:site.x,y:y+1,z:site.z,vx:0,vz:0,vy:0},{x:0,z:0,jump:false,sprint:false},.04,{gravity:1.62,height:moonHeight,resolve:resolveMoonGround});assert(p.y>=y,'Samples share the walker ground convention');}
console.log('Lunar design passed: level touchdown zone, finite bounded crater slopes, shared visual/physics heights, seamless highlands, small distant Earth and sample ground detection.');
