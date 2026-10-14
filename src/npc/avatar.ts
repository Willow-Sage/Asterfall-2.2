import * as THREE from "three";
import type {Npc} from "./types";
/** A fully generated 3D mesh hierarchy, usable as a world actor and exportable to GLB.
 * Concept-quality mesh; not the approved Cloudbound-level art or a skinned rig.
 */
const animationPivots = new WeakMap<THREE.Group,{arms:THREE.Group[];legs:THREE.Group[]}>();
export function createNpcAvatar(npc:Npc):THREE.Group{
 const root=new THREE.Group();root.name=`NPC_${npc.id}`;
 const a=npc.appearance;
 const skin=new THREE.MeshStandardMaterial({color:a.skin,roughness:0.83});
 const hairMat=new THREE.MeshStandardMaterial({color:a.hair,roughness:0.85});
 const cloth=new THREE.MeshStandardMaterial({color:a.clothing,roughness:0.87,side:THREE.DoubleSide});
 const trim=new THREE.MeshStandardMaterial({color:"#f1cca0",roughness:0.75});
 const undershirt=new THREE.MeshStandardMaterial({color:"#e3d6c5",roughness:0.88});
 const dark=new THREE.MeshStandardMaterial({color:"#312c3a",roughness:0.74});
 const bootMat=new THREE.MeshStandardMaterial({color:"#54433b",roughness:0.93});
 const eyeWhite=new THREE.MeshStandardMaterial({color:"#ffefdc",roughness:0.5});
 const iris=new THREE.MeshStandardMaterial({color:a.eyes,roughness:0.36});
 const highlight=new THREE.MeshBasicMaterial({color:"#fff9ef"});
 const sculpt=(parent:THREE.Object3D,geometry:THREE.BufferGeometry,material:THREE.Material,pos:[number,number,number],scale:[number,number,number]=[1,1,1])=>{
  const m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
 };
 const sphere=new THREE.SphereGeometry(1,24,18);
 const tapered=(top:number,bottom:number,height:number,material:THREE.Material,parent:THREE.Object3D,pos:[number,number,number])=>sculpt(parent,new THREE.CylinderGeometry(top,bottom,height,24,3),material,pos);
 const face=new THREE.Group();face.name="HeadPivot";face.position.y=1.52;root.add(face);
 sculpt(face,sphere,skin,[0,0,0],[0.235,0.275,0.215]);
 // Rounded cheek planes and nose projection distinguish the face from a featureless sphere.
 sculpt(face,sphere,skin,[0,-0.112,0.153],[0.16,0.115,0.070]);
 sculpt(face,sphere,skin,[0,-0.035,0.219],[0.036,0.067,0.040]);
 for(const sign of [-1,1]){
  const x=sign*0.098;
  sculpt(face,sphere,dark,[x,0.015,0.189],[0.070,0.081,0.021]);
  sculpt(face,sphere,eyeWhite,[x,0.022,0.207],[0.056,0.064,0.015]);
  sculpt(face,sphere,iris,[x,0.018,0.221],[0.032,0.052,0.009]);
  sculpt(face,sphere,dark,[x,0.017,0.230],[0.017,0.038,0.009]);
  sculpt(face,sphere,highlight,[x-sign*0.011,0.040,0.238],[0.010,0.014,0.006]);
  const brow=sculpt(face,new THREE.CapsuleGeometry(0.010,0.050,3,8),hairMat,[x,0.119,0.195],[1,1,1]);brow.rotation.z=sign*0.33;
  sculpt(face,sphere,skin,[sign*0.233,-0.03,0.013],[0.037,0.067,0.044]);
 }
 const lips=new THREE.MeshStandardMaterial({color:"#a96963",roughness:0.8});
 sculpt(face,sphere,lips,[0,-0.157,0.190],[0.046,0.009,0.009]);
 // A smooth fitted hair cap with strands framing the face; no random facial hair.
 sculpt(face,sphere,hairMat,[0,0.181,-0.025],[0.245,0.165,0.236]);
 const strand=(from:[number,number,number],to:[number,number,number],width:number)=>{
  const mid:[number,number,number]=[(from[0]+to[0])/2,(from[1]+to[1])/2+0.025,(from[2]+to[2])/2+0.050];
  const c=new THREE.QuadraticBezierCurve3(new THREE.Vector3(...from),new THREE.Vector3(...mid),new THREE.Vector3(...to));
  return sculpt(face,new THREE.TubeGeometry(c,10,width,7,false),hairMat,[0,0,0]);
 };
 for(let i=0;i<7;i++){const x=(i-3)*0.07;strand([x,0.268,0.065],[x+0.038,0.124,0.215],0.025);}
 if(a.hairShape!=="short"){
  for(const sign of [-1,1]){
   for(let i=0;i<(a.hairShape==="curls"?4:3);i++){
    const x=sign*(0.16+i*0.035);
    strand([x,0.20,-0.01],[x,-0.32-i*0.020,-0.062],a.hairShape==="curls"?0.052:0.039);
   }
  }
 }
 if(a.hairShape==="braid"){
  for(let j=0;j<5;j++)sculpt(face,sphere,hairMat,[0.15,-0.20-j*0.067,-0.15],[0.05,0.057,0.055]);
 }
 // Clothing includes fitted workwear, a curved apron/skirt, and embroidered trim.
 const torso=new THREE.Group();torso.name="Torso";root.add(torso);
 tapered(0.215,0.24,0.47,undershirt,torso,[0,1.025,0]);
 tapered(0.20,0.25,0.44,cloth,torso,[0,1.019,0]);
 const hem=sculpt(torso,new THREE.TorusGeometry(0.23,0.012,6,32),trim,[0,0.80,0]);hem.rotation.x=Math.PI/2;
 const collar=sculpt(torso,new THREE.TorusGeometry(0.135,0.022,7,32),trim,[0,1.25,0]);collar.rotation.x=Math.PI/2;
 // Slightly flared over-tunic creates an identifiable Solterran ensemble.
 tapered(0.245,a.outfit==="scholar"?0.41:0.325,a.outfit==="scholar"?0.54:0.40,cloth,root,[0,a.outfit==="scholar"?0.61:0.72,0]);
 const belt=sculpt(root,new THREE.TorusGeometry(0.232,0.016,6,32),bootMat,[0,0.856,0]);belt.rotation.x=Math.PI/2;
 sculpt(root,sphere,trim,[0,0.86,0.248],[0.05,0.055,0.015]);
 if(a.outfit==="artisan"){
  const panel=sculpt(root,new THREE.BoxGeometry(0.25,0.42,0.018),undershirt,[0,0.76,0.23]);panel.rotation.x=-0.055;
  sculpt(root,new THREE.BoxGeometry(0.22,0.015,0.022),trim,[0,0.63,0.244]);
 }
 if(a.outfit==="scholar"){
  sculpt(root,sphere,trim,[0,1.03,0.223],[0.028,0.042,0.016]);
 }
 const arms:THREE.Group[]=[];const legs:THREE.Group[]=[];
 for(const sign of [-1,1]){
  const arm=new THREE.Group();arm.name=sign<0?"Arm_L":"Arm_R";arm.position.set(sign*0.227,1.213,0);root.add(arm);arms.push(arm);
  sculpt(arm,sphere,cloth,[sign*0.04,-0.110,0],[0.110,0.18,0.118]);
  tapered(0.080,0.068,0.26,cloth,arm,[sign*0.055,-0.275,0]);
  sculpt(arm,sphere,skin,[sign*0.055,-0.455,0],[0.075,0.105,0.076]);
  const leg=new THREE.Group();leg.name=sign<0?"Leg_L":"Leg_R";leg.position.set(sign*0.117,0.625,0);root.add(leg);legs.push(leg);
  tapered(0.108,0.079,0.4,bootMat,leg,[0,-0.205,0]);
  sculpt(leg,sphere,bootMat,[0,-0.425,0.05],[0.100,0.09,0.153]);
 }
 root.userData={...root.userData,npcId:npc.id,displayName:npc.name,age:npc.age,householdId:npc.householdId,profession:npc.profession,appearanceAssetId:a.modelId};
 animationPivots.set(root,{arms,legs});
 // Human-height visual scale preserving recognizable age differences.
 const scale=npc.age<=5?0.58:npc.age<13?0.63+(npc.age-6)*0.037:npc.age<18?0.82+(npc.age-13)*0.036:npc.age>=65?0.94:1;
 root.scale.setScalar(scale);
 return root;
}
/** Safe animation of generated mesh hierarchy (GLB export is STATIC; this animation is runtime code). */
export function animateNpc(root:THREE.Group,elapsed:number,isWalking:boolean){
 const limbs=animationPivots.get(root);
 const phase=elapsed*5.8;
 for(let i=0;i<2;i++){
  if(limbs.legs?.[i])limbs.legs[i].rotation.x=isWalking?Math.sin(phase+i*Math.PI)*0.42:0;
  if(limbs.arms?.[i])limbs.arms[i].rotation.x=isWalking?Math.sin(phase+i*Math.PI+Math.PI)*0.28:0.04*Math.sin(elapsed*1.3+i);
 }
}