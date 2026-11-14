export const EARTH_RADIUS=6;
export const ORBIT_TIME_SCALE=60;
export const earthOrbitObjects=[
  {id:'iss',name:'International Space Station',short:'ISS',kind:'station',altitudeKm:400,inclination:51.6,radius:9.2,node:.3,phase:.7,scale:.055,role:'An inhabited orbital laboratory supporting microgravity research and international crews.',source:'https://www.nasa.gov/international-space-station/'},
  {id:'hubble',name:'Hubble Space Telescope',short:'HUBBLE',kind:'telescope',altitudeKm:500,inclination:28.5,radius:10.8,node:1.5,phase:2.1,scale:.075,role:'An Earth-orbiting telescope studying stars, galaxies and the expansion of the universe. Its actual altitude changes over time.',source:'https://science.nasa.gov/mission/hubble/observatory/'},
  {id:'landsat9',name:'Landsat 9',short:'LANDSAT 9',kind:'earth',altitudeKm:705,inclination:98.2,radius:12.5,node:2.8,phase:3.8,scale:.075,role:'A NASA/USGS Earth-observation mission mapping land cover, agriculture, water and changes to our planet.',source:'https://science.nasa.gov/mission/landsat-9/'},
  {id:'sentinel6b',name:'Copernicus Sentinel-6B',short:'SENTINEL-6B',kind:'ocean',altitudeKm:1336,inclination:66,radius:14.2,node:4.1,phase:5,scale:.075,role:'Launched in November 2025, this NASA/ESA-partner mission measures sea-surface height and helps maintain the long-term ocean record.',source:'https://science.nasa.gov/mission/sentinel-6b/'},
] as const;
export type EarthOrbitId=typeof earthOrbitObjects[number]['id'];
export interface OrbitParameters{radius:number;inclination:number;node:number;phase:number;altitudeKm:number;}
export function orbitPeriod(altitudeKm:number){return 2*Math.PI*Math.sqrt((6371+altitudeKm)**3/398600.4418);}
export function orbitPosition(orbit:OrbitParameters,time:number):[number,number,number]{
  const a=orbit.phase+time*ORBIT_TIME_SCALE*2*Math.PI/orbitPeriod(orbit.altitudeKm),inclination=orbit.inclination*Math.PI/180;
  const x=orbit.radius*Math.cos(a),z=orbit.radius*Math.sin(a),y=-z*Math.sin(inclination),zi=z*Math.cos(inclination);
  const xn=x*Math.cos(orbit.node)+zi*Math.sin(orbit.node),zn=-x*Math.sin(orbit.node)+zi*Math.cos(orbit.node),tilt=23.44*Math.PI/180;
  return [xn,y*Math.cos(tilt)-zn*Math.sin(tilt),y*Math.sin(tilt)+zn*Math.cos(tilt)];
}
export const representativeSatellites=Array.from({length:16},(_,i)=>({radius:i<6?21.5:10.3,inclination:i<6?55:53,node:(i%3)*Math.PI/3,phase:i*2.399,altitudeKm:i<6?20200:550,kind:i<6?'navigation':'communications'}));
