export type AssistAction='launch'|'mars'|'moon'|'travel'|'orbit'|'land'|'exit'|'interact'|'scan'|'moonland'|'moonexit'|'mooninteract'|null;
interface State{surface:string|null;target:string;distance:number;autopilot:boolean;mars:{stage:string;objectives:string[]};moon:{stage:string;objectives:string[]};samples:string[];visited?:string[];}
export function missionAssist(g:State,port:{phase:string;range:number}){
  const goal=(title:string,instruction:string,step:number,action:AssistAction=null)=>({title,instruction,step,action});
  if(g.surface==='Earth')return port.phase==='walk'?goal('Board your spacecraft',port.range>6?'Follow the access road toward the launch pad. Hold Shift to run.':'Boarding access reached. Press E to begin your ascent.',0,port.range<=6?'launch':null):goal('Earth departure','Ignition, tower release and ascent are in progress. Escape pauses.',1);
  if(g.surface==='Mars'){
    const m=g.mars;if(m.stage==='descent')return goal('Control the descent','Keep lateral speed low and align with the pad. Space controls manual thrust.',3);
    if(m.stage==='failed')return goal('Prepare another approach','Use Retry Landing on the results screen. Keep guidance on for assistance.',3);
    if(m.stage==='landed')return goal('First steps on Mars','Press E to exit. Your suit recharges while aboard.',4,'exit');
    if(m.stage==='complete')return goal('Expedition complete','Review your science results or return to orbit.',5);
    const missing=['A','B','C'].filter(id=>!m.objectives.includes(id));
    return missing.length?goal('Collect geological samples',`${3-missing.length}/3 samples secured. Follow the sample markers and press E within reach.`,4):!m.objectives.includes('research')?goal('Investigate the outcrop','Follow the scientific outcrop marker and press E to scan it.',4):goal('Bring the science home','Return to the ODYSSEY airlock and press E to finish the expedition.',5);
  }
  if(g.surface==='Moon')return g.moon.stage==='landed'?goal('Explore the Moon','Press E to leave the lander. Lunar gravity changes your jump.',4,'moonexit'):g.moon.stage==='descent'?goal('Lunar powered descent','There is no atmospheric braking. Use guidance or Space thrust to slow down.',3):goal('Lunar science expedition',`${g.samples.filter(id=>id.startsWith('Moon-')).length}/3 required samples. Collect with E, then return to the lander.`,4);
  if(g.autopilot)return goal('Interplanetary transfer','Guidance is flying the course. You can cancel transfer to resume manual flight.',2);
  if(g.mars.objectives.includes('complete')&&['Earth','Mars'].includes(g.target))return goal('Red Horizon archived','Continue your expedition with a lunar landing and sample-return survey.',2,'moon');
  if(g.target==='Mars')return g.distance>18?goal('Set course for Mars','Engage transfer guidance, then approach within 18 navigation units.',2,'travel'):g.mars.stage==='orbit'?goal('Landing window open','Begin descent. Automatic guidance is enabled for your first landing.',3,'land'):goal('Establish Mars orbit','You are within arrival range. Enter orbit to open the landing window.',2,'orbit');
  if(g.target==='Moon')return g.distance>18?goal('Visit our nearest neighbour','Engage transfer guidance to approach the Moon.',2,'travel'):goal('Lunar landing window','Begin a powered descent and explore the cratered surface.',3,'moonland');
  if(g.target==='Earth')return goal('Choose your next horizon','Try Operation Red Horizon: travel to Mars, land and return scientific samples.',2,'mars');
  if(g.visited?.includes(g.target))return goal('Survey archived','This world is documented. Choose a new destination or open Mission Control.',2);
  return g.distance<=18?goal('Document this world','Press F to survey the planet. Gas and ice giants support orbital exploration.',2,'scan'):goal('Explore a distant world','Engage transfer guidance. Distances and travel times are compressed for play.',2,'travel');
}
