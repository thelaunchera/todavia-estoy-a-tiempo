/* Universal, resolution-independent interface artwork. Shared by every Content Lab account.
 * Never read from a customer's media library or private Brand Kit. */
export type DashboardIllustrationName='carousel'|'seamless'|'post'|'story'|'media'|'stickers'|'prompts'|'brand'|'calendar';
type Props={name:DashboardIllustrationName;size?:number;className?:string};
export function DashboardIllustration({name,size=120,className=''}:Props){
 const ink='#292823';
 const stroke={stroke:ink,strokeWidth:7.5,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
 return <svg className={'lab-dashboard-illustration '+className} viewBox="0 0 240 240"
   width={size} height={size} focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
   <path d="M43 44C68 21 96 22 122 24c46-3 83 13 96 52 17 52 9 103-25 132-30 24-91 25-137 7C19 199 13 157 22 108c3-27 4-46 21-64Z" fill="#C8E7FB"/>
   {(name==='carousel'||name==='seamless')&&<g {...stroke}>
    <rect x="40" y="80" width="160" height="98" rx="20" fill="#FFF9EA"/>
    <path d="M64 79V57c0-12 9-19 20-19h74c11 0 19 8 19 19v22" fill="#FFF9EA"/>
    <path d="M44 145v17c0 10 7 17 17 17h118c10 0 18-7 18-17v-18" fill="#FFE16B"/>
    {name==='carousel'?<g>
      <rect x="62" y="63" width="116" height="124" rx="22" fill="#FFF9EA"/>
      <circle cx="143" cy="101" r="12" fill="#F2D85B"/>
      <path d="m81 153 26-32c4-5 10-5 14 0l20 20 9-8 11 20Z" fill="#F2D85B"/>
      <path d="M98 170h43" strokeWidth="5"/>
      <circle cx="87" cy="170" r="3" fill={ink} stroke="none"/>
      <circle cx="152" cy="170" r="3" fill={ink} stroke="none"/>
     </g>:<g>
      <rect x="53" y="71" width="134" height="107" rx="15" fill="#FFFAEA"/>
      <circle cx="142" cy="105" r="12" fill="#F2D85B"/>
      <path d="M63 145q26-33 49-15t36-3q14-9 29 4v36H63Z" fill="#B9DCCB"/>
      <path d="M98 76v98M143 76v98" stroke="#668F9C" strokeWidth="3" strokeDasharray="6 7"/>
     </g>}
   </g>}
   {(name==='post'||name==='media')&&<g {...stroke}>
    <rect x="49" y="47" width="135" height="137" rx="23" fill="#FFFAEA"/>
    <circle cx="148" cy="83" r="12" fill="#F2D85B"/>
    <path d="M66 142 103 98l27 29 17-15 20 29v20H66Z" fill="#C1E9CC"/>
    <path d="M149 155l32-49 20 13-34 51-23 8Z" fill="#CDD6FB"/>
    <path d="m144 178 23-8-13-12Z" fill="#F2D85B"/>
    <path d="m182 104 20 13" strokeWidth="8"/>
   </g>}
   {(name==='story'||name==='stickers')&&<g {...stroke}>
    {name==='story'&&<rect x="67" y="32" width="106" height="174" rx="25" fill="#FFF9EA"/>}
    <path d="M118 49c6 30 22 49 51 58-29 8-45 27-51 57-6-30-24-49-52-57 28-9 46-28 52-58Z"
     fill="#FFE16B"/>
    <circle cx="181" cy="159" r="9" fill="#F2D85B"/>
    <circle cx="64" cy="166" r="6" fill="#F2D85B"/>
   </g>}
   {name==='prompts'&&<g {...stroke}>
    <path d="M43 67q35-20 77 4v117q-41-21-77-4Z" fill="#FFE16B"/>
    <path d="M120 71q42-24 77-4v117q-35-17-77 4Z" fill="#FFE16B"/>
    <path d="M52 54q37-20 68 5v116q-35-23-68-7Z" fill="#FFF9EA"/>
    <path d="M120 59q35-25 68-5v114q-33-16-68 7Z" fill="#FFF9EA"/>
    <path d="M67 94q16-4 34 8M67 123q16-4 34 8M138 102q18-12 34-8M138 131q18-12 34-8" fill="none" strokeWidth="5"/>
   </g>}
   {name==='brand'&&<g {...stroke}>
    <path d="M79 172 58 69q-2-10 8-14l29-7q11-2 14 9l24 115Z" fill="#FFE16B"/>
    <path d="M79 172 102 61q2-11 13-9l30 7q9 2 8 13l-25 100Z" fill="#B8DEF3"/>
    <path d="M79 172 153 84q7-9 16-3l24 20q8 6 1 15L99 181Z" fill="#FFF9EA"/>
    <circle cx="85" cy="170" r="12" fill="#FFF9EA"/>
    <circle cx="85" cy="170" r="4" fill="#FFE16B" stroke="none"/>
   </g>}
   {name==='calendar'&&<g {...stroke}>
    <rect x="55" y="57" width="133" height="132" rx="17" fill="#FFFAEA"/>
    <path d="M59 97h125" fill="none"/>
    <path d="M91 43v32M152 43v32" strokeWidth="10"/>
    <g fill={ink} stroke="none">
     <rect x="79" y="118" width="16" height="15" rx="5"/><rect x="112" y="118" width="16" height="15" rx="5"/><rect x="145" y="118" width="16" height="15" rx="5"/>
     <rect x="79" y="151" width="16" height="15" rx="5"/><rect x="112" y="151" width="16" height="15" rx="5"/><rect x="145" y="151" width="16" height="15" rx="5"/>
    </g>
   </g>}
 </svg>;
}
