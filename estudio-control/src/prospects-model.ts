
export type ProspectProjectLink = {label:string;href:string};

/**
 * Project shortcuts are persisted in the prospect's existing private notes.
 * Only the explicit ENLACES DIRECTOS section can produce clickable shortcuts;
 * untrusted links elsewhere in research notes remain plain text.
 */
export function prospectProjectLinks(notes:string):ProspectProjectLink[] {
  const lines=notes.split(/\r?\n/);
  const start=lines.findIndex(line=>/^ENLACES DIRECTOS\b/i.test(line.trim()));
  if(start<0)return [];
  const labels:Record<string,string>={
    'website':'Website',
    'menú digital':'Menú digital',
    'admin panel':'Admin Panel',
    'content planner / content hub':'Content Planner',
    'content planner':'Content Planner',
    'propuesta canva':'Propuesta Canva',
  };
  const links:ProspectProjectLink[]=[];
  const seen=new Set<string>();
  for(const line of lines.slice(start+1)){
    if(!line.trim())break;
    const match=line.trim().match(/^([^:]+):\s*(https?:\/\/[^\s<>]+)\s*$/i);
    if(!match)continue;
    const name=match[1].trim().replace(/\s*\([^)]*\)\s*$/,'').toLocaleLowerCase('es');
    const label=labels[name];
    if(!label||seen.has(label))continue;
    try{
      const url=new URL(match[2]);
      if(!['https:','http:'].includes(url.protocol)||url.username||url.password)continue;
      if(label==='Propuesta Canva'&&(url.protocol!=='https:'||!['canva.com','www.canva.com','canva.link'].includes(url.hostname)))continue;
      links.push({label,href:url.href});
      seen.add(label);
    }catch{/* Do not render an invalid URI as a link. */}
  }
  return links;
}

export const PROSPECT_STAGES = [
  { id: 'found', label: 'Encontrados', detail: 'Por investigar' },
  { id: 'qualified', label: 'Calificados', detail: 'Oportunidad validada' },
  { id: 'contacted', label: 'Contactados', detail: 'Primer acercamiento' },
  { id: 'proposal', label: 'Propuesta enviada', detail: 'En negociación' },
  { id: 'won', label: 'Ganados', detail: 'Proyecto confirmado' },
  { id: 'lost', label: 'Descartados', detail: 'Sin seguimiento activo' },
] as const;
export type ProspectStage = typeof PROSPECT_STAGES[number]['id'];
export type ProspectService = 'website' | 'menu' | 'both' | 'other';
export type ProspectWebsite = 'unverified' | 'none' | 'social_only' | 'exists';
export const SERVICES: Record<ProspectService,string> = {
  website: 'Website', menu: 'Menú digital', both: 'Website + menú', other: 'Otro servicio',
};
export const WEBSITE_STATUS: Record<ProspectWebsite,string> = {
  unverified: 'Por verificar', none: 'Sin web identificada',
  social_only: 'Solo redes o directorio', exists: 'Web existente',
};
export type StudioProspect = {
  id: string;
  owner_id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  service: ProspectService;
  website_status: ProspectWebsite;
  website_url: string;
  source_url: string;
  notes: string;
  next_follow_up: string | null;
  estimated_value: number;
  stage: ProspectStage;
  created_at: string;
  updated_at: string;
};
export type StudioProspectInput = Omit<StudioProspect, 'id' | 'owner_id' | 'created_at' | 'updated_at'>;
export const EMPTY_PROSPECT: StudioProspectInput = {
  business_name:'', contact_name:'', phone:'', email:'', city:'', state:'',
  service:'website', website_status:'unverified', website_url:'', source_url:'',
  notes:'', next_follow_up:null, estimated_value:0, stage:'found',
};
export function stageTotals(items:ReadonlyArray<Pick<StudioProspect,'stage'|'estimated_value'>>) {
  return PROSPECT_STAGES.map(stage=>({
    ...stage,
    count: items.filter(item=>item.stage===stage.id).length,
    total: items.filter(item=>item.stage===stage.id)
      .reduce((sum,item)=>sum + (Number.isFinite(item.estimated_value)?Math.max(0,item.estimated_value):0),0),
  }));
}
export function activePipelineTotal(items:ReadonlyArray<Pick<StudioProspect,'stage'|'estimated_value'>>) {
  return stageTotals(items).filter(stage=>stage.id!=='lost'&&stage.id!=='won')
    .reduce((total,stage)=>total+stage.total,0);
}
export function moveProspect<T extends {id:string;stage:ProspectStage}>(items:ReadonlyArray<T>,id:string,stage:ProspectStage):T[] {
  return items.map(item=>item.id===id?{...item,stage}:item);
}
export function parseEstimate(value:string):number {
  const n=Number(value);
  return value.trim()!==''&&Number.isFinite(n)&&n>=0?Math.round(Math.min(n,100000000)*100)/100:0;
}
