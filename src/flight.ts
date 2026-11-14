import * as THREE from 'three';
export function steerFlight(rotation:THREE.Quaternion,keys:Set<string>,dx:number,dy:number,dt:number){
  const pitch=-dy*.0018+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*.9*dt;
  const yaw=-dx*.0018+((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*.9*dt;
  const roll=((keys.has('KeyZ')?1:0)-(keys.has('KeyX')?1:0))*dt;
  rotation.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch,yaw,roll))).normalize();
}
export function accelerateFlight(velocity:THREE.Vector3,rotation:THREE.Quaternion,keys:Set<string>,dt:number,enginePower=1){
  const input=new THREE.Vector3((keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0),(keys.has('KeyE')?1:0)-(keys.has('KeyQ')?1:0),(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0));
  if(input.lengthSq()>0)input.normalize();input.applyQuaternion(rotation).multiplyScalar(keys.has('ShiftLeft')||keys.has('ShiftRight')?38:10).multiplyScalar(enginePower);
  velocity.lerp(input,1-Math.exp(-dt*(keys.has('Space')?12:2.5)));if(keys.has('Space'))velocity.multiplyScalar(Math.exp(-dt*10));
}
