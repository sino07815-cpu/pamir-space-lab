import { heritageCollision } from './heritageData.ts';
import { baseCollision,presentationBaseRoute } from './expedition.ts';
import { freshSuit,freshMotion,freshRover,type SuitVitals,type SurfaceMotion,type RoverState,type SurfacePlanet } from './surfacePhysics.ts';
export type MarsStage = 'space' | 'orbit' | 'approach' | 'descent' | 'landed' | 'eva' | 'failed' | 'complete';
export interface Landing { altitude:number; velocity:number; fuel:number; throttle:number; elapsed:number; impact:number; assisted:boolean; result:'flying'|'safe'|'crashed'; x:number;z:number;vx:number;vz:number;horizontalSpeed:number;tilt:number;stability:number;padError:number;padX:number;padZ:number;gravity:number; }
export interface MarsMission { stage:MarsStage; objectives:string[]; elapsed:number; earned:number; landing:Landing; player:[number,number,number]; demo:boolean; demoTime:number; interactionUntil:number; suit:SuitVitals;motion:SurfaceMotion;rover:RoverState; }
export const objectives = [
  ['land','Land successfully on Mars'], ['exit','Exit the spacecraft'],
  ['A','Collect geological sample A'], ['B','Collect geological sample B'],
  ['C','Collect geological sample C'], ['research','Scan the sedimentary outcrop'],
  ['return','Return to the spacecraft'], ['complete','Complete Red Horizon'],
] as const;
export const sites = [
  {id:'A', name:'Basalt sample A',value:75, x:12, z:8, fact:'Basalt records volcanic processes. Studying its minerals helps reconstruct the history of the Martian crust.'},
  {id:'B', name:'Sedimentary sample B',value:75, x:-18, z:-8, fact:'Layers of sediment can preserve evidence of ancient environments, including places where water once flowed.'},
  {id:'C', name:'Regolith sample C',value:75, x:22, z:-22, fact:'Regolith is loose surface material. Its grains help scientists investigate weathering and the movement of dust.'},
  {id:'research', name:'Layered research outcrop',value:100, x:-28, z:20, fact:'NASA explores Mars to understand its geology, past climate, and potential ancient habitability. Samples preserve clues for detailed analysis.'},
] as const;
export const initialLanding = (planet:SurfacePlanet='Mars'):Landing => ({altitude:120,velocity:-8,fuel:100,throttle:0,elapsed:0,impact:0,assisted:true,result:'flying',x:8,z:planet==='Moon'?7:-6,vx:0,vz:0,horizontalSpeed:0,tilt:0,stability:100,padError:10,padX:0,padZ:planet==='Moon'?13:0,gravity:planet==='Moon'?1.62:3.71});
export const initialMars = (planet:SurfacePlanet='Mars'):MarsMission => ({stage:'space',objectives:[],elapsed:0,earned:0,landing:initialLanding(planet),player:[0,0,planet==='Moon'?18:5],demo:false,demoTime:0,interactionUntil:0,suit:freshSuit(),motion:freshMotion(),rover:freshRover()});
export const operationObjectives=[['reach','Reach Mars'],['land','Land safely'],['exit','Exit ODYSSEY'],['zone','Explore the research zone'],['samples','Collect three samples'],['research','Scan the scientific outcrop'],['return','Return to ODYSSEY'],['complete','Complete the mission']] as const;
export const objectiveDone=(m:MarsMission,id:string)=>id==='samples'?['A','B','C'].every(k=>m.objectives.includes(k)):m.objectives.includes(id);
export function normalizeMission(saved:Partial<MarsMission>|undefined,planet:SurfacePlanet='Mars'):MarsMission{
  const base=initialMars(planet),m={...base,...saved,landing:{...base.landing,...saved?.landing},suit:{...base.suit,...saved?.suit},motion:{...base.motion,...saved?.motion},rover:{...base.rover,...saved?.rover}};
  const done=new Set(m.objectives);if(done.has('land')||['orbit','approach','descent','landed','eva','complete'].includes(m.stage))done.add('reach');if(done.has('A')||done.has('complete')||(m.stage==='eva'&&Math.hypot(m.player[0]-8,m.player[2]-6)<6))done.add('zone');m.objectives=[...done];
  if(saved?.landing&&saved.landing.result!=='flying'&&saved.landing.x===undefined){m.landing.x=0;m.landing.z=planet==='Moon'?13:0;m.landing.padError=0;m.landing.horizontalSpeed=0;}return m;
}
export function missionReport(m:MarsMission){const samples=['A','B','C'].filter(id=>m.objectives.includes(id)).length;const landingQuality=Math.max(0,Math.round(100-m.landing.impact*12-m.landing.horizontalSpeed*12-m.landing.padError*2));const explorationScore=Math.round(operationObjectives.filter(([id])=>objectiveDone(m,id)).length*100+landingQuality+Math.min(100,m.rover.distance*2));const rating=m.suit.rescues?'C':landingQuality>=75&&samples===3?'S':landingQuality>=55?'A':'B';return {samples,landingQuality,explorationScore,rating};}
export const onMars = (stage:MarsStage) => ['descent','landed','eva','failed','complete'].includes(stage);
export const terrainHeight = (x:number,z:number) => {
  const crater = -3.5*Math.exp(-((x-40)**2+(z+40)**2)/180)+1.2*Math.exp(-(((Math.hypot(x-40,z+40)-16)/3)**2));
  const hills = Math.sin(x*.045)*Math.cos(z*.039)*4+Math.sin(x*.17+z*.12)*.45+crater;
  const flat = Math.min(1,Math.max(0,(Math.hypot(x,z)-7)/12));
  const baseFlatten=1-Math.min(1,Math.max(0,(Math.hypot(x-44,z-21)-28)/7));
  return hills*flat*(1-baseFlatten);
};
const route=[{x:0,z:5},...sites,{x:0,z:5},{x:22,z:-22},...presentationBaseRoute];
const nearRoute=(x:number,z:number)=>route.some((a,i)=>{const b=route[i+1];if(!b)return false;const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)<5.5;});
export const boulders = Array.from({length:85},(_,i)=>({x:Math.sin(i*71.7)*100,z:Math.cos(i*37.1)*100,r:.5+((i*13)%11)/7})).filter(b=>Math.hypot(b.x,b.z)>11&&!sites.some(s=>Math.hypot(s.x-b.x,s.z-b.z)<5)&&!nearRoute(b.x,b.z)&&!(b.x>24&&b.x<99&&b.z>-8&&b.z<49));
export function resolveGround(x:number,z:number,oldX=x,oldZ=z,ship:[number,number]=[0,0]):[number,number] {
  x=Math.max(-105,Math.min(105,x));z=Math.max(-105,Math.min(105,z));
  for(const b of boulders){const dx=x-b.x,dz=z-b.z,d=Math.hypot(dx,dz),limit=b.r+.4;if(d<limit){x=b.x+(d?dx/d:1)*limit;z=b.z+(d?dz/d:0)*limit;}}
  // A solid spacecraft hull; its access ramp remains reachable at z=5.
  const sx=x-ship[0],sz=z-ship[1];if(Math.abs(sx)<2.1&&Math.abs(sz)<2.8){if(Math.abs(sx)/2.1>Math.abs(sz)/2.8)x=ship[0]+Math.sign(sx||1)*2.1;else z=ship[1]+Math.sign(sz||1)*2.8;}
  [x,z]=heritageCollision('Mars',x,z);return baseCollision(x,z,oldX,oldZ);
}
export function stepLanding(previous:Landing,dt:number,manualThrust=false,controls={x:0,z:0}):Landing {
  const s={...initialLanding(),...previous};if(s.result!=='flying')return s;
  let remaining=Math.min(.25,Math.max(0,dt));
  while(remaining>1e-8){const h=Math.min(remaining,1/120);remaining-=h;
    const desired=-Math.min(12,Math.max(1.1,Math.sqrt(Math.max(0,s.altitude)*.7)));
    const ax=s.assisted?Math.max(-2.2,Math.min(2.2,-(s.x-s.padX)*.45-s.vx*1.4)):controls.x*2.2,az=s.assisted?Math.max(-2.2,Math.min(2.2,-(s.z-s.padZ)*.45-s.vz*1.4)):controls.z*2.2;
    s.vx+=((s.fuel>0?ax:0)-s.vx*.12)*h;s.vz+=((s.fuel>0?az:0)-s.vz*.12)*h;s.x+=s.vx*h;s.z+=s.vz*h;s.horizontalSpeed=Math.hypot(s.vx,s.vz);s.padError=Math.hypot(s.x-s.padX,s.z-s.padZ);s.tilt+=(Math.min(30,Math.hypot(ax,az)*6)-s.tilt)*Math.min(1,h*4);s.stability=Math.max(0,100-s.tilt*2);
    const drag=s.gravity>2?-.008*s.velocity*Math.abs(s.velocity):0;const thrust=s.gravity*2.43;const vertical=Math.cos(s.tilt*Math.PI/180);
    const demand=s.assisted?Math.max(0,Math.min(1,(s.gravity-drag+(desired-s.velocity)*1.8)/(thrust*vertical))):(manualThrust?1:0);
    s.throttle=s.fuel>0?demand:0;s.fuel=Math.max(0,s.fuel-(s.throttle*1.8+Math.hypot(ax,az)*.03)*h);
    s.velocity+=(s.throttle*thrust*vertical-s.gravity+drag)*h;s.altitude=Math.max(0,s.altitude+s.velocity*h);s.elapsed+=h;
    if(s.altitude===0){s.impact=Math.abs(s.velocity);s.result=s.impact<=3&&s.horizontalSpeed<=1.5&&s.padError<=6&&s.stability>=65&&s.fuel>0?'safe':'crashed';s.velocity=0;s.throttle=0;break;}
  }return s;
}
export const marsFacts = [
  {title:'LOW GRAVITY',text:'Surface gravity is approximately 3.7 m/s² — about 38% of Earth’s. EVA jumping here uses 3.71 m/s².',url:'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/mars/'},
  {title:'THIN ATMOSPHERE',text:'Mars has a very thin atmosphere, mostly carbon dioxide. An EVA suit supplies the breathable environment.',url:'https://science.nasa.gov/mars/facts/'},
  {title:'EXTREME TEMPERATURES',text:'NASA gives a surface range of about −153°C to 20°C. Conditions vary with location, season, and time of day.',url:'https://science.nasa.gov/mars/facts/'},
  {title:'READING THE ROCKS',text:'Perseverance studies geology and ancient habitability and collects rock and regolith samples for scientific investigation.',url:'https://science.nasa.gov/mission/mars-2020-perseverance/science/'},
];
export interface Walker {x:number;y:number;z:number;vx:number;vz:number;vy:number;}
export function stepWalker(p:Walker,input:{x:number;z:number;jump:boolean;sprint:boolean},dt:number,environment:{gravity?:number;height?:(x:number,z:number)=>number;resolve?:(x:number,z:number,oldX:number,oldZ:number)=>[number,number]}={}):Walker {
  const groundHeight=environment.height??terrainHeight,resolve=environment.resolve??resolveGround;
  const s={...p};dt=Math.min(.04,Math.max(0,dt));const n=Math.max(1,Math.hypot(input.x,input.z));const speed=input.sprint?6.5:3.1;
  const blend=1-Math.exp(-dt*9);s.vx+=(input.x/n*speed-s.vx)*blend;s.vz+=(input.z/n*speed-s.vz)*blend;
  const grounded=s.y<=groundHeight(s.x,s.z)+.03;if(input.jump&&grounded)s.vy=4.1;
  const [x,z]=resolve(s.x+s.vx*dt,s.z+s.vz*dt,s.x,s.z);s.x=x;s.z=z;s.vy-=(environment.gravity??3.71)*dt;s.y+=s.vy*dt;
  const ground=groundHeight(x,z);if(s.y<ground){s.y=ground;s.vy=0;}return s;
}
