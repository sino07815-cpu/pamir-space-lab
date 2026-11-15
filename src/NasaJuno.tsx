import { Component,Suspense,useEffect,useMemo,type ReactNode } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useExpedition } from './expeditionStore';
import { publicAssetUrl } from './publicAssets';
import SurveyHardware from './SurveyHardware';
export const nasaJunoStatus={ready:false,failed:false,meshes:0};
class AssetBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return{failed:true};}
 componentDidCatch(){nasaJunoStatus.failed=true;}
 render(){return this.state.failed?<SurveyHardware kind="probe"/>:this.props.children;}
}
function JunoModel(){
 const gltf=useGLTF(publicAssetUrl('models/nasa-juno.glb'),false);
 const model=useMemo(()=>{const scene=gltf.scene.clone(true),box=new THREE.Box3().setFromObject(scene),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());scene.position.sub(center);let meshes=0;scene.traverse(object=>{if((object as THREE.Mesh).isMesh)meshes++;});return{scene,scale:5.5/Math.max(size.x,size.y,size.z,.01),meshes};},[gltf.scene]);
 useEffect(()=>{nasaJunoStatus.ready=true;nasaJunoStatus.meshes=model.meshes;},[model]);
 return <group name="NASA-VTAD-JUNO-REPLICA" scale={model.scale} dispose={null}><primitive object={model.scene}/></group>;
}
export default function NasaJuno(){
 const quality=useExpedition(s=>s.graphics);if(quality==='LOW')return <SurveyHardware kind="probe"/>;
 return <AssetBoundary><Suspense fallback={<SurveyHardware kind="probe"/>}><JunoModel/></Suspense></AssetBoundary>;
}
