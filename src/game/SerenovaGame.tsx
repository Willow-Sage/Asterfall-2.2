import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {SerenovaScene} from './SerenovaScene';
import {SAVE_KEY,PLACES,START,closestPlace,initialState,interact,loadGame,nextTarget,objective,objectiveHint,type GameState,type Vec2} from './sim';
import './serenova.css';

type Pane='journal'|'inventory'|'map'|'help'|null;
function savedPosition():Vec2{
 try{const p=JSON.parse(localStorage.getItem(SAVE_KEY+':position')||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.z))return {x:p.x,z:p.z};}catch{/* start anew */}return START;
}
const ICONS={fruit:'🍊',timber:'🪵',crates:'📦',honey:'🍯',coins:'✧'};
function Stat({icon,label,value}:{icon:string;label:string;value:number}){return <div className="ast-stat"><span>{icon}</span><span>{label}</span><strong>{value}</strong></div>}
function Panel({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){return <section className="ast-panel"><header><h2>{title}</h2><button onClick={onClose} aria-label="Close panel">×</button></header>{children}</section>}
export function SerenovaGame(){
 const [game,setGame]=useState<GameState>(loadGame);
 const [position,setPosition]=useState<Vec2>(savedPosition);
 const [initialPosition]=useState<Vec2>(savedPosition);
 const [pane,setPane]=useState<Pane>(null);
 const [toast,setToast]=useState('Welcome to Serenova. Meet Eliana outside the manor.');
 const held=useRef<Set<string>>(new Set());
 const snapshot=useRef(game);snapshot.current=game;
 const place=useMemo(()=>closestPlace(position,game),[position,game]);
 const placeRef=useRef(place);placeRef.current=place;
 const saver=useRef(0);
 useEffect(()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(game));}catch{/* full storage */}},[game]);
 const updatePosition=useCallback((p:Vec2)=>{setPosition(p);const now=Date.now();if(now-saver.current>1100){saver.current=now;try{localStorage.setItem(SAVE_KEY+':position',JSON.stringify(p));}catch{/* storage unavailable */}}},[]);
 const handleInteract=useCallback(()=>{
  if(pane)return;const nearest=placeRef.current;
  if(!nearest){setToast('Move closer to a villager, tree, workbench, or supply station.');return;}
  const outcome=interact(snapshot.current,nearest.id);
  snapshot.current=outcome.state;setGame(outcome.state);setToast(outcome.message);
 },[pane]);
 useEffect(()=>{
  const onKey=(e:KeyboardEvent)=>{const target=e.target as HTMLElement|null;
   if(target?.closest('button, input, textarea, select'))return;
   const k=e.key.toLowerCase();
   if(k==='e'||k===' '){e.preventDefault();if(!e.repeat)handleInteract();}
   else if(k==='i'){setPane(p=>p==='inventory'?null:'inventory');e.preventDefault();}
   else if(k==='m'){setPane(p=>p==='map'?null:'map');e.preventDefault();}
   else if(k==='j'){setPane(p=>p==='journal'?null:'journal');e.preventDefault();}
   else if(k==='escape'){setPane(null);}
  };
  window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);
 },[handleInteract]);
 const reset=()=>{if(!window.confirm('Begin a new Serenova journey? Your current local save will be replaced.'))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY+':position');window.location.reload();};
 const target=nextTarget(game);const dx=target.x-position.x;const dz=target.z-position.z;
 return <div className="asterfall-game" aria-label="Playable Asterfall 2.3: Serenova orchard to market">
  <div className="ast-viewport"><SerenovaScene state={game} controller={held} onPosition={updatePosition} initialPosition={initialPosition}/></div>
  <div className="ast-vignette" aria-hidden="true"/>
  <div className="ast-top-left"><div className="ast-brand"><small>THE LIVING BARONY</small><strong>Asterfall <em>2.3</em></strong><span>Solterra · Terravelle · Serenova</span></div></div>
  <div className="ast-top-right"><div className="ast-day">☀ Day {game.day} <span>·</span> Serenova <span>·</span> {game.completed} deliveries</div><div className="ast-reputation">✧ {game.coins} crowns <span>·</span> ♡ {game.reputation} renown</div></div>
  <section className="ast-objective"><span className="ast-kicker">CURRENT COMMISSION</span><h2>{objective(game)}</h2><p>{objectiveHint(game)}</p><div className="ast-direction">◇ Target approximately {Math.round(Math.hypot(dx,dz))} paces away</div></section>
  <div className="ast-interaction" aria-live="polite">{place?<button type="button" onClick={handleInteract}><kbd>E</kbd><span><strong>{place.name}</strong><small>{place.detail}</small></span><span className="ast-chevron">›</span></button>:<span className="ast-idle-prompt">WASD move · drag to rotate · E interact</span>}</div>
  <div className="ast-toast" role="status">✦ {toast}</div>
  <div className="ast-bottom-bar"><div className="ast-pouch"><Stat icon={ICONS.fruit} label="Citrus" value={game.fruit}/><Stat icon={ICONS.timber} label="Timber" value={game.timber}/><Stat icon={ICONS.crates} label="Crates" value={game.crates}/></div><div className="ast-actions"><button onClick={()=>setPane(p=>p==='journal'?null:'journal')}>Journal <kbd>J</kbd></button><button onClick={()=>setPane(p=>p==='inventory'?null:'inventory')}>Pouch <kbd>I</kbd></button><button onClick={()=>setPane(p=>p==='map'?null:'map')}>Map <kbd>M</kbd></button><button onClick={()=>setPane(p=>p==='help'?null:'help')}>Help</button></div></div>
  <div className="ast-mobile-control" aria-label="Touch movement controls"><div className="ast-dpad"><button onPointerDown={()=>held.current.add('w')} onPointerUp={()=>held.current.delete('w')} onPointerCancel={()=>held.current.delete('w')} aria-label="Move forward">▲</button><div><button onPointerDown={()=>held.current.add('a')} onPointerUp={()=>held.current.delete('a')} onPointerCancel={()=>held.current.delete('a')} aria-label="Move left">◀</button><button onPointerDown={()=>held.current.add('s')} onPointerUp={()=>held.current.delete('s')} onPointerCancel={()=>held.current.delete('s')} aria-label="Move backward">▼</button><button onPointerDown={()=>held.current.add('d')} onPointerUp={()=>held.current.delete('d')} onPointerCancel={()=>held.current.delete('d')} aria-label="Move right">▶</button></div></div><button onClick={handleInteract} className="ast-mobile-interact">Interact</button></div>
  {pane&&<div className="ast-panel-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setPane(null)}}>
   {pane==='journal'&&<Panel title="The Serenova Journal" onClose={()=>setPane(null)}><div className="ast-ledger"><div><small>CHAPTER I · THE ORCHARD'S FIRST HARVEST</small><h3>{objective(game)}</h3><p>{objectiveHint(game)}</p></div><div className="ast-progress"><span>Commission deliveries</span><strong>{game.completed}</strong></div><div className="ast-progress"><span>Citrus stored in granary</span><strong>{game.granary}</strong></div><div className="ast-progress"><span>Market inventory</span><strong>{game.stock}</strong></div><div className="ast-progress"><span>Local reputation</span><strong>{game.reputation}</strong></div><h4>Village dispatches</h4>{game.history.length?game.history.map((item,i)=><p className="ast-log" key={i}>{item}</p>):<p className="ast-log">The market needs supplies. A new arrival may be just what Serenova needs.</p>}</div></Panel>}
   {pane==='inventory'&&<Panel title="Traveler’s Pouch" onClose={()=>setPane(null)}><div className="ast-ledger"><div className="ast-inventory-grid"><Stat icon={ICONS.fruit} label="Citrus" value={game.fruit}/><Stat icon={ICONS.timber} label="Timber" value={game.timber}/><Stat icon={ICONS.crates} label="Crates" value={game.crates}/><Stat icon={ICONS.honey} label="Honey" value={game.honey}/><Stat icon={ICONS.coins} label="Crowns" value={game.coins}/></div><h4>Life & guild skills</h4>{Object.entries(game.skills).map(([skill,value])=><div className="ast-skill" key={skill}><span>{skill}</span><progress max={100} value={value%100}/><strong>{value} XP</strong></div>)}<p className="ast-hint">Twelve professions and six cross-profession skills shape your path through Solterra. Earn XP by doing real work.</p></div></Panel>}
   {pane==='map'&&<Panel title="Serenova Atlas" onClose={()=>setPane(null)}><div className="ast-ledger"><div className="ast-map"><div className="ast-map-grid"/>{PLACES.filter(p=>p.kind!=='orchard').map((p,i)=><span key={i} className="ast-map-pin" title={p.name} style={{left:`${50+p.position.x/80*100}%`,top:`${50+p.position.z/78*100}%`}}>{p.kind==='steward'?'♜':p.kind==='workshop'?'⚒':p.kind==='market'?'⚖':p.kind==='granary'?'▣':p.kind==='wood'?'♣':'◉'}</span>)}<span className="ast-map-orchard">CITRUS GROVES</span><span className="ast-map-player" style={{left:`${50+position.x/80*100}%`,top:`${50+position.z/78*100}%`}}>◆</span></div><p className="ast-hint">◆ Your location · ♜ Manor · ⚒ Workshop · ⚖ Market · ▣ Granary · ♣ Woodpile</p><p className="ast-hint">The greater realm of Solterra remains beyond this playable barony slice.</p></div></Panel>}
   {pane==='help'&&<Panel title="How to Play" onClose={()=>setPane(null)}><div className="ast-ledger"><p><strong>W A S D</strong> or arrow keys to travel. Hold <strong>Shift</strong> to run. <strong>Drag</strong> across the landscape to rotate the third-person camera; scroll to zoom.</p><p>Walk near a named resident, fruit tree, woodpile, workshop, or granary and press <strong>E</strong> (or click the prompt) to interact. The pouch and journal record your progress.</p><p>Collect six citrus, gather three timber, craft a crate, and deliver everything to the granary. Visit the newly stocked market and return to Eliana for a new day.</p><p>The playable world saves automatically in this browser. Online shared multiplayer is not yet part of this vertical slice.</p><button className="ast-reset" onClick={reset}>Reset local Serenova save</button></div></Panel>}
  </div>}
 </div>;
}
export const newJourney=initialState;