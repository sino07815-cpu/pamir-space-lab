export const PORT_SPAWN=[14,0,55] as const;
export const PORT_BOARDING=[4.8,3] as const;
export const PORT_START_RANGE=Math.hypot(PORT_SPAWN[0]-PORT_BOARDING[0],PORT_SPAWN[2]-PORT_BOARDING[1]);
export const PORT_OBSTACLES=[
  {x:0,z:-11,w:3.2,d:6.2},
  {x:9,z:-5,w:2.2,d:2.2},
  {x:-29,z:-19,w:11.5,d:13},
  {x:31,z:-8,w:10,d:13},{x:31,z:7,w:3.7,d:2},
  {x:-18,z:-37,w:3,d:3},{x:-25,z:-38,w:3,d:3},{x:-32,z:-38,w:3,d:3},
  {x:29,z:24,w:1.7,d:3.2},{x:36,z:24,w:1.7,d:3.2},
] as const;
export function spaceportHeight(x:number,z:number){const t=Math.max(0,Math.min(1,(11-Math.hypot(x,z))/2));return .55*t*t*(3-2*t);}
export function resolveSpaceport(x:number,z:number,oldX=x,oldZ=z):[number,number]{
  if(!Number.isFinite(x)||!Number.isFinite(z))return [oldX,oldZ];
  x=Math.max(-69,Math.min(69,x));z=Math.max(-64,Math.min(69,z));
  const free=(px:number,pz:number)=>px>=-69&&px<=69&&pz>=-64&&pz<=69&&Math.hypot(px,pz)>=3.3999&&!PORT_OBSTACLES.some(b=>Math.abs(px-b.x)<b.w+.35&&Math.abs(pz-b.z)<b.d+.35);
  const r=Math.hypot(x,z);if(r<3.4){x=(r?x/r:1)*3.4001;z=(r?z/r:0)*3.4001;}
  if(free(x,z))return [x,z];
  if(free(x,oldZ))return [x,oldZ];if(free(oldX,z))return [oldX,z];
  const candidates:[number,number][]=[];
  for(const b of PORT_OBSTACLES){const w=b.w+.3501,d=b.d+.3501;candidates.push([b.x-w,z],[b.x+w,z],[x,b.z-d],[x,b.z+d]);}
  const best=candidates.filter(([cx,cz])=>free(cx,cz)).sort((a,b)=>Math.hypot(a[0]-x,a[1]-z)-Math.hypot(b[0]-x,b[1]-z))[0];
  return best??[oldX,oldZ];
}
export const boardingDistance=(x:number,z:number)=>Math.hypot(x-PORT_BOARDING[0],z-PORT_BOARDING[1]);
export function launchAltitude(time:number){return Math.max(0,time-1.7)**2*1.8;}
