/** Reusable editable basic forms shared in behavior with the commercial
 * carousel editor, without copying any customer or private-brand assets.
 */
export type StudioShape='paper'|'tape'|'circle'|'frame';
export const STUDIO_SHAPES=[
 {id:'paper',name:'Papel editorial',color:'#F2E3CD'},
 {id:'tape',name:'Cinta washi',color:'#F2D85B'},
 {id:'circle',name:'Círculo',color:'#BED8E9'},
 {id:'frame',name:'Marco',color:'#191919'},
] as const;
export function studioShapeData(shape:StudioShape,color:string):string{
 const ink=/^#[0-9a-f]{6}$/i.test(color)?color:'#F2D85B';
 const body=shape==='paper'
  ?'<rect x="20" y="18" width="560" height="414" rx="26" fill="'+ink+'"/>'
  :shape==='tape'
   ?'<path d="M18 125 L582 83 L570 306 L10 346 Z" fill="'+ink+'" fill-opacity=".85"/>'
   :shape==='circle'
    ?'<ellipse cx="300" cy="225" rx="210" ry="210" fill="'+ink+'"/>'
    :'<rect x="28" y="28" width="544" height="394" rx="20" stroke="'+ink+'" stroke-width="32" fill="none"/>';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450">'+body+'</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
