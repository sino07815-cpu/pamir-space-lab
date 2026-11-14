import type { PlanetName } from './store.ts';
import { publicAssetUrl } from './publicAssets.ts';
// Rotation is accelerated for display; axial tilt and polar flattening are retained.
export const planetVisuals:Record<PlanetName,{map:string;tilt:number;dayHours:number;polarRatio:number;atmosphere?:string;roughness:number}>= {
  Mercury:{map:'mercury.jpg',tilt:.034,dayHours:1407.6,polarRatio:1,roughness:.98},
  Venus:{map:'venus.jpg',tilt:177.36,dayHours:5832.5,polarRatio:1,atmosphere:'#f2d5a6',roughness:1},
  Earth:{map:'earth-day.jpg',tilt:23.44,dayHours:23.934,polarRatio:.99665,atmosphere:'#4d9aff',roughness:.85},
  Moon:{map:'moon.jpg',tilt:6.68,dayHours:655.7,polarRatio:1,roughness:.98},
  Mars:{map:'mars.jpg',tilt:25.19,dayHours:24.623,polarRatio:.9941,atmosphere:'#d08a62',roughness:.95},
  Jupiter:{map:'jupiter.jpg',tilt:3.13,dayHours:9.925,polarRatio:.9351,roughness:1},
  Saturn:{map:'saturn.jpg',tilt:26.73,dayHours:10.7,polarRatio:.902,roughness:1},
  Uranus:{map:'uranus.jpg',tilt:97.77,dayHours:17.24,polarRatio:.9771,atmosphere:'#91c5c8',roughness:1},
  Neptune:{map:'neptune.jpg',tilt:28.32,dayHours:16.11,polarRatio:.9829,atmosphere:'#7495b8',roughness:1},
};
export const planetTextureUrl=(name:PlanetName)=>publicAssetUrl('textures/'+planetVisuals[name].map);
export const solarOrder=['Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn','Uranus','Neptune'] as const;
