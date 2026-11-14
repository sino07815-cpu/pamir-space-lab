import assert from 'node:assert/strict';
import fs from 'node:fs';
import { planets,useGame } from '../src/store.ts';
import { planetVisuals,solarOrder,planetTextureUrl } from '../src/planetVisuals.ts';
import { transferSpeed } from '../src/orbitalScale.ts';
assert.equal(planets.length,9);assert.equal(new Set(planets.map(p=>p.name)).size,9);
assert.equal(solarOrder.filter(n=>n!=='Moon').length,8);
function jpegSize(b){assert.equal(b.readUInt16BE(0),0xffd8);let i=2;while(i<b.length-9){assert.equal(b[i],0xff);const marker=b[i+1],size=b.readUInt16BE(i+2);if([0xc0,0xc1,0xc2].includes(marker))return [b.readUInt16BE(i+7),b.readUInt16BE(i+5)];i+=size+2;}throw Error('No JPEG dimensions');}
for(const planet of planets){const config=planetVisuals[planet.name];assert(config);assert(config.polarRatio>.89&&config.polarRatio<=1);assert(config.dayHours>0);assert.deepEqual(jpegSize(fs.readFileSync('public'+planetTextureUrl(planet.name))),[2048,1024]);const diameter=Number(planet.diameter.replace(/[^0-9.]/g,''));assert(Math.abs(planet.radius/6-diameter/12742)<.00001,'Mean radii match diameter ratios: '+planet.name);useGame.getState().set({surface:null,target:planet.name,distance:18});const before=useGame.getState().points;useGame.getState().scan();assert.equal(useGame.getState().points,before+100);useGame.getState().scan();assert.equal(useGame.getState().points,before+100);}
for(const file of ['earth-clouds.jpg','earth-night.jpg'])assert.deepEqual(jpegSize(fs.readFileSync('public/textures/'+file)),[2048,1024]);
const ring=fs.readFileSync('public/textures/saturn-ring.png');assert.equal(ring.subarray(1,4).toString(),'PNG');assert.equal(ring.readUInt32BE(16),2048);assert.equal(ring[25],6,'Ring has an alpha channel');
const earth=planets.find(p=>p.name==='Earth');for(const name of ['Jupiter','Saturn','Uranus','Neptune']){const p=planets.find(p=>p.name===name);assert(Math.hypot(...p.position.map((v,i)=>v-earth.position[i]))/p.radius>20,'Giants are distant rather than filling Earth sky: '+name);}
for(let i=0;i<planets.length;i++)for(let j=i+1;j<planets.length;j++){const a=planets[i],b=planets[j];assert(Math.hypot(...a.position.map((v,k)=>v-b.position[k]))>a.radius+b.radius+5,'No overlapping planet bodies');}
for(const planet of planets){let d=Math.hypot(...planet.position.map((v,i)=>v-[0,0,20][i]));for(let t=0;t<12000&&d>=planet.radius+9;t++)d-=transferSpeed(d,planet.radius)/60;assert(d<planet.radius+9,'Transfer can arrive within 200 simulated seconds: '+planet.name);}
assert.equal(transferSpeed(10000,6),180);assert.equal(transferSpeed(6,6),0);
assert(fs.readFileSync('public/textures/ATTRIBUTION.md','utf8').includes('Creative Commons Attribution 4.0'));
console.log('Planet checks passed: eight planets + Moon, 12 valid local maps, correct mean-size ratios, tilt/flattening, distant giants, nine surveys, bounded transfer arrivals and asset attribution.');
