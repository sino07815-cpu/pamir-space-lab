import {usePlanetMissions} from './planetMissionStore';
import {activeCoach,coachMission,coachProgress,coachHint,coachWaypoint} from './missionCoach';
import {LText,tr} from './Locale';
import { useEffect,useRef,useState } from 'react';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { usePort,launchEarth } from './earthPortState';
import { missionAssist,type AssistAction } from './expeditionGuidance';
export default function MissionAssist(){
  const g=useGame(),e=useExpedition(),port=usePort(),[hidden,setHidden]=useState(false),[toast,setToast]=useState<{text:string;points:number}|null>(null),previous=useRef(g.points);
  useEffect(()=>{const delta=g.points-previous.current;previous.current=g.points;if(delta>0&&g.started&&!e.presentation)setToast({text:g.notice,points:delta});},[g.points,g.started,e.presentation]);
  useEffect(()=>{if(!toast)return;const timeout=setTimeout(()=>setToast(null),4500);return()=>clearTimeout(timeout);},[toast]);
  if(!g.started||g.paused||g.uiBlocked||e.presentation||g.mars.demo)return null;
  const goal=missionAssist(g,port),r=usePlanetMissions.getState(),m=coachMission(activeCoach(g,e,r),g,e,r,port),progress=coachProgress(m),waypoint=coachWaypoint(m,g,e,r);
  const action=(kind:AssistAction)=>{const s=useGame.getState(),exp=useExpedition.getState();if(s.paused||s.uiBlocked||exp.mode!=='flight'||exp.dock!=='free')return;
    if(kind==='launch')launchEarth();else if(kind==='mars'||kind==='moon'||kind==='travel'){if(s.surface)return;if(exp.events.navigation||exp.events.comms){s.set({notice:'Restore navigation and communications from the cabin before transfer.'});return;}exp.set({navStation:false});s.set({target:kind==='mars'?'Mars':kind==='moon'?'Moon':s.target,autopilot:true,mars:s.mars.stage==='orbit'?{...s.mars,stage:'space'}:s.mars,notice:'Expedition transfer guidance engaged.'});}
    else if(kind==='orbit')s.enterOrbit();else if(kind==='land')s.beginLanding();else if(kind==='exit')s.exitShip();else if(kind==='scan')s.scan();else if(kind==='moonland')s.startMoonLanding();else if(kind==='moonexit')s.exitMoonShip();
  };
  const nextAction:AssistAction=m.id==='Earth'&&!g.surface?(g.visited.includes('Earth')?'moon':'scan'):goal.action;
  const labels:Partial<Record<NonNullable<AssistAction>,string>>={launch:'BOARD & LAUNCH',mars:'BEGIN RED HORIZON',moon:'CONTINUE TO THE MOON',travel:'ENGAGE TRANSFER',orbit:'ENTER MARS ORBIT',land:'BEGIN DESCENT',exit:'EXIT SPACECRAFT',scan:'SURVEY PLANET',moonland:'BEGIN LUNAR DESCENT',moonexit:'EXIT LANDER'};
  return <>{toast&&<div className="science-toast" role="status"><b>+{toast.points} <LText>SCIENCE</LText></b><span><LText>{toast.text}</LText></span></div>}{hidden?<button className="coach-guide-shortcut" onClick={()=>setHidden(false)}><LText>Next task</LText> +</button>:<aside className="mission-coach" aria-label={tr('Mission guidance')}>
 <button className="coach-compact-title" onClick={()=>e.set({panel:'guide'})}><span><LText>{progress.complete?'Mission complete · what you learned':progress.next?.title??m.title}</LText></span><small>{progress.count}/{progress.total} ↗</small></button>
 <div className="coach-desktop"><div className="assist-heading"><span><LText>{m.title}</LText></span><button aria-label={tr('Hide mission assistant')} onClick={()=>setHidden(true)}>×</button></div><div className="guide-progress" role="progressbar" aria-label={tr('Completed tasks')} aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.count}><i style={{width:progress.count/progress.total*100+'%'}}/></div><div className="coach-meta"><span>{progress.count}/{progress.total} <LText>Completed tasks</LText></span>{waypoint?.distance!==null&&waypoint&&<span>{waypoint.distance.toFixed(0)} <LText>{waypoint.space==='orbit'?'u':'m'}</LText></span>}</div><h3><LText>{progress.complete?'Mission complete · what you learned':progress.next?.title}</LText></h3><p><LText>{coachHint(m,g,e,r)}</LText></p>
 {progress.complete?<p><LText>{m.takeaway}</LText></p>:<details><summary className="coach-next"><LText>Why this matters</LText></summary><p><LText>{m.learning}</LText></p></details>}
 {e.mode==='flight'&&e.dock==='free'&&!r.robot&&['Earth','Moon','Mars'].includes(m.id)&&nextAction&&labels[nextAction]&&<button className="assist-action" onClick={()=>action(nextAction)}><LText>{labels[nextAction]}</LText> ↗</button>}
 <button className="coach-open" onClick={()=>e.set({panel:'guide'})}><LText>Mission steps & science</LText> ↗</button></div></aside>}</>;

}
