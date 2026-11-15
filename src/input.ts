import { useEffect } from 'react';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
export const keys=new Set<string>();
const edges=new Set<string>();
export const steering={x:0,y:0};
export function consume(code:string){const found=edges.has(code);edges.delete(code);return found;}
export function resetInput(){keys.clear();edges.clear();steering.x=0;steering.y=0;}
export function useInputs(){
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{const s=useGame.getState();if(!s.started)return;
      if(e.code==='Escape'){if(!e.repeat){s.set({paused:!s.paused});document.exitPointerLock?.();resetInput();}return;}
      if(s.uiBlocked||s.paused||(e.target instanceof Element&&e.target.closest('input,textarea,[contenteditable=true]')))return;
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
      if(!e.repeat){edges.add(e.code);if(e.code==='KeyC')s.set({cockpit:!s.cockpit});if(e.code==='KeyF'&&!s.surface&&useExpedition.getState().mode==='flight')s.scan();}
      keys.add(e.code);
    };
    const up=(e:KeyboardEvent)=>keys.delete(e.code);
    const move=(e:MouseEvent)=>{if(document.pointerLockElement||(e.buttons===1&&(e.target as HTMLElement).tagName==='CANVAS')){steering.x+=e.movementX;steering.y+=e.movementY;}};
    const visibility=()=>{if(document.hidden&&useGame.getState().started){useGame.getState().set({paused:true});resetInput();}};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('mousemove',move);window.addEventListener('blur',resetInput);
    document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('mousemove',move);window.removeEventListener('blur',resetInput);document.removeEventListener('visibilitychange',visibility);resetInput();};
  },[]);
}
