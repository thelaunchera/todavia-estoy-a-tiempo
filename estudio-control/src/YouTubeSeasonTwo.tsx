import { seasonTwo } from './youtube/season-2';
import './youtube-season-two.css';

export default function YouTubeSeasonTwo(){
 const groups=['Protagonista original','Equipo principal','Recurrente'] as const;
 return <div className="yt2-shell" role="tabpanel">
   <section className="yt-paper yt2-intro">
     <div className="yt-small-title">TEMPORADA 02 · PROPUESTA DE HISTORIA</div>
     <h3>{seasonTwo.workingTitle}</h3>
     <p className="yt2-tagline">“{seasonTwo.tagline}”</p>
     <p>{seasonTwo.premise}</p>
     <p><strong>El conflicto central:</strong> {seasonTwo.stakes}</p>
     <div className="yt2-facts"><span>8 episodios propuestos</span><span>6–8 minutos</span><span>Diálogos en inglés</span><span>Comedia animada</span></div>
     <p className="yt2-note">{seasonTwo.status}</p>
   </section>

   <section className="yt-paper">
     <div className="yt-small-title">CASTING VISUAL · AVATARES APORTADOS</div>
     <h3>Personajes y funciones</h3>
     <p>Los números hacen referencia al orden de las nueve imágenes que compartiste. La imagen 7 es Nia, y Ruby conserva su avatar original de la primera temporada. Los nombres nuevos son propuestas, aún no definitivos.</p>
     {groups.map(group=><div className="yt2-group" key={group}>
       <h4>{group === 'Protagonista original'?'Las dos protagonistas':group==='Equipo principal'?'Cuatro colaboradores habituales':'Cuatro personajes recurrentes'}</h4>
       <div className="yt2-cast-grid">
         {seasonTwo.roster.filter(person=>person.group===group).map(person=><article className="yt2-cast-card" key={person.name}>
           <div className="yt2-cast-heading">
             <div className={'yt2-cast-symbol yt2-symbol-'+person.avatar} aria-hidden="true">{person.name.charAt(0)}</div>
             <div><strong>{person.name}</strong><span>{person.role}</span></div>
           </div>
           <p>{person.trait}</p><p><b>En la serie:</b> {person.job}</p>
           <p><b>Con quién choca:</b> {person.chemistry}</p>
           <p className="yt2-quote">“{person.catchphrase}”</p>
           <small>{person.avatar===0?'Avatar original de Ruby':'Referencia visual: imagen '+person.avatar}</small>
         </article>)}
       </div>
     </div>)}
   </section>

   <section className="yt-paper">
     <div className="yt-small-title">TRAMA DE TEMPORADA</div>
     <h3>Los ocho capítulos</h3>
     <div className="yt2-episodes">
       {seasonTwo.episodes.map(ep=><article key={ep.number}>
         <div className="yt2-ep-head"><span>{String(ep.number).padStart(2,'0')}</span><h4>{ep.title}</h4></div>
         <p>{ep.plot}</p>
         <p><b>Arranque visual:</b> {ep.hook}</p>
         <p><b>Personajes destacados:</b> {ep.primary}</p>
         <p className="yt2-resolution"><b>Final:</b> {ep.payoff}</p>
       </article>)}
     </div>
   </section>
   <section className="yt-paper">
     <h3>Reglas para la producción</h3>
     <p>{seasonTwo.castRule}</p>
     <p>{seasonTwo.visualRule}</p>
     <p className="yt2-note">Todavía no se han desarrollado los diálogos completos ni generado nuevas imágenes de escenas. Esta es la biblia inicial para decidir el reparto y la historia.</p>
   </section>
 </div>;
}
