export const heritageSites = [
  {id:'apollo11',planet:'Moon',name:'Apollo 11 · Eagle descent stage',year:'1969',region:'Mare Tranquillitatis',x:-25,z:-20,radius:3.4,kind:'lander',fact:'The lower stage of Eagle remained on the Moon after the astronauts departed. Lunar Reconnaissance Orbiter photographed the stage and astronaut trails decades later.',source:'https://science.nasa.gov/resource/apollo-11-landing-site/'},
  {id:'apollo17',planet:'Moon',name:'Apollo 17 · Lunar Roving Vehicle',year:'1972',region:'Taurus–Littrow',x:28,z:28,radius:2.5,kind:'buggy',fact:'Apollo 17 astronauts used an electric lunar rover to explore Taurus–Littrow. The rover and its tracks remain at the landing site, documented by Lunar Reconnaissance Orbiter.',source:'https://svs.gsfc.nasa.gov/4302/'},
  {id:'opportunity',planet:'Mars',name:'Opportunity · MER-B',year:'2004–2018',region:'Perseverance Valley · Meridiani Planum',x:-36,z:-24,radius:2.4,kind:'rover',fact:'Opportunity explored Mars for almost fifteen years and travelled more than 45 kilometres. Its final location is Perseverance Valley, where a global dust storm ended communications in 2018.',source:'https://science.nasa.gov/mission/mer-opportunity/'},
  {id:'ingenuity',planet:'Mars',name:'Ingenuity · Mars helicopter',year:'2021–2024',region:'Valinor Hills · Jezero crater',x:37,z:-34,radius:1.6,kind:'helicopter',fact:'Ingenuity demonstrated powered flight in the thin Martian atmosphere. It completed 72 flights before rotor damage ended its flying mission in January 2024; its final airfield is called Valinor Hills.',source:'https://science.nasa.gov/resource/perseverance-spots-ingenuity-at-its-final-airfield/'},
] as const;
export type HeritageId=typeof heritageSites[number]['id'];
export const HERITAGE_REWARD=60;
export function heritageCollision(planet:'Mars'|'Moon',x:number,z:number):[number,number]{
  for(const site of heritageSites){if(site.planet!==planet)continue;const dx=x-site.x,dz=z-site.z,d=Math.hypot(dx,dz),r=site.radius+.4;if(d<r){x=site.x+(d?dx/d:1)*r;z=site.z+(d?dz/d:0)*r;}}
  return [x,z];
}
