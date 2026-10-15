import {Component,useState,type ReactNode} from 'react';
import {SerenovaGame} from '../game/SerenovaGame';
import {NpcStudio} from '../npc/NpcStudio';
import './site23.css';
class GameBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<div role="alert" className="game-load-error"><h2>Serenova could not start the 3D scene.</h2><p>Try a desktop browser with WebGL enabled. This build does not yet provide a 2D fallback.</p></div>:this.props.children;}}
export function App(){
 const [view,setView]=useState<'play'|'npc'>('play');
 return <main className="asterfall-shell"><header className="site-head"><div className="site-logo">✦ <span>Asterfall</span><small>2.3</small></div><nav aria-label="Game modes"><button onClick={()=>setView('play')} aria-current={view==='play'?'page':undefined}>Explore Serenova</button><button onClick={()=>setView('npc')} aria-current={view==='npc'?'page':undefined}>NPC Studio</button></nav></header>
 {view==='play'?<GameBoundary><SerenovaGame/></GameBoundary>:<div className="site-studio"><NpcStudio/></div>}
 </main>;
}