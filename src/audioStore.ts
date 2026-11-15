import { create } from 'zustand';
import { persist,createJSONStorage } from 'zustand/middleware';
export interface AudioPreferences{volume:number;effects:number;music:number;muted:boolean;}
interface AudioState extends AudioPreferences{enabled:boolean;open:boolean;status:'off'|'starting'|'ready'|'blocked';set:(value:Partial<Omit<AudioState,'set'>>)=>void;}
const safeStorage={getItem:(k:string)=>{try{return typeof localStorage==='undefined'?null:localStorage.getItem(k);}catch{return null;}},setItem:(k:string,v:string)=>{try{if(typeof localStorage!=='undefined')localStorage.setItem(k,v);}catch{}},removeItem:(k:string)=>{try{if(typeof localStorage!=='undefined')localStorage.removeItem(k);}catch{}}};
const level=(n:unknown,fallback:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(1,n)):fallback;
export const useAudio=create<AudioState>()(persist(set=>({volume:.65,effects:.85,music:.25,muted:false,enabled:false,open:false,status:'off',set:value=>set(value)}),{name:'pamir-audio-v1',storage:createJSONStorage(()=>safeStorage),partialize:s=>({volume:s.volume,effects:s.effects,music:s.music,muted:s.muted}),merge:(saved,current)=>{const s=saved as Partial<AudioPreferences>|undefined;return{...current,volume:level(s?.volume,current.volume),effects:level(s?.effects,current.effects),music:level(s?.music,current.music),muted:s?.muted===true};}}));
