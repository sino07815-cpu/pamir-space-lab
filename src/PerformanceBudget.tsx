import { useEffect,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from './store';
export default function PerformanceBudget({scale,onScale}:{scale:number;onScale:(value:number)=>void}){
  const started=useGame(s=>s.started),surface=useGame(s=>s.surface),timing=useRef({warmup:0,time:0,frames:0,stable:0});
  useEffect(()=>{timing.current={warmup:0,time:0,frames:0,stable:0};onScale(1);},[started,surface,onScale]);
  useFrame((_,delta)=>{const g=useGame.getState(),t=timing.current;if(!g.started||g.paused||g.uiBlocked||document.hidden||delta>1){t.time=0;t.frames=0;return;}t.warmup+=delta;if(t.warmup<8)return;t.time+=delta;t.frames++;if(t.time<2)return;const fps=t.frames/t.time;t.time=0;t.frames=0;if(fps<26){t.stable=0;if(scale>.72)onScale(Math.max(.72,Math.round((scale-.1)*100)/100));}else if(fps>55){t.stable+=2;if(t.stable>=12&&scale<1){onScale(Math.min(1,Math.round((scale+.05)*100)/100));t.stable=0;}}else t.stable=0;});return null;
}
