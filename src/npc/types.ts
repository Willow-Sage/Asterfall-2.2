/** Shared NPC definitions. No player-specific reputation belongs in this asset. */
export const PROFESSIONS = ["Farmer", "Fisher", "Miner", "Carpenter", "Mason", "Smith", "Tailor", "Potter", "Cook", "Herbalist", "Merchant", "Mage"] as const;
export type Profession = typeof PROFESSIONS[number];
export const CORE_SKILLS = ["Gathering", "Cultivation", "Craftsmanship", "Construction", "Scholarship", "Commerce"] as const;
export type CoreSkill = typeof CORE_SKILLS[number];
export type LifeStage = "child" | "teen" | "adult" | "elder";
export type Kinship = "spouse" | "partner" | "parent" | "child" | "sibling" | "grandparent" | "grandchild" | "aunt_uncle" | "niece_nephew";
export type RelationLink = { npcId: string; relation: Kinship };
export type DaySchedule = { at: number; anchor: string; activity: string };
export type NpcAppearance = { skin: string; hair: string; eyes: string; clothing: string; hairShape: "braid" | "short" | "long" | "curls" | "bun" | "ponytail" | "locs" | "waves" | "cropped"; outfit: "workwear" | "scholar" | "artisan" | "noble" | "fieldwear" | "riverwear" | "armored"; modelId: string; accessory?: "none" | "circlet" | "ribbon" | "headscarf" | "earrings" | "glasses" | "satchel" | "apron" | "cape" | "bracers"; accent?: string; height?: number; build?: "slim" | "average" | "broad"; styleNotes?: string };
export type Npc = {
  id: string;
  householdId: string;
  name: string;
  age: number;
  stage: LifeStage;
  identity: string;
  pronouns: string;
  role: string;
  location: string;
  profession: Profession | null;
  coreSkill: CoreSkill | null;
  socialStanding: "Commoner" | "Lesser nobility";
  magicAffinity: "None" | "Earth" | "Water" | "Wind" | "Fire";
  traits: [string, string];
  favoriteGift: string;
  dislikedGift: string;
  ambition: string;
  bio?: string;
  greeting?: string;
  family: RelationLink[];
  schedule: DaySchedule[];
  appearance: NpcAppearance;
  romanceEligible: boolean;
};
export type Household = { id: string; settlement: string; homeAnchor: string; members: string[]; familyName: string; composition: string };
export type NpcPack = { schemaVersion: "1.0"; world: "Tervac"; kingdom: "Solterra"; settlement: string; createdFromSeed: number; generatedAt: string; households: Household[]; npcs: Npc[] };
export type PlayerNpcRelationship = { npcId: string; playerId: string; friendship: number; lastTalkDay: number; lastGiftDay: number; flags: string[] };
export const PROFESSION_SKILL: Record<Profession,CoreSkill> = {
  Farmer:"Cultivation", Fisher:"Gathering", Miner:"Gathering", Carpenter:"Craftsmanship", Mason:"Construction", Smith:"Craftsmanship", Tailor:"Craftsmanship", Potter:"Craftsmanship", Cook:"Craftsmanship", Herbalist:"Scholarship", Merchant:"Commerce", Mage:"Scholarship"
};
export const WORK_ANCHOR: Record<Profession,string> = {
  Farmer:"fields", Fisher:"river_dock", Miner:"quarry", Carpenter:"workshop", Mason:"building_yard", Smith:"smithy", Tailor:"tailor_shop", Potter:"pottery_studio", Cook:"tavern_kitchen", Herbalist:"herb_garden", Merchant:"market", Mage:"scholars_hall"
};
export function validatePack(pack: NpcPack): string[] {
  const errors: string[] = [];
  const people = new Map(pack.npcs.map(p=>[p.id,p]));
  const sets = pack.households;
  if(people.size!==pack.npcs.length) errors.push("Duplicate resident ID");
  for(const h of sets){
    if(h.members.length<2||h.members.length>6) errors.push(`${h.id}: household outside 2–6 members`);
    for(const id of h.members) if(!people.has(id)) errors.push(`${h.id}: missing member ${id}`);
    if(h.members.some(id=>people.get(id)?.householdId!==h.id)) errors.push(`${h.id}: mismatched household ID`);
  }
  for(const p of pack.npcs){
    if(p.age<0 || p.stage==="child" && p.age>=13 || p.stage==="teen" && (p.age<13||p.age>=18) || p.stage==="adult" && (p.age<18||p.age>=65) || p.stage==="elder"&&p.age<65) errors.push(`${p.name}: invalid age/stage`);
    if(p.age<18 && (p.profession!==null||p.romanceEligible)) errors.push(`${p.name}: minor with adult profession/romance`);
    for(const k of p.family){
      const other = people.get(k.npcId);
      if(!other) {errors.push(`${p.name}: missing relative ${k.npcId}`);continue;}
      const reciprocal:Record<Kinship,Kinship>={spouse:"spouse",partner:"partner",parent:"child",child:"parent",sibling:"sibling",grandparent:"grandchild",grandchild:"grandparent",aunt_uncle:"niece_nephew",niece_nephew:"aunt_uncle"};
      if(!other.family.some(x=>x.npcId===p.id&&x.relation===reciprocal[k.relation])) errors.push(`${p.name}: relationship ${k.relation} not reciprocal`);
      if(k.relation==="parent" && other.age-p.age<18) errors.push(`${p.name}: parent age difference under 18`);
      if(k.relation==="grandparent" && other.age-p.age<36) errors.push(`${p.name}: grandparent age difference under 36`);
    }
  }
  return errors;
}