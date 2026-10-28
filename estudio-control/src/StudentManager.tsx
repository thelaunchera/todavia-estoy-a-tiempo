import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, CircleAlert, Gift, RefreshCw, Search, Users } from 'lucide-react';
import {
  getStudioStudents, getStudioBonusResources, getStudioBonusGrants,
  setStudentBonusGrant,
  type StudioStudent, type StudioBonusResource, type StudioBonusGrant,
} from './supabase-client';
import './student-manager.css';

const readable = (value: string | null) => value
  ? new Intl.DateTimeFormat('es-US', { day:'numeric',month:'short',year:'numeric' }).format(new Date(value))
  : '—';
const STATUS: Record<StudioStudent['status'],string> = {
  active:'Acceso activo', pending:'Pago pendiente', refunded:'Reembolsado', revoked:'Acceso retirado',
};

export default function StudentManager() {
  const [students,setStudents] = useState<StudioStudent[]>([]);
  const [resources,setResources] = useState<StudioBonusResource[]>([]);
  const [grants,setGrants] = useState<StudioBonusGrant[]>([]);
  const [selected,setSelected] = useState('');
  const [search,setSearch] = useState('');
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState('');
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [refresh,setRefresh] = useState(0);
  useEffect(()=>{
    let alive = true;
    setLoading(true);setError('');
    Promise.all([getStudioStudents(),getStudioBonusResources(),getStudioBonusGrants()])
      .then(([s,r,g])=>{if(alive){setStudents(s);setResources(r);setGrants(g);}})
      .catch(()=>{if(alive)setError('No se pudo cargar la gestión de alumnos. Comprueba tu sesión y pulsa Actualizar.');})
      .finally(()=>{if(alive)setLoading(false);});
    return ()=>{alive=false;};
  },[refresh]);

  const filtered = useMemo(()=>students.filter(s=>
    s.buyer_email.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  ),[students,search]);
  const current = students.find(s=>s.buyer_email===selected);
  const active = students.filter(s=>s.status==='active'&&!s.revoked_at).length;
  const assigned = grants.filter(g=>g.buyer_email===selected);

  async function toggle(email:string,code:string,checked:boolean){
    const key=email+':'+code;
    setSaving(key);setError('');setNotice('');
    try{
      await setStudentBonusGrant(email,code,checked);
      setGrants(prev=>checked
        ? prev.some(g=>g.buyer_email===email&&g.resource_code===code)
          ? prev : [...prev,{buyer_email:email,resource_code:code}]
        : prev.filter(g=>!(g.buyer_email===email&&g.resource_code===code)));
      setNotice(checked ? 'Bono asignado únicamente a '+email+'.' : 'Bono retirado de '+email+'.');
    }catch{
      setError('No se guardó el cambio. Comprueba tu conexión y vuelve a intentarlo.');
    }finally{setSaving('');}
  }

  return (
    <section className="studio-students" aria-label="Lista de alumnos y bonos individuales">
      <div className="studio-students-heading">
        <div><span className="eyebrow">GESTIÓN PRIVADA DE LA CLASE</span>
          <h2>Alumnos y sus bonos</h2>
          <p>Consulta las compras de esta clase y elige exactamente qué bono recibe cada alumno. Esta lista es independiente de la audiencia del podcast.</p></div>
        <button type="button" onClick={()=>setRefresh(n=>n+1)} disabled={loading||!!saving}><RefreshCw size={16}/> Actualizar</button>
      </div>
      <div className="studio-student-stats">
        <span><strong>{students.length}</strong> compras registradas</span>
        <span><strong>{active}</strong> alumnos con acceso activo</span>
        <span><strong>{resources.length}</strong> bonos para elegir</span>
      </div>
      {error && <p role="alert" className="student-management-alert"><CircleAlert size={17}/>{error}</p>}
      {notice && <p role="status" className="student-management-saved"><Check size={17}/>{notice}</p>}
      {loading ? <p className="student-management-empty">Comprobando alumnos y asignaciones…</p> :
      students.length===0
      ? <div className="student-management-empty"><Users size={26}/><h3>Aún no hay alumnos registrados.</h3><p>Cuando se confirme una compra de la clase, su correo aparecerá aquí automáticamente. No es necesario agregarlo a la audiencia del podcast.</p></div>
      : <>
        <label className="student-manager-search"><Search size={18}/><input type="search" placeholder="Buscar alumno por correo" aria-label="Buscar alumnos por correo" value={search} onChange={e=>setSearch(e.target.value)}/></label>
        <div className="student-manager-list">
          {filtered.length===0&&<p className="student-management-empty">No hay alumnos que coincidan con esta búsqueda.</p>}
          {filtered.map(student=>{
            const opened=selected===student.buyer_email;
            const eligible=student.status==='active'&&!student.revoked_at;
            const count=grants.filter(g=>g.buyer_email===student.buyer_email).length;
            return <article className="student-manager-card" key={student.buyer_email}>
              <button className="student-manager-person" type="button" aria-expanded={opened} onClick={()=>{setSelected(opened?'':student.buyer_email);setNotice('');setError('');}}>
                <span className="student-manager-avatar" aria-hidden="true">{student.buyer_email.charAt(0).toUpperCase()}</span>
                <span className="student-manager-person-info"><strong>{student.buyer_email}</strong>
                  <small>{STATUS[student.status]} · {student.paid_at?'Compra '+readable(student.paid_at):'Registro '+readable(student.created_at)} · {count} {count===1?'bono':'bonos'}</small></span>
                {opened?<ChevronUp size={19}/>:<ChevronDown size={19}/>}
              </button>
              {opened&&<div className="student-manager-assignment">
                <div className="student-manager-assignment-head"><Gift size={20}/><div><h3>Elegir bonos para esta persona</h3><p>Marca solo los que quieras darle a <strong>{student.buyer_email}</strong>. Cada cambio se guarda por separado.</p></div></div>
                {!eligible&&<p className="student-management-alert">Su acceso no está activo. No se pueden entregar bonos hasta confirmar la compra.</p>}
                {resources.length===0&&<p className="student-management-empty">Primero añade un bono desde Biblioteca de bonos.</p>}
                <div className="student-manager-bonus-options">
                  {resources.map(resource=>{
                    const checked=assigned.some(g=>g.resource_code===resource.resource_code);
                    const key=student.buyer_email+':'+resource.resource_code;
                    return <label className={'student-manager-bonus-option '+(checked?'assigned':'')} key={resource.resource_code}>
                      <input type="checkbox" checked={checked} disabled={!eligible||Boolean(saving)} onChange={e=>void toggle(student.buyer_email,resource.resource_code,e.target.checked)}/>
                      <span className="student-manager-bonus-text"><strong>{resource.title}</strong>
                      <small>{resource.status==='ready'?'Disponible para el alumno asignado':'En preparación · no visible todavía para el alumno'}{saving===key?' · Guardando…':''}</small></span>
                      {checked&&<Check size={18}/>}
                    </label>;
                  })}
                </div>
                <p className="student-manager-note">Solo verá los bonos marcados aquí que estén activados en Biblioteca de bonos. Quitar la marca retira su acceso desde el aula.</p>
              </div>}
            </article>;
          })}
        </div>
      </>}
    </section>
  );
}
