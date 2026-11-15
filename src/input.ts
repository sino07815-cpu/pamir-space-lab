import { useEffect } from 'react';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { pressInput,releaseInput,resetInput,steering } from './inputState';
export { keys,consume,resetInput,steering } from './inputState';
export function pressControl(code:string,source:string){
  const s=useGame.getState();if(!s.started||s.paused||s.uiBlocked)return false;
  const first=pressInput(code,source);
  if(first&&code==='KeyC')s.set({cockpit:!s.cockpit});
  if(first&&code==='KeyF'&&!s.surface&&useExpedition.getState().mode==='flight')s.scan();
  return first;
}
export function useInputs(){
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{const s=useGame.getState();if(!s.started)return;
      if(e.code==='Escape'){if(!e.repeat){s.set({paused:!s.paused});document.exitPointerLock?.();resetInput();}return;}
      if(s.uiBlocked||s.paused||(e.target instanceof Element&&e.target.closest('input,textarea,[contenteditable=true]')))return;
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
      if(!e.repeat)pressControl(e.code,'keyboard:'+e.code);
    };
    const up=(e:KeyboardEvent)=>releaseInput(e.code,'keyboard:'+e.code);
    const move=(e:MouseEvent)=>{if(document.pointerLockElement||(e.buttons===1&&(e.target as HTMLElement).tagName==='CANVAS')){steering.x+=e.movementX;steering.y+=e.movementY;}};
    let look:{id:number;x:number;y:number}|null=null;
    const touchDown=(e:PointerEvent)=>{const s=useGame.getState();if(e.pointerType==='touch'&&e.target instanceof HTMLCanvasElement&&s.started&&!s.uiBlocked&&!s.paused&&!look){look={id:e.pointerId,x:e.clientX,y:e.clientY};e.target.setPointerCapture(e.pointerId);}};
    const touchMove=(e:PointerEvent)=>{if(!look||e.pointerId!==look.id)return;const s=useGame.getState();if(!s.paused&&!s.uiBlocked){steering.x+=Math.max(-100,Math.min(100,e.clientX-look.x));steering.y+=Math.max(-100,Math.min(100,e.clientY-look.y));}look={id:e.pointerId,x:e.clientX,y:e.clientY};};
    const touchEnd=(e:PointerEvent)=>{if(look?.id===e.pointerId)look=null;};
    const clear=()=>{look=null;resetInput();};
    const visibility=()=>{if(document.hidden&&useGame.getState().started){useGame.getState().set({paused:true});clear();}};
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('mousemove',move);window.addEventListener('blur',clear);
    window.addEventListener('pointerdown',touchDown);window.addEventListener('pointermove',touchMove);window.addEventListener('pointerup',touchEnd);window.addEventListener('pointercancel',touchEnd);
    document.addEventListener('visibilitychange',visibility);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('mousemove',move);window.removeEventListener('blur',clear);window.removeEventListener('pointerdown',touchDown);window.removeEventListener('pointermove',touchMove);window.removeEventListener('pointerup',touchEnd);window.removeEventListener('pointercancel',touchEnd);document.removeEventListener('visibilitychange',visibility);clear();};
  },[]);
}
