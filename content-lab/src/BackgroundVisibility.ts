const hidden = new Set<string>();
export const isBackgroundVisible=(id:string)=>!hidden.has(id);
export const updateHiddenBackgrounds=(ids:string[])=>{hidden.clear();ids.forEach(id=>hidden.add(id));};
