export type ApprovedAsset = {path:string; author:string; license:string; source:string};
// Add only licensed, reviewed assets. Paths are relative to public/.
export const assets: {player:ApprovedAsset|null; village:ApprovedAsset|null} = {player:null,village:null};
export const assetURL=(path:string)=>import.meta.env.BASE_URL+path;
