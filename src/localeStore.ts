import {create} from 'zustand';
export type Language='tg'|'ru'|'en';
export const languageKey='pamir-language-v1';
export const validLanguage=(v:unknown):v is Language=>v==='tg'||v==='ru'||v==='en';
export function readLanguage(raw:string|null){try{const p=raw?JSON.parse(raw):null;if(p&&validLanguage(p.language)&&p.chosen===true)return{language:p.language,chosen:true};}catch{}return{language:'tg' as Language,chosen:false};}
let initial={language:'tg' as Language,chosen:false};try{initial=readLanguage(typeof localStorage==='undefined'?null:localStorage.getItem(languageKey));}catch{}
export const useLocale=create<{language:Language;chosen:boolean;open:boolean;choose:(language:Language)=>void;show:()=>void;close:()=>void}>((set,get)=>({
 ...initial,open:!initial.chosen,
 choose:language=>{if(!validLanguage(language))return;try{localStorage.setItem(languageKey,JSON.stringify({language,chosen:true}));}catch{}set({language,chosen:true,open:false});},
 show:()=>set({open:true}),close:()=>{if(get().chosen)set({open:false});},
}));
