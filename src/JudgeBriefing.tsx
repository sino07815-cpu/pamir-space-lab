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
    <p className="judge-intro">Learn space exploration by making decisions: manage a descent, investigate geology, repair equipment and turn samples into research.</p>
    <div className="judge-checks" role="status"><span className={checks.graphics?'ready':'attention'}>3D RENDERER · {checks.graphics?'AVAILABLE':'CHECK HARDWARE ACCELERATION'}</span><span className={checks.saving?'ready':'attention'}>PROGRESS · {checks.saving?'LOCAL SAVE AVAILABLE':'SESSION ONLY'}</span><span>NO API KEY · NO PAID SERVICES</span></div>
    <h3>CHOOSE YOUR PRESENTATION</h3>
    <div className="judge-routes"><article><small>01 / PROTECTED EXPEDITION</small><h3>Earth orbit → Mars research</h3><p>Dock with PAMIR Gateway, repair its relay during an EVA, land on Mars and analyze geological samples. Uses the actual mission actions and preserves your normal save.</p><button className="primary" onClick={e.startPresentation}>START PROTECTED PRESENTATION ↗</button><small>About 2½ simulated minutes · allow 3–5 minutes for commentary and rendering.</small></article><article><small>02 / LANDING FOCUS</small><h3>Operation Red Horizon</h3><p>A guided Mars landing, astronaut exploration, three samples and the return to the lander. Take Control is available during the route.</p><button className="ops-button" onClick={redHorizon}>START MARS DEMO ↗</button><small>About 3½ simulated minutes. Replaces the current Red Horizon run and its rewards; choose the protected route to retain it.</small></article></div>
    <h3>WHAT THE PLAYER LEARNS</h3><div className="judge-learning"><article><b>Engineering</b><p>Altitude, velocity, thrust, fuel and touchdown limits affect landing success.</p></article><article><b>Scientific method</b><p>Travel to a research location, collect distinct samples and analyze them at the laboratory.</p></article><article><b>Mission operations</b><p>Monitor suit resources, follow objectives and recover safely to the spacecraft.</p></article></div>
    <h3>SCIENCE WITH TRACEABLE SOURCES</h3><div className="judge-sources">{science.records.slice(0,4).map(record=><a key={record.id} href={record.source} target="_blank" rel="noreferrer">{record.title} ↗</a>)}</div>
    <p className="physics-note">Educational simulation: compressed distances and time, simplified flight, fictional terrain and facilities. Planet imagery is locally bundled and attributed. NASA-inspired presentation does not imply NASA endorsement.</p>
    <div className="judge-preferences"><span>Presentation graphics</span>{(['LOW','MEDIUM','HIGH'] as const).map(q=><button className={e.graphics===q?'selected':''} key={q} onClick={()=>e.set({graphics:q})}>{q}</button>)}</div>
    <p className="physics-note">WASD move · mouse look · E interact · C camera · M Mission Control · H controls · Esc pause. Click the audio icon once to enable sound. Keep a local production preview ready if the venue internet is unavailable.</p>
  </div>;
}
