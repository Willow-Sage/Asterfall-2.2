import {Suspense} from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls,useGLTF} from "@react-three/drei";
import {assets,assetURL} from "../assets/manifest";
function Village(){const model=useGLTF(assetURL(assets.village!.path));return <primitive object={model.scene}/>;}
// Asset inspection viewport. Character movement is a later implementation,
// contingent on approved rig, collision geometry, and animation clips.
export function VisualScene(){return <Canvas shadows camera={{position:[8,5,8],fov:45}}><color attach="background" args={["#b8d4e6"]}/><ambientLight intensity={0.7}/><directionalLight castShadow position={[12,18,8]} intensity={2.2} color="#ffe2b5"/><Suspense fallback={null}><Village/></Suspense><OrbitControls target={[0,1,0]} minDistance={2} maxDistance={30}/></Canvas>;}
