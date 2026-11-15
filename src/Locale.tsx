import {type ReactNode} from 'react';
import {useLocale} from './localeStore';
import {translateText} from './translations';
export function tr(value:unknown){return typeof value==='string'?translateText(value,useLocale.getState().language):String(value??'');}
function content(value:ReactNode,language:ReturnType<typeof useLocale.getState>['language']):ReactNode{return typeof value==='string'?translateText(value,language):Array.isArray(value)?value.map(v=>content(v,language)):value;}
// React-level text leaves: no DOM rewriting, no extra elements and no translated
// identifiers in game state, event handlers, data attributes or save records.
export function LText({children}:{children?:ReactNode}){const language=useLocale(s=>s.language);return <>{content(children,language)}</>;}
