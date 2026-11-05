import React, { useMemo, useState } from 'react';
import { Check, Copy, Download, ChevronDown } from 'lucide-react';
import { ONE_PHOTO_NINE } from './OnePhotoNinePrompts';
import './OneProductEightPrompts.css';

type Locale = 'es' | 'en';
type Props = { locale: Locale; brandName?: string; palette?: string };

const spanishDirections = [
  {
    title: 'Editorial asimétrica',
    description: 'Producto a la derecha y texto a la izquierda',
    layout: 'Ubica el producto principal a la DERECHA, ocupando aproximadamente el 55 % del lienzo. Organiza el titular en la IZQUIERDA y la información secundaria debajo. Mantén una composición asimétrica pero equilibrada, con espacios en blanco intencionales.',
    shot: 'Fotografía editorial en tres cuartos, superficies auténticas y táctiles, con luz natural suave que caiga sobre el producto.'
  },
  {
    title: 'Centro monumental',
    description: 'Titular grande y producto central',
    layout: 'Usa un titular monumental en la parte superior central que ocupe entre el 80 % y el 90 % del ancho. Centra el producto DEBAJO con un recorte inferior intencional y seguro. Coloca el texto secundario discretamente en las esquinas.',
    shot: 'Fotografía frontal del producto con presencia, sombra de contacto realista, textura fina y separación de color cuidada.'
  },
  {
    title: 'Tipografía detrás del producto',
    description: 'Letras grandes por detrás, producto adelante',
    layout: 'Convierte el titular enorme en una capa tipográfica de FONDO. Coloca el producto en PRIMER PLANO, tapando parcialmente algunas letras sin perder legibilidad. Deja los textos complementarios en los bordes despejados.',
    shot: 'Luz lateral direccional suave, bordes del producto definidos y profundidad natural, sin resplandores artificiales.'
  },
  {
    title: 'Primer plano lateral',
    description: 'Acercamiento que destaca texturas',
    layout: 'Amplía el producto real para que entre desde UN LADO y desde ABAJO. Reserva una zona opuesta completamente despejada para el texto en bloques. Nunca recortes etiquetas ni información esencial.',
    shot: 'Fotografía macro premium que resalte materiales y texturas auténticas. Incluye líquido, condensación o detalles de superficie solo si están presentes en la referencia.'
  },
  {
    title: 'Espacio negativo editorial',
    description: 'Producto abajo y composición despejada',
    layout: 'Coloca el producto en la PARTE INFERIOR DERECHA a tamaño mediano-grande. Titular compacto ARRIBA A LA IZQUIERDA, centro muy despejado y detalles mínimos y refinados en las esquinas.',
    shot: 'Naturaleza muerta editorial minimalista con sombras naturales suaves y fondo neutro o cálido.'
  },
  {
    title: 'Flujo visual diagonal',
    description: 'Producto y titular en extremos opuestos',
    layout: 'Coloca el producto ARRIBA A LA DERECHA y el titular ABAJO A LA IZQUIERDA para crear una dirección visual diagonal. No gires las letras ni deformes el producto.',
    shot: 'Cámara ligeramente elevada en tres cuartos, sensación de movimiento orgánico y perspectiva fotográfica creíble.'
  },
  {
    title: 'Composición editorial vertical',
    description: 'Una jerarquía clara en tres niveles',
    layout: 'Divide el lienzo en tres zonas: título estrecho ARRIBA, contenido secundario EN MEDIO y producto emergiendo desde ABAJO. Respeta el ritmo vertical editorial y deja aire entre bloques.',
    shot: 'Fotografía de campaña realista, iluminación discreta y cuidada, profundidad clara y textura natural de los materiales.'
  },
  {
    title: 'Columnas tipo revista',
    description: 'Texto a un lado, producto protagonista al otro',
    layout: 'Crea dos columnas desiguales: IZQUIERDA, 33 % para título y textos; DERECHA, 67 % para un solo producto grande. Alinea la tipografía sobre una cuadrícula editorial invisible.',
    shot: 'Fotografía moderna de producto para revista, luz de estudio natural y materiales con detalle táctil a escala real.'
  }
] as const;

function makePrompt(index: number, locale: Locale, fields: { product: string; brand: string; headline: string; supporting: string; palette: string }) {
  const source = ONE_PHOTO_NINE[index];
  const local = spanishDirections[index];
  const product = fields.product.trim();
  const brand = fields.brand.trim();
  const headline = fields.headline.trim();
  const supporting = fields.supporting.trim();
  const palette = fields.palette.trim();

  if (locale === 'es') {
    return [
      'PROMPT ' + String(index + 1).padStart(2, '0') + ' DE 08 — ' + local.title.toUpperCase(),
      'Crea UNA SOLA imagen publicitaria editorial en formato vertical 4:5, a 1080 × 1350 píxeles o la máxima resolución disponible. No hagas collages, mosaicos, cuadrículas ni varias versiones juntas.',
      'Voy a adjuntar UNA fotografía de referencia. Esa fotografía es la única fuente autorizada para la identidad del producto. Si todavía no está adjunta, pídemela ANTES de generar la imagen.',
      'PRODUCTO: ' + (product || 'exactamente el producto de mi fotografía adjunta') + '. MARCA: ' + (brand || 'la marca que aparece en la referencia') + '.',
      'Conserva fielmente la forma, el material, los colores, las proporciones, la textura, el envase, el logotipo y las etiquetas reales del producto. No cambies la marca, no inventes beneficios ni texto de packaging, no dupliques objetos y no añadas elementos sin respaldo en la referencia.',
      'DIRECCIÓN DE ARTE: ' + local.shot,
      'COMPOSICIÓN: ' + local.layout + ' Crea una jerarquía visual clara con espacio negativo intencional. Mantén el producto y todo texto importante dentro de márgenes seguros para pantallas móviles.',
      'CÁMARA E ILUMINACIÓN: Elige un lente realista de 35 mm, 50 mm, 85 mm o macro según la escena. Respeta la perspectiva física, el punto de enfoque, las sombras de contacto y las texturas naturales. Evita cualquier acabado plástico, CGI, piel artificial o brillo falso.',
      'PALETA: ' + (palette || 'usa una combinación editorial coherente con los colores originales del producto y la marca') + '.',
      'TEXTO: ' + (headline ? 'Titular exacto, sin traducir ni alterar: «' + headline + '».' : 'No añadas titulares ni letras de relleno.') + ' ' + (supporting ? 'Texto secundario exacto: «' + supporting + '».' : 'No añadas letra pequeña ni información inventada.') + ' Todo el texto visible debe estar en español.',
      'CONTROL DE CALIDAD: Comprueba que el producto se reconozca como el original, que no haya manos o dedos deformados, etiquetas falsas, logos alterados, elementos flotantes, sombras imposibles ni perspectivas incorrectas. Si la foto de referencia no permite verificar un detalle, solicítame otra foto en lugar de inventarlo.',
      'Devuelve UNA imagen final 4:5, de alta calidad, sin explicaciones.'
    ].join('\n\n');
  }
  return [
    'PROMPT ' + String(index + 1).padStart(2, '0') + ' OF 08 — ' + source.name.toUpperCase(),
    'Create ONE premium editorial advertising image in vertical 4:5 format, 1080 × 1350 pixels or the highest available resolution. No collage, contact sheet, grid, or multiple variations together.',
    'I will attach ONE reference photograph. Treat it as the ONLY authoritative source for the product identity. If no photo is attached, ask me to upload one BEFORE generating.',
    'PRODUCT: ' + (product || 'the exact product in my attached reference photo') + '. BRAND: ' + (brand || 'the brand visible in the reference') + '.',
    'Faithfully preserve the product shape, materials, colors, proportions, textures, packaging, logo, and printed labels. Do not redesign the item, invent product claims or packaging copy, duplicate objects, or add unsupported details.',
    'ART DIRECTION: ' + source.shot,
    'COMPOSITION: ' + source.layout + ' Keep a clear visual hierarchy with deliberate negative space. Protect the main subject and essential copy within mobile-safe margins.',
    'CAMERA & LIGHTING: Choose a plausible 35mm, 50mm, 85mm, or macro lens for the scene. Preserve physical perspective, focal plane, natural textures, and believable contact shadows. Avoid plastic CGI, artificial glow, or distorted objects.',
    'PALETTE: ' + (palette || 'an editorial combination consistent with the original product and brand colors') + '.',
    'TEXT: ' + (headline ? 'Exact headline, do not translate or alter: "' + headline + '".' : 'Do not add headlines or placeholder lettering.') + ' ' + (supporting ? 'Exact supporting copy: "' + supporting + '".' : 'Do not add fine print or invented information.') + ' All visible copy must be in US English.',
    'QUALITY CONTROL: Verify the original product identity, natural proportions, correct hands and fingers if present, real labels and logos, accurate perspective, and physical shadows. If the reference is insufficient, request another photograph instead of inventing details.',
    'Return ONE final high-resolution 4:5 image only, without explanation.'
  ].join('\n\n');
}

export default function OneProductEightPrompts({ locale, brandName = '', palette = '' }: Props) {
  const [brand, setBrand] = useState(brandName);
  const [product, setProduct] = useState('');
  const [headline, setHeadline] = useState('');
  const [supporting, setSupporting] = useState('');
  const [colors, setColors] = useState(palette);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [copied, setCopied] = useState<number | 'all' | null>(null);
  const [copyError, setCopyError] = useState(false);
  const prompts = useMemo(() => ONE_PHOTO_NINE.slice(0, 8).map((_, i) =>
    makePrompt(i, locale, { product, brand, headline, supporting, palette: colors })
  ), [locale, product, brand, headline, supporting, colors]);

  async function copyPrompt(text: string, id: number | 'all') {
    setCopyError(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      // Keep text selectable in the expanded field when iOS blocks clipboard permission.
      if (typeof id === 'number') setExpanded(id);
      setCopyError(true);
    }
  }
  function downloadAll() {
    const documentText = prompts.join('\n\n' + '—'.repeat(40) + '\n\n');
    const url = URL.createObjectURL(new Blob([documentText], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = locale === 'es' ? '8-prompts-composiciones.txt' : '8-composition-prompts.txt';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  return (
    <section className="lab-eight" aria-labelledby="lab-eight-heading">
      <div className="lab-eight-header">
        <div>
          <span className="lab-eight-eyebrow">{locale === 'es' ? 'INCLUIDO EN TU CONTENT LAB' : 'INCLUDED IN YOUR CONTENT LAB'}</span>
          <h2 id="lab-eight-heading">{locale === 'es' ? '1 producto → 8 composiciones' : '1 product → 8 compositions'}</h2>
          <p>{locale === 'es'
            ? 'Tus ocho prompts están aquí mismo, listos para personalizar y copiar. Sin enlaces externos ni formulario de correo.'
            : 'All eight prompts are right here, ready to customize and copy. No external links or email form.'}</p>
        </div>
        <span className="lab-eight-count">08 / 08</span>
      </div>

      <div className="lab-eight-fields">
        <label>{locale === 'es' ? 'Marca' : 'Brand'}
          <input value={brand} onChange={e => setBrand(e.target.value)} placeholder={locale === 'es' ? 'Nombre de tu marca' : 'Your brand name'} maxLength={120} />
        </label>
        <label>{locale === 'es' ? 'Producto de tu foto' : 'Product in your photo'}
          <input value={product} onChange={e => setProduct(e.target.value)} placeholder={locale === 'es' ? 'Perfume, matcha, brownies…' : 'Perfume, matcha, brownies…'} maxLength={180} />
        </label>
        <label>{locale === 'es' ? 'Titular opcional' : 'Optional headline'}
          <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder={locale === 'es' ? 'Texto exacto para la imagen' : 'Exact text for the image'} maxLength={220} />
        </label>
        <label>{locale === 'es' ? 'Texto secundario opcional' : 'Optional supporting text'}
          <input value={supporting} onChange={e => setSupporting(e.target.value)} placeholder={locale === 'es' ? 'Solo información real' : 'Only verified information'} maxLength={500} />
        </label>
        <label className="lab-eight-colors">{locale === 'es' ? 'Paleta o estilo opcional' : 'Optional colors or style'}
          <input value={colors} onChange={e => setColors(e.target.value)} placeholder={locale === 'es' ? 'Ej.: crema y azul suave, editorial' : 'E.g. ivory and soft blue, editorial'} maxLength={260} />
        </label>
      </div>
      <p className="lab-eight-tip">{locale === 'es'
        ? 'Cada prompt crea una imagen independiente. Adjunta tu foto original en la herramienta donde generarás la imagen.'
        : 'Each prompt creates one separate image. Attach your original photo in the image tool where you will generate it.'}</p>

      <div className="lab-eight-actions">
        <button type="button" onClick={() => copyPrompt(prompts.join('\n\n' + '—'.repeat(40) + '\n\n'), 'all')}>
          {copied === 'all' ? <Check size={17} /> : <Copy size={17} />}
          {locale === 'es' ? (copied === 'all' ? '8 prompts copiados' : 'Copiar los 8 prompts') : (copied === 'all' ? 'All 8 copied' : 'Copy all 8 prompts')}
        </button>
        <button type="button" className="secondary" onClick={downloadAll}>
          <Download size={17} />{locale === 'es' ? 'Guardar como texto' : 'Save as text'}
        </button>
      </div>
      {copyError && <p className="lab-eight-copy-error" role="status">
        {locale === 'es' ? 'Tu navegador bloqueó el copiado automático. Abre un prompt y mantén presionado el texto para copiarlo.' : 'Your browser blocked automatic copying. Open a prompt and press and hold its text to copy.'}
      </p>}

      <div className="lab-eight-list">
        {ONE_PHOTO_NINE.slice(0, 8).map((item, index) => {
          const isOpen = expanded === index;
          const local = spanishDirections[index];
          return (
            <article key={item.name} className={'lab-eight-card' + (isOpen ? ' open' : '')}>
              <button type="button" className="lab-eight-toggle" aria-expanded={isOpen} aria-controls={'lab-eight-prompt-' + index} onClick={() => setExpanded(isOpen ? null : index)}>
                <span className="lab-eight-number">{String(index + 1).padStart(2, '0')}</span>
                <img src={'./prompts/matcha-' + String(index + 1).padStart(2, '0') + '.jpg'} loading="lazy" alt={locale === 'es' ? 'Ejemplo de matcha para composición ' + (index + 1) : 'Matcha example for composition ' + (index + 1)} />
                <span className="lab-eight-summary">
                  <strong>{locale === 'es' ? local.title : item.name}</strong>
                  <small>{locale === 'es' ? local.description : item.short}</small>
                </span>
                <ChevronDown size={20} className={'lab-eight-chevron' + (isOpen ? ' rotated' : '')} />
              </button>
              {isOpen && <div className="lab-eight-detail" id={'lab-eight-prompt-' + index}>
                <textarea readOnly rows={15} value={prompts[index]} aria-label={(locale === 'es' ? 'Texto del prompt ' : 'Prompt text ') + (index + 1)} onFocus={e => e.currentTarget.select()} />
                <button type="button" onClick={() => copyPrompt(prompts[index], index)}>
                  {copied === index ? <Check size={16} /> : <Copy size={16} />}
                  {locale === 'es' ? (copied === index ? 'Copiado' : 'Copiar este prompt') : (copied === index ? 'Copied' : 'Copy this prompt')}
                </button>
              </div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
