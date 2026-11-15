import {useEffect,useRef,useState} from 'react';
import {useGame} from './store';
import {useExpedition} from './expeditionStore';
import {usePlanetMissions} from './planetMissionStore';
import {usePort} from './earthPortState';
import {coachOrder,coachMission,coachProgress,type CoachMission} from './missionCoach';
import {LText,tr} from './Locale';
export default function MissionOutcome(){
 const gameProgress=useGame(s=>JSON.stringify([s.started,s.paused,s.uiBlocked,s.visited,s.mars.objectives,s.moon.objectives,s.samples,s.mars.demo]));
 const operationProgress=useExpedition(s=>JSON.stringify([s.presentation,...Object.values(s.missions).map(m=>[m.status,m.done])]));
 const records=usePlanetMissions(s=>s.records),g=useGame.getState(),e=useExpedition.getState(),r=usePlanetMissions.getState(),p=usePort.getState(),previous=useRef<Record<string,boolean>|null>(null),[outcome,setOutcome]=useState<CoachMission|null>(null);
 useEffect(()=>{const missions=coachOrder.map(id=>coachMission(id,g,e,r,p)),next=Object.fromEntries(missions.map(m=>[m.id,coachProgress(m).complete]));if(!g.started||e.presentation||g.mars.demo){previous.current=next;return;}const completed=missions.find(m=>next[m.id]&&previous.current?.[m.id]===false);if(completed)setOutcome(completed);previous.current=next;},[gameProgress,operationProgress,records]);
 useEffect(()=>{if(!outcome)return;const id=setTimeout(()=>setOutcome(null),14000);return()=>clearTimeout(id);},[outcome]);
 if(!outcome||g.paused||g.uiBlocked||!g.started)return null;
 return <aside className="coach-outcome" role="status"><button aria-label={tr('Close')} onClick={()=>setOutcome(null)}>×</button><small><LText>Mission complete · what you learned</LText></small><h3><LText>{outcome.title}</LText></h3><p><LText>{outcome.takeaway}</LText></p></aside>;
}
