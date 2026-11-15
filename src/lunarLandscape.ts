// Artistic lunar geology in compressed game metres, not a real landing-site map.
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const fade=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
export function lunarNoise(x:number,z:number){
  const ix=Math.floor(x),iz=Math.floor(z),u=fade(x-ix),v=fade(z-iz);
  const hash=(a:number,b:number)=>{const n=Math.sin(a*127.1+b*311.7+43.2)*43758.5453;return n-Math.floor(n);};
  return (hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;
}
export const lunarCraters=[{x:28,z:-30,r:13,d:3},{x:-32,z:20,r:11,d:2},{x:58,z:-14,r:19,d:3.4},{x:-58,z:-46,r:24,d:4.8},{x:76,z:58,r:18,d:3.1},{x:-83,z:72,r:27,d:5},...Array.from({length:26},(_,i)=>{const a=i*2.399963,r=180+(i%8)*66;return{x:Math.cos(a)*r,z:Math.sin(a)*r,r:16+(i%7)*7,d:3+(i%5)*1.2};})];
export function lunarCraterHeight(x:number,z:number){let h=0;for(const c of lunarCraters){const t=Math.hypot(x-c.x,z-c.z)/c.r;if(t>1.6)continue;const bowl=t<1?-c.d*(1-t*t)**2:0;const rim=c.d*.24*Math.exp(-(((t-1)/.17)**2));h+=bowl+rim;}return h;}
export function lunarHeight(x:number,z:number){
  const flat=fade((Math.hypot(x,z-13)-7)/11);
  const hills=Math.sin(x*.055)*Math.cos(z*.047)*1.1;
  return (hills+lunarCraterHeight(x,z)+(lunarNoise(x*.13,z*.13)-.5)*.22)*flat;
}
export function lunarScenicHeight(x:number,z:number){const r=Math.hypot(x,z),blend=fade((r-160)/220),ridge=(1-Math.abs(lunarNoise(x*.009,z*.009)*2-1))**2;
  return lunarHeight(x,z)+blend*(ridge*36+(lunarNoise(x*.024,z*.024)-.5)*9-r*r/18000);
}
export const lunarEarth={position:[640,230,-1200] as [number,number,number],radius:14};
