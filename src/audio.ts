import { SoundEvents,type SoundCue,type SoundFrame } from './audioScene';
import type { AudioPreferences } from './audioStore';
export const audioDiagnostics={events:{} as Partial<Record<SoundCue,number>>,engine:0,drive:0,environment:0,context:'off',voices:0};
class SoundEngine{
 context:AudioContext;master:GainNode;effects:GainNode;ui:GainNode;music:GainNode;compressor:DynamicsCompressorNode;meter:AnalyserNode;
 engineGain:GainNode;enginePitch:OscillatorNode;driveGain:GainNode;drivePitch:OscillatorNode;windGain:GainNode;noise:AudioBuffer;tracker=new SoundEvents();sources:AudioScheduledSourceNode[]=[];side=1;
 constructor(suppliedContext?:AudioContext){
  const c=this.context=suppliedContext??new AudioContext(),master=this.master=c.createGain();master.gain.value=0;
  this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-17;this.compressor.knee.value=18;this.compressor.ratio.value=5;this.compressor.attack.value=.006;this.compressor.release.value=.18;
  this.effects=c.createGain();this.ui=c.createGain();this.music=c.createGain();this.effects.gain.value=0;this.ui.gain.value=0;this.music.gain.value=0;
  this.effects.connect(this.compressor);this.ui.connect(this.compressor);this.music.connect(this.compressor);this.compressor.connect(master);this.meter=c.createAnalyser();this.meter.fftSize=2048;master.connect(this.meter);this.meter.connect(c.destination);
  this.noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate);const data=this.noise.getChannelData(0);let seed=1847,brown=0;for(let i=0;i<data.length;i++){seed=seed*16807%2147483647;const white=seed/2147483647*2-1;brown=(brown+.025*white)/1.025;data[i]=brown*3.2;}
  const engineFilter=c.createBiquadFilter();engineFilter.type='lowpass';engineFilter.frequency.value=210;
  this.engineGain=c.createGain();this.engineGain.gain.value=0;this.engineGain.connect(this.effects);this.enginePitch=c.createOscillator();this.enginePitch.type='sawtooth';this.enginePitch.frequency.value=42;this.enginePitch.connect(engineFilter);engineFilter.connect(this.engineGain);this.start(this.enginePitch);
  const rumble=c.createBufferSource();rumble.buffer=this.noise;rumble.loop=true;rumble.connect(this.engineGain);this.start(rumble);
  this.driveGain=c.createGain();this.driveGain.gain.value=0;this.driveGain.connect(this.effects);this.drivePitch=c.createOscillator();this.drivePitch.type='triangle';this.drivePitch.frequency.value=90;this.drivePitch.connect(this.driveGain);this.start(this.drivePitch);
  this.windGain=c.createGain();this.windGain.gain.value=0;this.windGain.connect(this.effects);const air=c.createBufferSource();air.buffer=this.noise;air.loop=true;const windFilter=c.createBiquadFilter();windFilter.type='lowpass';windFilter.frequency.value=850;air.connect(windFilter);windFilter.connect(this.windGain);this.start(air);
  for(const [i,f] of [65.406,98,130.813].entries()){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;o.detune.value=i===1?-4:3;g.gain.value=.017;o.connect(g);g.connect(this.music);this.start(o);}
 }
 start(source:AudioScheduledSourceNode){source.start();this.sources.push(source);}
 mix(p:AudioPreferences,enabled:boolean){const t=this.context.currentTime;this.master.gain.cancelScheduledValues(t);if(!enabled||p.muted)this.master.gain.setValueAtTime(0,t);else this.master.gain.setTargetAtTime(p.volume,t,.025);this.ui.gain.setTargetAtTime(p.effects,t,.025);}
 tone(f:number,time:number,duration:number,volume:number,type:OscillatorType='sine',destination:AudioNode=this.effects,end=f*.8){
  const c=this.context,o=c.createOscillator(),gain=c.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,f),time);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),time+duration);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),time+.008);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(gain);gain.connect(destination);audioDiagnostics.voices++;o.onended=()=>{o.disconnect();gain.disconnect();audioDiagnostics.voices=Math.max(0,audioDiagnostics.voices-1);};o.start(time);o.stop(time+duration+.02);
 }
 hiss(time:number,duration:number,volume:number,frequency:number,destination:AudioNode=this.effects){const c=this.context,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=this.noise;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;gain.gain.setValueAtTime(volume,time);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(filter);filter.connect(gain);gain.connect(destination);audioDiagnostics.voices++;source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();audioDiagnostics.voices=Math.max(0,audioDiagnostics.voices-1);};source.start(time);source.stop(time+duration+.01);}
 play(cue:SoundCue,preview=false,kind:SoundFrame['stepKind']='suit',at=this.context.currentTime){
  if(this.context.state!=='running'&&!(typeof OfflineAudioContext!=='undefined'&&this.context instanceof OfflineAudioContext))return;audioDiagnostics.events[cue]=(audioDiagnostics.events[cue]??0)+1;const t=Math.max(at,this.context.currentTime),bus=preview||cue==='ui'||cue==='enabled'?this.ui:this.effects;
  const tone=(f:number,delay:number,duration:number,volume=.075,type:OscillatorType='sine',end=f*.85)=>this.tone(f,t+delay,duration,volume,type,bus,end);
  const hiss=(duration:number,volume:number,f:number,delay=0)=>this.hiss(t+delay,duration,volume,f,bus);
  switch(cue){
   case 'ui':tone(940,0,.045,.035,'sine',1220);break;
   case 'enabled':[392,523,784].forEach((f,i)=>tone(f,i*.085,.22,.06));break;
   case 'engine':case 'ignition':tone(32,0,1.3,.15,'triangle',95);tone(60,.12,1,.08,'sawtooth',45);hiss(1.4,.5,180);hiss(.8,.12,1200,.3);break;
   case 'touchdown':hiss(.22,.4,180);tone(75,0,.25,.14,'triangle',40);[440,554].forEach((f,i)=>tone(f,.23+i*.09,.14,.055));break;
   case 'failure':tone(195,0,.55,.1,'triangle',65);hiss(.4,.2,290);break;
   case 'step':this.side*=-1;hiss(kind==='earth'?.09:.12,kind==='earth'?.35:.24,kind==='metal'?700:kind==='earth'?470:260);tone(kind==='metal'?210:kind==='earth'?120:90,0,.1,.065,'triangle',55);break;
   case 'jump':hiss(.17,.17,650);tone(140,0,.18,.035,'sine',210);break;
   case 'airlock':hiss(.45,.2,1100);tone(160,.15,.12,.065,'triangle');tone(240,.32,.1,.05,'triangle');break;
   case 'rover':tone(120,0,.45,.075,'triangle',270);tone(640,.27,.1,.04);break;
   case 'sample':[660,880,1320].forEach((f,i)=>tone(f,i*.075,.19,.065));hiss(.12,.06,1400);break;
   case 'science':case 'repair':[523,784].forEach((f,i)=>tone(f,i*.1,.21,.065));break;
   case 'scan':tone(480,0,.4,.055,'sine',1500);tone(1100,.35,.11,.04);break;
   case 'probe':hiss(.28,.22,500);tone(100,0,.3,.09,'triangle',60);tone(780,.23,.17,.055);break;
   case 'data':[880,1100,1320,990].forEach((f,i)=>tone(f,i*.055,.07,.04));break;
   case 'dock':hiss(.18,.25,210);tone(90,0,.16,.1,'triangle',45);tone(125,.2,.13,.08,'triangle',60);tone(660,.4,.16,.04);break;
   case 'mission':[523,659,784,1046,1318].forEach((f,i)=>tone(f,i*.13,.36,.085));tone(261,0,1,.055,'sine',261);break;
   case 'alarm':[0,.28,.56].forEach((delay,i)=>tone(i%2?880:1174,delay,.15,.075,'triangle',i%2?880:1174));break;
  }
 }
 update(frame:SoundFrame,p:AudioPreferences){const t=this.context.currentTime,active=frame.active;this.effects.gain.setTargetAtTime(active?p.effects:0,t,.035);this.music.gain.setTargetAtTime((active||frame.menu)?p.music:0,t,.08);const thrust=active?frame.thrust*.16:0,drive=active&&(frame.vehicle==='rover'||frame.vehicle==='robot')?Math.min(1,frame.speed/6)*.07:0,wind=active?frame.wind*.3:0;this.engineGain.gain.setTargetAtTime(thrust,t,.12);this.enginePitch.frequency.setTargetAtTime(38+frame.thrust*60,t,.1);this.driveGain.gain.setTargetAtTime(drive,t,.1);this.drivePitch.frequency.setTargetAtTime(75+frame.speed*28,t,.1);this.windGain.gain.setTargetAtTime(wind,t,.2);audioDiagnostics.engine=thrust;audioDiagnostics.drive=drive;audioDiagnostics.environment=wind;for(const cue of this.tracker.update(frame,t))this.play(cue,false,frame.stepKind);}
 async close(){for(const source of this.sources)try{source.stop();}catch{}if(this.context.state!=='closed')await this.context.close().catch(()=>{});}
}
let engine:SoundEngine|null=null,operation=0;
export async function enableAudio(enabled:boolean,initial?:SoundFrame){if(!enabled){await closeAudio();return false;}const ticket=++operation;try{if(!engine)engine=new SoundEngine();const current=engine;let timeout:ReturnType<typeof setTimeout>|undefined;const resumed=await Promise.race([current.context.resume().then(()=>true),new Promise<boolean>(resolve=>{timeout=setTimeout(()=>resolve(false),2500);})]);if(timeout)clearTimeout(timeout);if(ticket!==operation)return false;if(!resumed){await closeAudio();audioDiagnostics.context='blocked';return false;}if(initial)current.tracker.reset(initial);audioDiagnostics.context=current.context.state;return current.context.state==='running';}catch{await closeAudio();audioDiagnostics.context='blocked';return false;}}
export async function closeAudio(){operation++;const old=engine;engine=null;audioDiagnostics.context='off';audioDiagnostics.engine=audioDiagnostics.drive=audioDiagnostics.environment=0;audioDiagnostics.voices=0;if(old)await old.close();}
export function setAudioMix(p:AudioPreferences,enabled:boolean){engine?.mix(p,enabled);}
export function playSound(cue:SoundCue,preview=false){engine?.play(cue,preview);}
export function updateAudio(frame:SoundFrame,p:AudioPreferences){engine?.update(frame,p);}
export function audioMeter(){if(!engine)return{state:'off',rms:0,peak:0};const data=new Float32Array(engine.meter.fftSize);engine.meter.getFloatTimeDomainData(data);let sum=0,peak=0;for(const v of data){sum+=v*v;peak=Math.max(peak,Math.abs(v));}return{state:engine.context.state,rms:Math.sqrt(sum/data.length),peak,time:engine.context.currentTime,master:engine.master.gain.value,music:engine.music.gain.value,effects:engine.effects.gain.value,ui:engine.ui.gain.value};}
export function recordGameAudio(){if(!engine||engine.context.state!=='running')throw Error('Enable audio before recording');const destination=engine.context.createMediaStreamDestination(),meter=engine.meter;meter.connect(destination);const recorder=new MediaRecorder(destination.stream),chunks:BlobPart[]=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start();return{stop:()=>new Promise<Blob>(resolve=>{recorder.onstop=()=>{meter.disconnect(destination);destination.stream.getTracks().forEach(track=>track.stop());resolve(new Blob(chunks,{type:recorder.mimeType}));};recorder.stop();})};}
// Reuses the game's synthesizer for the existing cut 30-second submission montage.
export function recordShowcaseAudio(){
 if(!engine)throw Error('Enable audio first');const current=engine,recording=recordGameAudio(),start=current.context.currentTime+.08;
 const timeline:[number,SoundCue][]=[[0,'enabled'],[3.1,'ui'],[5.1,'airlock'],[5.8,'step'],[6.3,'step'],[6.8,'step'],[8,'ignition'],[9.3,'engine'],[11,'engine'],[12.5,'scan'],[14,'engine'],[15.3,'engine'],[17.9,'touchdown'],[18.2,'airlock'],[18.8,'step'],[19.3,'step'],[19.8,'step'],[20.3,'step'],[20.8,'step'],[21.3,'step'],[22.1,'ui'],[25.1,'ui'],[25.4,'data'],[27.2,'ui'],[28.2,'ui']];
 for(const [at,cue] of timeline)current.play(cue,true,at<8?'earth':'suit',start+at);return recording;
}
export async function renderSoundDemo(showcase=false){
 const rate=48000,duration=30,context=new OfflineAudioContext(2,rate*duration,rate),scene=new SoundEngine(context as unknown as AudioContext);
 scene.mix({volume:.65,effects:.85,music:showcase?.25:0,muted:false},true);scene.ui.gain.setValueAtTime(.85,0);scene.music.gain.setValueAtTime(showcase?.25:0,0);
 const all:SoundCue[]=['ui','enabled','engine','ignition','touchdown','failure','step','jump','airlock','rover','sample','science','scan','probe','data','dock','repair','mission','alarm'];
 const timeline:[number,SoundCue][]=showcase?[[0,'enabled'],[3.1,'ui'],[5.1,'airlock'],[5.8,'step'],[6.3,'step'],[6.8,'step'],[8,'ignition'],[9.3,'engine'],[11,'engine'],[12.5,'scan'],[14,'engine'],[15.3,'engine'],[17.9,'touchdown'],[18.2,'airlock'],[18.8,'step'],[19.3,'step'],[19.8,'step'],[20.3,'step'],[20.8,'step'],[21.3,'step'],[22.1,'ui'],[25.1,'ui'],[25.4,'data'],[27.2,'ui'],[28.2,'ui']]:all.map((cue,i)=>[i*1.5,cue]);
 for(const [at,cue] of timeline)scene.play(cue,true,at<8&&showcase?'earth':'suit',at);
 const audio=await context.startRendering(),channel=audio.getChannelData(0),stats=timeline.map(([at,cue])=>{const start=Math.floor(at*rate),end=Math.min(channel.length,start+Math.floor(1.35*rate));let sum=0,peak=0;for(let i=start;i<end;i++){sum+=channel[i]**2;peak=Math.max(peak,Math.abs(channel[i]));}return{cue,rms:Math.sqrt(sum/Math.max(1,end-start)),peak};});
 const bytes=new ArrayBuffer(44+audio.length*4),view=new DataView(bytes),text=(offset:number,value:string)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};text(0,'RIFF');view.setUint32(4,bytes.byteLength-8,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,rate,true);view.setUint32(28,rate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,audio.length*4,true);let offset=44;for(let i=0;i<audio.length;i++)for(let c=0;c<2;c++){const sample=Math.max(-1,Math.min(1,audio.getChannelData(c)[i]));view.setInt16(offset,Math.round(sample*(sample<0?32768:32767)),true);offset+=2;}
 return{wav:bytes,stats,duration};
}
