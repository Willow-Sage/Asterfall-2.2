import {useEffect,useMemo,useRef} from "react";
import * as THREE from "three";
import {Canvas,useFrame} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import {activityAt} from "./generator";
import {animateNpc,createNpcAvatar} from "./avatar";
import type {Npc} from "./types";

/** Provisional map coordinates until proper village navigation anchors are authored. */
const ANCHORS:Record<string,[number,number,number]>={fields:[-3,0,-2],river_dock:[4,0,-3],quarry:[5,0,0],workshop:[-2,0,3],building_yard:[-4,0,1],smithy:[2,0,2],tailor_shop:[-3,0,3],pottery_studio:[2,0,-3],tavern_kitchen:[-1,0,-2],herb_garden:[3,0,3],market:[1,0,1],scholars_hall:[-1,0,4],schoolhouse:[-2,0,1],gardens:[3,0,-1],square:[0,0,0]};
function hash(s:string){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
export function npcPosition(npc:Npc,hour:number):[number,number,number]{
 const active=activityAt(npc,hour);const anchor=active?.anchor||"square";
 const n=hash(npc.id),jitterX=((n%7)-3)*0.17,jitterZ=(((n>>>6)%7)-3)*0.17;
 if(anchor.startsWith("home:")){const h=hash(npc.householdId),angle=(h%360)*Math.PI/180;return [Math.cos(angle)*4.5+jitterX,0,Math.sin(angle)*4.5+jitterZ];}
 const p=ANCHORS[anchor]||ANCHORS.square;return [p[0]+jitterX,p[1],p[2]+jitterZ];
}
function Agent({npc,hour,focus,index}:{npc:Npc;hour:number;focus:boolean;index:number}){
 const group=useRef<THREE.Group>(null);const model=useMemo(()=>createNpcAvatar(npc),[npc]);
 useEffect(()=>()=>{model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});},[model]);
 const desired=useMemo(()=>{if(focus)return new THREE.Vector3(0,0,0);const p=npcPosition(npc,hour);return new THREE.Vector3(p[0],p[1],p[2]);},[npc,hour,focus]);
 const previous=useRef(new THREE.Vector3(0,0,0));
 useFrame(({clock},delta)=>{
  if(!group.current)return;
  const parent=group.current;
  if(parent.position.distanceTo(desired)>0.09)parent.position.lerp(desired,Math.min(1,delta*2.1));
  const walking=parent.position.distanceTo(desired)>0.13;
  animateNpc(model,clock.elapsedTime+index*0.64,walking);
  if(walking){const dir=desired.clone().sub(parent.position);parent.rotation.y=Math.atan2(dir.x,dir.z);}
  else parent.rotation.y=focus?Math.sin(clock.elapsedTime*0.20)*0.19:parent.rotation.y;
  previous.current.copy(parent.position);
 });
 return <group ref={group} position={focus?[0,0,0]:npcPosition(npc,hour)}><primitive object={model}/></group>;
}
export function NpcPopulation({npcs,hour,limit=24}:{npcs:Npc[];hour:number;limit?:number}){
 return <group name="Serenova NPC population">{npcs.slice(0,limit).map((npc,i)=><Agent key={npc.id} npc={npc} hour={hour} focus={false} index={i}/>)}</group>;
}
export function NpcPreview({npcs,hour,groupView}:{npcs:Npc[];hour:number;groupView:boolean}){
 const listed=groupView?npcs.slice(0,24):npcs.slice(0,1);
 return <div className="npc-preview" aria-label="Live 3D preview of generated Solterran NPCs"><Canvas shadows camera={{position:groupView?[9,10,12]:[2.8,2,3.8],fov:groupView?50:37}}>
  <color attach="background" args={["#bdc9c0"]}/><ambientLight intensity={1.3}/><hemisphereLight intensity={0.7} groundColor="#b79b7f" color="#fff2dc"/>
  <directionalLight castShadow position={[6,10,5]} intensity={2.3} color="#fff3d2" shadow-mapSize={[1024,1024]}/>
  <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]}><circleGeometry args={[groupView?12:3,72]}/><meshStandardMaterial color="#ded5c5" roughness={1}/></mesh>
  {listed.map((npc,i)=><Agent key={npc.id} npc={npc} hour={hour} focus={!groupView} index={i}/>)}
  <OrbitControls target={groupView?[0,0.9,0]:[0,0.9,0]} enablePan={false} minDistance={groupView?7:1.9} maxDistance={groupView?26:7} maxPolarAngle={Math.PI/2.1}/>
 </Canvas></div>;
}