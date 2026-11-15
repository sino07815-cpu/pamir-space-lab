import {messages} from './locales/messages.ts';
import type {Language} from './localeStore.ts';
const normalize=(text:string)=>text.replace(/\s+/g,' ').trim();
const dictionary=new Map(messages.map(([source,tg,ru])=>[normalize(source).toLowerCase(),{tg,ru}]));
const escape=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=messages.filter(([s])=>/\{\d+\}/.test(s)).map(([s,tg,ru])=>{const ids=[...s.matchAll(/\{(\d+)\}/g)].map(m=>Number(m[1]));return{regex:new RegExp('^'+s.split(/\{\d+\}/).map(escape).join('([\\s\\S]*?)')+'$','i'),ids,tg,ru};});
const caches={tg:new Map<string,string>(),ru:new Map<string,string>()};
function capitalized(source:string,value:string,language:Language){return /[A-Za-z]/.test(source)&&source===source.toUpperCase()?value.toLocaleUpperCase(language):value;}
export function translateText(source:string,language:Language,depth=0):string{
 if(language==='en'||!source||!/[A-Za-z]/.test(source)||depth>4)return source;
 const cached=caches[language].get(source);if(cached!==undefined)return cached;
 const key=normalize(source),entry=dictionary.get(key.toLowerCase());let result=entry?capitalized(key,entry[language],language):key;
 if(!entry)for(const p of patterns){const m=key.match(p.regex);if(!m)continue;result=p[language].replace(/\{(\d+)\}/g,(_,id)=>{const i=p.ids.indexOf(Number(id));return i<0?'':translateText(m[i+1],language,depth+1);});result=capitalized(key,result,language);break;}
 if(result===key&&!entry)return source;
 const leading=source.match(/^\s*/)?.[0]??'',trailing=source.match(/\s*$/)?.[0]??'';result=leading+result+trailing;
 const cache=caches[language];if(cache.size>=2500)cache.delete(cache.keys().next().value!);cache.set(source,result);return result;
}
