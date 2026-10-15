/** Asterfall 2.3 playable Serenova vertical-slice simulation.
 * Pure functions; never couple authoritative economy/progression to WebGL meshes.
 */
export type Vec2 = {x:number;z:number};
export type Kind = 'steward'|'orchard'|'wood'|'workshop'|'granary'|'market'|'well';
export type Place = {id:string;kind:Kind;name:string;position:Vec2;detail:string};
export type GameState = {
  schema:2; day:number; begun:boolean; completed:number; orchard:number[]; logsLeft:number;
  fruit:number; timber:number; crates:number; honey:number; coins:number; granary:number;
  stock:number; reputation:number; skills:{Gathering:number;Cultivation:number;Craftsmanship:number;Construction:number;Scholarship:number;Commerce:number};
  lastMessage:string; history:string[];
};
export const START:Vec2={x:0,z:10};
export const TREE_POSITIONS:Vec2[]=[{x:-19,z:-13},{x:-14,z:-17},{x:-24,z:-19},{x:-18,z:-24},{x:-10,z:-24},{x:-28,z:-12},{x:-11,z:-11},{x:-25,z:-27}];
export const PLACES:Place[]=[
 {id:'steward',kind:'steward',name:'Eliana · Estate Steward',position:{x:1,z:11},detail:'Receive your first commission or begin a new day'},
 ...TREE_POSITIONS.map((position,i)=>({id:`tree-${i}`,kind:'orchard' as Kind,name:`Citrus tree ${i+1}`,position,detail:'Pick ripe Solterran citrus'})),
 {id:'wood',kind:'wood',name:'Forester’s woodpile',position:{x:-8,z:-6},detail:'Collect seasoned timber for a market crate'},
 {id:'workshop',kind:'workshop',name:'Carpenter’s Workshop',position:{x:9,z:-4},detail:'Craft a sturdy wooden crate'},
 {id:'granary',kind:'granary',name:'Serenova Granary',position:{x:17,z:11},detail:'Deliver produce and supplies'},
 {id:'market',kind:'market',name:'Serenova Market',position:{x:20,z:-10},detail:'Trade locally made goods'},
 {id:'well',kind:'well',name:'Village Fountain',position:{x:3,z:1},detail:'A quiet place to observe village life'}
];
export const initialState=():GameState=>({schema:2,day:1,begun:false,completed:0,orchard:Array(TREE_POSITIONS.length).fill(2),logsLeft:9,fruit:0,timber:0,crates:0,honey:0,coins:12,granary:0,stock:0,reputation:0,skills:{Gathering:0,Cultivation:0,Craftsmanship:0,Construction:0,Scholarship:0,Commerce:0},lastMessage:'Find Eliana near the manor courtyard.',history:[]});
export const SAVE_KEY='asterfall-2.3-serenova-save';
export function loadGame():GameState{
 try{
  const raw=localStorage.getItem(SAVE_KEY);if(!raw)return initialState();const s=JSON.parse(raw) as GameState;
  if(s.schema!==2 || !Array.isArray(s.orchard)||s.orchard.length!==TREE_POSITIONS.length||!s.skills)return initialState();
  return s;
 }catch{return initialState();}
}
export function objective(s:GameState):string{
 if(!s.begun)return 'Speak with Eliana, the estate steward';
 if(s.fruit<6)return `Harvest citrus in the southern orchard · ${s.fruit}/6`;
 if(s.crates<1&&s.timber<3)return `Collect timber at the forester’s woodpile · ${s.timber}/3`;
 if(s.crates<1)return 'Craft a wooden crate at the carpenter’s workshop';
 return 'Deliver 6 citrus and 1 crate to the Serenova granary';
}
export function objectiveHint(s:GameState):string{
 if(!s.begun)return 'Look for Eliana at the manor entrance, then press E to speak.';
 if(s.fruit<6)return 'Follow the orchard path west. Each tree yields two fruit per day.';
 if(s.crates<1&&s.timber<3)return 'The woodpile lies between the market square and the orchard.';
 if(s.crates<1)return 'Visit the workshop east of the village fountain.';
 return 'Bring the harvest to the granary just beyond the manor road.';
}
export type ActionResult={state:GameState;message:string;success:boolean};
const done=(state:GameState,message:string,success:boolean):ActionResult=>{
 const next={...state,lastMessage:message,history:[message,...state.history].slice(0,12)};return {state:next,message,success};
};
export function interact(state:GameState,id:string):ActionResult{
 let s:GameState={...state,orchard:[...state.orchard],skills:{...state.skills}};
 if(id==='steward'){
  if(!s.begun&&s.completed>0){s.day++;s.begun=true;s.orchard=Array(TREE_POSITIONS.length).fill(2);s.logsLeft=9;return done(s,`Eliana: “The ${ordinal(s.day)} day begins. The grove is ready for another harvest. Your contributions are remembered.”`,true);}
  if(!s.begun){s.begun=true;return done(s,'Eliana: “Our market is short on citrus. Gather six fruit and prepare one crate for the granary. Your work will feed the village.”',true);}
  return done(s,'Eliana: “The orchard is southwest, the carpenter east of the fountain, and the granary beside the manor road.”',false);
 }
 if(id.startsWith('tree-')){
  const index=Number(id.slice(5));
  if(!s.begun)return done(s,'First speak with Eliana about the granary commission.',false);
  if(!Number.isInteger(index)||index<0||index>=s.orchard.length)return done(s,'This tree is out of reach.',false);
  if(s.orchard[index]===0)return done(s,'The branches are bare. Another harvest will grow tomorrow.',false);
  s.orchard[index]--;s.fruit++;s.skills.Gathering+=3;s.skills.Cultivation+=4;
  return done(s,`Picked a sun-ripened citrus. Pouch: ${s.fruit} fruit · +3 Gathering · +4 Cultivation`,true);
 }
 if(id==='wood'){
  if(!s.begun)return done(s,'Speak with Eliana before collecting communal timber.',false);
  if(s.logsLeft<=0)return done(s,'The forester’s pile is empty until the next day.',false);
  s.logsLeft--;s.timber++;s.skills.Gathering+=3;
  return done(s,`Collected seasoned timber (${s.timber} in pouch). +3 Gathering`,true);
 }
 if(id==='workshop'){
  if(s.timber<3)return done(s,`Lucien: “A sturdy crate needs 3 timber. You have ${s.timber}. The forester keeps a pile near the orchard path.”`,false);
  s.timber-=3;s.crates++;s.skills.Craftsmanship+=14;s.skills.Construction+=5;
  return done(s,'Lucien: “Fine work. This Solterran crate will carry the fruit safely.” Crafted +1 wooden crate · +14 Craftsmanship',true);
 }
 if(id==='granary'){
  if(!s.begun)return done(s,'The granary accepts commissioned deliveries. See Eliana first.',false);
  if(s.fruit<6||s.crates<1)return done(s,`Granary keeper: “The order requires 6 citrus and a crate. You have ${s.fruit} fruit and ${s.crates} crates.”`,false);
  s.fruit-=6;s.crates--;s.granary+=6;s.stock+=6;s.completed++;s.begun=false;s.coins+=28;s.reputation+=12;s.skills.Commerce+=12;s.skills.Construction+=4;
  return done(s,'Commission complete! The granary stores six citrus, the market stall is stocked, and Serenova rewards you 28 crowns. Return to Eliana to begin another day.',true);
 }
 if(id==='market'){
  if(s.stock>0&&s.coins>=8){s.coins-=8;s.honey++;s.stock--;s.skills.Commerce+=5;return done(s,'Market trade: purchased citrus honey for 8 crowns. One stocked item sold · +5 Commerce',true);}
  if(s.stock===0)return done(s,'Mireya: “Our stalls need fresh deliveries. Contribute a harvest to the granary and we can offer our honey.”',false);
  return done(s,'Mireya: “Citrus honey is 8 crowns. Come back with enough money to trade.”',false);
 }
 if(id==='well')return done(s,'The village fountain is cool to the touch. Birds and neighbors gather around the water.',false);
 return done(s,'Nothing to interact with here.',false);
}
function ordinal(n:number){const suffix=n%10===1&&n%100!==11?'st':n%10===2&&n%100!==12?'nd':n%10===3&&n%100!==13?'rd':'th';return `${n}${suffix}`;}
export function closestPlace(pos:Vec2,state:GameState,maxDistance=3.8):Place|null{
 let best:Place|null=null,bestDistance=maxDistance;
 for(const p of PLACES){
  const distance=Math.hypot(pos.x-p.position.x,pos.z-p.position.z);
  if(distance<bestDistance){best=p;bestDistance=distance;}
 }
 return best;
}
export function nextTarget(state:GameState):Vec2{
 if(!state.begun)return PLACES[0].position;
 if(state.fruit<6)return TREE_POSITIONS.find((_,i)=>state.orchard[i]>0)??TREE_POSITIONS[0];
 if(state.crates<1&&state.timber<3)return PLACES.find(p=>p.id==='wood')!.position;
 if(state.crates<1)return PLACES.find(p=>p.id==='workshop')!.position;
 return PLACES.find(p=>p.id==='granary')!.position;
}