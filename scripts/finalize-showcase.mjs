import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
const out=path.resolve('artifacts/video'),ffmpeg=path.resolve('artifacts/video-tools/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const run=args=>new Promise((resolve,reject)=>{const p=spawn(ffmpeg,['-y','-hide_banner','-loglevel','error',...args],{cwd:out,windowsHide:true,stdio:['ignore','ignore','pipe']});let errors='';p.stderr.on('data',b=>errors+=b);p.on('error',reject);p.on('exit',code=>code?reject(Error(errors)):resolve());});
const {scenes}=JSON.parse(await fs.readFile(path.join(out,'capture.json'),'utf8'));
for(const name of ['06-descent','07-exploration','08-mission-control']){
 const s=scenes.find(s=>s.name===name),skip=name==='06-descent'?7:name==='07-exploration'?4:0;
 await run(['-framerate',String((s.frames-skip)/s.duration),'-start_number',String(skip),'-i',`${name}/%05d.jpg`,'-t',String(s.duration),'-r','30','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p',name+'.mp4']);
}
await run(['-f','concat','-safe','0','-i','segments.txt','-vf','tpad=stop_mode=clone:stop_duration=1','-t','30','-r','30','-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','PAMIR-SPACE-LAB-30s.mp4']);
await run(['-i','PAMIR-SPACE-LAB-30s.mp4','-f','null','-']);
const b=await fs.readFile(path.join(out,'PAMIR-SPACE-LAB-30s.mp4')),i=b.indexOf(Buffer.from('mvhd'));
const seconds=b.readUInt32BE(i+20)/b.readUInt32BE(i+16);if(seconds!==30)throw Error('Unexpected duration: '+seconds);
console.log(JSON.stringify({file:path.join(out,'PAMIR-SPACE-LAB-30s.mp4'),seconds,bytes:b.length,decoded:true}));
