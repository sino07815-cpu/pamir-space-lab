import {LText,tr} from './Locale';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AudioLines,SlidersHorizontal,Volume2,VolumeX,X } from 'lucide-react';
import { useAudio } from './audioStore';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { usePort } from './earthPortState';
import { usePlanetMissions } from './planetMissionStore';
import { keys } from './input';
import { soundFrame,type SoundCue } from './audioScene';
import { enableAudio,closeAudio,setAudioMix,updateAudio,playSound } from './audio';
import './audio.css';
export const currentSoundFrame=()=>{const frame=soundFrame(useGame.getState(),useExpedition.getState(),usePort.getState(),usePlanetMissions.getState(),keys);if(document.hidden){frame.active=false;frame.menu=false;}return frame;};
let arming:Promise<boolean>|null=null;
export function armSound(){
 if(arming)return arming;useAudio.getState().set({status:'starting'});
 arming=enableAudio(true,currentSoundFrame()).then(enabled=>{const p=useAudio.getState();p.set({enabled,muted:!enabled,status:enabled?'ready':'blocked'});setAudioMix(useAudio.getState(),enabled);if(enabled){updateAudio(currentSoundFrame(),useAudio.getState());playSound('enabled',true);}return enabled;}).finally(()=>{arming=null;});return arming;
}
export function muteSound(){useAudio.getState().set({enabled:false,muted:true,status:'off'});setAudioMix(useAudio.getState(),false);void closeAudio();}
export function AudioController(){
 const p=useAudio();
 useEffect(()=>{setAudioMix(p,p.enabled);},[p.volume,p.effects,p.music,p.enabled,p.muted]);
 useEffect(()=>{if(!p.enabled)return;const tick=()=>updateAudio(currentSoundFrame(),useAudio.getState());tick();const timer=setInterval(tick,80);const unsubscribe=useGame.subscribe(state=>{if(state.paused||state.uiBlocked||!state.started)tick();});document.addEventListener('visibilitychange',tick);return()=>{clearInterval(timer);unsubscribe();document.removeEventListener('visibilitychange',tick);};},[p.enabled]);
 useEffect(()=>{const click=(event:MouseEvent)=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const state=useAudio.getState();if(state.enabled&&target.closest('button'))playSound('ui',true);if(!state.enabled&&!state.muted&&target.closest('.hero-actions .primary,.hero-demo,.demo-launch,.presentation-launch .primary,.judge-routes button,.planet-expedition-links button,.modal .primary'))void armSound();};document.addEventListener('click',click,true);return()=>document.removeEventListener('click',click,true);},[]);
 useEffect(()=>()=>{void closeAudio();},[]);return null;
}
export function AudioStartButton(){const p=useAudio();return <button className={'audio-start '+(p.enabled?'audio-ready':'')} disabled={p.status==='starting'} onClick={()=>p.enabled?p.set({open:true}):void armSound()}><AudioLines size={13}/><LText>{p.status==='starting'?'STARTING AUDIO…':p.enabled?'SOUND ON · MIXER':'ENABLE SOUND'}</LText></button>;}
export function AudioMixerButton(){return <button className="audio-mixer-link" onClick={()=>useAudio.getState().set({open:true})}><LText>{"SOUND SETTINGS ↗"}</LText></button>;}
function AudioPanel(){
 const p=useAudio();useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.code==='Escape'){event.preventDefault();event.stopPropagation();useAudio.getState().set({open:false});}};document.addEventListener('keydown',escape,true);return()=>document.removeEventListener('keydown',escape,true);},[]);
 const preview=async(cue:SoundCue)=>{if(!useAudio.getState().enabled&&!await armSound())return;playSound(cue,true);};
 return createPortal(<div className="audio-backdrop"><section className="audio-panel" role="dialog" aria-modal="true" aria-label={tr("Sound settings")}><button className="close-button" aria-label={tr("Close sound settings")} onClick={()=>p.set({open:false})}><X size={19}/></button><div className="eyebrow"><LText>{"PAMIR / SOUND DESIGN"}</LText></div><h2><LText>{"Hear the expedition."}</LText></h2><p><LText>{"Engine layers, suit footsteps and scientific instruments, with an original ambient score."}</LText></p><div className="audio-status" role="status"><LText>{p.status==='ready'?'AUDIO SYSTEM ONLINE':p.status==='blocked'?'Browser audio did not start. Click Enable Sound to retry.':p.status==='starting'?'STARTING AUDIO…':'SOUND IS OFF'}</LText><button disabled={p.status==='starting'} onClick={()=>p.enabled?muteSound():void armSound()}><LText>{p.enabled?'MUTE ALL':'ENABLE SOUND'}</LText></button></div>
 <LText>{([['volume','MASTER VOLUME'],['effects','EFFECTS & INTERFACE'],['music','AMBIENT MUSIC']] as const).map(([key,label])=><label className="audio-slider" key={key}><span><LText>{label}</LText><b><LText>{Math.round(p[key]*100)}</LText><LText>{"%"}</LText></b></span><input type="range" min="0" max="100" value={Math.round(p[key]*100)} aria-label={tr(label)} onChange={event=>p.set({[key]:event.target.valueAsNumber/100})}/></label>)}</LText>
 <h3><LText>{"TEST THE SOUND"}</LText></h3><div className="audio-preview-grid"><LText>{([['engine','ROCKET ENGINE'],['touchdown','SAFE LANDING'],['step','SUIT FOOTSTEP'],['rover','ROVER DRIVE'],['sample','SAMPLE SECURED'],['probe','PROBE DEPLOYMENT'],['alarm','SUIT ALERT'],['mission','MISSION COMPLETE']] as const).map(([cue,label])=><button key={cue} disabled={p.status==='starting'} onClick={()=>void preview(cue)}><Volume2 size={13}/><LText>{label}</LText></button>)}</LText></div><small><LText>{"Mute and mix preferences stay on this browser. Spaceflight and robotic sounds are cockpit / telemetry sonification, rather than sound travelling through a vacuum. Gameplay loops pause with dashboards and menus; test buttons remain audible."}</LText></small><button className="primary" onClick={()=>p.set({open:false})}><LText>{"RETURN TO EXPEDITION ↗"}</LText></button></section></div>,document.body);
}
export default function AudioControls(){const p=useAudio();return <><button onClick={()=>p.enabled?muteSound():void armSound()} disabled={p.status==='starting'} title={tr(p.enabled?'Mute all audio':'Enable game audio')} aria-label={tr(p.enabled?'Mute game audio':'Enable game audio')} className={p.enabled?'active-icon':''}><LText>{p.enabled?<Volume2 size={16}/>:<VolumeX size={16}/>}</LText></button><button title={tr("Sound settings")} aria-label={tr("Sound settings")} onClick={()=>p.set({open:true})}><SlidersHorizontal size={16}/></button>{p.open&&<AudioPanel/>}</>;}
