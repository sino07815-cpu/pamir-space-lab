import {useState} from 'react';
import {LText} from './Locale';
import {useGame} from './store';
import {useExpedition} from './expeditionStore';
import {usePlanetMissions} from './planetMissionStore';
import {usePort} from './earthPortState';
import {activeCoach,coachMission,coachOrder,coachProgress,coachHint,type CoachId} from './missionCoach';
export default function MissionGuide(){
 const g=useGame(),e=useExpedition(),r=usePlanetMissions(),port=usePort();
 const [selected,setSelected]=useState<CoachId>(()=>activeCoach(g,e,r));
 const m=coachMission(selected,g,e,r,port),progress=coachProgress(m);
 const operation=selected==='orbital'?'orbital':selected==='research'?'mars':selected==='lunar'?'lunar':null;
 return <div className="mission-guide"><label className="guide-select"><LText>Choose a mission</LText><select value={selected} onChange={event=>setSelected(event.target.value as CoachId)}>{coachOrder.map(id=><option key={id} value={id}><LText>{coachMission(id,g,e,r,port).title}</LText></option>)}</select></label>
 <div className="guide-level"><LText>Difficulty</LText> {m.level}/7 <span><LText>Completed tasks</LText> {progress.count}/{progress.total}</span></div>
 <h3><LText>{m.title}</LText></h3><p><LText>{m.context}</LText></p>
 <section className="guide-learning"><strong><LText>Learning objective</LText></strong><p><LText>{m.learning}</LText></p></section>
 <h4><LText>Main objective</LText></h4><p><LText>{m.objective}</LText></p>
 {g.surface==='Mars'&&g.mars.stage==='complete'&&<button className="ops-button" onClick={()=>{g.set({mars:{...g.mars,stage:'eva'}});e.set({panel:null});}}><LText>CONTINUE EXPLORING</LText></button>}
 {g.started&&!g.surface&&e.mode==='flight'&&e.dock==='free'&&<button className="ops-button" onClick={()=>{e.set({panel:null});if(selected==='orbital')e.travelStation();else{const target=selected==='research'?'Mars':selected==='lunar'?'Moon':selected;e.set({navStation:false});g.set({target,autopilot:false,mars:g.mars.stage==='orbit'?{...g.mars,stage:'space'}:g.mars});}}}><LText>{selected==='orbital'?'RENDEZVOUS ASSIST':'SET DESTINATION ↗'}</LText></button>}
 {operation&&<div className="guide-accept"><button className="ops-button" disabled={!e.unlocked(operation)||['active','complete'].includes(e.missions[operation].status)||e.presentation} onClick={()=>e.accept(operation)}><LText>{e.missions[operation].status==='active'?'MISSION ACTIVE':e.missions[operation].status==='complete'?'MISSION COMPLETE':!e.unlocked(operation)?'LOCKED':e.missions[operation].status==='failed'?'RETRY MISSION':'Accept the operation'}</LText></button><p><LText>{operation==='lunar'?'Unlock: complete Red Planet Research.':operation==='mars'?'Unlock: complete Orbital Rescue or land on Mars.':'Accept this operation before beginning its tasks.'}</LText></p></div>}
 <ol className="guide-checklist">{m.steps.map((s,i)=><li key={s.id} className={s.done?'done':s.id===progress.next?.id?'next':''} aria-current={s.id===progress.next?.id?'step':undefined}><span className="guide-step-number">{s.done?'✓':i+1}</span><div><strong><LText>{s.title}</LText></strong><p><LText>{s.instruction}</LText></p><small><LText>{s.done?'Completed':s.id===progress.next?.id?'Next task':'Remaining'}</LText></small></div></li>)}</ol>
 <h4><LText>Helpful hint</LText></h4><p><LText>{selected===activeCoach(g,e,r)?coachHint(m,g,e,r):'Follow the numbered tasks. Amber beacons mark the next interaction. Open the pilot seat controls before travelling.'}</LText></p>
 <h4><LText>Interactive elements</LText></h4><p><LText>{m.tools}</LText></p>
 <h4><LText>Completion criteria</LText></h4><p><LText>{m.criteria}</LText> <LText>{m.steps[m.steps.length-1].instruction}</LText></p>
 <section className={'guide-learning '+(progress.complete?'guide-debrief':'')}><strong><LText>{progress.complete?'Mission complete · what you learned':'Educational takeaway'}</LText></strong><p><LText>{m.takeaway}</LText></p></section>
 <a href={m.source} target="_blank" rel="noreferrer"><LText>NASA SOURCE ↗</LText></a><p className="physics-note"><LText>Educational simulation: distances, timing, vehicles and instrument measurements are simplified. Completed tasks require gameplay actions, not quiz answers.</LText></p>
 <button className="primary" onClick={()=>e.set({panel:null})}><LText>RETURN TO EXPLORATION</LText></button></div>;
}
