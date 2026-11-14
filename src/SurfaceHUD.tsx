import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { keys } from './input';
import { sites,operationObjectives,objectiveDone } from './mars';
import { moonSamples,type SurfacePlanet } from './surfacePhysics';
export function LandingPanel({planet}:{planet:SurfacePlanet}){
  const g=useGame(),key=planet==='Mars'?'mars':'moon',m=g[key],l=m.landing;
  return <section className="landing-instruments upgraded-instruments"><div className="instrument-phase">{planet.toUpperCase()} · {l.altitude>60?'POWERED DESCENT':l.altitude>12?'BRAKING / ALIGNMENT':'FINAL APPROACH'}</div><div className="landing-readouts">
    {[['ALTITUDE',l.altitude.toFixed(1),'m'],['VERTICAL SPEED',l.velocity.toFixed(1),'m/s'],['HORIZONTAL SPEED',l.horizontalSpeed.toFixed(1),'m/s'],['FUEL',l.fuel.toFixed(0),'%'],['STABILITY',l.stability.toFixed(0),'%'],['LANDING ZONE',l.padError.toFixed(1),'m']].map(([label,value,unit])=><div key={label}><small>{label}</small><strong>{value}<span> {unit}</span></strong></div>)}
    </div><div className="fuel-track"><span style={{width:`${l.fuel}%`}}/></div><div className="landing-buttons"><button onClick={()=>g.set({[key]:{...m,landing:{...l,assisted:!l.assisted}}})}>{l.assisted?'GUIDANCE ON':'MANUAL CONTROL'} · TOGGLE</button><button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.add('Space');}} onPointerUp={()=>keys.delete('Space')} onPointerCancel={()=>keys.delete('Space')}>HOLD THRUST · SPACE</button></div><small className="physics-note">WASD LATERAL · SPACE THRUST · SAFE: VERTICAL ≤3 / HORIZONTAL ≤1.5 m/s · ZONE ≤6 m · STABILITY ≥65%</small><small className="physics-note">EDUCATIONAL SIMULATION · g {l.gravity.toFixed(2)} m/s² · EST. TOUCHDOWN T−{Math.ceil(l.altitude/Math.max(1,-l.velocity))}s</small></section>;
}
export function MoonMissionPanel(){const g=useGame(),m=g.moon;const samples=g.samples.filter(id=>id.startsWith('Moon-')).length;const goals=[['reach','Reach the Moon'],['land','Touch down safely'],['exit','Exit the lander'],['samples','Collect three lunar rocks'],['return','Return to the lander'],['complete','Complete the survey']];return <section className="red-dashboard"><div className="eyebrow">LUNAR SURVEY / REUSABLE SURFACE SYSTEM</div><div className="objective-grid">{goals.map(([id,label])=><div className={(id==='samples'?samples>=3:m.objectives.includes(id))?'done':''} key={id}><span>{(id==='samples'?samples>=3:m.objectives.includes(id))?'✓':'○'}</span>{label}</div>)}</div><div className="red-stats"><span>SCIENCE<b>{m.earned} PTS</b></span><span>SAMPLES<b>{samples} / 3 REQUIRED</b></span><span>GRAVITY<b>1.62 m/s²</b></span><span>SUIT<b>{m.suit.oxygen.toFixed(0)}% O₂ · {m.suit.energy.toFixed(0)}% ENERGY</b></span></div></section>;}
export default function SurfaceHUD(){
  const g=useGame(),mode=useExpedition(s=>s.mode);if(!g.started||g.uiBlocked||g.paused||mode!=='flight'||(g.surface!=='Mars'&&g.surface!=='Moon'))return null;
  const planet=g.surface,m=planet==='Mars'?g.mars:g.moon;if(m.stage!=='eva')return null;
  const nextSite=sites.find(site=>site.id!=='research'&&!m.objectives.includes(site.id));const samples=planet==='Mars'?['A','B','C'].filter(id=>m.objectives.includes(id)).length:g.samples.filter(id=>id.startsWith('Moon-')).length;
  let target={x:m.landing.x,z:m.landing.z+5,name:'ODYSSEY AIRLOCK'};
  if(planet==='Mars'){
    if(!m.objectives.includes('zone'))target={x:8,z:6,name:'RESEARCH ZONE'};
    else if(nextSite)target={...nextSite,name:nextSite.name};else if(!m.objectives.includes('research'))target={x:-28,z:20,name:'SCIENTIFIC OUTCROP'};
  }else if(samples<3){const p=moonSamples.find(p=>!g.samples.includes('Moon-'+p.id));if(p)target={...p,name:'LUNAR SAMPLE '+p.id};}
  const heading=(360-m.motion.heading*180/Math.PI)%360,cardinal=['N','NE','E','SE','S','SW','W','NW'][Math.round(heading/45)%8],bearing=(Math.atan2(target.x-m.player[0],-(target.z-m.player[2]))*180/Math.PI+360)%360;
  const turn=((bearing-heading+540)%360)-180,range=Math.hypot(m.player[0]-target.x,m.player[2]-target.z);
  return <><div className="surface-compass"><span>{cardinal} {heading.toFixed(0)}°</span><b>{Math.abs(turn)<12?'▲':turn>0?'↗':'↖'}</b><span>{target.name} · {range.toFixed(0)} m</span></div><div className="suit-hud"><div className="suit-values">{([['OXYGEN',m.suit.oxygen],['SUIT ENERGY',m.suit.energy],['HEALTH',m.suit.health]] as const).map(([label,value])=><div key={label} className={value<25?'critical':''}><small>{label}</small><b>{value.toFixed(0)}%</b><span><i style={{width:`${value}%`}}/></span></div>)}</div><div className="surface-objective-line"><span>{planet==='Mars'?'OPERATION RED HORIZON':'LUNAR SURVEY'}</span><b>{planet==='Mars'?operationObjectives.filter(([id])=>objectiveDone(m,id)).length+'/8':samples+'/3 SAMPLES'}</b></div><small>{m.rover.occupied?`ROVER · ${Math.abs(m.rover.speed).toFixed(1)} m/s · E EXIT · C CAMERA`:`${samples} SAMPLES · ${m.motion.speed.toFixed(1)} m/s · E INTERACT`}</small></div></>;
}
