import {LText} from './Locale';
import { useEffect,useState } from 'react';
import { textureStatus } from './planetTextures';
import { useGame } from './store';
export default function PlanetLoading(){
  const [status,setStatus]=useState(textureStatus),surface=useGame(s=>s.surface),blocked=useGame(s=>s.uiBlocked);
  useEffect(()=>{const timer=setInterval(()=>{const next=textureStatus();setStatus(old=>old.pending.join()===next.pending.join()&&old.failed.join()===next.failed.join()?old:next);},200);return()=>clearInterval(timer);},[]);
  if(surface||blocked||!status.pending.length&&!status.failed.length)return null;
  return <div className="planet-loading" role="status"><LText>{status.failed.length?'MAP LOADING FAILED · RELOAD TO RETRY':`LOADING PLANET MAPS · ${status.pending.length} REMAINING`}</LText></div>;
}
