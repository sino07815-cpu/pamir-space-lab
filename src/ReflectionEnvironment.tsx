import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGame } from './store';
export default function ReflectionEnvironment(){
  const gl=useThree(s=>s.gl),scene=useThree(s=>s.scene),surface=useGame(s=>s.surface);
  useEffect(()=>{
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d')!;
    const sky=c.createLinearGradient(0,0,0,512),earth=surface==='Earth',mars=surface==='Mars',moon=surface==='Moon';
    sky.addColorStop(0,earth?'#6f99bf':mars?'#5e4137':moon?'#000001':'#101a2b');sky.addColorStop(.36,earth?'#dce7ec':mars?'#ddb486':moon?'#030405':'#526178');sky.addColorStop(.49,moon?'#101114':'#fff1d9');sky.addColorStop(.54,earth?'#8d9388':mars?'#9e6242':moon?'#8b8780':'#202b3e');sky.addColorStop(1,moon?'#51514f':'#151c24');c.fillStyle=sky;c.fillRect(0,0,1024,512);
    const sun=c.createRadialGradient(220,150,0,220,150,130);sun.addColorStop(0,'rgba(255,255,246,1)');sun.addColorStop(.2,'rgba(255,248,221,.85)');sun.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sun;c.fillRect(0,0,500,400);
    if(!moon){c.fillStyle='rgba(225,238,246,.45)';c.fillRect(650,100,24,170);c.fillRect(735,125,9,120);}
    const source=new THREE.CanvasTexture(canvas);source.colorSpace=THREE.SRGBColorSpace;source.mapping=THREE.EquirectangularReflectionMapping;
    const generator=new THREE.PMREMGenerator(gl),target=generator.fromEquirectangular(source),previous=scene.environment,previousIntensity=scene.environmentIntensity;
    scene.environment=target.texture;scene.environmentIntensity=earth?.85:moon?.5:.65;
    return()=>{scene.environment=previous;scene.environmentIntensity=previousIntensity;target.dispose();source.dispose();generator.dispose();};
  },[gl,scene,surface]);return null;
}
