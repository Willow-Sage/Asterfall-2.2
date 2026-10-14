import {useMemo,useState} from "react";
import {generatePopulation,AVERAGE_HOUSEHOLD_SIZE,activityAt,friendshipLevel} from "./generator";
import {NpcPreview} from "./NpcWorld";
import {downloadNpcMesh,downloadNpcPack} from "./export";
import type {NpcPack,PlayerNpcRelationship,RelationLink} from "./types";
import {validatePack} from "./types";

function relationName(relation:RelationLink["relation"]){return ({spouse:"Spouse",partner:"Partner",parent:"Parent",child:"Child",sibling:"Sibling",grandparent:"Grandparent",grandchild:"Grandchild",aunt_uncle:"Aunt/uncle",niece_nephew:"Niece/nephew"} as const)[relation];}
function getRelated(pack:NpcPack,id:string){const n=pack.npcs.find(n=>n.id===id);return n?n.family.flatMap(r=>{const relative=pack.npcs.find(x=>x.id===r.npcId);return relative?[{npc:relative,relationship:relationName(r.relation)}]:[];}):[];}
export function NpcStudio(){
 const [seed,setSeed]=useState(2026),[count,setCount]=useState(6),[settlement,setSettlement]=useState("Serenova");
 const [pack,setPack]=useState<NpcPack>(()=>generatePopulation(2026,6,"Serenova"));
 const [selected,setSelected]=useState(pack.npcs[0].id);
 const [groupView,setGroupView]=useState(false),[hour,setHour]=useState(10),[day,setDay]=useState(1);
 const [friends,setFriends]=useState<Record<string,PlayerNpcRelationship>>({}),[notice,setNotice]=useState(""),[exporting,setExporting]=useState(false);
 const resident=pack.npcs.find(n=>n.id===selected)||pack.npcs[0];
 const family=pack.households.find(h=>h.id===resident?.householdId);
 const bond=friends[resident.id]||{npcId:resident.id,playerId:"local-prototype",friendship:0,lastTalkDay:-1,lastGiftDay:-1,flags:[]};
 const householdMean=useMemo(()=>pack.npcs.length/pack.households.length,[pack]);
 function regenerate(){try{const fresh=generatePopulation(seed,count,settlement.trim()||"Serenova");setPack(fresh);setSelected(fresh.npcs[0].id);setFriends({});setNotice(`Created ${fresh.npcs.length} residents in ${fresh.households.length} households. Models are generated when rendered or exported.`);}catch(e){setNotice(e instanceof Error?e.message:"Generation failed");}}
 function socialize(action:"talk"|"gift"|"disliked"){
  if(!resident)return;
  const existing=friends[resident.id]||{npcId:resident.id,playerId:"local-prototype",friendship:0,lastTalkDay:-1,lastGiftDay:-1,flags:[]};
  if(action==="talk"&&existing.lastTalkDay===day){setNotice("You have already talked today.");return;}
  if(action!=="talk"&&existing.lastGiftDay===day){setNotice("You have already given a gift today.");return;}
  const gain=action==="talk"?4:action==="gift"?12:-8;
  setFriends(old=>({...old,[resident.id]:{...existing,friendship:Math.max(0,Math.min(100,existing.friendship+gain)),lastTalkDay:action==="talk"?day:existing.lastTalkDay,lastGiftDay:action!=="talk"?day:existing.lastGiftDay}}));
  setNotice(`${resident.name}: ${gain>0?"+":""}${gain} friendship. Personal reputation remains per-player, not part of shared NPC data.`);
 }
 async function exportModel(){if(!resident||exporting)return;setExporting(true);setNotice("Preparing 3D GLB mesh…");try{await downloadNpcMesh(resident);setNotice(`Exported ${resident.name}'s 3D mesh (.glb). A production-ready skeleton and animation clips are still required.`);}catch(error){setNotice(`Mesh export failed: ${error instanceof Error?error.message:String(error)}`);}finally{setExporting(false);}}
 return <div className="npc-studio">
  <div className="npc-studio-intro"><span className="eyebrow">SERENOVA · SETTLEMENT LIFE</span><h2>NPC Studio</h2><p>Generate village families, review identities and routines, preview their actual 3D bodies, and export game-ready population data and prototype GLB meshes.</p></div>
  <div className="npc-controls">
   <label>Settlement<input aria-label="Settlement" value={settlement} onChange={e=>setSettlement(e.target.value)} /></label>
   <label>Households<input aria-label="Households" type="number" min={1} max={20} value={count} onChange={e=>setCount(Math.max(1,Math.min(20,Number(e.target.value)||1)))}/></label>
   <label>Generation seed<input aria-label="Generation seed" type="number" value={seed} onChange={e=>setSeed(Number(e.target.value)||0)}/></label>
   <button onClick={regenerate} className="npc-btn npc-btn-primary">Generate population</button>
  </div>
  <div className="npc-figures"><span><strong>{pack.households.length}</strong> households</span><span><strong>{pack.npcs.length}</strong> residents</span><span><strong>{householdMean.toFixed(1)}</strong> persons / household</span><span><strong>{AVERAGE_HOUSEHOLD_SIZE.toFixed(1)}</strong> target average</span><span><strong>{pack.npcs.filter(n=>n.age<18).length}</strong> children & teens</span></div>
  <div className="npc-workspace">
   <aside className="npc-registry"><h3>Village households</h3><p className="npc-small">Each family includes 2–6 members. A generated village always averages four.</p>
    <div className="npc-house-list">{pack.households.map(h=><section key={h.id} className="npc-house"><h4>{h.familyName} family <small>{h.members.length} people</small></h4><p>{h.composition}</p>
     {h.members.map(id=>{const n=pack.npcs.find(p=>p.id===id)!;return <button key={id} onClick={()=>{setSelected(id);setGroupView(false);setNotice("");}} className={`npc-resident ${resident?.id===id?"selected":""}`}><span>{n.name.split(" ")[0]} <small>{n.age} · {n.role}</small></span><span className="npc-career">{n.profession||"Student"}</span></button>;})}
    </section>)}</div>
   </aside>
   <section className="npc-stage"><div className="npc-stage-header"><h3>Live 3D character preview</h3><div><button onClick={()=>setGroupView(false)} className={groupView?"":"active"}>Character</button><button className={groupView?"active":""} onClick={()=>setGroupView(true)}>Village population</button></div></div>
    <NpcPreview key={groupView?"group":"solo"} npcs={groupView?pack.npcs:resident?[resident]:[]} hour={hour} groupView={groupView}/>
    <p className="npc-small">Orbit the camera to inspect actual generated 3D meshes. These are editable prototype character assets, not the approved final anime models. Group view displays time-dependent location anchors, not finished village pathfinding.</p>
    <div className="npc-clock"><label>Settlement time <strong>{String(hour).padStart(2,"0")}:00 · Day {day}</strong><input type="range" min={0} max={23} value={hour} onChange={e=>setHour(Number(e.target.value))}/></label><button onClick={()=>{setDay(n=>n+1);setNotice("Next day: daily conversations and gifts reset.");}}>Next day →</button></div>
   </section>
   {resident&&<aside className="npc-profile"><h3>{resident.name}</h3><p className="npc-small">{resident.age} years · {resident.identity} ({resident.pronouns}) · {resident.socialStanding}</p><div className="npc-chips"><span>{resident.profession||"Student"}</span><span>{resident.coreSkill||"Learning"}</span><span>{resident.magicAffinity} magic</span></div>
    <h4>Household</h4><p><strong>{family?.familyName}</strong> · {family?.members.length} family members<br/>{resident.role}</p>
    <div className="npc-relations">{getRelated(pack,resident.id).map(r=><button key={r.npc.id} onClick={()=>setSelected(r.npc.id)}><strong>{r.relationship}</strong><span>{r.npc.name} · {r.npc.age}</span></button>)}</div>
    <h4>Life & routine</h4><p><strong>{resident.traits.join(" · ")}</strong><br/>{resident.ambition}.</p>
    <div className="npc-routine">{resident.schedule.map(s=><div key={`${s.at}-${s.anchor}`} className={activityAt(resident,hour)===s?"now":""}><time>{String(s.at).padStart(2,"0")}:00</time><span>{s.activity}</span></div>)}</div>
    <h4>Player relationship</h4><div className="npc-bond"><span>{friendshipLevel(bond.friendship)}</span><strong>{bond.friendship}/100</strong></div><progress value={bond.friendship} max={100}/><p className="npc-small">Favorite: {resident.favoriteGift}<br/>Dislikes: {resident.dislikedGift}</p>
    <div className="npc-actions"><button onClick={()=>socialize("talk")} disabled={bond.lastTalkDay===day}>Talk</button><button onClick={()=>socialize("gift")} disabled={bond.lastGiftDay===day}>Loved gift</button><button onClick={()=>socialize("disliked")} disabled={bond.lastGiftDay===day}>Disliked gift</button></div>
    <h4>Export assets</h4><div className="npc-actions"><button onClick={()=>downloadNpcPack(pack)}>NPC JSON pack</button><button onClick={exportModel} disabled={exporting}>{exporting?"Exporting…":"3D character GLB"}</button></div>
    <p className="npc-small">JSON stores named identities, verified kinship links, professions, schedules and appearance parameters; GLB stores a real 3D character mesh. Character animation is currently performed by the runtime controller, not stored as GLB clips.</p>
   </aside>}
  </div>
  <p className="npc-msg" role="status">{notice||`${validatePack(pack).length===0?"✓ All household and reciprocal kinship checks pass.":"⚠ Family validation needs attention."} All residents belong to a 2–6 person family.`}</p>
 </div>;
}