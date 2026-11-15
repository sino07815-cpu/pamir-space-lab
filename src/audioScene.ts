import type { GameState } from './store.ts';
import type { RobotSession } from './planetMissionStore.ts';
export type SoundCue='ui'|'enabled'|'engine'|'ignition'|'touchdown'|'failure'|'step'|'jump'|'airlock'|'rover'|'sample'|'science'|'scan'|'probe'|'data'|'dock'|'repair'|'mission'|'alarm';
export interface SoundFrame{active:boolean;menu:boolean;location:string;stage:string;vehicle:'foot'|'ship'|'rover'|'robot'|'eva'|'interior';speed:number;airborne:boolean;thrust:number;wind:number;points:number;samples:string[];completed:string[];packets:string[];probe:string;dock:string;analyzing:boolean;repaired:boolean;scanning:boolean;warning:boolean;stepKind:'earth'|'suit'|'metal';interiorPosition:[number,number]|null;}
interface ExpeditionAudio{mode:string;dock:string;navStation:boolean;analyzing:boolean;repaired:boolean;events:Record<string,boolean>;suit:{oxygen:number};missions:Record<string,{status:string}>;interior:[number,number];}
interface ResearchAudio{robot:RobotSession|null;probe:{planet:string}|null;records:Partial<Record<string,{done:string[]}>>;hold:number;}
export function soundFrame(g:GameState,e:ExpeditionAudio,port:{phase:string;time:number;speed:number},research:ResearchAudio,input:ReadonlySet<string>):SoundFrame{
 const r=research.robot&&g.surface===research.robot.planet?research.robot:null,m=g.surface==='Moon'?g.moon:g.surface==='Mars'?g.mars:null,active=g.started&&!g.paused&&!g.uiBlocked,crew=m?.stage==='eva';
 const vehicle:SoundFrame['vehicle']=r?.stage==='driving'?'robot':g.surface==='Earth'&&port.phase==='walk'?'foot':crew&&m.rover.occupied?'rover':crew?'foot':e.mode==='eva'?'eva':e.mode==='station'||e.mode==='cabin'?'interior':'ship';
 const readyUplink=research.records[g.target]?.done.includes('probe')&&!research.records[g.target]?.done.includes('complete');
 const accelerating=['KeyW','KeyS','KeyQ',...(readyUplink?[]:['KeyE'])].some(k=>input.has(k));
 const thrust=r?.stage==='descent'?r.landing.throttle:g.surface==='Earth'&&port.phase!=='walk'?Math.min(1,port.time/1.3):m?.stage==='descent'?m.landing.throttle:!g.surface&&e.mode==='flight'&&e.dock==='free'?(g.autopilot||e.navStation?.5:accelerating?(input.has('ShiftLeft')||input.has('ShiftRight')?1:.6):0):vehicle==='eva'&&['KeyW','KeyS','KeyA','KeyD','Space','ControlLeft'].some(k=>input.has(k))?.18:0;
 const samples=[...g.samples,...g.mars.objectives.filter(id=>['A','B','C'].includes(id)).map(id=>'Mars-'+id)];
 const completed=[...(g.mars.objectives.includes('complete')?['Red Horizon']:[]),...(g.moon.stage==='complete'||g.moon.objectives.includes('complete')?['Lunar Survey']:[]),...Object.entries(e.missions).filter(([,v])=>v.status==='complete').map(([id])=>'expedition-'+id)];
 const packets:string[]=[];for(const [world,record] of Object.entries(research.records)){if(!record)continue;record.done.filter(id=>['A','B','C'].includes(id)).forEach(id=>samples.push(world+'-'+id));if(record.done.includes('complete'))completed.push('research-'+world);if(record.done.includes('probe'))packets.push(world);}
 const warning=!!(r?r.energy<20:m&&crew?m.suit.oxygen<25||m.suit.health<30:e.mode==='eva'?e.suit.oxygen<25:false)||(r?.stage==='descent'?r.landing.fuel<15:m?.stage==='descent'?m.landing.fuel<15:false)||Object.values(e.events).some(Boolean);
 return{interiorPosition:vehicle==='interior'?[...e.interior]:null,active,menu:!g.started&&!g.paused&&!g.uiBlocked,location:g.surface??e.mode,stage:r?.stage??(g.surface==='Earth'?port.phase:m?.stage??'space'),vehicle,speed:r?.stage==='driving'?r.speed:g.surface==='Earth'?port.speed:m?.rover.occupied?Math.abs(m.rover.speed):m?.motion.speed??0,airborne:!!(crew&&m.motion.airborne),thrust:active?thrust:0,wind:active?(g.surface==='Earth'?.12:g.surface==='Mars'?(e.events.storm?.5:.08):g.surface==='Venus'?.09:e.mode==='cabin'||e.mode==='station'?.025:0):0,points:g.points,samples:[...new Set(samples)],completed,packets,probe:research.probe?.planet??'',dock:e.dock,analyzing:e.analyzing,repaired:e.repaired,scanning:research.hold>0,warning,stepKind:g.surface==='Earth'?'earth':vehicle==='interior'?'metal':'suit'};
}
const additions=(next:string[],previous:string[])=>next.some(id=>!previous.includes(id));
export class SoundEvents{
 previous:SoundFrame|null=null;lastStep=-10;lastAlarm=-10;lastAnalysis=-10;lastTime=0;
 reset(frame:SoundFrame){this.previous=frame;}
 update(frame:SoundFrame,time:number):SoundCue[]{
  const p=this.previous,dt=Math.max(.02,time-this.lastTime);this.lastTime=time;this.previous=frame;if(!p||!frame.active)return[];const cues:SoundCue[]=[];const speed=frame.vehicle==='interior'&&p.interiorPosition&&frame.interiorPosition?Math.hypot(frame.interiorPosition[0]-p.interiorPosition[0],frame.interiorPosition[1]-p.interiorPosition[1])/dt:frame.speed;
  if(p.active){
   if(frame.stage==='failed'&&p.stage!=='failed')cues.push('failure');
   if(p.stage==='descent'&&frame.stage==='landed')cues.push('touchdown');
   if(frame.location==='Earth'&&frame.stage==='launch'&&p.stage!=='launch')cues.push('ignition');
   if(frame.vehicle==='robot'&&p.vehicle!=='robot'||frame.vehicle==='rover'&&p.vehicle!=='rover'||p.vehicle==='rover'&&frame.vehicle!=='rover')cues.push('rover');
   if(frame.vehicle==='foot'&&p.vehicle==='ship'||frame.vehicle==='ship'&&p.vehicle==='foot'||p.dock==='docked'&&frame.dock==='free'||frame.location!==p.location&&['eva','cabin','station'].some(x=>x===frame.location||x===p.location))cues.push('airlock');
   if(frame.vehicle==='foot'&&frame.airborne&&!p.airborne)cues.push('jump');
   if(frame.vehicle==='foot'&&!frame.airborne&&p.airborne){cues.push('step');this.lastStep=time;}
   if(frame.dock!==p.dock&&frame.dock!=='free')cues.push('dock');
   if(frame.probe&&!p.probe)cues.push('probe');
   if(additions(frame.packets,p.packets))cues.push('data');else if(p.probe&&!frame.probe&&!additions(frame.completed,p.completed))cues.push('failure');
   if(frame.repaired&&!p.repaired)cues.push('repair');
   if(additions(frame.completed,p.completed))cues.push('mission');else if(additions(frame.samples,p.samples))cues.push('sample');else if(frame.points>p.points)cues.push('science');
   if(frame.scanning&&!p.scanning&&!cues.includes('science'))cues.push('scan');
  }
  if((frame.vehicle==='foot'||frame.vehicle==='interior')&&speed>.3&&!frame.airborne&&time-this.lastStep>(speed>4?.26:.44)){this.lastStep=time;cues.push('step');}
  if(frame.analyzing&&time-this.lastAnalysis>1.3){this.lastAnalysis=time;cues.push('data');}
  if(frame.warning&&time-this.lastAlarm>8){this.lastAlarm=time;cues.push('alarm');}
  return [...new Set(cues)];
 }
}
