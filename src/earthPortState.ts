import {usePlanetMissions} from './planetMissionStore.ts';
import { create } from 'zustand';
import { PORT_START_RANGE } from './spaceport.ts';
import { useGame } from './store.ts';
import { useExpedition } from './expeditionStore.ts';
export const usePort=create<{phase:'walk'|'launch'|'landing';time:number;range:number;portrait:boolean;speed:number;overview:boolean}>(()=>({phase:'walk',time:0,range:PORT_START_RANGE,portrait:false,speed:0,overview:false}));
export function enterEarthPort(landing=false){const g=useGame.getState(),e=useExpedition.getState();if(e.mode!=='flight'||e.dock!=='free'||g.surface||['approach','descent'].includes(g.mars.stage)||g.moon.stage==='approach')return;usePort.setState({phase:landing?'landing':'walk',time:0,range:PORT_START_RANGE,portrait:false,speed:0,overview:!landing});e.set({navStation:false});g.set({started:true,surface:'Earth',target:'Earth',paused:false,autopilot:false,speed:0,cockpit:false,mars:g.mars.stage==='orbit'?{...g.mars,stage:'space'}:g.mars,notice:'PAMIR EARTH SPACEPORT · Approach ODYSSEY and press E to launch.'});}
export function launchEarth(){const g=useGame.getState();if(g.surface!=='Earth'||g.paused||g.uiBlocked||usePort.getState().phase!=='walk'||usePort.getState().range>6)return;recordDeparture('board');usePort.setState({phase:'launch',time:0,portrait:false,overview:false});g.set({notice:'ODYSSEY LIFTOFF · Earth departure sequence active.'});}

export function finishEarthLaunch(){const g=useGame.getState();if(g.surface!=='Earth'||usePort.getState().phase!=='launch')return;recordDeparture('launch');g.set({surface:null,target:'Earth',flightPosition:[0,0,20],flightRotation:[0,0,0,1],flightReset:g.flightReset+1,speed:0,distance:14,notice:'EARTH ORBIT ESTABLISHED · Select Moon or Mars, then TRAVEL. Land and explore the historic sites.'});usePort.setState({phase:'walk',time:0});}

function recordDeparture(id:string){if(useExpedition.getState().presentation)return;const s=usePlanetMissions.getState(),r=s.records.Earth??{done:[],earned:0};s.set({records:{...s.records,Earth:{...r,done:[...new Set([...r.done,id])]}}});}
