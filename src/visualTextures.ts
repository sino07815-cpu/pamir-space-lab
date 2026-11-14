import * as THREE from 'three';
export function labelTexture(text:string,foreground='#edf1f1',background='transparent',width=1024,height=192){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d')!;
  if(background!=='transparent'){c.fillStyle=background;c.fillRect(0,0,width,height);}c.fillStyle=foreground;c.font=`700 ${Math.floor(height*.56)}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,width/2,height*.52,width*.94);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;
}
export function surfaceTexture(kind:'cloth'|'steel'|'concrete'|'solar'|'tiles'){
  const size=128,data=new Uint8Array(size*size*4);let seed=137;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,n=random(),grid=x%16===0||y%8===0;
    let rgb:number[];if(kind==='solar')rgb=grid?[113,142,154]:[24+n*8,47+n*10,73+n*15];else if(kind==='tiles'){const edge=y%12<1||(x+(Math.floor(y/12)%2)*7)%14<1;rgb=edge?[57,62,66]:[19+n*9,23+n*9,28+n*9];}else{const value=kind==='cloth'?125+(x%2+y%2)*9+n*12:kind==='steel'?123+Math.sin(x*3.7)*9+n*5:135+n*38;rgb=[value,value,value];}data[i]=rgb[0];data[i+1]=rgb[1];data[i+2]=rgb[2];data[i+3]=255;
  }
  const map=new THREE.DataTexture(data,size,size);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.colorSpace=kind==='solar'||kind==='tiles'?THREE.SRGBColorSpace:THREE.NoColorSpace;map.needsUpdate=true;return map;
}
