import {Suspense} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls,useGLTF} from "@react-three/drei";
import {assets,assetURL} from "../assets/manifest";
import {NpcPopulation} from "../npc/NpcWorld";
import {generatePopulation} from "../npc/generator";
const defaultPopulation=generatePopulation(2026,6,"Serenova");
function Village(){const model=useGLTF(assetURL(assets.village!.path));return <primitive object={model.scene}/>;}
/** Population bridge: residents are actual three.js mesh actors in the world
 * when a reviewed village model is assigned. Anchors are provisional pending navmesh. */
export function VisualScene(){return <Canvas shadows camera={{position:[8,5,8],fov:45}}><color attach="background" args={["#b8d4e6"]}/><ambientLight intensity={0.7}/><directionalLight castShadow position={[12,18,8]} intensity={2.2} color="#ffe2b5"/><Suspense fallback={null}><Village/><NpcPopulation npcs={defaultPopulation.npcs} hour={10} limit={18}/></Suspense><OrbitControls target={[0,1,0]} minDistance={2} maxDistance={30}/></Canvas>;}