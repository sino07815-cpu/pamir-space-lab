// Navigation/save coordinates stay stable; orbital rendering uses a larger world
// while the spacecraft stays human-sized. Surface scenes use metres separately.
export const ORBITAL_SCALE=12;
export const orbitalPoint=(p:readonly number[])=>p.map(v=>v*ORBITAL_SCALE) as [number,number,number];

export function transferSpeed(distance:number,radius:number){return Math.max(0,Math.min(180,Math.max(12,(distance-radius)*.16),(distance-radius-7)*1.3));}
