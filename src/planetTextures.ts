import * as THREE from 'three';
import type { PlanetName } from './store';
import { planetTextureUrl } from './planetVisuals';
import { publicAssetUrl } from './publicAssets';
const pending=new Map<string,number>(),failed=new Set<string>();
export const textureStatus=()=>({pending:[...pending.keys()],failed:[...failed]});
export function localTexture(file:string,color=true){
  pending.set(file,(pending.get(file)??0)+1);
  const finished=()=>{const count=(pending.get(file)??1)-1;if(count)pending.set(file,count);else pending.delete(file);};
  const map=new THREE.TextureLoader().load(publicAssetUrl('textures/'+file),()=>{finished();failed.delete(file);},undefined,()=>{finished();failed.add(file);});
  map.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;
  map.wrapS=THREE.RepeatWrapping;map.anisotropy=8;return map;
}
export default function texture(name:PlanetName){
  return localTexture(planetTextureUrl(name).split('/').pop()!);
}
export const cloudTexture=()=>localTexture('earth-clouds.jpg',false);
