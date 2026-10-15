import {useEffect,useMemo,useRef,type MutableRefObject} from 'react';
import * as THREE from 'three';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import {createNpcAvatar,animateNpc} from '../npc/avatar';
import {generatePopulation} from '../npc/generator';
import type {Npc} from '../npc/types';
import {TREE_POSITIONS,type GameState,type Vec2} from './sim';

const C={sand:'#d9c3a0',stone:'#e7d9bc',plaster:'#f8e9cf',terracotta:'#ad6045',terracotta2:'#c87954',dark:'#6b5149',sage:'#56836a',olive:'#466b4b',gold:'#e4bc74',market:'#d7b18b'};
function Mat({color,roughness=0.91}:{color:string;roughness?:number}){return <meshStandardMaterial color={color} roughness={roughness}/>;}
function Block({position,scale,color,rotation,cast=true}:{position:[number,number,number];scale:[number,number,number];color:string;rotation?:[number,number,number];cast?:boolean}){
 return <mesh castShadow={cast} receiveShadow position={position} scale={scale} rotation={rotation}><boxGeometry args={[1,1,1]}/><Mat color={color}/></mesh>;
}
function Sphere({position,scale,color}:{position:[number,number,number];scale:[number,number,number];color:string}){return <mesh position={position} scale={scale} castShadow><sphereGeometry args={[1,16,12]}/><Mat color={color}/></mesh>}
function Cylinder({position,radius=0.35,height=1,color,rotation}:{position:[number,number,number];radius?:number;height?:number;color:string;rotation?:[number,number,number]}){
 return <mesh castShadow receiveShadow position={position} rotation={rotation}><cylinderGeometry args={[radius,radius,height,12]}/><Mat color={color}/></mesh>;
}
function Ground(){const flowers=useMemo(()=>Array.from({length:160},(_,i)=>{const x=Math.sin(i*73.74)*33;const z=Math.cos(i*42.13)*30;return {x,z,kind:i%4};}).filter(f=>Math.abs(f.x)>5||Math.abs(f.z)>20),[]);return <>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,-0.047,0]}><planeGeometry args={[140,140]}/><Mat color="#83a575"/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,-0.027,1]}><planeGeometry args={[9,66]}/><Mat color="#d8c4a3"/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[-9,-0.025,-7]}><planeGeometry args={[25,3.4]}/><Mat color="#d9c7a7"/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[10,-0.021,-5]}><planeGeometry args={[26,3.2]}/><Mat color="#d9c7a7"/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[11,-0.019,10]}><planeGeometry args={[26,3.3]}/><Mat color="#d9c7a7"/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[3,-0.013,0]}><circleGeometry args={[9.5,48]}/><Mat color="#cdbb9c"/></mesh>
 {Array.from({length:11},(_,i)=><Block key={`road${i}`} position={[0,0.002,i*5.2-25]} scale={[8.2,0.025,0.11]} color="#c4af94"/>)}
 {flowers.map((f,i)=><group key={i} position={[f.x,0,f.z]}><Block position={[0,.13,0]} scale={[.035,.24,.035]} color="#4f7d50"/><Sphere position={[0,.28,0]} scale={[.084,.08,.084]} color={['#e6c0a7','#fff0b4','#d5c3e1','#f6e2cd'][f.kind]}/></group>)}
 </>}
function Roof({width,depth,height=4,accent=C.terracotta}:{width:number;depth:number;height?:number;accent?:string}){
 const side=width/2;
 return <group position={[0,height,0]}><Block position={[-side/2,.43,0]} scale={[side+0.24,.18,depth+.3]} rotation={[0,0,-0.43]} color={accent}/><Block position={[side/2,.43,0]} scale={[side+0.24,.18,depth+.3]} rotation={[0,0,.43]} color={accent}/><Block position={[0,1.14,0]} scale={[.18,.16,depth+.44]} color="#914d3d"/>
 {Array.from({length:Math.floor(depth/.7)},(_,i)=><group key={i} position={[0,0,-depth/2+.35+i*.7]}><Block position={[-side/2,.51,0]} scale={[side+.32,.04,.045]} rotation={[0,0,-.43]} color="#d89161"/><Block position={[side/2,.51,0]} scale={[side+.32,.04,.045]} rotation={[0,0,.43]} color="#d89161"/></group>)}
 </group>;
}
function Building({position,width=6,depth=5,height=3.9,type='home',tint=C.plaster,rot=0}:{position:[number,number,number];width?:number;depth?:number;height?:number;type?:'home'|'manor'|'workshop'|'granary';tint?:string;rot?:number}){
 return <group position={position} rotation={[0,rot,0]}>
 <Block position={[0,height/2,0]} scale={[width,height,depth]} color={tint}/>
 <Block position={[0,.24,depth/2+.02]} scale={[width+.12,.48,.15]} color="#d4bba0"/>
 <Roof width={width} depth={depth} height={height} accent={type==='granary'?'#94684f':type==='manor'?'#b85e43':C.terracotta2}/>
 <Block position={[0,1.14,depth/2+.08]} scale={[1.2,2.2,.15]} color="#725548"/>
 <Block position={[0,1.5,depth/2+.18]} scale={[.12,.7,.04]} color="#d8aa71"/>
 {[-1,1].map((s)=><group key={s} position={[s*(width/2-1.25),2.43,depth/2+.1]}><Block position={[0,0,0]} scale={[.94,1.1,.18]} color="#6d8d91"/><Block position={[0,0,.1]} scale={[.06,1.1,.04]} color="#f3e6c6"/><Block position={[0,0,.1]} scale={[.94,.08,.04]} color="#f3e6c6"/><Block position={[s*.59,0,.05]} scale={[.22,1.18,.14]} color="#54786a"/><Block position={[0,-.61,.18]} scale={[1.28,.16,.45]} color="#c4a483"/><Sphere position={[0,-.43,.28]} scale={[.38,.14,.18]} color="#a67d6c"/></group>)}
 {type==='manor'&&<><Block position={[0,height*.58,depth/2+.12]} scale={[2.2,.27,.17]} color="#d3af78"/>{[-1,1].map(x=><Cylinder key={x} position={[x*(width/2+.2),height/2,depth/2+.55]} radius={.24} height={height} color="#e9d6b8"/>)}<Block position={[0,0.17,depth/2+1.25]} scale={[3,.32,2.2]} color="#d0b898"/></>}
 {type==='granary'&&<>{[-1,1].map((s)=><Block key={s} position={[s*(width/2+.4),1.5,0]} scale={[.65,2.95,depth+.2]} color="#a48365"/>)}<Block position={[0,1.2,depth/2+.2]} scale={[2.6,2.4,.3]} color="#80624b"/></>}
 {type==='workshop'&&<><Block position={[0,2.1,depth/2+.6]} scale={[width-1,.15,1.7]} color="#a66a4c"/><Cylinder position={[-width/2+.5,1.1,depth/2+1]} radius={.13} height={2.2} color="#8a694f"/><Cylinder position={[width/2-.5,1.1,depth/2+1]} radius={.13} height={2.2} color="#8a694f"/></>}
 </group>
}
function CitrusTree({position,index,remaining}:{position:Vec2;index:number;remaining:number}){
 const green=index%2===0?'#507d52':'#628b54';return <group position={[position.x,0,position.z]}>
 <Cylinder position={[0,1.5,0]} height={3.1} radius={.23} color="#795944"/>
 <Cylinder position={[.4,2.85,.15]} height={1.6} radius={.11} color="#806448" rotation={[0,0,.45]}/>
 <Sphere position={[0,3.45,0]} scale={[1.7,1.52,1.55]} color={green}/>
 <Sphere position={[1.07,3.05,.15]} scale={[.97,1.0,.95]} color="#6d965b"/>
 <Sphere position={[-.9,3.1,-.3]} scale={[1.1,1.03,1]} color="#678c50"/>
 <Sphere position={[.1,4.46,-.22]} scale={[1.04,.75,1.0]} color="#739b5c"/>
 {Array.from({length:remaining},(_,i)=><Sphere key={i} position={[i===0?-.9:.8,i===0?2.7:3.1,i===0?1.17:1.17]} scale={[.18,.19,.18]} color="#f9b955"/>)}
 <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,.012,0]}><circleGeometry args={[1.65,18]}/><Mat color="#79936d"/></mesh>
 </group>;
}
function Orchard({state}:{state:GameState}){return <group>{TREE_POSITIONS.map((pos,i)=><CitrusTree key={i} position={pos} index={i} remaining={state.orchard[i]}/>)}
 <Block position={[-18,.1,-30]} scale={[24,.2,.38]} color="#a18c70"/>
 {Array.from({length:9},(_,i)=><group key={i} position={[-30+i*3,0,-30]}><Cylinder position={[0,.65,0]} radius={.10} height={1.3} color="#796148"/></group>)}
 <mesh position={[-20,.03,-17]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[27,27]}/><meshStandardMaterial color="#a19e6c" opacity={.15} transparent/></mesh>
 </group>}
function Woodpile({left}:{left:number}){return <group position={[-8,0,-6]}><Block position={[0,.10,0]} scale={[3.4,.2,2]} color="#aa8768"/>
 {Array.from({length:Math.max(0,left)},(_,i)=>{const x=(i%3-1)*.72;const y=.35+Math.floor(i/3)*.39;return <group key={i}><Cylinder position={[x,y,0]} radius={.19} height={1.5} rotation={[Math.PI/2,0,0]} color={i%2===0?'#906343':'#b17e54'}/><Sphere position={[x,y,.77]} scale={[.16,.16,.025]} color="#cfab73"/></group>})}
 </group>}
function Market({stock}:{stock:number}){return <group position={[20,0,-10]}>
 <Block position={[0,.55,0]} scale={[4.7,1.1,2.35]} color="#967453"/>
 <Block position={[0,2.9,0]} scale={[5.5,.2,3.3]} color="#c58c5e"/>
 {[-2.3,2.3].map(x=><Cylinder key={x} position={[x,1.9,1.05]} radius={.11} height={3.6} color="#694b39"/>)}
 {Array.from({length:7},(_,i)=><Block key={i} position={[(i-3)*.77,2.99,0]} scale={[.68,.045,3.38]} color={i%2===0?'#e4c88c':'#54857b'}/>)}
 {Array.from({length:Math.min(stock,6)},(_,i)=><Sphere key={i} position={[-1.45+(i%3)*.6,1.23,.38+Math.floor(i/3)*.55]} scale={[.25,.24,.24]} color="#f2b95b"/>)}
 {stock===0?<Block position={[0,1.1,.6]} scale={[3.5,.10,1.1]} color="#a68868"/>:null}
 </group>}
function Fountain(){return <group position={[3,0,1]}><Cylinder position={[0,.55,0]} radius={2.1} height={.8} color="#ccbfa4"/><Cylinder position={[0,.89,0]} radius={1.74} height={.10} color="#efe4cd"/><Cylinder position={[0,.93,0]} radius={1.60} height={.07} color="#75b4b8"/><Cylinder position={[0,1.35,0]} radius={.28} height={1.15} color="#d9c5a6"/><Sphere position={[0,2,0]} scale={[.47,.25,.47]} color="#e2c99f"/><Sphere position={[0,2.27,0]} scale={[.11,.22,.11]} color="#afdbdb"/></group>}
function Decorative(){return <group>
 {Array.from({length:8},(_,i)=>{const x=i%2===0?-35:34,z=Math.floor(i/2)*14-27;return <group key={i} position={[x,0,z]}><Cylinder position={[0,2,0]} radius={.3} height={4} color="#725a40"/><Sphere position={[0,4.5,0]} scale={[2.1,2.25,2.1]} color="#517951"/></group>})}
 {Array.from({length:14},(_,i)=>{const x=(i%7-3)*4.9,z=25+Math.floor(i/7)*4;return <group key={i} position={[x,0,z]}><Cylinder position={[0,1.45,0]} radius={.17} height={2.9} color="#836747"/><Sphere position={[0,3.2,0]} scale={[1.18,1.4,1.1]} color={i%2===0?'#6c9b5e':'#5b854f'}/></group>})}
 {[-1,1].map((s)=><group key={s} position={[s*4.1,0,14.8]}><Cylinder position={[0,1,0]} height={2} radius={.12} color="#957054"/><Sphere position={[0,2.1,0]} scale={[.55,.14,.45]} color="#d9be8c"/></group>)}
 <Building position={[-7,0,23]} width={10} depth={8} height={5.3} type="manor" tint="#f0dfc7"/>
 <Building position={[10,0,-7]} width={7} depth={5} height={3.9} type="workshop"/>
 <Building position={[17,0,8]} width={7} depth={6} height={4.2} type="granary" tint="#e8d5b8"/>
 <Building position={[-3,0,-16]} width={5.6} depth={4.9} height={3.4} tint="#ecddc6"/>
 <Building position={[27,0,1]} width={5.6} depth={4.4} height={3.2} tint="#f2e3cd" rot={-.7}/>
 <Building position={[-32,0,3]} width={6} depth={5} height={3.2} tint="#e7d6c6" rot={.35}/>
 <Fountain/>
 </group>}
function FloatingLabel({title,subtitle}:{title:string;subtitle?:string}){return <Html position={[0,2.9,0]} transform distanceFactor={12} center occlude={false}><div className="world-sign"><strong>{title}</strong>{subtitle&&<span>{subtitle}</span>}</div></Html>}
const persons=generatePopulation(2301,3,'Serenova').npcs.filter(p=>p.age>=18);
function person(base:Npc,name:string,color:string,profession:Npc['profession']):Npc{return {...base,id:`fixed-${name}`,name,profession,appearance:{...base.appearance,clothing:color,modelId:'generated-solterran-v1'}};}
const VILLAGERS=[
 {npc:person(persons[0],'Eliana Valera','#426b68','Merchant'),pos:[1,0,11] as [number,number,number],label:'Eliana · Steward'},
 {npc:person(persons[1],'Lucien Serrano','#ae7254','Carpenter'),pos:[9,0,-4] as [number,number,number],label:'Lucien · Carpenter'},
 {npc:person(persons[2],'Mireya Bellamar','#8a6c9b','Merchant'),pos:[19,0,-8] as [number,number,number],label:'Mireya · Merchant'},
 {npc:person(persons[3]||persons[0],'Tavian Ortez','#7d9169','Farmer'),pos:[-15,0,-9] as [number,number,number],label:'Tavian · Orchardist'},
];
function Villager({npc,pos,label,index}:{npc:Npc;pos:[number,number,number];label:string;index:number}){
 const model=useMemo(()=>createNpcAvatar(npc),[npc]);const ref=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(!ref.current)return;const t=clock.elapsedTime+index*3;ref.current.position.set(pos[0]+Math.sin(t*.3)*.40,0,pos[2]+Math.cos(t*.3)*.26);ref.current.rotation.y=Math.sin(t*.21)*.45;animateNpc(model,t,Math.cos(t*.3)>0.85);});
 return <group ref={ref} position={pos}><primitive object={model}/><FloatingLabel title={label}/></group>;
}
function Player({controller,onPosition,initialPosition}:{controller:MutableRefObject<Set<string>>;onPosition:(p:Vec2)=>void;initialPosition:Vec2}){
 const group=useRef<THREE.Group>(null);const position=useRef(new THREE.Vector3(initialPosition.x,0,initialPosition.z));
 const yaw=useRef(0);const pitch=useRef(.34);const distance=useRef(8.6);const drag=useRef(false);const last=useRef({x:0,y:0});const elapsed=useRef(0);
 const {camera,gl}=useThree();
 const player=useMemo(()=>person(persons[4]||persons[0],'Serenova Wanderer','#3d7773','Farmer'),[]);
 const avatar=useMemo(()=>createNpcAvatar(player),[player]);
 useEffect(()=>{
  const canvas=gl.domElement;
  const kd=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)&&!(e.target instanceof HTMLInputElement)){controller.current.add(k);e.preventDefault();}};
  const ku=(e:KeyboardEvent)=>controller.current.delete(e.key.toLowerCase());
  const down=(e:PointerEvent)=>{if(e.button!==0)return;drag.current=true;last.current={x:e.clientX,y:e.clientY};};
  const move=(e:PointerEvent)=>{if(!drag.current)return;yaw.current-=(e.clientX-last.current.x)*.0045;pitch.current=THREE.MathUtils.clamp(pitch.current+(e.clientY-last.current.y)*.003,-.06,1);last.current={x:e.clientX,y:e.clientY};};
  const up=()=>{drag.current=false;};const wheel=(e:WheelEvent)=>{e.preventDefault();distance.current=THREE.MathUtils.clamp(distance.current+e.deltaY*.012,4.8,15.5);};
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);window.addEventListener('blur',up);canvas.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);canvas.addEventListener('wheel',wheel,{passive:false});
  return ()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);window.removeEventListener('blur',up);canvas.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);canvas.removeEventListener('wheel',wheel);};
 },[gl,controller]);
 useFrame(({clock},dt)=>{
  const held=controller.current;const forward=Number(held.has('w')||held.has('arrowup'))-Number(held.has('s')||held.has('arrowdown'));
  const lateral=Number(held.has('d')||held.has('arrowright'))-Number(held.has('a')||held.has('arrowleft'));
  let vx=-Math.sin(yaw.current)*forward+Math.cos(yaw.current)*lateral;
  let vz=-Math.cos(yaw.current)*forward-Math.sin(yaw.current)*lateral;
  const active=Math.hypot(vx,vz)>.01;
  if(active){const inv=1/Math.hypot(vx,vz);vx*=inv;vz*=inv;const speed=held.has('shift')?9.3:5.7;position.current.x=THREE.MathUtils.clamp(position.current.x+vx*speed*Math.min(dt,.05),-36,36);position.current.z=THREE.MathUtils.clamp(position.current.z+vz*speed*Math.min(dt,.05),-33,33);}
  if(group.current){group.current.position.copy(position.current);if(active){const angle=Math.atan2(vx,vz);group.current.rotation.y=angle;}animateNpc(avatar,clock.elapsedTime,active);}
  const target=new THREE.Vector3(position.current.x,1.42,position.current.z);
  const cameraPoint=new THREE.Vector3(target.x+Math.sin(yaw.current)*distance.current*Math.cos(pitch.current),target.y+distance.current*Math.sin(pitch.current)+1.4,target.z+Math.cos(yaw.current)*distance.current*Math.cos(pitch.current));
  camera.position.lerp(cameraPoint,1-Math.exp(-dt*5.5));camera.lookAt(target);
  elapsed.current+=dt;if(elapsed.current>.17){elapsed.current=0;onPosition({x:position.current.x,z:position.current.z});}
 });
 return <group ref={group} position={[initialPosition.x,0,initialPosition.z]}><primitive object={avatar}/><mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.45,.55,24]}/><meshBasicMaterial color="#f4d89a" transparent opacity={.8}/></mesh></group>
}
function SceneContents({state,controller,onPosition,initialPosition}:{state:GameState;controller:MutableRefObject<Set<string>>;onPosition:(p:Vec2)=>void;initialPosition:Vec2}){
 return <>
 <color attach="background" args={['#b2d8d5']}/><fog attach="fog" args={['#b2d8d5',55,105]}/><ambientLight intensity={1.5}/><hemisphereLight intensity={1} color="#fff2d4" groundColor="#698c6d"/>
 <directionalLight castShadow position={[28,44,18]} intensity={2.6} color="#ffe8bb" shadow-mapSize={[2048,2048]} shadow-camera-left={-47} shadow-camera-right={47} shadow-camera-top={47} shadow-camera-bottom={-47} shadow-bias={-.0005}/>
 <Ground/><Decorative/><Orchard state={state}/><Woodpile left={state.logsLeft}/><Market stock={state.stock}/>
 {VILLAGERS.map((v,i)=><Villager key={v.label} {...v} index={i}/>)}
 <Player controller={controller} onPosition={onPosition} initialPosition={initialPosition}/>
 </>;
}
export function SerenovaScene({state,controller,onPosition,initialPosition}:{state:GameState;controller:MutableRefObject<Set<string>>;onPosition:(p:Vec2)=>void;initialPosition:Vec2}){
 return <Canvas shadows dpr={[1,1.65]} camera={{position:[0,9,23],fov:57,near:.1,far:145}} gl={{antialias:true,powerPreference:'high-performance'}}>
 <SceneContents state={state} controller={controller} onPosition={onPosition} initialPosition={initialPosition}/>
 </Canvas>;
}