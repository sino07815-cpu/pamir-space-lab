import AudioControls,{ AudioController,AudioStartButton,AudioMixerButton } from './AudioControls';
import { useAudio } from './audioStore';
import { usePlanetMissions } from './planetMissionStore';
import PlanetMissionHUD from './PlanetMissionUI';
import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Check, ChevronRight, CircleHelp, Compass, Crosshair, FlaskConical, Globe2, Maximize2, Orbit, Pause, Play, Radio, Rocket, ScanLine, Settings2, ShieldCheck, Target, X } from 'lucide-react';
import Scene from './Scene';
import PlanetLoading from './PlanetLoading';
import MissionAssist from './MissionAssist';
import { usePort } from './earthPortState';
import { EarthOrbitHUD } from './EarthSatellites';
import { HeritageHUD,HeritageArchive } from './Heritage';
import { EarthHUD } from './EarthPort';
import { enterEarthPort } from './earthPortState';
import './heritage.css';
import { planetTextureUrl,solarOrder } from './planetVisuals';
const displayPlanets=solarOrder.map(name=>planets.find(p=>p.name===name)!);
import ExpeditionHUD, { ExpeditionDashboard } from './ExpeditionHUD';
import { useExpedition } from './expeditionStore';
import { docking } from './expedition';
import MarsHUD, { MarsMissionPanel } from './MarsHUD';
import { onMars } from './mars';
import SurfaceHUD, { MoonMissionPanel } from './SurfaceHUD';
import { MoonHUD } from './MoonWorld';
import { resetInput } from './input';
import { planets, useGame } from './store';

class SpaceBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}render(){return this.state.failed?<div className="graphics-error"><Orbit size={48}/><h2>Graphics unavailable</h2><p>This game needs WebGL. Enable hardware acceleration in your browser, then reload.</p></div>:this.props.children;}}
const pad=(n:number)=>String(Math.floor(n)).padStart(2,'0');
export default function App(){
  const robot=usePlanetMissions(s=>s.robot);const robotActive=!!robot;const audioOpen=useAudio(s=>s.open);const game=useGame();const expedition=useExpedition();const port=usePort();const [help,setHelp]=useState(false);const [dashboard,setDashboard]=useState(false);

  const planet=planets.find(p=>p.name===game.target)!;const time=game.elapsed;const marsActive=game.started&&(onMars(game.mars.stage)||game.mars.stage==='approach');
  let controlHint='WASD MOVE · MOUSE / ARROWS STEER · SHIFT BOOST · SPACE BRAKE';
  if(game.surface==='Mars')controlHint=game.mars.stage==='descent'?'WASD LATERAL · SPACE THRUST · ESC PAUSE':'WASD WALK · SPACE JUMP · E INTERACT · SHIFT RUN · C CAMERA';
  if(game.surface==='Moon')controlHint=game.moon.stage==='descent'?'WASD LATERAL · SPACE THRUST · ESC PAUSE':'WASD WALK · SPACE JUMP · E INTERACT · SHIFT RUN · C CAMERA';
  if(game.surface==='Earth')controlHint=port.phase==='walk'?'WASD WALK · SHIFT RUN · E BOARD · B CAMPUS VIEW · V COSMONAUT':'GUIDED EARTH DEPARTURE / ARRIVAL · ESC PAUSE';
  if(robot&&game.surface===robot.planet)controlHint=robot.stage==='descent'?'WASD LATERAL · SPACE THRUST · ESC PAUSE':robot.stage==='failed'?'LANDING FAILED · RETURN TO ORBIT AND RETRY':robot.stage==='landed'?'E DEPLOY ROVER · RETURN TO ORBIT WHEN READY':'WASD DRIVE · MOUSE / ARROWS LOOK · SPACE BRAKE · E ANALYZE · C CAMERA';
  if(expedition.mode==='eva')controlHint='WASD THRUST · SPACE UP · CTRL DOWN · SHIFT BOOST · E INTERACT';
  if(expedition.mode==='station'||expedition.mode==='cabin')controlHint='WASD WALK · E TERMINAL · C CAMERA · ESC PAUSE';
  useEffect(()=>{game.set({uiBlocked:dashboard||help||game.paused||!!expedition.panel||audioOpen});resetInput();if(dashboard||help||game.paused||expedition.panel||audioOpen)document.exitPointerLock?.();},[dashboard,help,game.paused,expedition.panel,audioOpen]);
  useEffect(()=>{if(!game.started||game.paused||dashboard||help||expedition.panel||audioOpen)return;let last=performance.now();const id=setInterval(()=>{const now=performance.now();useGame.getState().tick((now-last)/1000);last=now;},250);return()=>clearInterval(id);},[game.started,game.paused,dashboard,help,expedition.panel,audioOpen]);
  useEffect(()=>{const shortcut=(event:KeyboardEvent)=>{if(event.repeat||(event.target instanceof Element&&event.target.closest('input,textarea,[contenteditable=true]'))||!useGame.getState().started||useGame.getState().paused||useAudio.getState().open)return;if(event.code==='KeyM'&&!help&&!useExpedition.getState().panel){setDashboard(value=>!value);event.preventDefault();}if(event.code==='KeyH'&&!dashboard&&!useExpedition.getState().panel){setHelp(value=>!value);event.preventDefault();}};window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut);},[help,dashboard]);
  const start=()=>{if(!game.surface&&game.elapsed===0&&game.points===0&&game.mars.stage==='space'){enterEarthPort();return;}game.set({started:true,paused:false,target:onMars(game.mars.stage)?'Mars':game.surface==='Moon'?'Moon':game.target,notice:'Flight systems online. Click space to capture mouse. W to thrust.'});};
  const select=(name:typeof game.target)=>{if(game.started&&(game.surface||game.mars.stage==='approach'||game.moon.stage==='approach'||expedition.mode!=='flight'||expedition.dock!=='free')){game.set({notice:'Return to the pilot seat and undock before choosing a flight destination.'});return;}expedition.set({navStation:false});game.set({target:name,autopilot:false,mars:game.mars.stage==='orbit'?{...game.mars,stage:'space'}:game.mars});};
  const land=()=>{if(game.target==='Earth'){if(game.distance<=18)enterEarthPort(true);else game.set({notice:'Approach Earth before returning to the spaceport.'});return;}if(game.target==='Mars'){if(game.mars.stage==='orbit')game.beginLanding();else game.enterOrbit();return;}if(game.distance>18){game.set({notice:'Approach within 18 units of the surface before landing.'});return;}if(game.target!=='Moon')return;game.startMoonLanding();document.exitPointerLock?.();};
  const fullscreen=()=>{if(document.fullscreenElement)void document.exitFullscreen();else void document.documentElement.requestFullscreen?.().catch(()=>game.set({notice:'Fullscreen unavailable in this window.'}));};
  return <main className={(game.started?'app in-flight':'app')+(marsActive?' mars-active':'')+(game.started&&expedition.mode!=='flight'?' operations-mode':'')+(game.started&&!game.surface&&docking(game.flightPosition,game.flightRotation,game.speed).range<30?' gateway-active':'')+(game.surface==='Mars'&&game.mars.stage==='eva'&&game.mars.player[0]>24?' base-active':'')+(game.surface==='Moon'?' lunar-active':'')+(game.surface==='Earth'?' earth-active':'')+(expedition.presentation?' presentation-active':'')+(game.surface==='Earth'&&port.overview?' campus-overview':'')+(game.started&&['Mercury','Venus','Jupiter','Saturn','Uranus','Neptune'].includes(game.target)?' science-world-active':'')+(robotActive&&game.surface===robot?.planet?' robotics-active':'')}>
    <div className="universe"><SpaceBoundary><Suspense fallback={null}><Scene/></Suspense></SpaceBoundary></div>
    {game.started&&!game.surface&&!dashboard&&<div className="orbit-scale-note">INTERPLANETARY CRUISE · DISTANCES & TIME COMPRESSED</div>}<div className="vignette"/><PlanetLoading/><PlanetMissionHUD/><MissionAssist/><HeritageHUD/><EarthHUD/><EarthOrbitHUD/>
    <header className="topbar">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();if(game.started){game.set({paused:true});}else setDashboard(false);}} aria-label="Pamir Space Lab"><span className="brand-mark"><Orbit size={28}/></span><span>PAMIR <b>SPACE LAB</b><small>EXPLORATION HAS NO LIMITS</small></span></a>
      <nav><button className={!dashboard?'nav-active':''} onClick={()=>setDashboard(false)}>EXPLORATION</button><button className={dashboard?'nav-active':''} onClick={()=>setDashboard(true)}>MISSION CONTROL <span className="nav-count">{game.visited.length}/{planets.length}</span></button></nav>
      <div className="system-state"><i/> SYSTEMS ONLINE <span className="top-divider"/><span className="team-label">NASA SPACE APPS <span>2026</span></span></div>
    </header>

    {!game.started&&!dashboard&&<section className="hero">
      <div className="eyebrow"><span/> A NEW PERSPECTIVE AWAITS</div>
      <h1>BEYOND<br/><span>EARTH.</span></h1>
      <p className="hero-copy">One small planet. Infinite possibilities.<br/>Take the controls. Follow your curiosity.<br/>Discover what lies beyond our world.</p>
      <div className="hero-actions">{!game.surface&&!onMars(game.mars.stage)&&<button className="primary" onClick={()=>enterEarthPort()}>BEGIN ON EARTH <Rocket size={18}/></button>}<button className="primary" onClick={start}>{game.mars.stage==='space'?'START GAME':'RESUME MISSION'} <ArrowUpRight size={20}/></button><button className="how-button" onClick={()=>setHelp(true)}><span><Play size={13} fill="currentColor"/></span> HOW TO PLAY</button></div>
      <div className="hero-meta"><AudioStartButton/><button className="planet-mission-open" onClick={()=>expedition.set({panel:'planetary'})}>SOLAR SYSTEM MISSIONS ↗</button><button className="hero-demo" onClick={game.startDemo}>JUDGE DEMO · 3–5 MIN</button><span><Globe2 size={15}/> 8 PLANETS + THE MOON</span><span><Compass size={15}/> FREE EXPLORATION</span></div>
    </section>}

    {!game.started&&!dashboard&&<div className="earth-caption"><span className="caption-line"/><div><span className="tiny-label">{planet.name==='Earth'?'YOU ARE HERE':'DESTINATION PREVIEW'}</span><h3>{planet.name.toUpperCase()} <span> / 0{displayPlanets.indexOf(planet)+1}</span></h3><p>{planet.tag}</p></div></div>}

    {!dashboard&&<aside className="mission-card">
      <div className="panel-heading"><span><Radio size={14}/> MISSION BRIEFING</span><i/></div>
      <div className="mission-code">EXPEDITION 001 <span>SCIENCE & DISCOVERY</span></div>
      <h2>{game.surface?`${game.surface} surface expedition`:'The journey begins with you.'}</h2>
      <p>{game.surface?'Find the glowing geological samples. Approach within 3 units and press E to collect them.':'Survey distant worlds. Uncover their stories. Bring a little more of the universe home.'}</p>
      <div className="mission-objective"><span className={game.visited.length?'objective-icon complete':'objective-icon'}>{game.visited.length?<Check size={14}/>:<Target size={14}/>}</span><div><strong>Survey the Solar System</strong><small>{game.visited.length} OF {planets.length} WORLDS EXPLORED</small></div><span>{Math.round(game.visited.length/planets.length*100)}%</span></div>
      <div className="progress-track"><span style={{width:`${Math.round(game.visited.length/planets.length*100)}%`}}/></div>
      <div className="reward"><span><FlaskConical size={13}/> SCIENCE POINTS</span><strong>{game.points.toLocaleString()} <small>PTS</small></strong></div>
    </aside>}

    {game.started&&!dashboard&&<>
      <section className="flight-status"><div className="eyebrow"><i/> {game.surface?'EXTRAVEHICULAR ACTIVITY':game.autopilot?'GUIDED TRANSFER ACTIVE':'MANUAL FLIGHT ACTIVE'}</div><h2>{game.surface||'ODYSSEY'} <span>{game.surface?'SURFACE':'/ EXPLORER CLASS'}</span></h2><p>{game.notice}</p></section>
      <div className="crosshair"><span/><span/><i/></div>
      <div className="telemetry"><div><small>{game.surface?'EVA STATUS':'VELOCITY'}</small><strong>{game.surface?'NOMINAL':game.speed.toFixed(1)} <span>{!game.surface&&'u/s'}</span></strong></div><div><small>{game.surface?'SAMPLES SECURED':'SURFACE DISTANCE'}</small><strong>{game.surface?game.samples.filter(s=>s.startsWith(game.surface!)).length:game.distance.toFixed(1)} <span>{game.surface?'/ 5':'u'}</span></strong></div><div><small>MISSION ELAPSED</small><strong>{pad(Math.floor(time/3600))}:{pad(Math.floor(time/60)%60)}:{pad(time%60)}</strong></div></div>
      <div className="flight-actions">{game.surface?<button className="primary" onClick={()=>{if(game.surface==='Moon'&&!expedition.returnMoon())return;game.set({surface:null,notice:'Returned to orbit. Choose your next destination.'});}}><Rocket size={16}/> RETURN TO SHIP</button>:<><button onClick={()=>{if(expedition.dock!=='free'||expedition.events.navigation||expedition.events.comms){game.set({notice:'Undock and repair navigation / uplink before engaging transfer.'});return;}expedition.set({navStation:false});game.set({mars:game.mars.stage==='orbit'?{...game.mars,stage:'space'}:game.mars,autopilot:!game.autopilot,notice:game.autopilot?'Manual flight restored.':'Transfer guidance engaged.'});}}><Compass size={16}/>{game.autopilot?'CANCEL TRANSFER':'TRAVEL TO '+game.target.toUpperCase()}</button><button onClick={game.scan}><ScanLine size={16}/> SCAN <kbd>F</kbd></button>{(game.target==='Earth'||game.target==='Mars'||game.target==='Moon')&&<button onClick={land}><ArrowDown size={16}/>{game.target==='Mars'?(game.mars.stage==='orbit'?'INITIATE LANDING':'ENTER MARS ORBIT'):'LAND'}</button>}<button onClick={()=>game.set({cockpit:!game.cockpit})}><Crosshair size={16}/>{game.cockpit?'COCKPIT':'CHASE CAM'} <kbd>C</kbd></button></>}</div>
      {game.cockpit&&!game.surface&&<div className="cockpit-frame"><span>ODYSSEY // FORWARD VIEW</span></div>}
    </>}

    {dashboard&&<section className="dashboard"><div className="eyebrow"><Radio size={14}/> PAMIR MISSION OPERATIONS</div><h1>Mission control<span>.</span></h1><p>Every discovery moves us forward. Your expedition, at a glance.</p><button className="planet-mission-open" onClick={()=>expedition.set({panel:'planetary'})}>SOLAR SYSTEM MISSIONS ↗</button><ExpeditionDashboard/><MarsMissionPanel/><MoonMissionPanel/><HeritageArchive/><div className="dashboard-stats"><article><FlaskConical/><strong>{game.points}</strong><small>SCIENCE POINTS</small></article><article><Globe2/><strong>{game.visited.length}<span> / {planets.length}</span></strong><small>WORLDS SURVEYED</small></article><article><ShieldCheck/><strong>{game.samples.length}<span> / 8</span></strong><small>SAMPLES SECURED</small></article></div><div className="survey-list">{displayPlanets.map((p,i)=><button key={p.name} onClick={()=>{select(p.name);setDashboard(false);}}><span className={'mini-planet mini-'+p.name.toLowerCase()} style={{backgroundImage:`url(${planetTextureUrl(p.name)})`}}/><span><small>DESTINATION 0{i+1}</small><strong>{p.name}</strong></span><span className="survey-description">{p.type} · {p.diameter}</span><span className={game.visited.includes(p.name)?'survey-done':'survey-pending'}>{game.visited.includes(p.name)?'SURVEY COMPLETE':'AWAITING SURVEY'}</span><ChevronRight size={18}/></button>)}</div>{!game.started&&<button className="primary" onClick={()=>{start();setDashboard(false);}}>BEGIN EXPEDITION <ArrowUpRight size={18}/></button>}</section>}

    {!dashboard&&<section className="destination-panel"><div className="destination-heading"><span>CHOOSE YOUR DESTINATION</span><span>ALL 8 PLANETS + MOON · SCROLL <ArrowRight size={12}/></span></div><div className="planet-list">{displayPlanets.map((p,i)=><button key={p.name} onClick={()=>select(p.name)} className={'planet-choice '+(p.name===game.target?'selected':'')}><span className="planet-index">0{i+1}</span><span className={'mini-planet mini-'+p.name.toLowerCase()} style={{backgroundImage:`url(${planetTextureUrl(p.name)})`}}/><span className="planet-text"><strong>{p.name}</strong><small>{p.type}</small></span>{p.name===game.target?<span className="selected-dot"/>:<ArrowUpRight size={15}/>}</button>)}</div></section>}

    {!dashboard&&!help&&!game.paused&&expedition.mode==='flight'&&<MarsHUD onDashboard={()=>setDashboard(true)}/>}
    {!dashboard&&!help&&!game.paused&&<><SurfaceHUD/><MoonHUD/></>}
    <ExpeditionHUD dashboard={dashboard}/>
    <footer><span className="footer-note"><span className="live-dot"/> {game.started?'MISSION IN PROGRESS':'YOUR UNIVERSE. YOUR DISCOVERY.'}</span><span className="footer-center">{game.started?controlHint:'BUILT FOR THE CURIOUS. INSPIRED BY THE COSMOS.'}</span><div><AudioControls/><button onClick={()=>setHelp(true)} title="Controls" aria-label="Show controls"><CircleHelp size={16}/></button><button onClick={fullscreen} title="Fullscreen" aria-label="Toggle fullscreen"><Maximize2 size={16}/></button>{game.started&&<button onClick={()=>game.set({paused:true})} title="Pause" aria-label="Pause game"><Pause size={16}/></button>}</div></footer>

    {(help||game.paused)&&<div className="modal-backdrop"><section className="modal"><button className="close-button" onClick={()=>{setHelp(false);game.set({paused:false});}} aria-label="Close"><X size={20}/></button><div className="eyebrow"><Settings2 size={15}/> FLIGHT OPERATIONS</div><h2>{game.paused?'Take a breath, Commander.':'Your journey starts here.'}</h2><p>Click the space view to capture your mouse. Press Esc to release it and pause. Use the dashboard buttons with your mouse released.</p><AudioMixerButton/><div className="control-grid">{[['W / S','Forward / reverse'],['A / D','Strafe left / right'],['MOUSE / ARROWS','Steer the spacecraft'],['Q / E','Descend / ascend'],['SHIFT','Boost thrusters'],['SPACE','Brake'],['C','Switch camera'],['F','Survey nearby planet'],['Z / X','Roll left / right'],['E ON SURFACE','Interact / enter ship'],['SPACE ON MARS','Jump / landing thrust'],['SPACE / CTRL','Orbit EVA up / down'],['HOLD E','Repair orbital relay']].map(([key,label])=><div key={key}><kbd>{key}</kbd><span>{label}</span></div>)}</div><p className="help-tip">Select a destination and use <b>Travel</b> for a guided approach. Scan within 18 units to earn 100 points. For Mars, enter orbit, initiate landing, and exit the spacecraft. Collect A/B/C, scan the research outcrop, then return to the airlock. E interacts and Space jumps during EVA. Judge Demo runs the same physics and interaction checks automatically. Progress is saved locally. Distances, orbit and entry are simplified for play.</p><p className="texture-credit">Planet maps by <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Imagery-based maps with artistic adjustments; not live weather.</p><button className="primary" onClick={()=>{setHelp(false);if(!game.started)start();else game.set({paused:false});}}>{game.started?'RESUME EXPLORATION':'LET’S EXPLORE'}<ArrowRight size={18}/></button></section></div>}
    <AudioController/><div className="sr-only" role="status" aria-live="polite">{game.notice}</div>
  </main>;
}
