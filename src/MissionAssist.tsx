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
  if(!g.started||g.paused||g.uiBlocked||e.presentation||g.mars.demo||e.mode!=='flight'||e.dock!=='free'||e.navStation||g.mars.stage==='complete'||g.moon.stage==='complete'&&g.surface==='Moon')return null;
  const goal=missionAssist(g,port);
  const action=(kind:AssistAction)=>{const s=useGame.getState(),exp=useExpedition.getState();if(s.paused||s.uiBlocked||exp.mode!=='flight'||exp.dock!=='free')return;
    if(kind==='launch')launchEarth();else if(kind==='mars'||kind==='moon'||kind==='travel'){if(s.surface)return;if(exp.events.navigation||exp.events.comms){s.set({notice:'Restore navigation and communications from the cabin before transfer.'});return;}exp.set({navStation:false});s.set({target:kind==='mars'?'Mars':kind==='moon'?'Moon':s.target,autopilot:true,mars:s.mars.stage==='orbit'?{...s.mars,stage:'space'}:s.mars,notice:'Expedition transfer guidance engaged.'});}
    else if(kind==='orbit')s.enterOrbit();else if(kind==='land')s.beginLanding();else if(kind==='exit')s.exitShip();else if(kind==='scan')s.scan();else if(kind==='moonland')s.startMoonLanding();else if(kind==='moonexit')s.exitMoonShip();
  };
  const labels:Partial<Record<NonNullable<AssistAction>,string>>={launch:'BOARD & LAUNCH',mars:'BEGIN RED HORIZON',moon:'CONTINUE TO THE MOON',travel:'ENGAGE TRANSFER',orbit:'ENTER MARS ORBIT',land:'BEGIN DESCENT',exit:'EXIT SPACECRAFT',scan:'SURVEY PLANET',moonland:'BEGIN LUNAR DESCENT',moonexit:'EXIT LANDER'};
  return <>{toast&&<div className="science-toast" role="status"><b><LText>{"+"}</LText><LText>{toast.points}</LText><LText>{" SCIENCE"}</LText></b><span><LText>{toast.text}</LText></span></div>}{hidden?<button className="assist-reopen" onClick={()=>setHidden(false)}><LText>{"MISSION ASSIST +"}</LText></button>:<aside className="mission-assist"><div className="assist-heading"><span><LText>{"EXPEDITION / NEXT OBJECTIVE"}</LText></span><button aria-label={tr("Hide mission assistant")} onClick={()=>setHidden(true)}><LText>{"×"}</LText></button></div><div className="assist-stages"><LText>{['EARTH','ASCENT','TRANSIT','LANDING','SCIENCE','RETURN'].map((label,i)=><span key={label} className={i===goal.step?'current':i<goal.step?'passed':''} title={tr(label)}/>)}</LText></div><h3><LText>{goal.title}</LText></h3><p><LText>{goal.instruction}</LText></p><LText>{goal.action&&labels[goal.action]&&<button className="assist-action" onClick={()=>action(goal.action)}><LText>{labels[goal.action]}</LText><LText>{" ↗"}</LText></button>}</LText><small><LText>{"M · MISSION CONTROL　H · FLIGHT GUIDE"}</LText></small></aside>}</>;
}
