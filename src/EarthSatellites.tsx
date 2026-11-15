import {LText,tr} from './Locale';
import { useEffect,useMemo,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { earthOrbitObjects,representativeSatellites,orbitPosition,orbitPeriod,EARTH_RADIUS,type EarthOrbitId } from './earthOrbits';
import { useEarthOrbit } from './earthOrbitStore';
import { useGame } from './store';
import { useExpedition } from './expeditionStore';
import { ORBITAL_SCALE } from './orbitalScale';
import { steering,keys,resetInput } from './input';

function solarMap(){const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,grid=x%16<1||y%8<1;data[i]=grid?139:23;data[i+1]=grid?156:54;data[i+2]=grid?164:89;data[i+3]=255;}const map=new THREE.DataTexture(data,size,size);map.colorSpace=THREE.SRGBColorSpace;map.needsUpdate=true;return map;}
function Panels({map,x=2,width=2,height=3}:{map:THREE.Texture;x?:number;width?:number;height?:number}){return <>{[-1,1].map(side=><group key={side}><mesh position={[side*x,0,0]}><boxGeometry args={[width,.045,height]}/><meshStandardMaterial map={map} metalness={.45} roughness={.55}/></mesh><mesh position={[side*x*.5,0,0]}><boxGeometry args={[x,.07,.06]}/><meshStandardMaterial color="#aebbc0"/></mesh></group>)}</>;}
function SatelliteModel({kind,map}:{kind:string;map:THREE.Texture}){
  if(kind==='station')return <group>
    <mesh><boxGeometry args={[9,.16,.22]}/><meshStandardMaterial color="#b8c1bf" metalness={.5}/></mesh>
    {[-1.7,0,1.7].map(z=><mesh key={z} position={[0,.1,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.43,.43,1.8,14]}/><meshStandardMaterial color="#d0d4cc" metalness={.35}/></mesh>)}
    {[-3.5,-1.7,1.7,3.5].map(x=><group key={x} position={[x,0,0]}>{[-1,1].map(z=><mesh key={z} position={[0,0,z*1.6]}><boxGeometry args={[1.15,.035,2.7]}/><meshStandardMaterial map={map} color="#bfa77d" metalness={.45}/></mesh>)}</group>)}
    <mesh position={[.7,-.35,.2]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.28,.28,1.3,12]}/><meshStandardMaterial color="#c9d0cb"/></mesh><mesh position={[0,.55,-1.3]}><boxGeometry args={[.6,.35,.6]}/><meshStandardMaterial color="#e7e3d4"/></mesh>
  </group>;
  if(kind==='telescope')return <group>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.6,.6,3,20]}/><meshStandardMaterial color="#bdc4c7" metalness={.8} roughness={.3}/></mesh>
    <mesh position={[0,0,-1.51]}><circleGeometry args={[.52,24]}/><meshStandardMaterial color="#080f18" roughness={.4}/></mesh><mesh position={[0,0,-1.55]}><torusGeometry args={[.59,.045,8,32]}/><meshStandardMaterial color="#c4cdcd" metalness={.7}/></mesh>
    <Panels map={map} x={1.8} width={2.3} height={1.5}/><mesh position={[.7,.8,.6]} rotation={[.6,0,-.4]}><coneGeometry args={[.4,.15,20,1,true]}/><meshStandardMaterial color="#deddd4" side={THREE.DoubleSide}/></mesh>
  </group>;
  return <group><mesh position={[0,.1,0]}><boxGeometry args={[1.2,1.3,1.3]}/><meshStandardMaterial color="#c3a568" metalness={.6} roughness={.5}/></mesh>
    {kind==='ocean'?<><mesh position={[0,1,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[.85,.6,4]}/><meshStandardMaterial color="#aebac3"/></mesh><Panels map={map} x={1.5} width={1.6} height={1.8}/></>:<><mesh position={[2.1,.1,0]}><boxGeometry args={[3,.04,1.8]}/><meshStandardMaterial map={map} metalness={.4}/></mesh><mesh position={[.1,1,0]}><boxGeometry args={[.8,.7,.8]}/><meshStandardMaterial color="#d0d5ce"/></mesh></>}
    <mesh position={[0,-.8,.3]}><cylinderGeometry args={[.3,.18,.22,12]}/><meshStandardMaterial color="#a4afad"/></mesh><mesh position={[-.5,1.2,-.4]}><cylinderGeometry args={[.018,.018,1.1,6]}/><meshStandardMaterial color="#d1d8d6"/></mesh>
  </group>;
}

export function inspectOrbit(id:EarthOrbitId){const g=useGame.getState(),e=useExpedition.getState();if(!g.started||g.surface||g.paused||g.uiBlocked||e.mode!=='flight'||e.dock!=='free'||e.presentation||g.mars.stage==='approach'||g.moon.stage==='approach')return;g.set({autopilot:false,speed:0});e.set({navStation:false});useEarthOrbit.getState().set({selected:id,focus:true,open:true});resetInput();}
export default function EarthSatellites(){
  const labels=useRef<(THREE.Sprite|null)[]>([]),models=useRef<(THREE.Group|null)[]>([]),bodies=useRef<THREE.InstancedMesh>(null),panels=useRef<THREE.InstancedMesh>(null),inspectionLight=useRef<THREE.PointLight>(null),time=useRef(useGame.getState().elapsed),view=useRef({yaw:.4,pitch:.25});
  const map=useMemo(solarMap,[]),dummy=useMemo(()=>new THREE.Object3D(),[]),camera=useThree(s=>s.camera),mode=useExpedition(s=>s.mode),open=useEarthOrbit(s=>s.open),focus=useEarthOrbit(s=>s.focus),tracks=useEarthOrbit(s=>s.tracks);
  const labelMaps=useMemo(()=>earthOrbitObjects.map(orbit=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d')!;c.fillStyle='#081821e8';c.fillRect(0,0,512,96);c.strokeStyle='#9bc6ca77';c.lineWidth=2;c.strokeRect(1,1,510,94);c.fillStyle='#cce4e7';c.font='36px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(orbit.short,256,48);const result=new THREE.CanvasTexture(canvas);result.colorSpace=THREE.SRGBColorSpace;return result;}),[]);
  const height=useThree(s=>s.size.height);
  const paths=useMemo(()=>earthOrbitObjects.map(orbit=>new THREE.BufferGeometry().setFromPoints(Array.from({length:160},(_,i)=>new THREE.Vector3(...orbitPosition(orbit,i/160*orbitPeriod(orbit.altitudeKm)/60))))),[]);
  useEffect(()=>()=>{map.dispose();paths.forEach(p=>p.dispose());labelMaps.forEach(p=>p.dispose());},[map,paths,labelMaps]);
  useEffect(()=>{view.current={yaw:.4,pitch:.25};},[focus]);
  useFrame((_,delta)=>{const g=useGame.getState(),e=useExpedition.getState(),o=useEarthOrbit.getState();if(g.paused||g.uiBlocked||!g.started)return;const dt=Math.min(.1,delta);time.current+=dt;
    earthOrbitObjects.forEach((orbit,i)=>{const p=orbitPosition(orbit,time.current),node=models.current[i];if(node){node.position.set(...p);node.lookAt(0,0,0);const label=labels.current[i];if(label){const scale=e.mode==='flight'?ORBITAL_SCALE:1,range=camera.position.distanceTo(new THREE.Vector3(...p).multiplyScalar(scale)),pixel=2*Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov/2))*range/height/scale;label.scale.set(pixel*84,pixel*20,1);}}});
    representativeSatellites.forEach((orbit,i)=>{const p=orbitPosition(orbit,time.current);dummy.position.set(...p);dummy.lookAt(0,0,0);dummy.scale.set(.075,.055,.085);dummy.updateMatrix();bodies.current?.setMatrixAt(i,dummy.matrix);dummy.scale.set(.32,.012,.13);dummy.updateMatrix();panels.current?.setMatrixAt(i,dummy.matrix);});
    if(bodies.current)bodies.current.instanceMatrix.needsUpdate=true;if(panels.current)panels.current.instanceMatrix.needsUpdate=true;
    if(o.focus&&e.mode==='flight'&&!e.presentation){const selected=earthOrbitObjects.find(p=>p.id===o.selected)!;const point=new THREE.Vector3(...orbitPosition(selected,time.current)).multiplyScalar(ORBITAL_SCALE);view.current.yaw-=steering.x*.003;view.current.yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt;view.current.pitch=THREE.MathUtils.clamp(view.current.pitch+steering.y*.002,-.7,1.2);steering.x=0;steering.y=0;
      const d=o.distance,offset=new THREE.Vector3(Math.sin(view.current.yaw)*Math.cos(view.current.pitch),Math.sin(view.current.pitch),Math.cos(view.current.yaw)*Math.cos(view.current.pitch)).multiplyScalar(d),desired=point.clone().add(offset),clearance=EARTH_RADIUS*ORBITAL_SCALE+2;if(desired.length()<clearance)desired.normalize().multiplyScalar(clearance);camera.position.lerp(desired,1-Math.exp(-dt*6));camera.up.set(0,1,0);camera.lookAt(point);inspectionLight.current?.position.copy(camera.position).divideScalar(ORBITAL_SCALE);
    }
  });
  return <><pointLight ref={inspectionLight} intensity={focus?120:0} distance={40} color="#bcd6e7"/>
    {earthOrbitObjects.map((orbit,i)=><group key={orbit.id} ref={node=>{models.current[i]=node;}} position={orbitPosition(orbit,time.current)}><group scale={orbit.scale}><SatelliteModel kind={orbit.kind} map={map}/></group><sprite ref={node=>{labels.current[i]=node;}} position={[0,.55,0]} visible={open&&!focus&&mode==='flight'}><spriteMaterial map={labelMaps[i]} transparent depthWrite={false}/></sprite></group>)}
    <instancedMesh ref={bodies} args={[undefined,undefined,representativeSatellites.length]} frustumCulled={false}><boxGeometry/><meshStandardMaterial color="#c9c0a6" metalness={.45}/></instancedMesh>
    <instancedMesh ref={panels} args={[undefined,undefined,representativeSatellites.length]} frustumCulled={false}><boxGeometry/><meshStandardMaterial map={map} metalness={.4}/></instancedMesh>
    {tracks&&paths.map((geometry,i)=><lineLoop key={i} geometry={geometry}><lineBasicMaterial color={['#a5c9c5','#d4b17b','#799cc6','#ba9fc1'][i]} transparent opacity={.24} depthWrite={false}/></lineLoop>)}
  </>;
}

export function EarthOrbitHUD(){
  const g=useGame(),e=useExpedition(),o=useEarthOrbit();
  const allowed=g.started&&!g.surface&&e.mode==='flight'&&!e.presentation&&e.dock==='free'&&!e.navStation&&!g.autopilot&&!g.paused&&!g.uiBlocked&&g.mars.stage!=='approach'&&g.moon.stage!=='approach';
  useEffect(()=>{if(!allowed){o.set({focus:false,open:false});resetInput();}},[allowed]);
  useEffect(()=>{o.set({focus:false,open:false});resetInput();},[g.target]);
  useEffect(()=>{document.querySelector('main')?.classList.toggle('orbit-catalog-open',o.open);return()=>document.querySelector('main')?.classList.remove('orbit-catalog-open');},[o.open]);
  if(!allowed)return null;const selected=earthOrbitObjects.find(p=>p.id===o.selected)!;
  const close=()=>{o.set({open:false,focus:false});resetInput();};
  return <><button className="earth-orbit-launch" onClick={()=>{if(o.open)close();else o.set({open:true});}}><LText>{"EARTH ORBIT · 2026 "}</LText><LText>{o.open?'−':'+'}</LText></button>
    {o.open&&<aside className="earth-orbit-panel"><div className="eyebrow"><LText>{"ORBITAL EXPLORER / 2026"}</LText></div><h3><LText>{o.focus?'Tracking '+selected.short:'Around our home world'}</LText></h3><p><LText>{"Real missions · simulated positions · accelerated time. Select a craft to inspect it."}</LText></p><div className="orbit-catalog"><LText>{earthOrbitObjects.map(object=><button key={object.id} className={o.selected===object.id?'selected':''} onClick={()=>inspectOrbit(object.id)}><span><LText>{object.short}</LText></span><small><LText>{object.altitudeKm.toLocaleString()}</LText><LText>{" km nominal"}</LText></small></button>)}</LText></div><p className="orbit-description"><LText>{selected.role}</LText></p><a href={selected.source} target="_blank" rel="noreferrer"><LText>{"NASA mission reference ↗"}</LText></a>
      <LText>{o.focus&&<><label className="orbit-zoom"><LText>{"INSPECTION DISTANCE"}</LText><input aria-label={tr("Inspection distance")} type="range" min={8} max={30} value={o.distance} onChange={event=>o.set({distance:Number(event.target.value)})}/></label><small><LText>{"MOUSE / ARROWS · ROTATE VIEW. Ship held in place."}</LText></small></>}</LText>
      <div className="orbit-panel-actions"><button onClick={()=>o.set({tracks:!o.tracks})}><LText>{o.tracks?'HIDE':'SHOW'}</LText><LText>{" ORBIT PATHS"}</LText></button><button onClick={close}><LText>{o.focus?'RETURN TO SHIP':'CLOSE'}</LText></button></div><small><LText>{"16 additional miniature navigation / communications craft are representative constellations, not identified live satellites. Altitude clearances and model sizes are enlarged for readability."}</LText></small>
    </aside>}
  </>;
}
