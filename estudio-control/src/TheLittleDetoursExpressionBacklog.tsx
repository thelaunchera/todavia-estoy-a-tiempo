import {useMemo, useState} from 'react';
import {Check, ClipboardCopy, Download, Film, Sparkles} from 'lucide-react';
import {expressionCounts, expressionPrompt, expressionsFor} from './youtube/character-expression-plan';
import type {ExpressionPlan} from './youtube/character-expression-plan';
import './the-little-detours-expression-backlog.css';

type Name='Nora'|'Eli'|'Pip';
function saveText(name:string, data:string) {
  const file=new Blob([data],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(file);
  const link=document.createElement('a');
  link.href=url;
  link.download=name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function ExpressionList({name}:{name:Name}) {
  const items=useMemo(()=>expressionsFor(name),[name]);
  const [onlyPilot,setOnlyPilot]=useState(false);
  const [active,setActive]=useState<string>('');
  const [status,setStatus]=useState('');
  const shown=onlyPilot?items.filter(i=>i.priority==='pilot'):items;
  async function copy(item:ExpressionPlan){
    try{
      await navigator.clipboard.writeText(expressionPrompt(item));
      setStatus('Copiado: '+item.label);
    } catch {
      setActive(item.id);
      setStatus('Selecciona el texto del prompt abierto para copiarlo.');
    }
  }
  const allText=items.map(item=>expressionPrompt(item)).join('\n\n'+'='.repeat(65)+'\n\n');

  return <div className="tld-expr-list">
    <div className="tld-expr-tools">
      <label>
        <input type="checkbox" checked={onlyPilot} onChange={ev=>setOnlyPilot(ev.currentTarget.checked)}/>
        Solo prioritarias para el piloto
      </label>
      <button type="button" onClick={()=>saveText('THE-LITTLE-DETOURS-'+name+'-PENDING-EXPRESSIONS.txt',allText)}>
        <Download size={15}/> Descargar todos
      </button>
    </div>
    <div className="tld-expr-rows">
      {shown.map(item=><div className="tld-expr-row" key={item.id}>
        <div className="tld-expr-row-main">
          <span className="tld-expr-slot">
            <strong>{item.label}</strong>
            <small>{item.id}.png · {item.kind==='angle'?'Ángulo':item.kind==='action'?'Acción':'Expresión'}</small>
          </span>
          <span className="tld-expr-badges">
            {item.priority==='pilot'&&<small className="tld-expr-priority"><Film size={12}/> Piloto</small>}
            <small className="tld-expr-pending">Sin generar</small>
          </span>
        </div>
        <div className="tld-expr-row-buttons">
          <button type="button" onClick={()=>setActive(active===item.id?'':item.id)}>
            {active===item.id?'Cerrar prompt':'Ver prompt'}
          </button>
          <button type="button" onClick={()=>void copy(item)}>
            <ClipboardCopy size={14}/> Copiar
          </button>
        </div>
        {active===item.id&&<textarea readOnly rows={9} value={expressionPrompt(item)} aria-label={'Prompt de '+item.label+' para '+name}/>}
      </div>)}
    </div>
    {status&&<p className="tld-expr-status" role="status"><Check size={15}/>{status}</p>}
  </div>;
}

export default function TheLittleDetoursExpressionBacklog({name}:{name:Name}){
  const items=expressionsFor(name);
  return <details className="tld-expr-details">
    <summary>
      <span className="tld-expr-icon"><Sparkles size={17}/></span>
      <span className="tld-expr-label"><strong>Expresiones y ángulos por crear</strong>
        <small>{items.length} pendientes · {items.filter(i=>i.origin==='new').length} nuevas expresiones añadidas</small>
      </span>
      <span className="tld-expr-plus" aria-hidden="true">+</span>
    </summary>
    <ExpressionList name={name}/>
  </details>;
}

export function ExpressionsSummary(){
  return <div className="tld-expr-summary">
    <div><strong>🎭 Biblioteca de expresiones sin diálogo</strong>
      <span>{expressionCounts.existing} referencias pendientes que ya estaban en Drive + {expressionCounts.new} expresiones nuevas planificadas. {expressionCounts.pilot} imágenes prioritarias para el piloto.</span>
    </div>
    <small>Las fotos aún no se han generado. Abre la ficha de cada personaje para ver y copiar los prompts individuales.</small>
  </div>;
}
