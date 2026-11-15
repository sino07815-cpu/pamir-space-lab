import {LText} from './Locale';
import { useMemo } from 'react';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import science from './science-data.json';

export default function JudgeBriefing(){
  const e=useExpedition(),g=useGame();
  const checks=useMemo(()=>{
    const canvas=document.querySelector('canvas');
    const graphics=!!canvas&&(!!canvas.getContext('webgl2')||!!canvas.getContext('webgl'));
    let saving=false;try{const key='pamir-preflight-check';localStorage.setItem(key,'ok');saving=localStorage.getItem(key)==='ok';localStorage.removeItem(key);}catch{/* Session-only operation is supported. */}
    return{graphics,saving};
  },[]);
  const redHorizon=()=>{e.set({panel:null});g.startDemo();};
  return <div className="judge-briefing">
    <p className="judge-intro"><LText>{"Learn space exploration by making decisions: manage a descent, investigate geology, repair equipment and turn samples into research."}</LText></p>
    <div className="judge-checks" role="status"><span className={checks.graphics?'ready':'attention'}><LText>{"3D RENDERER · "}</LText><LText>{checks.graphics?'AVAILABLE':'CHECK HARDWARE ACCELERATION'}</LText></span><span className={checks.saving?'ready':'attention'}><LText>{"PROGRESS · "}</LText><LText>{checks.saving?'LOCAL SAVE AVAILABLE':'SESSION ONLY'}</LText></span><span><LText>{"NO API KEY · NO PAID SERVICES"}</LText></span></div>
    <h3><LText>{"CHOOSE YOUR PRESENTATION"}</LText></h3>
    <div className="judge-routes"><article><small><LText>{"01 / PROTECTED EXPEDITION"}</LText></small><h3><LText>{"Earth orbit → Mars research"}</LText></h3><p><LText>{"Dock with PAMIR Gateway, repair its relay during an EVA, land on Mars and analyze geological samples. Uses the actual mission actions and preserves your normal save."}</LText></p><button className="primary" onClick={e.startPresentation}><LText>{"START PROTECTED PRESENTATION ↗"}</LText></button><small><LText>{"About 2½ simulated minutes · allow 3–5 minutes for commentary and rendering."}</LText></small></article><article><small><LText>{"02 / LANDING FOCUS"}</LText></small><h3><LText>{"Operation Red Horizon"}</LText></h3><p><LText>{"A guided Mars landing, astronaut exploration, three samples and the return to the lander. Take Control is available during the route."}</LText></p><button className="ops-button" onClick={redHorizon}><LText>{"START MARS DEMO ↗"}</LText></button><small><LText>{"About 3½ simulated minutes. Replaces the current Red Horizon run and its rewards; choose the protected route to retain it."}</LText></small></article></div>
    <h3><LText>{"WHAT THE PLAYER LEARNS"}</LText></h3><div className="judge-learning"><article><b><LText>{"Engineering"}</LText></b><p><LText>{"Altitude, velocity, thrust, fuel and touchdown limits affect landing success."}</LText></p></article><article><b><LText>{"Scientific method"}</LText></b><p><LText>{"Travel to a research location, collect distinct samples and analyze them at the laboratory."}</LText></p></article><article><b><LText>{"Mission operations"}</LText></b><p><LText>{"Monitor suit resources, follow objectives and recover safely to the spacecraft."}</LText></p></article></div>
    <h3><LText>{"SCIENCE WITH TRACEABLE SOURCES"}</LText></h3><div className="judge-sources"><LText>{science.records.slice(0,4).map(record=><a key={record.id} href={record.source} target="_blank" rel="noreferrer"><LText>{record.title}</LText><LText>{" ↗"}</LText></a>)}</LText></div>
    <p className="physics-note"><LText>{"Educational simulation: compressed distances and time, simplified flight, fictional terrain and facilities. Planet imagery is locally bundled and attributed. NASA-inspired presentation does not imply NASA endorsement."}</LText></p>
    <div className="judge-preferences"><span><LText>{"Presentation graphics"}</LText></span><LText>{(['LOW','MEDIUM','HIGH'] as const).map(q=><button className={e.graphics===q?'selected':''} key={q} onClick={()=>e.set({graphics:q})}><LText>{q}</LText></button>)}</LText></div>
    <p className="physics-note"><LText>{"WASD move · mouse look · E interact · C camera · M Mission Control · H controls · Esc pause. Click the audio icon once to enable sound. Keep a local production preview ready if the venue internet is unavailable."}</LText></p>
  </div>;
}
