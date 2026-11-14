import type { GameState } from './store';
let context:AudioContext|null=null,master:GainNode|null=null,engine:OscillatorNode|null=null,engineGain:GainNode|null=null,wind:AudioBufferSourceNode|null=null,windGain:GainNode|null=null;
let lastStep=0,lastPoints=0,lastStage='',lastVehicle=false;
export async function enableAudio(enabled:boolean,points=0){
  if(!enabled){await closeAudio();return false;}
  lastPoints=points;lastStage='';
  try{if(!context){context=new AudioContext();master=context.createGain();master.gain.value=.5;master.connect(context.destination);engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=50;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=170;engineGain=context.createGain();engineGain.gain.value=0;engine.connect(filter);filter.connect(engineGain);engineGain.connect(master);engine.start();
    const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);let seed=23;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=(seed/2147483647-.5)*.4;}wind=context.createBufferSource();wind.buffer=buffer;wind.loop=true;const windFilter=context.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=650;windGain=context.createGain();windGain.gain.value=0;wind.connect(windFilter);windFilter.connect(windGain);windGain.connect(master);wind.start();}
    await context.resume();return context.state==='running';
  }catch{await closeAudio();return false;}
}
export async function closeAudio(){const old=context;context=null;master=null;engineGain=null;windGain=null;try{engine?.stop();wind?.stop();}catch{/* Nodes may already be stopped by the browser. */}engine=null;wind=null;if(old&&old.state!=='closed')await old.close().catch(()=>{});}
function tone(frequency:number,time:number,duration:number,volume:number,type:OscillatorType='sine'){
  if(!context||!master||context.state!=='running')return;const o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,time);o.frequency.exponentialRampToValueAtTime(Math.max(40,frequency*.65),time+duration);g.gain.setValueAtTime(volume,time);g.gain.exponentialRampToValueAtTime(.001,time+duration);o.connect(g);g.connect(master);o.start(time);o.stop(time+duration+.01);o.onended=()=>{o.disconnect();g.disconnect();};
}
export function updateAudio(game:GameState,orbitalMode:string,storm:boolean,earth?:{phase:string;time:number;speed:number}){
  if(!context||!engineGain||!windGain||!engine)return;const active=game.started&&!game.paused&&!game.uiBlocked,m=game.surface==='Moon'?game.moon:game.mars,now=context.currentTime;
  const earthThrust=game.surface==='Earth'&&earth&&earth.phase!=='walk'?Math.min(1,earth.time/1.3)*.11:0;
  const thrust=earthThrust&&active?earthThrust:active&&orbitalMode==='flight'?(game.surface&&m.stage==='descent'?m.landing.throttle*.07:!game.surface?Math.min(1,game.speed/38)*.035:0):0;engineGain.gain.setTargetAtTime(thrust,now,.12);engine.frequency.setTargetAtTime(45+Math.min(1,game.speed/38)*45,now,.15);
  windGain.gain.setTargetAtTime(active&&game.surface==='Mars'&&m.stage==='eva'?(storm?.04:.009):0,now,.2);
  if(active&&game.surface==='Earth'&&earth?.phase==='walk'&&earth.speed>.3&&now-lastStep>(earth.speed>4?.25:.43)){lastStep=now;tone(145,now,.09,.025,'triangle');}
  if(active&&game.surface&&game.surface!=='Earth'&&m.stage==='eva'&&m.motion.speed>.3&&!m.motion.airborne&&!m.rover.occupied&&now-lastStep>(m.motion.speed>4?.25:.43)){lastStep=now;tone(game.surface==='Moon'?115:165,now,.1,.035,'triangle');}
  if(active&&game.points>lastPoints){if(m.stage==='complete'){[523,659,784,1046].forEach((f,i)=>tone(f,now+i*.12,.2,.045));}else{tone(660,now,.12,.04);tone(880,now+.08,.16,.03);}}
  const stage=game.surface?m.stage:'space';if(active&&lastStage&&stage!==lastStage&&['eva','landed'].includes(stage))tone(340,now,.12,.035,'triangle');
  if(active&&m.rover.occupied!==lastVehicle)tone(260,now,.12,.04,'triangle');lastPoints=game.points;lastStage=stage;lastVehicle=m.rover.occupied;
}
