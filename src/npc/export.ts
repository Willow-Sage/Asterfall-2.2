import * as THREE from "three";
import {GLTFExporter} from "three/addons/exporters/GLTFExporter.js";
import {createNpcAvatar} from "./avatar";
import type {Npc,NpcPack} from "./types";
function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),3000);}
function safe(name:string){return name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
export function downloadNpcPack(pack:NpcPack){download(new Blob([JSON.stringify(pack,null,2)],{type:"application/json"}),`asterfall-${safe(pack.settlement)}-npc-pack.json`);}
/** Export an actual .glb mesh from the character generator, not only NPC metadata. */
export async function downloadNpcMesh(npc:Npc){const exporter=new GLTFExporter();const avatar=createNpcAvatar(npc);
 try{
  const output=await new Promise<ArrayBuffer>((resolve,reject)=>{
   exporter.parse(avatar,result=>{if(result instanceof ArrayBuffer)resolve(result);else reject(new Error("Expected binary glTF"));},reject,{binary:true,onlyVisible:true,trs:true});
  });
  download(new Blob([output],{type:"model/gltf-binary"}),`${safe(npc.name)}-${npc.id}.glb`);
 }finally{
  avatar.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});
 }
}