import { heritageCollision } from './heritageData.ts';
import { lunarHeight } from './lunarLandscape.ts';
export type SurfacePlanet='Mars'|'Moon';
export interface SuitVitals {oxygen:number;energy:number;health:number;rescues:number;}
export interface SurfaceMotion {speed:number;heading:number;airborne:boolean;}
export interface RoverState {occupied:boolean;x:number;z:number;yaw:number;speed:number;distance:number;}
export const freshSuit=():SuitVitals=>({oxygen:100,energy:100,health:100,rescues:0});
export const freshMotion=():SurfaceMotion=>({speed:0,heading:0,airborne:false});
export const freshRover=():RoverState=>({occupied:false,x:9,z:4,yaw:0,speed:0,distance:0});
export const moonSamples=[{id:'0',x:5,z:5},{id:'1',x:-7,z:10},{id:'2',x:12,z:-9},{id:'3',x:-13,z:-7},{id:'4',x:2,z:-16}];
export const moonRocks=Array.from({length:75},(_,i)=>({x:Math.sin(i*73.2)*100,z:Math.cos(i*31.7)*100,r:.4+(i%7)*.15})).filter(r=>Math.hypot(r.x,r.z-13)>10&&!moonSamples.some(s=>Math.hypot(r.x-s.x,r.z-s.z)<5)&&Math.hypot(r.x-16,r.z+12)>5).concat([{x:13,z:30,r:1.6},{x:21,z:33,r:1.8},{x:-15,z:38,r:2.1},{x:-48,z:-12,r:2.5},{x:64,z:-42,r:2.8}]);
export function resolveMoonGround(x:number,z:number,oldX=x,oldZ=z,ship:[number,number]=[0,13]):[number,number]{
  x=Math.max(-105,Math.min(105,x));z=Math.max(-105,Math.min(105,z));for(const b of moonRocks){const dx=x-b.x,dz=z-b.z,d=Math.hypot(dx,dz),r=b.r+.4;if(d<r){x=b.x+(d?dx/d:1)*r;z=b.z+(d?dz/d:0)*r;}}
  const dx=x-ship[0],dz=z-ship[1];if(Math.abs(dx)<2.1&&Math.abs(dz)<2.8){if(Math.abs(dx)/2.1>Math.abs(dz)/2.8)x=ship[0]+Math.sign(dx||1)*2.1;else z=ship[1]+Math.sign(dz||1)*2.8;}
  [x,z]=heritageCollision('Moon',x,z);return Number.isFinite(x)&&Number.isFinite(z)?[x,z]:[oldX,oldZ];
}
export const moonHeight=lunarHeight;
export function stepSuit(v:SuitVitals,dt:number,motion:SurfaceMotion,sprinting:boolean,rover=false):SuitVitals {
  dt=Math.max(0,Math.min(dt,1));const moving=motion.speed>.2;const oxygen=Math.max(0,v.oxygen-dt*(rover?.035:sprinting&&moving?.16:.09));
  const energy=Math.max(0,Math.min(100,v.energy+dt*(rover?.08:moving?(sprinting?-.2:-.045):.1)));
  const health=Math.max(0,v.health-(oxygen<=0?dt*2:0));return {...v,oxygen,energy,health};
}
export function stepRover(previous:RoverState,throttle:number,steer:number,brake:boolean,dt:number,resolve:(x:number,z:number,oldX:number,oldZ:number)=>[number,number]):RoverState {
  dt=Math.max(0,Math.min(.04,dt));const s={...previous};s.speed+=throttle*3.8*dt;s.speed*=Math.exp(-dt*(brake?9:throttle===0?1.5:.24));s.speed=Math.max(-3,Math.min(8,s.speed));s.yaw+=steer*Math.min(1,Math.abs(s.speed)/2)*Math.sign(s.speed||1)*dt*.95;
  const x=s.x-Math.sin(s.yaw)*s.speed*dt,z=s.z-Math.cos(s.yaw)*s.speed*dt;const [rx,rz]=resolve(x,z,s.x,s.z);const moved=Math.hypot(rx-s.x,rz-s.z);if(moved<Math.abs(s.speed*dt)*.25)s.speed*=.1;s.x=rx;s.z=rz;s.distance+=moved;return s;
}
