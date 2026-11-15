import {LText,tr} from './Locale';
import { useEffect,useRef,useState,type PointerEvent as ReactPointerEvent } from 'react';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { usePort } from './earthPortState';
import { usePlanetMissions } from './planetMissionStore';
import { pressControl } from './input';
import { releaseInput,releaseInputSources,steering,stickInput } from './inputState';

export function useTouchMode(){
  const manual=useRef(false);
  const [enabled,setEnabled]=useState(()=>typeof window!=='undefined'&&(navigator.maxTouchPoints>0&&window.innerWidth<=1024||window.matchMedia('(pointer: coarse)').matches));
  useEffect(()=>{const detect=(e:PointerEvent)=>{if(e.pointerType==='touch'&&!manual.current)setEnabled(true);};window.addEventListener('pointerdown',detect,{passive:true});return()=>window.removeEventListener('pointerdown',detect);},[]);
  useEffect(()=>{if(!enabled)return;try{if(!localStorage.getItem('pamir-touch-quality-v1')){useExpedition.getState().set({graphics:'LOW'});localStorage.setItem('pamir-touch-quality-v1','1');}}catch{}},[enabled]);
  return [enabled,(value:boolean)=>{manual.current=true;setEnabled(value);}] as const;
}

function HoldButton({code,label}:{code:string;label:string}){
  const [held,setHeld]=useState(false),pointer=useRef<number|null>(null);
  const release=()=>{if(pointer.current!==null)releaseInputSources('touch:button:'+code+':'+pointer.current);pointer.current=null;setHeld(false);};
  useEffect(()=>()=>releaseInputSources('touch:button:'+code+':'),[code]);
  return <button className={'touch-action '+(held?'held':'')} data-control={code} aria-label={tr(label)} aria-pressed={held}
    onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(pointer.current!==null)return;e.preventDefault();pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);pressControl(code,'touch:button:'+code+':'+e.pointerId);setHeld(true);}}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><LText>{label}</LText></button>;
}
function Stick(){
  const [knob,setKnob]=useState({x:0,y:0}),pointer=useRef<number|null>(null);
  const move=(e:ReactPointerEvent<HTMLDivElement>)=>{if(pointer.current!==e.pointerId)return;e.preventDefault();const r=e.currentTarget.getBoundingClientRect(),v=stickInput(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);setKnob(v);if(v.codes.length&&useGame.getState().surface==='Earth'&&usePort.getState().overview)usePort.setState({overview:false,portrait:false});const source='touch:stick';for(const code of ['KeyW','KeyA','KeyS','KeyD']){if(v.codes.includes(code))pressControl(code,source);else releaseInput(code,source);}};
  const release=()=>{releaseInputSources('touch:stick');pointer.current=null;setKnob({x:0,y:0});};
  useEffect(()=>()=>releaseInputSources('touch:stick'),[]);
  return <div className="touch-stick" role="group" aria-label={tr("Movement joystick")} onContextMenu={e=>e.preventDefault()}
    onPointerDown={e=>{if(pointer.current!==null)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e);}} onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
    <span className="stick-directions"><LText>{"↑"}</LText><br/><LText>{"← MOVE →"}</LText><br/><LText>{"↓"}</LText></span><i style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/></div>;
}
function LookPad(){
  const pointer=useRef<{id:number;x:number;y:number}|null>(null);
  return <div className="touch-look" role="group" aria-label={tr("Camera swipe area")} onContextMenu={e=>e.preventDefault()}
    onPointerDown={e=>{if(pointer.current)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};}}
    onPointerMove={e=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;steering.x+=Math.max(-100,Math.min(100,e.clientX-p.x));steering.y+=Math.max(-100,Math.min(100,e.clientY-p.y));pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY};}}
    onPointerUp={()=>{pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;}} onLostPointerCapture={()=>{pointer.current=null;}}><span><LText>{"↔ SWIPE TO LOOK"}</LText></span></div>;
}
export default function TouchControls({enabled,blocked}:{enabled:boolean;blocked:boolean}){
  const g=useGame(),e=useExpedition(),port=usePort(),research=usePlanetMissions();
  const robot=research.robot&&g.surface===research.robot.planet?research.robot:null;
  const descent=robot?.stage==='descent'||(g.surface==='Mars'&&g.mars.stage==='descent')||(g.surface==='Moon'&&g.moon.stage==='descent');
  const flight=!g.surface&&e.mode==='flight',eva=e.mode==='eva',interior=e.mode==='station'||e.mode==='cabin';
  const rover=!!robot||g.surface==='Mars'&&g.mars.rover.occupied;
  const terminal=robot?.stage==='failed'||(g.surface==='Mars'&&['complete','failed'].includes(g.mars.stage))||(g.surface==='Moon'&&['complete','failed'].includes(g.moon.stage));
  const guided=g.surface==='Earth'&&port.phase!=='walk'||g.mars.stage==='approach'||g.moon.stage==='approach';
  const active=enabled&&g.started&&!g.paused&&!g.uiBlocked&&!blocked&&!terminal&&!guided&&!e.presentation&&!g.mars.demo;
  const context=[g.surface,e.mode,g.mars.stage,g.moon.stage,robot?.stage,port.phase,g.mars.rover.occupied].join(':');
  useEffect(()=>{releaseInputSources('touch:');return()=>releaseInputSources('touch:');},[active,context]);
  useEffect(()=>{const clear=()=>releaseInputSources('touch:');window.addEventListener('blur',clear);window.addEventListener('orientationchange',clear);return()=>{window.removeEventListener('blur',clear);window.removeEventListener('orientationchange',clear);clear();};},[]);
  if(!active)return null;
  const buttons:[string,string][]=[];
  if(!interior)buttons.push(['Space',descent?'THRUST':eva?'UP':flight||rover?'BRAKE':'JUMP']);
  if(!descent)buttons.push(['KeyE',flight?'UP / USE':eva?'REPAIR / USE':rover?'USE / EXIT':'INTERACT']);
  if(!descent){if(!(g.surface==='Mars'&&g.mars.rover.occupied))buttons.push(['ShiftLeft',flight||eva?'BOOST':robot?'FAST DRIVE':'RUN']);buttons.push(['KeyC','CAMERA']);}
  if(flight)buttons.push(['KeyF','HOLD SCAN'],['KeyQ','DOWN'],['KeyZ','ROLL ↶'],['KeyX','ROLL ↷']);
  if(eva)buttons.push(['ControlLeft','DOWN']);
  if(g.surface==='Earth'&&port.phase==='walk')buttons.push(['KeyB','WALK / VIEW'],['KeyV','PORTRAIT']);
  return <div className="touch-controls" key={context} aria-label={tr("Touch game controls")}><LookPad/><div className="touch-bottom"><div className="touch-move"><small><LText>{descent?'ALIGN LANDER':flight?'FLIGHT':rover?'DRIVE':'MOVE'}</LText></small><Stick/></div><div className="touch-buttons"><LText>{buttons.map(([code,label])=><HoldButton key={code} code={code} label={label}/>)}</LText></div></div></div>;
}
