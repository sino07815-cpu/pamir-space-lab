import type { PlanetName } from './store.ts';
export type RobotPlanet='Mercury'|'Venus';
export const giantWorlds=['Jupiter','Saturn','Uranus','Neptune'] as const;
export const isGiant=(p:string)=>giantWorlds.some(n=>n===p);
export const isRobotWorld=(p:string):p is RobotPlanet=>p==='Mercury'||p==='Venus';
export const missionDefinitions:Record<PlanetName,{title:string;method:string;brief:string;source:string;instrument:string;goals:string[]}>={
 Earth:{title:'BLUE MARBLE',method:'Crewed departure & Earth survey',brief:'Launch from the PAMIR campus and survey our home from orbit.',source:'https://science.nasa.gov/earth/',instrument:'Earth observation',goals:['Depart the launch complex','Survey Earth from orbit']},
 Moon:{title:'SILENT ARCHIVE',method:'Crewed landing & surface geology',brief:'Land in low gravity, collect lunar rocks and return safely.',source:'https://science.nasa.gov/moon/facts/',instrument:'Seismometer',goals:['Land safely','Exit the lander','Collect three rocks','Return with the samples']},
 Mars:{title:'OPERATION RED HORIZON',method:'Crewed landing & geological research',brief:'Manage descent, explore the research zone, collect three samples and investigate the outcrop.',source:'https://science.nasa.gov/mission/mars-2020-perseverance/science/',instrument:'Geological sampling',goals:['Land safely','Exit ODYSSEY','Collect A / B / C','Scan the outcrop','Return to the spacecraft']},
 Mercury:{title:'TERMINATOR FRONTIER',method:'Remote robotic landing',brief:'Survey the cratered world, land a fictional robotic explorer and study regolith, impact rock and a shadowed depression.',source:'https://science.nasa.gov/mercury/facts/',instrument:'MESSENGER-inspired spectrometer',goals:['Hold a stable orbital survey','Land the robotic module','Analyze three surface targets','Return the rover and transmit']},
 Venus:{title:'BENEATH THE VEIL',method:'Remote robotic landing',brief:'Operate a fictional heat-shielded rover beneath the clouds. Investigate volcanic rocks and pressure instruments; no astronaut EVA.',source:'https://science.nasa.gov/venus/venus-facts/',instrument:'Venera-inspired pressure capsule',goals:['Hold a stable orbital survey','Land the robotic module','Analyze three surface targets','Return the rover and transmit']},
 Jupiter:{title:'STORM ATLAS',method:'Orbital instruments & atmospheric probe',brief:'Stabilize near Jupiter, observe its cloud bands and deploy a fictional instrument probe. There is no solid ground to land on.',source:'https://science.nasa.gov/mission/juno/',instrument:'Juno-inspired radiometer',goals:['Hold a stable orbital survey','Deploy and receive probe measurements','Transmit the research packet']},
 Saturn:{title:'RINGS OF DISCOVERY',method:'Orbital instruments & remote probe',brief:'Observe the rings remotely, deploy a fictional instrument carrier and transmit its measurements. The carrier does not land on the rings.',source:'https://science.nasa.gov/mission/cassini/',instrument:'Cassini-inspired imaging package',goals:['Hold a stable orbital survey','Deploy and receive probe measurements','Transmit the research packet']},
 Uranus:{title:'TILTED HORIZONS',method:'Orbital instruments & remote probe',brief:'Investigate the sideways ice giant using a fictional magnetometer carrier inspired by planetary exploration.',source:'https://science.nasa.gov/uranus/facts/',instrument:'Voyager-inspired magnetometer',goals:['Hold a stable orbital survey','Deploy and receive probe measurements','Transmit the research packet']},
 Neptune:{title:'DEEP BLUE SIGNAL',method:'Orbital instruments & remote probe',brief:'Measure a distant ice giant remotely and return a complete science packet. The blue cloud map is illustrative, not live weather.',source:'https://science.nasa.gov/neptune/facts/',instrument:'Voyager-inspired imaging system',goals:['Hold a stable orbital survey','Deploy and receive probe measurements','Transmit the research packet']},
};
export const robotTargets=[{id:'A',x:12,z:8},{id:'B',x:-16,z:13},{id:'C',x:18,z:-18}] as const;
export const targetNames={Mercury:['Regolith spectrometry','Impact-basin rock','Shadowed depression'],Venus:['Volcanic basalt','Fractured terrain','Pressure instrument replica']};
export function robotHeight(planet:RobotPlanet,x:number,z:number){
 const flat=Math.min(1,Math.max(0,(Math.hypot(x,z)-9)/9));
 let h=Math.sin(x*.045)*Math.cos(z*.038)*2+Math.sin(x*.19+z*.13)*.16;
 if(planet==='Mercury')for(const [cx,cz,r] of [[32,-22,12],[-32,24,16],[50,45,20],[-58,-38,23],[12,65,18]]){const d=Math.hypot(x-cx,z-cz);h+=1.8*Math.exp(-(((d-r)/2.4)**2))-3*Math.exp(-((d/r)**4));}
 else h+=Math.abs(Math.sin(x*.065+z*.025))*2.2+Math.sin(z*.1)*.4;
 return h*flat;
}
export const robotRocks=Array.from({length:95},(_,i)=>({x:Math.sin(i*31.31)*92,z:Math.cos(i*17.19)*92,r:.35+i%5*.23})).filter(r=>Math.hypot(r.x,r.z)>10&&!robotTargets.some(t=>Math.hypot(r.x-t.x,r.z-t.z)<4));
export function resolveRobot(x:number,z:number,oldX=x,oldZ=z):[number,number]{
 x=Math.max(-98,Math.min(98,x));z=Math.max(-98,Math.min(98,z));
 for(const rock of [...robotRocks,{x:0,z:0,r:3}]){const dx=x-rock.x,dz=z-rock.z,d=Math.hypot(dx,dz),radius=rock.r+.65;if(d<radius){x=rock.x+(d?dx/d:1)*radius;z=rock.z+(d?dz/d:0)*radius;}}
 return Number.isFinite(x)&&Number.isFinite(z)?[x,z]:[oldX,oldZ];
}
export function stableOrbit(g:{surface:string|null;distance:number;speed:number;autopilot:boolean;paused:boolean;uiBlocked:boolean},mode='flight',dock='free'){
 return !g.surface&&!g.paused&&!g.uiBlocked&&!g.autopilot&&g.distance<=18&&g.speed<=.8&&mode==='flight'&&dock==='free';
}
