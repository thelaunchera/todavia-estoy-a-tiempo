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
