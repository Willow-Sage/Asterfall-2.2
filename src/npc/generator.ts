import {PROFESSIONS,PROFESSION_SKILL,WORK_ANCHOR,validatePack,type Npc,type NpcPack,type Household,type Kinship,type Profession,type NpcAppearance,type DaySchedule,type LifeStage} from "./types";
/** 2–6 household distribution; weights are symmetric around 4, so E[size] = 4. */
export const HOUSEHOLD_WEIGHTS: ReadonlyArray<readonly [number,number]> = [[2,1],[3,2],[4,6],[5,2],[6,1]];
export const AVERAGE_HOUSEHOLD_SIZE = HOUSEHOLD_WEIGHTS.reduce((s,[size,w])=>s+size*w,0)/HOUSEHOLD_WEIGHTS.reduce((s,[,w])=>s+w,0);
const GIVEN = ["Amalia","Lucien","Isara","Renzo","Eliana","Mateo","Seren","Dario","Mireya","Tavian","Neria","Cassian","Aveline","Ilan","Vesper","Marisol","Arielle","Soren","Leora","Emilio","Inara","Noel","Celia","Rafael","Sabela","Aurel","Liora","Ezio","Miral","Soraya","Rafaela","Natan","Eleni","Corin","Rosalia","Jovan","Alina","Talia"];
const FAMILIES = ["Valera","Serrano","Bellamar","Ortez","Calder","Mirell","Solenne","Neris","Peralta","Alvarin","Lunaro","Varela","Morales","Roselle"];
const TRAITS = [["Thoughtful","Meticulous"],["Outgoing","Generous"],["Reserved","Curious"],["Ambitious","Loyal"],["Playful","Inventive"],["Patient","Traditional"],["Warm","Independent"],["Practical","Protective"]] as const;
const GIFTS = ["Citrus honey cake","Blue-glazed pottery","Fresh herbs","Embroidered ribbon","Wildflower bouquet","Spiced bread","Handcrafted charm","River pearls"];
const COLORS = {skin:["#d5a279","#9e664e","#f0c3a2","#7e4f3c","#d59b80","#8c5344"],hair:["#32242c","#452b24","#6c3e2c","#1c2635","#b88c55","#754d4a"],eyes:["#42675d","#584737","#55769a","#866347","#77875a"],cloth:["#437a75","#af7254","#6976a1","#a48456","#627c64","#7f648a","#bf8b71"]};
export function rng(seed:number){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function pick<T>(xs:readonly T[],random:()=>number):T{return xs[Math.floor(random()*xs.length)]!;}
function range(from:number,to:number,random:()=>number){return from+Math.floor(random()*(to-from+1));}
function weightedSize(random:()=>number){const total=HOUSEHOLD_WEIGHTS.reduce((s,[,w])=>s+w,0);let roll=random()*total;for(const [n,w] of HOUSEHOLD_WEIGHTS){roll-=w;if(roll<0)return n;}return 4;}
function lifeStage(age:number):LifeStage{return age<13?"child":age<18?"teen":age<65?"adult":"elder";}
function makeSchedule(stage:LifeStage,profession:Profession|null,home:string,personality:string):DaySchedule[]{
  const work=profession?WORK_ANCHOR[profession]:"schoolhouse";
  if(stage==="elder"&&!profession)return [{at:6,anchor:home,activity:"Morning at home"},{at:9,anchor:"gardens",activity:"Tending family garden"},{at:12,anchor:home,activity:"Family lunch"},{at:16,anchor:"square",activity:"Visiting neighbors"},{at:20,anchor:home,activity:"Family evening"}];
  if(stage==="child"||stage==="teen")return [{at:6,anchor:home,activity:"Breakfast with family"},{at:8,anchor:"schoolhouse",activity:"Lessons and apprenticeship"},{at:12,anchor:home,activity:"Lunch with family"},{at:14,anchor:"schoolhouse",activity:"Study and age-appropriate chores"},{at:16,anchor:"square",activity:"Playing with friends"},{at:19,anchor:home,activity:"Family dinner"},{at:21,anchor:home,activity:"Sleeping"}];
  return [{at:6,anchor:home,activity:"Breakfast and household chores"},{at:8,anchor:work,activity:`Working as ${profession?.toLowerCase()??"resident"}`},{at:12,anchor:"market",activity:"Lunch and market errands"},{at:13,anchor:work,activity:"Afternoon work"},{at:17,anchor:"square",activity:personality==="Reserved"?"A quiet walk":"Meeting friends and neighbors"},{at:19,anchor:home,activity:"Family dinner"},{at:21,anchor:home,activity:"Rest"}];
}
/** Generate both sides of every family edge from one source of truth. */
function link(a:Npc,b:Npc,aToB:Kinship,bToA:Kinship){if(!a.family.some(r=>r.npcId===b.id))a.family.push({npcId:b.id,relation:aToB});if(!b.family.some(r=>r.npcId===a.id))b.family.push({npcId:a.id,relation:bToA});}
function member(id:string,householdId:string,fullName:string,age:number,role:string,location:string,home:string,random:()=>number,forcedProfession?:Profession):Npc{
 const stage=lifeStage(age);const adult=age>=18;
 const profession=adult?(forcedProfession||pick(PROFESSIONS,random)):null;
 const identity=pick(["Woman","Man","Nonbinary"],random);
 const [traitA,traitB]=pick(TRAITS,random);
 const hairShape=pick(["braid","short","long","curls"] as const,random);
 const appearance:NpcAppearance={skin:pick(COLORS.skin,random),hair:pick(COLORS.hair,random),eyes:pick(COLORS.eyes,random),clothing:pick(COLORS.cloth,random),hairShape,outfit:profession==="Mage"?"scholar":profession==="Merchant"||profession==="Tailor"||profession==="Potter"?"artisan":"workwear",modelId:"generated-solterran-v1"};
 const pronouns=identity==="Woman"?"she/her":identity==="Man"?"he/him":"they/them";
 return {id,householdId,name:fullName,age,stage,identity,pronouns,role,location,profession,coreSkill:profession?PROFESSION_SKILL[profession]:null,socialStanding:random()<0.05?"Lesser nobility":"Commoner",magicAffinity:profession==="Mage"?pick(["Earth","Water","Wind","Fire"] as const,random):random()<0.1?pick(["Earth","Water","Wind"] as const,random):"None",traits:[traitA,traitB],favoriteGift:pick(GIFTS,random),dislikedGift:pick(["Spoiled fruit","Broken tools","Damaged pottery","Torn fabric"],random),ambition:stage==="child"||stage==="teen"?"Learn a craft and contribute to the village":`Become a respected ${profession?.toLowerCase()??"resident"} and support the household`,family:[],schedule:makeSchedule(stage,profession,home,traitA),appearance,romanceEligible:age>=18&&age<60&&role!=="Spouse"&&role!=="Partner"};
}
/** All generated households contain 2–6 actual linked family members. */
export function generateHousehold(seed:number,index:number,settlement="Serenova",leadProfession?:Profession,forcedSize?:number):{household:Household;npcs:Npc[]}{
 const random=rng(seed*98731+index*8191+7),size=forcedSize??weightedSize(random);
 if(size<2||size>6||!Number.isInteger(size))throw new Error("Household size must be an integer from 2 to 6");
 const surname=pick(FAMILIES,random),id=`solterra-${settlement.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-h${seed}-${index}`,home=`home:${id}`;
 const template=pick(["two_parents","two_parents","single_parent","multigenerational","extended_siblings"] as const,random);
 // Household structures deliberately keep parents older than their children and
 // grandparent ages plausible rather than rolling all ages independently.
 const gen:{age:number;role:string;surname:string}[]=[];
 if(template==="two_parents" || (size===2&&template==="multigenerational")){
   const oldest=range(35,48,random),second=oldest+range(-4,4,random);gen.push({age:oldest,role:"Parent",surname},{age:second,role:"Parent",surname});
   for(let i=2;i<size;i++)gen.push({age:range(5,Math.min(17,Math.min(oldest,second)-19),random),role:"Child",surname});
 }else if(template==="single_parent"){
   const parent=range(35,51,random);gen.push({age:parent,role:"Parent",surname});
   for(let i=1;i<size;i++)gen.push({age:range(5,Math.min(17,parent-19),random),role:"Child",surname});
 }else if(template==="multigenerational"){
   const grand=range(67,82,random),parent=range(40,Math.min(54,grand-20),random);
   gen.push({age:grand,role:"Grandparent",surname},{age:parent,role:"Parent",surname});
   for(let i=2;i<size;i++)gen.push({age:range(5,Math.min(17,parent-19),random),role:"Child",surname});
 }else {
   const older=range(39,55,random);
   gen.push({age:older,role:"Adult sibling",surname},{age:Math.max(23,older-range(1,9,random)),role:"Adult sibling",surname});
   for(let i=2;i<size;i++)gen.push({age:range(5,Math.min(17,older-19),random),role:"Child",surname});
 }
 // Unique names within a household, with stable identifiers independent of display names.
 const names=new Set<string>();
 const npcs=gen.map((person,k)=>{let first=pick(GIVEN,random);while(names.has(first))first=pick(GIVEN,random);names.add(first);return member(`${id}-p${k}`,id,`${first} ${person.surname}`,person.age,person.role,settlement,home,random,k===0?leadProfession:undefined);});
 const [a,b]=npcs;
 if(template==="two_parents"||size===2&&template==="multigenerational"){
   link(a,b,"partner","partner");a.role="Partner";b.role="Partner";a.romanceEligible=false;b.romanceEligible=false;
   for(let k=2;k<npcs.length;k++){link(npcs[k],a,"parent","child");link(npcs[k],b,"parent","child");}
   for(let k=2;k<npcs.length;k++)for(let j=k+1;j<npcs.length;j++)link(npcs[k],npcs[j],"sibling","sibling");
 }else if(template==="single_parent"){
   for(let k=1;k<npcs.length;k++)link(npcs[k],a,"parent","child");
   for(let k=1;k<npcs.length;k++)for(let j=k+1;j<npcs.length;j++)link(npcs[k],npcs[j],"sibling","sibling");
 }else if(template==="multigenerational"){
   link(b,a,"parent","child");
   for(let k=2;k<npcs.length;k++){link(npcs[k],b,"parent","child");link(npcs[k],a,"grandparent","grandchild");}
   for(let k=2;k<npcs.length;k++)for(let j=k+1;j<npcs.length;j++)link(npcs[k],npcs[j],"sibling","sibling");
 }else{
   link(a,b,"sibling","sibling");
   for(let k=2;k<npcs.length;k++){link(npcs[k],a,"parent","child");link(npcs[k],b,"aunt_uncle","niece_nephew");}
   for(let k=2;k<npcs.length;k++)for(let j=k+1;j<npcs.length;j++)link(npcs[k],npcs[j],"sibling","sibling");
 }
 const composition=template==="two_parents"?"Two parents and children":template==="single_parent"?"Single parent and children":template==="multigenerational"?(size===2?"Couple":"Three generations"):"Siblings and nieces/nephews";
 return {household:{id,settlement,homeAnchor:home,members:npcs.map(n=>n.id),familyName:surname,composition},npcs};
}
export function generatePopulation(seed=2026,householdCount=6,settlement="Serenova"):NpcPack{
 if(!Number.isInteger(householdCount)||householdCount<1||householdCount>80)throw new Error("Household count must be between 1 and 80");
 const households:Household[]=[],npcs:Npc[]=[];
 const random=rng(seed^0x7c41),sizes:number[]=[];
 for(let i=0;i<Math.floor(householdCount/2);i++){const size=weightedSize(random);sizes.push(size,8-size);}
 if(householdCount%2) sizes.push(4);
 for(let i=sizes.length-1;i>0;i--){const j=range(0,i,random);[sizes[i],sizes[j]]=[sizes[j],sizes[i]];}
 for(let i=0;i<householdCount;i++){const result=generateHousehold(seed,i,settlement,undefined,sizes[i]);households.push(result.household);npcs.push(...result.npcs);}
 const pack:NpcPack={schemaVersion:"1.0",world:"Tervac",kingdom:"Solterra",settlement,createdFromSeed:seed,generatedAt:new Date().toISOString(),households,npcs};
 const errors=validatePack(pack);if(errors.length)throw new Error(`Invalid generated population: ${errors.join("; ")}`);
 return pack;
}
export function activityAt(npc:Npc,hour:number){return [...npc.schedule].reverse().find(slot=>slot.at<=hour)||npc.schedule[npc.schedule.length-1];}
export function friendshipLevel(points:number){return points>=85?"Cherished":points>=60?"Close friend":points>=35?"Friend":points>=15?"Acquaintance":"Stranger";}