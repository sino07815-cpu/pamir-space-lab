import { create } from 'zustand';
import type { EarthOrbitId } from './earthOrbits';
export const useEarthOrbit=create<{open:boolean;focus:boolean;selected:EarthOrbitId;tracks:boolean;distance:number;set:(state:Partial<{open:boolean;focus:boolean;selected:EarthOrbitId;tracks:boolean;distance:number}>)=>void}>(set=>({open:false,focus:false,selected:'iss',tracks:false,distance:14,set}));
