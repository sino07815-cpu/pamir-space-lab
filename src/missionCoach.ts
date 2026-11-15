import type {GameState,PlanetName} from './store.ts';
import type {useExpedition} from './expeditionStore.ts';
import type {usePlanetMissions} from './planetMissionStore.ts';
import type {usePort} from './earthPortState.ts';
import {planets} from './store.ts';
import {missionDefinitions,isRobotWorld,robotTargets,targetNames} from './planetMissions.ts';
import {sites} from './mars.ts';
import {moonSamples} from './surfacePhysics.ts';
import {PORT,REPAIR} from './expedition.ts';
import {missionTakeaways} from './missionTakeaways.ts';
export type CoachId=PlanetName|'orbital'|'research'|'lunar';
type Expedition=ReturnType<typeof useExpedition.getState>;
type Research=ReturnType<typeof usePlanetMissions.getState>;
type PortState=ReturnType<typeof usePort.getState>;
export interface CoachStep{id:string;title:string;instruction:string;done:boolean;point?:[number,number];space?:'surface'|'interior'|'orbit';}
export interface CoachMission{id:CoachId;title:string;context:string;learning:string;objective:string;takeaway:string;criteria:string;tools:string;source:string;steps:CoachStep[];level:number;}
export const coachOrder:CoachId[]=['Earth','Moon','Mars','orbital','research','lunar','Mercury','Venus','Jupiter','Saturn','Uranus','Neptune'];
export function activeCoach(g:GameState,e:Expedition,r:Research):CoachId{
 if(r.robot&&g.surface===r.robot.planet)return r.robot.planet;
 if(g.surface==='Earth')return 'Earth';
 if(e.missions.orbital.status==='active'&&g.target==='Earth'&&!g.surface)return 'orbital';
 if(e.mode==='station'||e.mode==='eva'||e.navStation||e.dock!=='free')return 'orbital';
 if(g.surface==='Mars')return e.missions.mars.status==='active'&&['A','B','C'].every(id=>g.mars.objectives.includes(id))?'research':'Mars';
 if(g.surface==='Moon')return e.missions.lunar.status==='active'?'lunar':'Moon';
 return g.target;
}
export function coachMission(id:CoachId,g:GameState,e:Expedition,r:Research,port:PortState):CoachMission{
 const step=(id:string,title:string,instruction:string,done:boolean,point?:[number,number],space:CoachStep['space']='surface'):CoachStep=>({id,title,instruction,done,point,space});
 const mars=g.mars,moon=g.moon,lunarCount=g.samples.filter(s=>s.startsWith('Moon-')).length;
 const arrived=(name:PlanetName)=>g.target===name&&!g.surface&&g.distance<=18;
 const returnMars:[number,number]=[mars.landing.x,mars.landing.z+5],returnMoon:[number,number]=[moon.landing.x,moon.landing.z+5];
 const base={id,title:'',context:'',learning:'',objective:'',takeaway:'',criteria:'Complete every task through its actual interaction.',tools:'Spacecraft controls and scientific instruments',source:'https://science.nasa.gov/solar-system/',steps:[] as CoachStep[],level:1};
 if(id==='orbital'){const done=e.missions.orbital.done;return {...base,title:'ORBITAL RESCUE',level:4,context:'Dock with PAMIR Gateway, repair its exterior communications relay, and return through the airlock.',learning:'Practice relative motion, suit safety and equipment maintenance.',objective:'Repair orbital relay',takeaway:'Spacewalks allow astronauts to maintain station equipment. Life support and a safety tether protect the crew.',tools:'Docking controls, airlock, suit and external relay',source:'https://www.nasa.gov/international-space-station/space-station-spacewalks/',steps:[
 step('accept','Accept the operation','Open Missions and accept Orbital Rescue before repairing the relay.',['active','complete'].includes(e.missions.orbital.status)),
 step('dock','Dock with PAMIR Gateway','Use rendezvous guidance. Align within 14°, brake below 0.65 u/s, then select Dock.',done.includes('dock'),[PORT[0],PORT[2]],'orbit'),
 step('eva','Begin the spacewalk','Enter the station. Walk to the airlock marker and press E.',done.includes('eva'),[0,11],'interior'),
 step('repair','Repair orbital relay','Follow the amber relay beacon. Hold E nearby until repair reaches 100%.',done.includes('repair'),[REPAIR[0],REPAIR[2]],'orbit'),
 step('return','Return to the airlock','Follow the airlock beacon and press E nearby. Keep oxygen above zero.',done.includes('return'),[PORT[0],PORT[2]],'orbit') ]};}
 if(id==='research')return {...base,title:'RED PLANET RESEARCH',level:5,context:'Land on Mars, collect samples A/B/C, enter the base laboratory and analyze all three samples.',learning:'Connect field sampling with laboratory analysis and power management.',objective:'Analyze samples inside base lab',takeaway:'Different rocks preserve different parts of a planet’s history. Laboratory analysis compares their minerals and formation environments.',tools:'Sample sites, base doorway, laboratory and solar power',source:missionDefinitions.Mars.source,steps:[
 step('accept','Accept the operation','Open Missions and accept Red Planet Research. Land on Mars to unlock it.',['active','complete'].includes(e.missions.mars.status)),
 step('land','Land safely','Keep lateral speed low and align with the pad. Space controls manual thrust.',mars.objectives.includes('land')),
 ...sites.filter(s=>s.id!=='research').map(s=>step(s.id,s.name,'Approach the marked sample within 3 m and press E. Each sample counts once.',mars.objectives.includes(s.id),[s.x,s.z])),
 step('lab','Analyze samples inside base lab','Enter the laboratory through its south door at (53, 20). Approach the console and press E; start analysis with at least 20 energy.',e.missions.mars.done.includes('analysis'),Math.abs(mars.player[0]-53)<3.7&&Math.abs(mars.player[2]-16)<3.7?[53,14]:[53,20]),
 step('finish','Complete the mission','Keep the laboratory powered for five seconds of active play. Close the terminal to let time advance.',e.missions.mars.status==='complete',[53,14]) ]};
 if(id==='lunar')return {...base,title:'LUNAR DISCOVERY',level:5,context:'Land on the Moon, obtain a regolith sample, deploy a seismometer at the research beacon and return to the lander.',learning:'Use a field instrument to investigate the Moon’s interior.',objective:'Deploy seismometer at lunar beacon',takeaway:'Seismometers detect vibrations. Scientists use moonquakes to investigate the Moon’s interior.',tools:'Regolith sample, seismometer, power supply and lander',source:missionDefinitions.Moon.source,steps:[
 step('accept','Accept the operation','Complete Red Planet Research, then accept Lunar Discovery in Missions.',['active','complete'].includes(e.missions.lunar.status)),
 step('land','Land safely','There is no atmospheric braking. Use guidance or Space thrust to slow down.',moon.objectives.includes('land')),
 step('sample','Collect a lunar regolith sample','Approach a regolith marker within 3 m and press E.',lunarCount>0, [5,5]),
 step('deploy','Deploy seismometer at lunar beacon','Walk to (16, −12) and press E. Deployment needs one sample, 10 materials and 10 energy.',e.missions.lunar.done.includes('deploy'),[16,-12]),
 step('return','Return to the lander','Walk to the lander airlock and press E before the 10-minute operation window ends.',e.missions.lunar.status==='complete',returnMoon)]};
 const m=missionDefinitions[id],p=planets.find(p=>p.name===id)!;
 const common={...base,title:m.title,context:p.description,objective:id==='Mars'?'Complete Red Horizon':m.goals[m.goals.length-1],source:m.source,tools:m.instrument,takeaway:missionTakeaways[id]};
 if(id==='Earth'){const surveyed=g.visited.includes('Earth'),departed=r.records.Earth?.done??[],orbit=departed.includes('launch');return {...common,learning:'Use spacecraft controls and observe Earth from orbit.',steps:[
 step('board','Board your spacecraft',port.range>6?'Follow the access road toward the launch pad. Hold Shift to run.':'Boarding access reached. Press E to begin your ascent.',departed.includes('board'),[4.8,3]),
 step('launch','Depart the launch complex','Board at the amber access beacon. The guided launch carries you to orbit.',orbit),
 step('survey','Survey Earth from orbit','In orbit, select Earth. Travel within 18 units, stop the transfer and press F to survey.',surveyed)]};}
 if(id==='Mars')return {...common,level:3,learning:'Balance landing speed and fuel, then compare geological samples.',steps:[
 step('reach','Reach Mars','Select Mars and Travel. Within 18 units, enter Mars orbit.',mars.objectives.includes('reach')),
 step('land','Land safely','Initiate landing. Keep vertical speed at or below 3 m/s, lateral speed at or below 1.5 m/s and align within 6 m of the pad.',mars.objectives.includes('land')),
 step('exit','Exit the spacecraft','After touchdown, press E to leave the spacecraft.',mars.objectives.includes('exit')),
 step('zone','Explore the research zone','Walk to the amber research-zone beacon at (8, 6). Enter the zone before collecting the samples.',mars.objectives.includes('zone'),[8,6]),
 ...sites.map(s=>step(s.id,s.name,s.id==='research'?'Approach the outcrop within 3 m and press E to scan it.':'Approach the marked sample within 3 m and press E. Each sample counts once.',mars.objectives.includes(s.id),[s.x,s.z])),
 step('return','Return with the samples','Return to the amber airlock marker and press E after collecting A/B/C and scanning the outcrop.',mars.objectives.includes('complete'),returnMars)]};
 if(id==='Moon'){const complete=moon.objectives.includes('complete');const remaining=moonSamples.filter(s=>!g.samples.includes('Moon-'+s.id));return {...common,level:2,learning:'Control a descent without atmospheric braking and collect lunar regolith.',steps:[
 step('reach','Reach the Moon','Select Moon and Travel. Within 18 units, begin lunar descent.',complete||moon.objectives.includes('reach')),
 step('land','Land safely','There is no atmospheric braking. Use guidance or Space thrust to slow down.',complete||moon.objectives.includes('land')),
 step('exit','Exit the lander','After touchdown, press E to leave the spacecraft.',complete||moon.objectives.includes('exit')),
 ...Array.from({length:3},(_,i)=>{const s=remaining[Math.max(0,i-lunarCount)];return step('sample-'+i,'SAMPLE '+(i+1),'Approach a regolith marker within 3 m and press E.',lunarCount>i,s?[s.x,s.z]:undefined);}),
 step('return','Return with the samples','Return to the amber airlock marker and press E after collecting three distinct lunar samples.',complete,returnMoon)]};}
 const done=r.records[id]?.done??[],complete=done.includes('complete'),robot=r.robot?.planet===id?r.robot:null;
 const steps=[step('arrive','Interplanetary transfer','Select this world and Travel. Research begins within 18 navigation units.',complete||done.includes('survey')||arrived(id)),step('survey','Hold a stable orbital survey','Cancel transfer and brake below 0.8 u/s. Hold F for three seconds without moving away.',done.includes('survey'))];
 if(isRobotWorld(id))return {...common,level:6,learning:'Use remote instruments where a spacesuit cannot protect a human explorer.',steps:[...steps,
 step('land','Land the robotic module','Deploy the robotic lander. Use guidance or Space braking thrust; align with the landing zone.',done.includes('land')),
 step('rover','Deploy the science rover','After a safe touchdown, press E to deploy or rejoin the rover.',complete||!!robot&&robot.stage==='driving'||robotTargets.some(t=>done.includes(t.id))),
 ...robotTargets.map((t,i)=>step(t.id,targetNames[id][i],'Drive within 3 m of the amber target and press E to analyze it.',done.includes(t.id),[t.x,t.z])),
 step('return','Return the rover and transmit','Drive to the lander uplink and press E with all three data sets.',complete,robot?[robot.landing.x,robot.landing.z+6]:[0,6])]};
 return {...common,level:7,learning:'Measure a giant planet remotely instead of attempting a surface landing.',steps:[...steps,step('probe','Deploy and receive probe measurements','Deploy the instrument probe. Stay within 18 units and below 0.8 u/s for 10 seconds.',done.includes('probe')),step('transmit','Transmit the research packet','Hold E for three seconds while keeping the link stable.',complete)]};
}
export function coachProgress(m:CoachMission){const count=m.steps.filter(s=>s.done).length;return {count,total:m.steps.length,complete:count===m.steps.length,next:m.steps.find(s=>!s.done)};}
export function coachWaypoint(m:CoachMission,g:GameState,e:Expedition,r:Research){const next=coachProgress(m).next;if(!next?.point)return null;const space=next.space??'surface';if(space==='surface'&&g.surface!==(m.id==='research'?'Mars':m.id==='lunar'?'Moon':m.id))return null;if(space==='interior'&&!['cabin','station'].includes(e.mode))return null;if(space==='orbit'&&g.surface)return null;const player=space==='interior'?[e.interior[0],0,e.interior[1]]:space==='orbit'?e.mode==='eva'?e.suit.position:g.flightPosition:g.surface==='Mars'?g.mars.player:g.surface==='Moon'?g.moon.player:r.robot?.player;
 return {point:next.point,space,title:next.title,distance:player?Math.hypot(player[0]-next.point[0],player[2]-next.point[1]):null,ready:player?Math.hypot(player[0]-next.point[0],player[2]-next.point[1])<3:false};}
export function coachHint(m:CoachMission,g:GameState,e:Expedition,r:Research){
 if(m.id==='orbital'&&e.mode==='eva'&&e.suit.oxygen<25)return 'LOW OXYGEN · return to the airlock, refill, or use emergency tether retrieval.';
 if(m.id==='Earth'&&!g.surface&&!r.records.Earth?.done.includes('board'))return 'Return to the Earth spaceport for departure training, or select Moon to continue exploring. Earlier saves do not contain departure records.';
 if(e.mode==='cabin')return 'Walk to the pilot seat at the front of the cabin and press E before flying.';
 if(r.probe)return 'Instrument carrier deployed. Hold position for 10 seconds to receive measurements.';
 if(m.id==='research'&&e.analyzing)return 'Keep the laboratory powered for five seconds of active play. Close the terminal to let time advance.';
 const stage=g.surface==='Mars'?g.mars.stage:g.surface==='Moon'?g.moon.stage:r.robot?.stage;
 if(stage==='failed')return 'Use Retry Landing or return to orbit. Keep guidance enabled and brake earlier.';
 if(m.id==='orbital'&&e.mode==='flight'&&e.dock==='docked')return 'Select Enter Station, then walk to the airlock marker.';
 if(m.id==='orbital'&&e.dock==='capture')return 'Soft capture in progress…';
 if(g.autopilot)return 'Guidance is flying the course. You can cancel transfer to resume manual flight.';
 if(g.surface==='Mars'&&g.mars.stage==='landed'&&coachProgress(m).next?.id!=='land')return 'After touchdown, press E to leave the spacecraft.';
 if(g.surface==='Moon'&&g.moon.stage==='landed'&&coachProgress(m).next?.id!=='land')return 'After touchdown, press E to leave the spacecraft.';
 if((m.id==='research')&&e.resources.energy<20)return 'Laboratory requires at least 20 energy. Restore solar power first.';
 return coachProgress(m).next?.instruction??m.takeaway;
}
