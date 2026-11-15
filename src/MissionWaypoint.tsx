import {Html} from '@react-three/drei';
import {useGame} from './store';
import {useExpedition} from './expeditionStore';
import {usePlanetMissions} from './planetMissionStore';
import {usePort} from './earthPortState';
import {activeCoach,coachMission,coachWaypoint} from './missionCoach';
import {moonHeight} from './surfacePhysics';
import {terrainHeight} from './mars';
import {robotHeight,isRobotWorld} from './planetMissions';
import {LText} from './Locale';
export default function MissionWaypoint(){const g=useGame(),e=useExpedition(),r=usePlanetMissions(),p=usePort();if(!g.started||g.paused||g.uiBlocked||e.presentation||g.mars.demo)return null;const mission=coachMission(activeCoach(g,e,r),g,e,r,p),w=coachWaypoint(mission,g,e,r);if(!w||w.space==='orbit')return null;const [x,z]=w.point,y=w.space==='interior'?0:g.surface==='Moon'?moonHeight(x,z):g.surface==='Mars'?terrainHeight(x,z):g.surface&&isRobotWorld(g.surface)?robotHeight(g.surface,x,z):.3;return <group position={[x,y,z]} name="Next-mission-interaction"><mesh rotation={[-Math.PI/2,0,0]} position={[0,.07,0]}><ringGeometry args={[1.2,1.35,40]}/><meshBasicMaterial color="#ffbd75" transparent opacity={.8} depthWrite={false}/></mesh><mesh position={[0,1.6,0]}><cylinderGeometry args={[.035,.035,3.2,6]}/><meshBasicMaterial color="#ffbd75" transparent opacity={.6} depthWrite={false}/></mesh><Html center position={[0,3.5,0]} zIndexRange={[3,0]} style={{pointerEvents:'none'}}><div className="coach-world-marker"><small><LText>Next task</LText></small><strong><LText>{w.title}</LText></strong>{w.distance!==null&&<span>{Math.round(w.distance)} <LText>m</LText></span>}</div></Html></group>;}
