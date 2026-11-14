import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { consume } from './input';
import { terrainHeight } from './mars';
import { moonHeight } from './surfacePhysics';
import { heritageSites,HERITAGE_REWARD } from './heritageData';

function HistoricModel({kind}:{kind:string}){
  const gold='#bc9447',silver='#b9b9ad',dark='#32393d';
  if(kind==='lander')return <group>
    <mesh position={[0,1.2,0]}><cylinderGeometry args={[1.5,1.5,1.65,8]}/><meshStandardMaterial color={gold} metalness={.7} roughness={.5}/></mesh>
    <mesh position={[0,2.05,0]}><cylinderGeometry args={[1.2,1.2,.08,8]}/><meshStandardMaterial color={dark}/></mesh>
    {[0,1,2,3].map(i=><group key={i} rotation={[0,i*Math.PI/2,0]}><mesh position={[1.8,.9,0]} rotation={[0,0,.75]}><cylinderGeometry args={[.055,.07,2.25,8]}/><meshStandardMaterial color={silver}/></mesh><mesh position={[2.55,.12,0]}><cylinderGeometry args={[.42,.42,.12,12]}/><meshStandardMaterial color={gold}/></mesh></group>)}
    <mesh position={[0,.38,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[.5,.65,12,1,true]}/><meshStandardMaterial color={dark} side={2}/></mesh>
    <mesh position={[0,1.15,1.52]}><boxGeometry args={[.48,.3,.02]}/><meshStandardMaterial color="#d5d2bb"/></mesh>
  </group>;
  if(kind==='helicopter')return <group>
    <mesh position={[0,.65,0]}><boxGeometry args={[.45,.45,.45]}/><meshStandardMaterial color={gold} metalness={.5}/></mesh>
    <mesh position={[0,1.1,0]}><cylinderGeometry args={[.025,.025,.65,8]}/><meshStandardMaterial color={silver}/></mesh>
    {[0,1].map(i=><mesh key={i} position={[0,1.23+i*.15,0]} rotation={[0,i*1.1,0]}><boxGeometry args={[1.8,.025,.12]}/><meshStandardMaterial color={dark}/></mesh>)}
    <mesh position={[0,1.6,0]}><boxGeometry args={[.6,.035,.45]}/><meshStandardMaterial color="#283e58" metalness={.5}/></mesh>
    {[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}${z}`} position={[x*.35,.26,z*.35]} rotation={[z*.5,0,-x*.5]}><cylinderGeometry args={[.018,.018,.65,6]}/><meshStandardMaterial color={silver}/></mesh>))}
  </group>;
  const buggy=kind==='buggy';return <group>
    <mesh position={[0,.65,0]}><boxGeometry args={[1.5,.3,2]}/><meshStandardMaterial color={gold} metalness={.4}/></mesh>
    {[-1,1].flatMap(x=>(buggy?[-.7,.7]:[-.8,0,.8]).map(z=><mesh key={`${x}${z}`} position={[x*.95,.35,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.35,.35,.22,12]}/><meshStandardMaterial color={dark} wireframe={buggy}/></mesh>))}
    {buggy?<>{[-.4,.4].map(x=><group key={x}><mesh position={[x,1.05,.3]}><boxGeometry args={[.5,.1,.6]}/><meshStandardMaterial color="#d6c9ac"/></mesh><mesh position={[x,1.3,.6]} rotation={[-.15,0,0]}><boxGeometry args={[.5,.55,.08]}/><meshStandardMaterial color="#d6c9ac"/></mesh></group>)}<mesh position={[.7,1.2,-.5]} rotation={[.3,0,0]}><cylinderGeometry args={[.45,.12,.14,20]}/><meshStandardMaterial color={silver} wireframe/></mesh></>:<><mesh position={[0,.9,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.45,6]}/><meshStandardMaterial color="#34465c" metalness={.5} side={2}/></mesh><mesh position={[0,1.5,-.65]}><cylinderGeometry args={[.04,.04,1.35,8]}/><meshStandardMaterial color={silver}/></mesh><mesh position={[0,2.2,-.65]}><boxGeometry args={[.45,.16,.2]}/><meshStandardMaterial color={silver}/></mesh></>}
  </group>;
}
export default function HeritageWorld({planet}:{planet:'Mars'|'Moon'}){
  const g=useGame(),m=planet==='Mars'?g.mars:g.moon;
  useFrame(()=>{const s=useGame.getState(),e=useExpedition.getState(),mission=planet==='Mars'?s.mars:s.moon;if(s.surface!==planet||mission.stage!=='eva'||s.paused||s.uiBlocked||e.mode!=='flight'||e.presentation||mission.demo||mission.rover.occupied)return;if(consume('KeyF')){const nearby=heritageSites.find(site=>site.planet===planet&&Math.hypot(mission.player[0]-site.x,mission.player[2]-site.z)<=6);if(nearby)s.inspectHeritage(nearby.id);}});
  return <>{heritageSites.filter(site=>site.planet===planet).map(site=>{const distance=Math.hypot(m.player[0]-site.x,m.player[2]-site.z),done=g.heritage.includes(site.id);return <group key={site.id} position={[site.x,(planet==='Mars'?terrainHeight:moonHeight)(site.x,site.z),site.z]}><HistoricModel kind={site.kind}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,0]}><ringGeometry args={[site.radius+.5,site.radius+.58,48]}/><meshBasicMaterial color={done?'#79beac':'#e7aa61'} transparent opacity={.6}/></mesh>{m.stage==='eva'&&<Html position={[0,3.3,0]} center distanceFactor={22} zIndexRange={[2,0]} style={{pointerEvents:'none'}}><div className="world-marker"><strong>{site.name}</strong><span>{Math.round(distance)} m · {done?'DOCUMENTED':distance<=6?'F TO DOCUMENT':'HISTORIC SITE'}</span></div></Html>}</group>;})}</>;
}
export function HeritageHUD(){
  const g=useGame(),e=useExpedition();if(!g.started||g.paused||g.uiBlocked||e.mode!=='flight'||!['Mars','Moon'].includes(g.surface??''))return null;const m=g.surface==='Mars'?g.mars:g.moon;if(m.stage!=='eva'||m.demo||e.presentation||m.rover.occupied)return null;
  const entries=heritageSites.filter(s=>s.planet===g.surface).map(s=>({...s,distance:Math.hypot(m.player[0]-s.x,m.player[2]-s.z)})).sort((a,b)=>a.distance-b.distance),near=entries[0];const done=g.heritage.includes(near.id);
  return <aside className="heritage-hud"><small>SPACE HERITAGE · {g.heritage.length}/{heritageSites.length} DOCUMENTED</small><h3>{near.name}</h3><p>{near.year} · {near.region} · {near.distance.toFixed(0)} m</p>{near.distance<=6?<><p>{near.fact}</p><b>{done?'ARCHIVE SAVED':`PRESS F TO DOCUMENT · +${HERITAGE_REWARD} SCIENCE`}</b></>:<b>FOLLOW THE AMBER HISTORIC SITE MARKERS</b>}<small>Educational reconstructions. Sites are geographically separated in reality; this exploration sector compresses their locations.</small></aside>;
}
export function HeritageArchive(){const g=useGame();return <section className="heritage-archive"><div className="eyebrow">HISTORIC EXPEDITIONS · {g.heritage.length}/{heritageSites.length}</div><h3>Traces of earlier explorers</h3><p>Fly from Earth to Mars or the Moon, land, and approach each historic spacecraft. Press F within 6 m to document it. The equipment stays in place.</p><div>{heritageSites.map(site=><article key={site.id}><small>{site.planet.toUpperCase()} · {site.year} · {g.heritage.includes(site.id)?'DOCUMENTED':'AWAITING VISIT'}</small><h4>{site.name}</h4><p>{site.fact}</p><a href={site.source} target="_blank" rel="noreferrer">NASA mission archive ↗</a></article>)}</div><small>Procedural reconstructions; compressed geography. Jupiter and Saturn have no solid surface to walk on.</small></section>;}
