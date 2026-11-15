import {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {Languages,Check,ArrowRight,X,Orbit} from 'lucide-react';
import {useLocale,type Language} from './localeStore';
const labels={tg:{title:'Забони бозиро интихоб кунед',hint:'Баъдтар забонро аз нишонаи забон иваз карда метавонед.',change:'Иваз кардани забон',close:'Бастан'},ru:{title:'Выберите язык игры',hint:'Позже язык можно изменить через значок языка.',change:'Изменить язык',close:'Закрыть'},en:{title:'Choose your game language',hint:'You can change this later using the language icon.',change:'Change language',close:'Close'}};
export function LanguageButton(){const {language,show}=useLocale();return <button className="language-button" onClick={show} aria-label={labels[language].change} title={labels[language].change} aria-haspopup="dialog"><Languages size={18}/><span>{language.toUpperCase()}</span></button>;}
export default function LanguageMenu(){
 const {language,chosen,open,choose,close}=useLocale(),panel=useRef<HTMLElement>(null);
 useEffect(()=>{document.documentElement.lang=language;document.title='PAMIR SPACE LAB — '+({tg:'Берун аз Замин',ru:'За пределами Земли',en:'Beyond Earth'}[language]);},[language]);
 useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null;const frame=requestAnimationFrame(()=>panel.current?.querySelector<HTMLButtonElement>('[data-language="'+language+'"]')?.focus());
  const key=(event:KeyboardEvent)=>{if(event.code==='Escape'){event.preventDefault();event.stopPropagation();close();}if(event.code==='Tab'){const buttons=[...panel.current?.querySelectorAll<HTMLButtonElement>('button')??[]],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',key,true);return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key,true);if(previous?.isConnected&&previous!==document.body)previous.focus({preventScroll:true});else document.querySelector<HTMLButtonElement>('.hero-actions .primary')?.focus({preventScroll:true});};
 },[open,language,close]);
 if(!open)return null;
 return createPortal(<div className="language-backdrop"><section ref={panel} className="language-panel" role="dialog" aria-modal="true" aria-labelledby="language-heading">
  {chosen&&<button className="language-close" aria-label={labels[language].close} onClick={close}><X size={20}/></button>}
  <div className="language-brand"><Orbit size={25}/><span>PAMIR SPACE LAB</span></div><div className="language-kicker">BEYOND EARTH / LANGUAGE</div>
  <h1 id="language-heading">{labels[language].title}</h1>{!chosen&&<p className="language-welcome"><span lang="ru">Выберите язык игры</span><span lang="en">Choose your game language</span></p>}
  <div className="language-options">{([['tg','Тоҷикӣ','Забони тоҷикӣ'],['ru','Русский','Русский язык'],['en','English','English language']] as [Language,string,string][]).map(([code,name,note])=><button key={code} data-language={code} lang={code} className={language===code?'selected':''} onClick={()=>choose(code)}><span className="language-code">{code.toUpperCase()}</span><span><strong>{name}</strong><small>{note}</small></span>{chosen&&language===code?<Check size={18}/>:<ArrowRight size={18}/>}</button>)}</div>
  <p className="language-hint"><Languages size={15}/>{labels[language].hint}</p>
 </section></div>,document.body);
}
