import * as THREE from 'three';
export type Vec3=[number,number,number];
export type Mode='flight'|'station'|'eva'|'cabin';
export type MissionId='orbital'|'mars'|'lunar';
export type BuildKind='solar'|'oxygen'|'research'|'comms';
export type EventId='lowOxygen'|'solar'|'comms'|'damage'|'storm'|'navigation';
export const PORT:Vec3=[22,5,16];
export const STATION_FLIGHT_SCALE=.09;
export const STATION_APPROACH:Vec3=[PORT[0],PORT[1],PORT[2]+2];
export const REPAIR:Vec3=[PORT[0]+6,PORT[1]+2,PORT[2]-3];
export const distance=(a:Vec3,b:Vec3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function docking(position:Vec3,rotation:[number,number,number,number],speed:number){
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion(...rotation));
  const alignment=THREE.MathUtils.clamp(forward.dot(new THREE.Vector3(0,0,-1)),-1,1);
  const range=distance(position,PORT);return {range,angle:Math.acos(alignment)*180/Math.PI,speed,ready:range<=2.5&&alignment>=.97&&speed<=.65};
}
export interface Suit {position:Vec3;velocity:Vec3;oxygen:number;repair:number;}
export function stepEva(s:Suit,input:Vec3,boost:boolean,anchor:Vec3,dt:number,oxygenRate=1):Suit{
  dt=Math.max(0,Math.min(.05,dt));const p=new THREE.Vector3(...s.position),v=new THREE.Vector3(...s.velocity),a=new THREE.Vector3(...anchor);
  const demand=new THREE.Vector3(...input);if(demand.length()>1)demand.normalize();v.lerp(demand.multiplyScalar(boost?4:1.8),1-Math.exp(-dt*2));p.addScaledVector(v,dt);
  const offset=p.clone().sub(a);if(offset.length()>12){const normal=offset.normalize();p.copy(a).addScaledVector(normal,12);const radial=v.dot(normal);if(radial>0)v.addScaledVector(normal,-radial);}
  return {...s,position:p.toArray(),velocity:v.toArray(),oxygen:Math.max(0,s.oxygen-dt*(boost?.55:.28)*oxygenRate)};
}
export function guideRendezvous(position:THREE.Vector3,rotation:THREE.Quaternion,velocity:THREE.Vector3,dt:number){
  const offset=new THREE.Vector3(...STATION_APPROACH).sub(position);velocity.copy(offset.clone().normalize().multiplyScalar(Math.min(6,offset.length()*.8)));
  const desired=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(position,new THREE.Vector3(...PORT),new THREE.Vector3(0,1,0)));
  rotation.slerp(desired,1-Math.exp(-dt*4));
}
export const presentationBaseRoute=[{x:62,z:-2},{x:62,z:24},{x:53,z:24},{x:53,z:14}];
export const stationTerminals=[
  {id:'command',name:'COMMAND · MISSION UPLINK',x:7,z:7,room:'Command center'},
  {id:'science',name:'SCIENCE · NASA ARCHIVE',x:-7,z:-3,room:'Science laboratory'},
  {id:'engineering',name:'ENGINEERING · REPAIR SYSTEMS',x:7,z:-14,room:'Engineering'},
  {id:'crew',name:'CREW · SUIT REFILL',x:-7,z:8,room:'Crew quarters'},
  {id:'window',name:'OBSERVATION · PLANET DATA',x:-7,z:-14,room:'Observation deck'},
  {id:'airlock',name:'AIRLOCK · BEGIN SPACEWALK',x:0,z:11,room:'Airlock'},
  {id:'ship',name:'DOCKING HATCH · RETURN TO SHIP',x:0,z:-18,room:'Docking hatch'},
] as const;
export const cabinTerminals=[{id:'pilot',name:'PILOT SEAT · ACTIVATE CONTROLS',x:0,z:-5},{id:'navigation',name:'NAVIGATION · COURSE COMPUTER',x:-2,z:-2},{id:'mission',name:'MISSION DISPLAY',x:2,z:1},{id:'service',name:'ENGINEERING LOCKER',x:-2,z:3},{id:'exit',name:'AIRLOCK · EXIT SHIP',x:0,z:6}] as const;
export const baseTerminals=[{id:'habitat',name:'HABITAT / STORM SHELTER',x:38,z:14},{id:'lab',name:'RESEARCH LAB / SAMPLE ANALYSIS',x:53,z:14},{id:'construction',name:'ROVER GARAGE / CONSTRUCTION',x:38,z:30},{id:'oxygen',name:'OXYGEN PRODUCTION',x:53,z:30},{id:'storage',name:'STORAGE / MATERIALS CACHE',x:30,z:23},{id:'antenna',name:'COMMUNICATIONS ARRAY',x:65,z:26}] as const;
export const baseRooms=[{x:38,z:16,name:'HABITAT'},{x:53,z:16,name:'RESEARCH'},{x:38,z:32,name:'GARAGE'},{x:53,z:32,name:'OXYGEN'}];
export function safeBaseSpawn(x:number,z:number):[number,number]{
  for(const r of baseRooms){const dx=Math.abs(x-r.x),dz=z-r.z;const wall=(Math.abs(dx-4)<.5&&Math.abs(dz)<4.5)||(Math.abs(dz+4)<.5&&dx<4.5)||(Math.abs(dz-4)<.5&&dx>1.1&&dx<4.5);if(wall)return [r.x,r.z+5];}return [x,z];
}
export function interiorAllowed(x:number,z:number,cabin=false){if(cabin)return Math.abs(x)<3.6&&z>-6.7&&z<7;return (Math.abs(x)<2.7&&z>-19&&z<13)||([-14,-3,8].some(c=>Math.abs(z-c)<4.3)&&Math.abs(x)<10.7);}
export function insideBase(x:number,z:number){return baseRooms.find(r=>Math.abs(x-r.x)<3.7&&Math.abs(z-r.z)<3.7);}
export function baseCollision(x:number,z:number,oldX:number,oldZ:number):[number,number]{
  for(const r of baseRooms){const wall=(px:number,pz:number)=>{const dx=Math.abs(px-r.x),dz=pz-r.z;return (Math.abs(dx-4)<.48&&Math.abs(dz)<4.5)||(Math.abs(dz+4)<.48&&dx<4.5)||(Math.abs(dz-4)<.48&&dx>1.1&&dx<4.5);};if(wall(x,z)){if(!wall(oldX,z))x=oldX;else if(!wall(x,oldZ))z=oldZ;else{x=oldX;z=oldZ;}}}return [x,z];
}
export interface Resources{energy:number;oxygen:number;materials:number;research:number;}
export const costs:Record<BuildKind,Resources>={solar:{energy:10,oxygen:0,materials:20,research:0},oxygen:{energy:15,oxygen:0,materials:25,research:10},research:{energy:20,oxygen:0,materials:35,research:20},comms:{energy:10,oxygen:0,materials:20,research:10}};
export const affordable=(r:Resources,c:Resources)=>Object.keys(c).every(k=>r[k as keyof Resources]>=c[k as keyof Resources]);
export const missionDefinitions={
  orbital:{title:'ORBITAL RESCUE',brief:'Dock with PAMIR Gateway, repair its exterior communications relay, and return through the airlock.',objectives:['dock','eva','repair','return'],reward:250,failure:'Suit oxygen exhausted. Emergency tether retrieval returns the crew safely.'},
  mars:{title:'RED PLANET RESEARCH',brief:'Land on Mars, collect samples A/B/C, enter the base laboratory and analyze all three samples.',objectives:['land','samples','analysis'],reward:300,failure:'Electrical power lost during analysis. Samples remain available for retry.'},
  lunar:{title:'LUNAR DISCOVERY',brief:'Land on the Moon, obtain a regolith sample, deploy a seismometer at the research beacon and return to the lander.',objectives:['land','sample','deploy','return'],reward:250,failure:'The 10-minute instrument transmission window expires. Retry after resupply.'},
} as const;
export interface Mission{status:'available'|'active'|'complete'|'failed';done:string[];elapsed:number;reason:string;}
export const freshMissions=():Record<MissionId,Mission>=>({orbital:{status:'available',done:[],elapsed:0,reason:''},mars:{status:'available',done:[],elapsed:0,reason:''},lunar:{status:'available',done:[],elapsed:0,reason:''}});
