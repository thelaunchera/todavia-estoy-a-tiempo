import React, { useEffect, useState, useRef } from 'react';
import { api, auth, image } from './platform/client';
import heic2any from 'heic2any';
import BrandGrid, { CREATIVE_FORMATS } from './BrandGrid';
import ContentCalendar from './ContentCalendar';
import PromptStudio from './PromptStudio';
import './PromptStudio.css';
import type {PromptControls} from './PromptEngine';
import FreePostStudio from './FreePostStudio';
import VerticalStudio from './VerticalStudio';
import {installLabLocale,uiText} from './LabLocale';
import './CreativeCover.css';
import CarouselFactory from './CarouselFactory';
import FreeDecorControls from './FreeDecorControls';
import {readCoverDecor,writeCoverDecor,type CoverDecor} from './CoverDecor';
import MediaLibrary from './MediaLibrary';
import StickerDownloads from './StickerDownloads';
import BackgroundLibrary from './BackgroundLibrary';
import type {FreeBackgroundId} from './FreeDesignAssets';
import {updateHiddenBackgrounds} from './BackgroundVisibility';
import './ContentLabMotion.css';
import FormatGallery from './FormatGallery';
import {assetCategory,displayAssetName,type LibraryAsset,type MediaCategory} from './MediaAsset';
import {SOCIAL_PLATFORMS,brandPalette,normalizeExtraColors,normalizeSocialAccounts,preferredPlatform,platformName,socialAccount,type SocialAccounts,type SocialPlatform} from './BrandIdentity';
import {
  LayoutDashboard,
  WandSparkles,
  FolderOpen,
  Images,
  Settings2,
  Layers3,
  Film,
  Plus,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Search,
  Menu,
  LogOut,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Lightbulb,
  Heart,
  ImagePlus,
  Trash2,
  Pencil,
  Save,
  Copy,
  Download,
  Check,
  X,
  LoaderCircle,
  Upload,
  RotateCcw,
  Palette,
  BookOpen,
  CalendarDays,
} from 'lucide-react';

type Brand = {
  id: string;
  name: string;
  handle: string;
  audience: string;
  voice: string;
  rules: string;
  language: 'English' | 'Español';
  color: string;
  background: string;
  secondaryColor?: string;
  additionalColors?: string[];
  socialAccounts?: SocialAccounts;
  primaryPlatform?: SocialPlatform;
  headingFont?: string;
  bodyFont?: string;
  photoMood?: string;
  avoid?: string;
  logoAssetId?: string;
  referenceAssetId?: string;
};
type Post = {
  id?: string;
  brandId: string;
  title: string;
  format: string;
  angle: string;
  hook: string;
  slides: string;
  caption: string;
  cta: string;
  visual: string;
  status: string;
  template: string;
  assetId: string;
  date: string;
  time?: string;
  planningStatus?: string;
  updatedAt?: string;
  designData?: string;
};
type Asset = LibraryAsset;
type Tab = 'home' | 'create' | 'vertical' | 'factory' | 'grid' | 'calendar' | 'prompt-studio' | 'prompts' | 'posts' | 'media' | 'formats' | 'brands' | 'stickers' | 'backgrounds';
const angles = [
  'Pain point',
  'Educational',
  'Before / after',
  'Product spotlight',
  'POV / Relatable',
  'Storytelling',
];
const nav: { id: Tab; title: string; icon: typeof Sparkles }[] = [
  { id: 'home', title: 'Overview', icon: LayoutDashboard },
  { id: 'create', title: 'Posts · 4:5', icon: WandSparkles },
  { id: 'vertical', title: 'Reels e historias · 9:16', icon: Film },
  { id: 'factory', title: 'Carousel Factory', icon: Layers3 },
  { id: 'grid', title: '1 Photo → 9 Posts', icon: Images },
  { id: 'calendar', title: 'Calendario editorial', icon: CalendarDays },
  { id: 'stickers', title: 'Stickers', icon: ImagePlus },
  { id: 'backgrounds', title: 'Fondos', icon: Palette },
  { id: 'prompt-studio', title: 'Prompt Studio · 30 Recipes', icon: BookOpen },
  { id: 'prompts', title: '1 Product → 8 Prompts', icon: Palette },
  { id: 'posts', title: 'My content', icon: FolderOpen },
  { id: 'media', title: 'Media library', icon: Images },
  { id: 'formats', title: 'Creative formats', icon: Layers3 },
  { id: 'brands', title: 'Brand settings', icon: Settings2 },
];
const navGroups:{title:string;items:Tab[]}[]=[
  {title:'CREAR',items:['home','factory','vertical','create','grid']},
  {title:'TUS RECURSOS',items:['media','backgrounds','stickers','formats']},
  {title:'INSPIRACIÓN',items:['prompt-studio','prompts']},
  {title:'GUARDAR Y ORGANIZAR',items:['calendar','posts','brands']},
];
const newPost = (brandId: string): Post => ({
  brandId,
  title: '',
  format: 'Carousel',
  angle: 'Pain point',
  hook: '',
  slides: '',
  caption: '',
  cta: '',
  visual: '',
  status: 'Draft',
  template: 'Editorial',
  assetId: '',
  date: '',
  time: '09:00',
  planningStatus:'planned',
  designData: '',
});
const newBrand = (): Brand => ({
  id: '',
  name: '',
  handle: '',
  audience: '',
  voice: '',
  rules: '',
  language: 'English',
  color: '#BED8E9',
  background: '#FAF8F3',
  secondaryColor: '#E7D8C9',
  additionalColors: [],
  socialAccounts: {},
  primaryPlatform: 'instagram',
  headingFont: 'Prompt',
  bodyFont: 'Futura',
  photoMood: 'Natural editorial, human, realistic',
  avoid: 'Fake labels, made-up UI, AI-looking faces, duplicate scenes',
  logoAssetId: '',
  referenceAssetId: '',
});
const ink = (hex: string) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#191919';
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 151 ? '#191919' : '#ffffff';
};
function Graphic({
  post,
  brand,
  photo,
}: {
  post: Post;
  brand: Brand;
  photo?: string;
}) {
  const style = {
    '--paper': brand.background,
    '--accent': brand.color,
    '--ink': ink(brand.background),
    '--accentInk': ink(brand.color),
  } as React.CSSProperties;
  const picture = photo ? (
    <img src={photo} alt="Imagen de la publicación" />
  ) : (
    <div className="photo-placeholder">
      <ImagePlus size={30} /> {uiText("Your image here",brand.language==="Español"?"es":"en")}
    </div>
  );
  if (post.template === 'Spotlight')
    return (
      <div className="graphic spotlight" style={style}>
        <div className="graphic-img">{picture}</div>
        <div className="graphic-bottom">
          <span>{brand.name}</span>
          <strong>{post.hook || 'Good content starts here.'}</strong>
          <small>{post.cta || 'Discover more'}</small>
        </div>
      </div>
    );
  if (post.template === 'Split')
    return (
      <div className="graphic split" style={style}>
        <div className="split-text">
          <span>{brand.name}</span>
          <strong>{post.hook || 'One little idea. Big possibilities.'}</strong>
          <small>{post.cta || 'Create something.'}</small>
        </div>
        <div className="split-photo">{picture}</div>
      </div>
    );
  if (post.template === 'Bold')
    return (
      <div className="graphic boldgraphic" style={style}>
        <div className="bold-frame">
          <span>{brand.name}</span>
          <strong>{post.hook || 'Make something people remember.'}</strong>
          <small>{post.cta || 'Learn more'}</small>
        </div>
      </div>
    );
  return (
    <div className="graphic editorial" style={style}>
      <div className="graphic-brand">{brand.name}</div>
      <div className="graphic-rule" />
      <strong>{post.hook || 'One idea. Endless possibilities.'}</strong>
      <div className="editorial-photo">{picture}</div>
      <small>{post.cta || 'More to come.'}</small>
    </div>
  );
}
async function downloadPng(post: Post, brand: Brand, photo?: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const c = canvas.getContext('2d');
  if (!c) throw Error('No se pudo exportar.');
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  const lineText = (
    s: string,
    x: number,
    y: number,
    w: number,
    size: number,
    leading: number,
    color: string,
    max: number
  ) => {
    c.font = 'bold ' + size + 'px Georgia, serif';
    c.fillStyle = color;
    const words = (s || 'Your headline').split(/\s+/);
    let lines: string[] = [],
      part = '';
    for (const word of words) {
      const candidate = part ? part + ' ' + word : word;
      if (c.measureText(candidate).width > w && part) {
        lines.push(part);
        part = word;
      } else part = candidate;
    }
    if (part) lines.push(part);
    lines.slice(0, max).forEach((s, i) => c.fillText(s, x, y + i * leading));
  };
  const small = (s: string, x: number, y: number, color: string, size = 25) => {
    c.fillStyle = color;
    c.font = '600 ' + size + 'px Arial, sans-serif';
    c.fillText(s.slice(0, 67), x, y);
  };
  const drawPhoto = async (x: number, y: number, w: number, h: number) => {
    if (!photo) return;
    const im = new Image();
    im.src = photo;
    await new Promise<void>((resolve, reject) => {
      im.onload = () => resolve();
      im.onerror = () => reject(Error('Error con la imagen'));
    });
    const scale = Math.max(w / im.width, h / im.height);
    c.drawImage(
      im,
      (im.width - w / scale) / 2,
      (im.height - h / scale) / 2,
      w / scale,
      h / scale,
      x,
      y,
      w,
      h
    );
  };
  rect(0, 0, 1080, 1350, brand.background);
  const paperInk = ink(brand.background),
    accentInk = ink(brand.color);
  if (post.template === 'Spotlight') {
    rect(0, 0, 1080, 800, brand.color);
    await drawPhoto(0, 0, 1080, 800);
    small(brand.name.toUpperCase(), 70, 878, paperInk);
    lineText(post.hook, 70, 995, 930, 75, 86, paperInk, 3);
    small(post.cta, 70, 1280, paperInk);
  } else if (post.template === 'Split') {
    rect(0, 0, 530, 1350, brand.color);
    await drawPhoto(530, 0, 550, 1350);
    small(brand.name.toUpperCase(), 62, 120, accentInk);
    lineText(post.hook, 62, 300, 420, 77, 88, accentInk, 8);
    small(post.cta, 62, 1260, accentInk);
  } else if (post.template === 'Bold') {
    rect(0, 0, 1080, 1350, brand.color);
    c.strokeStyle = accentInk;
    c.lineWidth = 3;
    c.strokeRect(65, 65, 950, 1220);
    small(brand.name.toUpperCase(), 105, 145, accentInk);
    lineText(post.hook, 105, 430, 855, 110, 124, accentInk, 6);
    small(post.cta, 105, 1210, accentInk);
  } else {
    small(brand.name.toUpperCase(), 70, 130, paperInk);
    rect(70, 174, 140, 8, brand.color);
    lineText(post.hook, 70, 328, 930, 99, 115, paperInk, 5);
    rect(620, 720, 410, 450, brand.color);
    await drawPhoto(620, 720, 410, 450);
    small(post.cta, 70, 1280, paperInk);
  }
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download =
    (post.title || 'content').replace(/[^a-z0-9-]/gi, '-').toLowerCase() +
    '-1080x1350.png';
  a.click();
}
function App() {
  const [account, setAccount] = useState<{ email?: string } | null>(null);
  const [chosenPrompt,setChosenPrompt]=useState<{version:number;text:string;settings:PromptControls}|null>(null);
  const [aiWallet, setAiWallet] = useState<{
    admin?:boolean;photo_remaining?:number;creative_remaining?:number;
    photo_today?:number;creative_today?:number;quota_day?:string;
  }|null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [loginStage, setLoginStage] = useState<'email'|'code'>('email');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginLanguage, setLoginLanguage] = useState<'es'|'en'>(()=>{
    try{return localStorage.getItem('content-lab:language')==='en'?'en':'es'}catch{return 'es'}
  });
  const chooseLanguage=(next:'es'|'en')=>{
    setLoginLanguage(next);
    try{
      localStorage.setItem('content-lab:language',next);
      const mail=(account?.email||pendingEmail||loginEmail).trim().toLowerCase();
      if(mail)localStorage.setItem('content-lab:language:'+mail,next);
    }catch{/* Storage can be disabled in private tabs. */}
    if(account)void auth.setPreferredLanguage(next).catch(()=>{});
  };
  useEffect(()=>{
    const mail=account?.email?.trim().toLowerCase();
    if(!mail)return;
    let active=true;
    void auth.getPreferredLanguage().then(server=>{
      if(!active)return;
      const local=(()=>{try{return localStorage.getItem('content-lab:language:'+mail)}catch{return null}})();
      const preferred=server||local;
      if(preferred==='es'||preferred==='en'){
        setLoginLanguage(preferred);
        try{localStorage.setItem('content-lab:language',preferred)}catch{}
      }
    }).catch(()=>{});
    return()=>{active=false};
  },[account?.email]);

  const [waiting, setWaiting] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [current, setCurrent] = useState('');
  const [tab, setTab] = useState<Tab>('home');
  useEffect(()=>{if(waiting)return;return installLabLocale(loginLanguage)},[loginLanguage,account,waiting,tab]);
  const [menu, setMenu] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  // Prevent background page scrolling while the mobile drawer owns touch scroll.
  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [menu]);
  const [editor, setEditor] = useState<Post>(newPost(''));
  const editorSessionRef=useRef(0);
  const saveInFlightRef=useRef(false);
  const [brandForm, setBrandForm] = useState<Brand | null>(null);
  const [topic, setTopic] = useState('');
  const [manualOpen,setManualOpen]=useState(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [gridPref,setGridPref]=useState<{version:number;brandId?:string;sourceId?:string;referenceId?:string;format?:string}>({version:0});
  const [backgroundPref,setBackgroundPref]=useState<{version:number;brandId?:string;id?:FreeBackgroundId;imageAssetId?:string}>({version:0});
  const [stickerPref,setStickerPref]=useState<{version:number;brandId?:string;id?:string}>({version:0});
  const uploadRef = useRef<HTMLInputElement>(null);
  const createMenuRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside=(e:PointerEvent)=>{
      if(createMenuRef.current&&!createMenuRef.current.contains(e.target as Node))
        createMenuRef.current.open=false;
    };
    const closeOnEscape=(e:KeyboardEvent)=>{
      if(e.key==='Escape'&&createMenuRef.current?.open){
        createMenuRef.current.open=false;
        createMenuRef.current.querySelector<HTMLElement>('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown',closeOutside);
    document.addEventListener('keydown',closeOnEscape);
    return()=>{
      document.removeEventListener('pointerdown',closeOutside);
      document.removeEventListener('keydown',closeOnEscape);
    };
  },[]);
  const toast = (s: string) => {
    setNotice(s);
    window.setTimeout(() => setNotice(''), 4500);
  };
  const err = (e: unknown) => {
    const x = e as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };
    toast(
      x.response?.data?.error ||
        x.response?.data?.message ||
        x.message ||
        'No se pudo completar.'
    );
  };
  const requestLoginCode = async () => {
    setLoginBusy(true);
    try {
      const email = loginEmail.trim();
      await auth.signInWithOtp(email,loginLanguage);
      try{localStorage.setItem('content-lab:language:'+email.toLowerCase(),loginLanguage)}catch{}
      setPendingEmail(email);
      setLoginStage('code');
      setLoginCode('');
      toast(loginLanguage==='es'?'Revisa tu correo y escribe el código aquí, sin salir del Lab.':'Check your inbox and enter the code here, without leaving the Lab.');
    } catch (e) {err(e);} finally {setLoginBusy(false);}
  };
  const confirmLoginCode = async () => {
    setLoginBusy(true);
    try {
      // OTP verifies in this very browser/PWA context. No cross-app magic-link navigation.
      await auth.verifyEmailOtp(pendingEmail, loginCode.replace(/\s/g,''));
      const user = await auth.getUser();
      if (!user) {
        await auth.signOut();
        throw Error(loginLanguage==='es'?'Este correo aún no tiene acceso privado. El acceso para compradores se habilitará después de la compra.':'This email does not have private access yet. Customer access opens after purchase.');
      }
      await reload();
      await auth.setPreferredLanguage(loginLanguage).catch(()=>{});
      setAccount(user);
      setLoginCode('');
    } catch (e) {err(e);} finally {setLoginBusy(false);}
  };
  const reload = async () => {
    const { data } = await api.get('/api/data');
    const wallet=await api.get('/api/ai-wallet').catch(()=>({data:null}));
    setAiWallet(wallet.data);
    setBrands(data.brands || []);
    setPosts(data.posts || []);
    setAssets(data.assets || []);
    updateHiddenBackgrounds(data.hiddenBackgroundIds||[]);
    setCurrent(old =>
      data.brands.some((b: Brand) => b.id === old)
        ? old
        : data.brands[0]?.id || ''
    );
  };
  useEffect(()=>{
    const refresh=()=>{void api.get('/api/ai-wallet').then(r=>setAiWallet(r.data)).catch(()=>{});};
    window.addEventListener('content-lab-credit-change',refresh);
    return()=>window.removeEventListener('content-lab-credit-change',refresh);
  },[]);
  useEffect(() => {
    auth
      .getUser()
      .then(async u => {
        setAccount(u);
        if (u)
          try {
            await reload();
          } catch (e) {
            err(e);
          }
      })
      .catch(err)
      .finally(() => setWaiting(false));
  }, []);
  // A verified Supabase session survives normal iPhone tab/app closures. Only
  // 24h without actual interactions requires a new email code.
  useEffect(()=>{
    if(!account)return;
    let checking=false;
    const logoutWhenIdle=()=>{
      if(checking)return;
      checking=true;
      void auth.checkIdle().then(valid=>{
        if(!valid){
          setAccount(null);setAiWallet(null);setLoginStage('email');setLoginCode('');
          setPosts([]);setImages({});setAssets([]);setBrands([]);
        }else auth.noteActivity();
      }).catch(err).finally(()=>{checking=false;});
    };
    const interact=()=>{if(!auth.noteActivity())logoutWhenIdle();};
    const onVisibility=()=>{if(document.visibilityState==='visible')logoutWhenIdle();};
    const opts={passive:true,capture:true} as AddEventListenerOptions;
    for(const event of ['pointerdown','touchstart','keydown','input','scroll'])
      document.addEventListener(event,interact,opts);
    document.addEventListener('visibilitychange',onVisibility);
    window.addEventListener('focus',logoutWhenIdle);
    return()=>{
      for(const event of ['pointerdown','touchstart','keydown','input','scroll'])
        document.removeEventListener(event,interact,opts);
      document.removeEventListener('visibilitychange',onVisibility);
      window.removeEventListener('focus',logoutWhenIdle);
    };
  },[account?.email]);
  const t = (value:string):string=>uiText(value,loginLanguage);
  const brand = brands.find(b => b.id === current) || brands[0];
  const mine = posts.filter(p => p.brandId === brand?.id);
  const library = assets.filter(a => a.brandId === brand?.id || a.shared === true);
  const setupBrandReady = Boolean(brand && brand.name.trim() && brand.name!=='My Brand' && brand.audience?.trim());
  const setupStepsDone = Number(setupBrandReady)+Number(library.length>0)+Number(mine.length>0);
  const setupSteps = [
    {title:'Define tu marca',subtitle:'Colores, idioma, audiencia y estilo.',ready:setupBrandReady,tab:'brands' as Tab,icon:Palette},
    {title:'Sube una foto',subtitle:'Usa la original o una referencia de estilo.',ready:library.length>0,tab:'media' as Tab,icon:ImagePlus},
    {title:'Guarda tu primer post',subtitle:'Crea una publicación y guárdala en tu biblioteca.',ready:mine.length>0,tab:'create' as Tab,icon:WandSparkles},
  ];
  const change = (key: keyof Post, val: string) =>
    setEditor(p => ({ ...p, [key]: val }));
  const startFactory = () => {
    if (!brand) return;
    editorSessionRef.current++;
    setEditor({...newPost(brand.id),format:'Carousel'});
    navigate('factory');
  };
  const startVertical = (format:'Reel'|'Story'='Reel')=>{
    if(!brand)return;
    editorSessionRef.current++;
    setEditor({...newPost(brand.id),format,title:format==='Reel'?'Portada de Reel':'Historia',
      hook:'',designData:writeCoverDecor('',{...readCoverDecor(''),color:'#FAF8F3',
        headlineRect:{x:.08,y:.09,w:.84,h:.2},
        primaryPhotoRect:{x:.07,y:.33,w:.86,h:.55},
        headlineStyle:{font:'serif',fontSize:88,color:'#191919',lineHeight:1.1,spacing:0}})});
    navigate('vertical');
  };
  const navigate = (id: Tab) => {
    setTab(id);
    setMenu(false);
    setSwitcher(false);
  };
  const start = (angle = 'Pain point') => {
    if (!brand) return;
    editorSessionRef.current++;
    setEditor({ ...newPost(brand.id), angle,format:'Single post' });
    setManualOpen(false);
    setTopic('');
    setAlternatives([]);
    navigate('create');
  };
  const edit = (post: Post) => {
    editorSessionRef.current++;
    setCurrent(post.brandId);
    setEditor({ ...post });
    setManualOpen(true);
    setTopic('');
    setAlternatives([]);
    navigate(['Reel','Story'].includes(post.format)?'vertical':post.format==='Carousel'?'factory':'create');
  };
  const save = async (candidate?:unknown) => {
    if(saveInFlightRef.current)return;
    const possible=candidate&&typeof candidate==='object'?candidate as Partial<Post>:null;
    const source:Post=possible&&typeof possible.title==='string'&&
      typeof possible.format==='string'&&typeof possible.brandId==='string'
      ? possible as Post:editor;
    const draft={...source,title:source.title.trim()||source.hook.trim().slice(0,80)||
      (source.format==='Carousel'?'Mi carrusel':source.format==='Reel'?'Portada de Reel':
       source.format==='Story'?'Mi historia':'Mi publicación')};
    const session=editorSessionRef.current;
    const snapshot=JSON.stringify(source);
    saveInFlightRef.current=true;
    setBusy('save');
    try {
      const { data } = source.id
        ? await api.put('/api/posts/' + source.id, draft)
        : await api.post('/api/posts', draft);
      setPosts(prev =>source.id
        ? prev.map(x => (x.id === source.id ? data : x))
        : [data, ...prev]);
      // A delayed server response must never discard newer edits or replace a
      // different draft opened while Save was running.
      setEditor(current=>{
        if(editorSessionRef.current!==session||current.brandId!==source.brandId||
           current.format!==source.format||current.id!==source.id)return current;
        if(JSON.stringify(current)===snapshot)return data as Post;
        return {...current,id:data.id,updatedAt:data.updatedAt};
      });
      toast(source.format==='Carousel'
        ? 'Carrusel guardado ✓ Puedes seguir editando y guardarlo de nuevo.'
        : 'Guardado en tu biblioteca ✓');
    } catch (e) {
      err(e);
    } finally {
      saveInFlightRef.current=false;
      setBusy('');
    }
  };
  const remove = async (p: Post) => {
    if (!p.id || !window.confirm('¿Eliminar esta publicación?')) return;
    try {
      await api.delete('/api/posts/' + p.id);
      setPosts(prev => prev.filter(x => x.id !== p.id));
      toast('Publicación eliminada.');
    } catch (e) {
      err(e);
    }
  };
  const generate = async () => {
    if (topic.trim().length < 8)
      return toast('Describe tu idea con más detalle.');
    setBusy('ai');
    try {
      const { data } = await api.post('/api/ideas', {
        brandId: brand.id,
        topic,
        format: editor.format,
        angle: editor.angle,
        platform: preferredPlatform(brand),
      });
      setEditor(p => ({ ...p, ...data, brandId: brand.id, designData: '' }));
      setAlternatives(data.alternatives || []);
      setManualOpen(true);
      toast('La IA preparó tu propuesta. Revísala y cambia lo que quieras.');
    } catch (e) {
      err(e);
    } finally {
      setBusy('');
    }
  };
  const saveBrand = async () => {
    if (!brandForm?.name.trim())
      return toast('Escribe el nombre de la cuenta.');
    const accounts=normalizeSocialAccounts(brandForm.socialAccounts,brandForm.handle);
    const prepared:Brand={...brandForm,
      color:brandForm.color.toUpperCase(),background:brandForm.background.toUpperCase(),
      additionalColors:normalizeExtraColors(brandForm.additionalColors,[brandForm.color,brandForm.background,brandForm.secondaryColor||'']),
      socialAccounts:accounts,
      handle:accounts.instagram||'',
      primaryPlatform:preferredPlatform(brandForm)
    };
    setBusy('brand');
    try {
      const { data } = prepared.id
        ? await api.put('/api/brands/' + prepared.id, prepared)
        : await api.post('/api/brands', prepared);
      setBrands(prev =>
        brandForm.id
          ? prev.map(x => (x.id === data.id ? data : x))
          : [...prev, data]
      );
      setCurrent(data.id);
      setBrandForm(null);
      toast('Marca guardada, independiente de las demás.');
    } catch (e) {
      err(e);
    } finally {
      setBusy('');
    }
  };
  const imageLoad = async (id: string):Promise<string|undefined> => {
    if (images[id]) return images[id];
    try {
      const { data } = await api.get('/api/assets/' + id);
      const url='data:' + data.mime + ';base64,' + data.content;
      setImages(old => ({...old,[id]:url}));
      return url;
    } catch (e) {
      err(e);
      return undefined;
    }
  };
  useEffect(() => {
    if (tab === 'media')
      library.forEach(a => {
        if (!images[a.id]) void imageLoad(a.id);
      });
    // Load the opening row only. Remaining sticker thumbnails lazy-load in the
    // scroll viewport to keep iPad memory and network usage smooth.
    if (tab === 'stickers')
      library.filter(a=>assetCategory(a)==='sticker').slice(0,8).forEach(a=>{
        if(!images[a.id])void imageLoad(a.id);
      });
    if (tab === 'formats')
      library.filter(a=>['original','screenshot','generated'].includes(assetCategory(a)))
        .slice(0,3).forEach(a=>{if(!images[a.id])void imageLoad(a.id)});
    if(tab==='create'){
      const decor=readCoverDecor(editor.designData);
      [editor.assetId,decor.backgroundImageId,...decor.stickerIds,...decor.layers.map(layer=>layer.assetId)].filter(Boolean).forEach(id=>{
        if(!images[id])void imageLoad(id);
      });
    }
  }, [tab, current, assets, editor.assetId, editor.designData]);
  useEffect(()=>{
    if(tab!=='stickers'||!account)return;
    let cancelled=false;
    void api.get('/api/sticker-catalog').then(({data})=>{
      if(cancelled)return;
      setAssets(prev=>[...prev.filter(asset=>assetCategory(asset)!=='sticker'||!asset.shared),
        ...(data as Asset[])]);
    }).catch(err);
    return ()=>{cancelled=true};
  },[tab,account?.email]);
  useEffect(()=>{
    if(tab!=='backgrounds'||!account)return;
    let cancelled=false;
    void api.get('/api/background-catalog').then(({data})=>{
      if(cancelled)return;
      setAssets(prev=>[...prev.filter(asset=>!(asset.shared&&assetCategory(asset)==='background')),
        ...(data as Asset[])]);
    }).catch(err);
    return ()=>{cancelled=true};
  },[tab,account?.email]);
  const deleteLibraryAsset=async(asset:Asset):Promise<void>=>{
    const category=assetCategory(asset);
    if(asset.shared&&!aiWallet?.admin)throw Error('Solo la administradora puede borrar recursos compartidos.');
    const name=displayAssetName(asset);
    if(asset.bundled){
      if(!window.confirm('¿Quitar «'+name+'» del catálogo de todos los alumnos? Los diseños guardados conservarán el archivo.'))return;
      try{
        setBusy('delete-asset');
        await api.post('/api/hidden-backgrounds',{id:asset.id});
        const {data}=await api.get('/api/data');
        setAssets(data.assets||[]);updateHiddenBackgrounds(data.hiddenBackgroundIds||[]);
        toast('Recurso quitado del catálogo ✓');
      }catch(e){err(e)}finally{setBusy('')}
      return;
    }
    const visibility=asset.shared?'de la biblioteca de TODOS los alumnos':'de tu biblioteca privada';
    if(!window.confirm('¿Eliminar definitivamente '+name+' '+visibility+'?\n\nSi lo usaste en un diseño guardado, podría dejar de verse. Esta acción no se puede deshacer.'))return;
    const endpoint=asset.shared
      ?category==='sticker'?'/api/sticker-catalog/'+asset.id.slice('shared-'.length)
         :'/api/background-catalog/'+asset.id.slice('shared-background-'.length)
      :'/api/assets/'+asset.id;
    try{
      setBusy('delete-asset');
      await api.delete(endpoint);
      const {data}=await api.get('/api/data');
      setAssets(data.assets||[]);
      updateHiddenBackgrounds(data.hiddenBackgroundIds||[]);
      setImages(old=>{const next={...old};delete next[asset.id];return next});
      toast((category==='sticker'?'Sticker':'Fondo')+' eliminado ✓');
    }catch(e){err(e)}
    finally{setBusy('')}
  };
  const deleteIncludedBackground=async(id:FreeBackgroundId,name:string)=>{
    if(!aiWallet?.admin)return err(Error('Solo la administradora puede eliminar fondos incluidos.'));
    if(!window.confirm('¿Quitar el fondo «'+name+'» del catálogo de todos los alumnos?\n\nLos diseños que ya lo usan no se borrarán.'))return;
    try{
      setBusy('delete-preset');
      await api.post('/api/hidden-backgrounds',{id});
      const {data}=await api.get('/api/data');
      updateHiddenBackgrounds(data.hiddenBackgroundIds||[]);
      setAssets(data.assets||[]);
      toast('Fondo quitado del catálogo ✓');
    }catch(e){err(e)}
    finally{setBusy('')}
  };
  const publishSharedSticker=async(file:File,stickerGroup:string):Promise<Asset|null>=>{
    if(!aiWallet?.admin)throw Error('Solo la administradora publica stickers para todos.');
    if(!/[.]png$/i.test(file.name)||file.size>5000000)throw Error('El sticker debe ser PNG y medir menos de 5 MB.');
    const encoded=await new Promise<string>((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');
      reader.onerror=()=>reject(Error('No se pudo leer el PNG original.'));
      reader.readAsDataURL(file);
    });
    const {data}=await api.post('/api/sticker-catalog',{
      content:encoded,name:file.name.replace(/[.]png$/i,'').replace(/[_-]+/g,' ').trim(),
      category:stickerGroup
    });
    const item=data as Asset;
    setAssets(prev=>prev.some(a=>a.id===item.id)?prev:[...prev,item]);
    return item;
  };
  const publishSharedBackground=async(file:File,backgroundGroup='Editoriales'):Promise<Asset|null>=>{
    if(!aiWallet?.admin)throw Error('Solo la administradora puede publicar fondos compartidos.');
    setBusy('upload');
    try{
      if(file.size>25000000)throw Error('El fondo no puede superar los 25 MB antes de optimizarlo.');
      const isHeic=/heic|heif/i.test(file.type)||/\.(heic|heif)$/i.test(file.name);
      let original:File|Blob=file;
      if(isHeic){
        const converted=await heic2any({blob:file,toType:'image/jpeg',quality:0.82});
        original=Array.isArray(converted)?converted[0]:converted;
      }
      const mime=file.type==='image/png'?'image/png':
        file.type==='image/webp'?'image/webp':'image/jpeg';
      // Shared backgrounds are used on full-size 1080 × 1350 exports.
      // Do not pre-shrink them to low-quality thumbnails before Storage.
      // The common optimizer enforces the private 4.85 MB limit safely.
      const optimized=await image.resizeIfNeeded(original,{
        maxDimension:3000,maxPixels:7_000_000,quality:0.94,mimeType:mime,
        preserveIfPossible:true,maxBytes:4_850_000
      });
      const {data}=await api.post('/api/background-catalog',{
        name:file.name.replace(/\.(png|jpe?g|webp|heic|heif)$/i,'').replace(/[_-]+/g,' ').trim(),
        category:backgroundGroup,mime:optimized.mimeType,content:optimized.data
      });
      const item=data as Asset;
      setAssets(prev=>prev.some(x=>x.id===item.id)?prev:[...prev,item]);
      setImages(prev=>({...prev,[item.id]:'data:'+optimized.mimeType+';base64,'+optimized.data}));
      toast('Fondo publicado para todos los alumnos ✓');
      return item;
    }catch(e){err(e);return null}
    finally{setBusy('')}
  };
  const upload = async (file?: File, category:MediaCategory='original', autoSelect=true, targetBrandId=brand.id): Promise<Asset | null> => {
    if (!file) return null;
    // The administrator's background/sticker uploads are intentionally shared.
    // Every buyer upload still goes to owner-only RLS tables and private Storage.
    if(aiWallet?.admin&&category==='background')return publishSharedBackground(file);
    if(aiWallet?.admin&&category==='sticker')return publishSharedSticker(file,'Aesthetic');
    if (file.size > 25000000) {
      toast('Foto demasiado grande. Elige una imagen de menos de 25 MB.');
      return null;
    }
    setBusy('upload');
    try {
      const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
      let input: File | Blob = file;
      if (isHeic) {
        try {
          const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.94 });
          input = Array.isArray(converted) ? converted[0] : converted;
        } catch {
          // Safari can decode some HEIC photos natively, so try native optimization next.
          input = file;
        }
      }
      let prepared;
      try {
        const preserveOriginal=category==='original'||category==='generated'||category==='reference'||category==='logo';
        const keepMime=['image/png','image/jpeg','image/webp'].includes(input.type)?input.type:'image/jpeg';
        prepared = await image.resizeIfNeeded(input, {
          maxDimension:preserveOriginal?3000:2160,
          maxPixels:preserveOriginal?7_000_000:4_600_000,
          quality:preserveOriginal ? 0.94 : 0.88,
          mimeType:preserveOriginal?keepMime:(category==='sticker'||category==='background')&&file.type==='image/png'?'image/png':'image/jpeg',
          preserveIfPossible:preserveOriginal,maxBytes:4_850_000
        });
      } catch {
        throw new Error('No se pudo convertir esta foto. Prueba la opción de foto compatible de tu iPhone.');
      }
      if (!prepared.data || prepared.data.length > 6_470_000) {
        throw new Error('No se pudo reducir suficientemente la foto. Intenta con otra.');
      }
      const { data } = await api.post('/api/assets', {
        brandId: targetBrandId,
        name: file.name.replace(/\.(heic|heif)$/i,'.jpg'),
        category,displayName:file.name.replace(/\.(heic|heif|jpe?g|png|webp)$/i,'').replace(/[_-]+/g,' ').slice(0,85),
        mime: prepared.mimeType,
        content: prepared.data,
      });
      const asset = data as Asset;
      setAssets(prev => [asset, ...prev]);
      setImages(prev => ({ ...prev, [asset.id]: 'data:' + prepared.mimeType + ';base64,' + prepared.data }));
      if (tab === 'create' && category === 'original' && autoSelect) change('assetId', asset.id);
      toast((category==='sticker'?'Sticker PNG transparente':'Foto')+' guardado en '+brand.name+' ✓');
      return asset;
    } catch (e) {
      err(e);
      return null;
    } finally {
      setBusy('');
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };
  const uploadBrandImage = async (file:File|undefined, field:'logoAssetId'|'referenceAssetId') => {
    if(!file||!brandForm||busy)return;
    if(!brandForm.name.trim()){toast('Escribe primero el nombre de la marca.');return;}
    const draft={...brandForm};
    setBusy('brand-upload');
    try{
      let target=draft;
      if(!target.id){
        const {data}=await api.post('/api/brands',draft);
        target=data as Brand;
        setBrands(prev=>[...prev,target]);
        setBrandForm({...draft,id:target.id});
      }
      const asset=await upload(file,field==='logoAssetId'?'logo':'reference',false,target.id);
      if(!asset)return;
      setBrandForm(prev=>prev?{...prev,id:target.id,[field]:asset.id}:prev);
    }catch(e){err(e);}finally{setBusy('');}
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        [editor.hook, editor.slides, editor.caption, editor.cta]
          .filter(Boolean)
          .join('\n\n')
      );
      toast('Contenido copiado.');
    } catch {
      toast('No se pudo copiar.');
    }
  };
  if (waiting)
    return (
      <div className="loading">
        <div className="monogram">c.</div>
        <LoaderCircle className="spin" />
        <p>{t("Opening your Content Lab…")}</p>
      </div>
    );
  if (!account)
    return (
      <div className="login">
        <section className="login-left">
          <div className="logo light">
            the content lab<span>.</span>
          </div>
          <div>
            <div className="eyebrow">{t('YOUR PRIVATE CREATIVE SPACE')}</div>
            <h1>
              {t("Less scrolling.")}
              <br />
              <em>{t("More creating.")}</em>
            </h1>
            <p>{t('A thoughtful home for your ideas, brands and content.')}</p>
          </div>
          <div className="login-tags">
            <span>{t('CREATE')}</span>
            <span>{t('CURATE')}</span>
            <span>{t('PUBLISH')}</span>
          </div>
        </section>
        <section className="login-right">
          <div className="login-card">
            <div className="lockcircle">
              <LockKeyhole size={23} />
            </div>
            <p className="lab-language-question">{loginLanguage==='es'?'Elige el idioma de tu cuenta':'Choose your account language'}</p>
            <div className="lab-login-language" role="group" aria-label="Idioma / Language">
              <button type="button" className={loginLanguage==='es'?'active':''} onClick={()=>chooseLanguage('es')} aria-pressed={loginLanguage==='es'}>Español latino</button>
              <button type="button" className={loginLanguage==='en'?'active':''} onClick={()=>chooseLanguage('en')} aria-pressed={loginLanguage==='en'}>English</button>
            </div>
            <div className="eyebrow">{loginLanguage==='es'?'TU ESPACIO CREATIVO PRIVADO':'YOUR PRIVATE CREATIVE SPACE'}</div>
            <h2>{loginLanguage==='es'?'Tu Content Lab.':'Your Content Lab.'}</h2>
            <p>{loginLanguage==='es'
                ? 'Entra con un código sin salir de esta pantalla. Cada cuenta tendrá su propia biblioteca de fotos y publicaciones.'
                : 'Sign in with a code without leaving this screen. Each account will have its own photo and content library.'}</p>
            {!import.meta.env.VITE_CONTENT_LAB_SUPABASE_URL && (
              <p role="status" style={{background:'#e9f3f5',padding:12,borderRadius:9,color:'#426a7a',fontSize:12}}>
                El editor privado de GitHub aún necesita conectar su propio Supabase y el proveedor de IA.
                La biblioteca de Master Prompts ya está disponible aquí, sin subir tus fotos.
              </p>
            )}
            {loginStage==='email'?(
              <form onSubmit={e=>{e.preventDefault();void requestLoginCode()}}>
                <label htmlFor="lab-email">{loginLanguage==='es'?'Correo electrónico':'Email address'}</label>
                <input id="lab-email" type="email" required placeholder={loginLanguage==='es'?'Tu correo autorizado':'Your authorized email'} autoComplete="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/>
                <button className="btn dark wide" type="submit" disabled={loginBusy||!import.meta.env.VITE_CONTENT_LAB_SUPABASE_URL}>
                  {loginBusy?<LoaderCircle size={18}/>:<ArrowRight size={18}/>}
                  {loginLanguage==='es'?'Enviar código de acceso':'Send sign-in code'}
                </button>
              </form>
            ):(
              <form onSubmit={e=>{e.preventDefault();void confirmLoginCode()}}>
                <p className="lab-login-address">{loginLanguage==='es'?'Código para':'Code for'} <strong>{pendingEmail}</strong></p>
                <label htmlFor="lab-code">{loginLanguage==='es'?'Código de tu correo':'Code from your email'}</label>
                <input id="lab-code" type="text" inputMode="numeric" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required autoComplete="one-time-code" autoCapitalize="off" autoCorrect="off" placeholder="••••••" value={loginCode} onChange={e=>setLoginCode(e.target.value.replace(/\D/g,'').slice(0,8))}/>
                <button className="btn dark wide" type="submit" disabled={loginBusy||loginCode.length<6}>
                  {loginBusy?<LoaderCircle size={18}/>:<ShieldCheck size={18}/>}
                  {loginLanguage==='es'?'Entrar a mi Content Lab':'Open my Content Lab'}
                </button>
                <button className="lab-login-back" type="button" disabled={loginBusy} onClick={()=>{setLoginStage('email');setLoginCode('')}}>
                  {loginLanguage==='es'?'Cambiar correo o solicitar otro código':'Change email or request another code'}
                </button>
                <small className="lab-login-hint">{loginLanguage==='es'
                   ? 'El acceso por código funciona sin abrir Safari cuando el correo incluye un código numérico. Si solo recibes un enlace, la plantilla de correo de Supabase aún debe configurarse.'
                   : 'Code sign-in stays in this app when the email contains a numeric code. If you only receive a link, the Supabase email template still needs configuration.'}</small>
              </form>
            )}
            
            <a href="./prompts/" className="btn ghost wide" style={{marginTop:12}}>{loginLanguage==='es'?'Usar los 8 Master Prompts gratis':'Try the 8 free Master Prompts'}</a>
            <small><ShieldCheck size={16}/>{loginLanguage==='es'?'Acceso personal para compras verificadas · Sin contraseña':'Private access for verified purchases · No password'}</small>
          </div>
        </section>
      </div>
    );
  return (
    <div className="app-shell" lang={loginLanguage==='es'?'es-419':'en'}>
      {menu && <div className="overlay" onClick={() => setMenu(false)} />}
      <aside className={'sidebar ' + (menu ? 'open' : '')} aria-label="Menú de Content Lab">
        <div className="identity">
          <div className="monogram">c.</div>
          <div>
            <div className="logo">
              content lab<span>.</span>
            </div>
            <small>{t('YOUR CREATIVE HQ')}</small>
          </div>
          <button className="sidebar-close" type="button" aria-label="Cerrar menú" onClick={() => setMenu(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="side-label">{t('YOUR ACCOUNTS')}</div>
        <div className="switchwrap">
          <button className="switch" onClick={() => setSwitcher(v => !v)}>
            <span className="brand-avatar" style={{ background: brand?.color }}>
              {brand?.name[0] || '+'}
            </span>
            <span>
              <strong>{brand?.name || t('Select a brand')}</strong>
              <small>{brand?.handle || t('Personal workspace')}</small>
            </span>
            <ChevronDown size={16} />
          </button>
          {switcher && (
            <div className="switchlist">
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    editorSessionRef.current++;
                    setCurrent(b.id);
                    setEditor(newPost(b.id));
                    setSwitcher(false);
                  }}
                >
                  {b.name}
                  {b.id === brand.id && <Check size={15} />}
                </button>
              ))}
              <button
                className="special"
                onClick={() => {
                  setBrandForm(newBrand());
                  navigate('brands');
                }}
              >
                <Plus size={15} /> {t("Add another account")}
              </button>
            </div>
          )}
        </div>
        <nav aria-label="Herramientas del Content Lab">
          {navGroups.map(group=><div className="lab-nav-group" key={group.title}>
            <div className="side-label lab-nav-group-title">{t(group.title)}</div>
            {group.items.map(id=>{
              const item=nav.find(entry=>entry.id===id);
              if(!item)return null;
              const Icon=item.icon;
              return <button type="button" key={item.id}
                className={tab===item.id?'active':''}
                onClick={()=>item.id==='vertical'?startVertical():item.id==='factory'?startFactory():item.id==='create'?start():navigate(item.id)}>
                <Icon size={19} strokeWidth={1.8}/>{t(item.title)}
                {item.id==='posts'&&<b>{mine.length}</b>}
              </button>;
            })}
          </div>)}
        </nav>
        {aiWallet && !aiWallet.admin && <div className="lab-credit-wallet" role="status" aria-live="polite">
          <strong>{loginLanguage==='es'?'Créditos de IA · Tu saldo':'AI credits · Your balance'}</strong>
          <p>{aiWallet.photo_remaining??60} {loginLanguage==='es'?'fotos':'photos'} · {aiWallet.creative_remaining??30} {loginLanguage==='es'?'créditos creativos':'creative credits'}</p>
          <small>{loginLanguage==='es'?'10 fotos por día y un máximo de 10 créditos de ideas. Editar y descargar tus PNG no consume créditos.':'10 photos per day and up to 10 idea credits. Editing and downloading PNGs does not use credits.'}</small>
        </div>}
        <div className="side-footer">
          
          <div className="side-inspo">
            <Sparkles size={21} />
            <strong>{t('Good content starts with intention.')}</strong>
            <p>{t('Less noise, more meaning.')}</p>
          </div>
          <button
            className="signout"
            onClick={() => auth.signOut().then(() => setAccount(null))}
          >
            <span className="person">D</span>
            <span>
              <strong>{t('My private workspace')}</strong>
              <small>{account.email}</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main>
        <header className="top">
          <div>
            <button className="hamburger" type="button" aria-label="Abrir menú" aria-expanded={menu} onClick={() => setMenu(true)}>
              <Menu size={22} />
            </button>
            <span className="eyebrow">{t('MY WORKSPACE')}</span>
            <span className="slash">/</span>
            <strong className="lab-current-page">
              <span className="lab-page-long">{t(nav.find(n => n.id === tab)?.title||'')}</span>
              <span className="lab-page-short">{tab==='posts'?(loginLanguage==='es'?'Mis posts':'Posts'):tab==='calendar'?(loginLanguage==='es'?'Calendario':'Calendar'):t(nav.find(n => n.id === tab)?.title||'')}</span>
            </strong>
          </div>
          <div>
            <div className="lab-site-locale" role="group" aria-label="Idioma del sitio / Site language">
              <button type="button" aria-pressed={loginLanguage==='es'}
                className={loginLanguage==='es'?'active':''} onClick={()=>chooseLanguage('es')}>ES</button>
              <button type="button" aria-pressed={loginLanguage==='en'}
                className={loginLanguage==='en'?'active':''} onClick={()=>chooseLanguage('en')}>EN</button>
            </div>
            <span className="private">
              <LockKeyhole size={13} /> {loginLanguage==='es'?'PRIVADO':'PRIVATE'}
            </span>
            <details ref={createMenuRef} className="lab-create-menu">
              <summary className="btn dark compact lab-primary-create" aria-label={t('Create content')}>
                <Plus size={18}/><span>{loginLanguage==='es'?'Crear':'Create'}</span>
              </summary>
              <div className="lab-create-choices">
                <button type="button" onClick={()=>{createMenuRef.current!.open=false;start()}}>{loginLanguage==='es'?'Post · 4:5':'Post · 4:5'}</button>
                <button type="button" onClick={()=>{createMenuRef.current!.open=false;startFactory()}}>{loginLanguage==='es'?'Carrusel · 4:5':'Carousel · 4:5'}</button>
                <button type="button" onClick={()=>{createMenuRef.current!.open=false;startVertical('Reel')}}>Reel · 9:16</button>
                <button type="button" onClick={()=>{createMenuRef.current!.open=false;startVertical('Story')}}>{loginLanguage==='es'?'Historia · 9:16':'Story · 9:16'}</button>
              </div>
            </details>
          </div>
        </header>
        <div className="content" data-lab-tab={tab} key={tab}>
          {brand && tab === 'home' && (
            <>
              <section className="lab-home-greeting" aria-label={loginLanguage==='es'?'Bienvenida a tu estudio':'Welcome to your studio'}>
                <div className="lab-greeting-main">
                  <div className="lab-greeting-copy">
                    <span className="lab-greeting-kicker"><Sparkles size={15} aria-hidden="true"/>
                      {loginLanguage==='es'?'TU ESPACIO CREATIVO':'YOUR CREATIVE SPACE'}
                    </span>
                    <h1>{loginLanguage==='es'?'¡Qué gusto verte de nuevo! 👋':'Welcome back! 👋'}</h1>
                    <p>{loginLanguage==='es'
                      ?'Tu estudio está listo. ¿Qué vamos a crear hoy?'
                      :'Your studio is ready. What shall we create today?'}</p>
                    {brand.name&&brand.name!=='My Brand'&&<span className="lab-greeting-brand">
                      {loginLanguage==='es'?'Trabajando en':'Working on'} <strong>{brand.name}</strong>
                    </span>}
                  </div>
                  <div className="lab-greeting-actions">
                    <button type="button" className="btn dark" onClick={()=>start()}>
                      <Plus size={17} aria-hidden="true"/>
                      {loginLanguage==='es'?'Crear publicación':'Create post'}
                    </button>
                    <button type="button" className="lab-greeting-secondary" onClick={startFactory}>
                      {loginLanguage==='es'?'Carruseles':'Carousels'}
                    </button>
                    <button type="button" className="lab-greeting-secondary" onClick={()=>startVertical()}>
                      <Film size={16}/>{loginLanguage==='es'?'Reels e historias':'Reels and Stories'}
                    </button>
                  </div>
                </div>
                {setupStepsDone<3&&<details className="lab-greeting-progress">
                  <summary>
                    <Check size={15} aria-hidden="true"/>
                    <span>{loginLanguage==='es'?'Mis primeros pasos':'My first steps'}</span>
                    <strong>{setupStepsDone}/3</strong>
                    <ChevronDown size={16} aria-hidden="true"/>
                  </summary>
                  <div className="lab-greeting-checklist">
                    {setupSteps.map(step=><button key={step.title} type="button" className={step.ready?'complete':''}
                      onClick={()=>{if(step.tab==='brands')setBrandForm(brand);if(step.tab==='create')start();else navigate(step.tab)}}>
                      <span className="lab-greeting-checkicon">{step.ready?<Check size={15}/>:<ArrowRight size={15}/>}</span>
                      <span>{t(step.title)}</span>
                      <small>{step.ready?(loginLanguage==='es'?'Listo':'Done'):(loginLanguage==='es'?'Pendiente':'To do')}</small>
                    </button>)}
                  </div>
                </details>}
              </section>
              <section className="stats">
                {[
                  {
                    label: 'TOTAL PIECES',
                    n: mine.length,
                    detail: 'In this account',
                  },
                  {
                    label: 'IN PROGRESS',
                    n: mine.filter(x => ['Idea', 'Draft'].includes(x.status))
                      .length,
                    detail: 'Ideas in motion',
                  },
                  {
                    label: 'READY TO POST',
                    n: mine.filter(x => x.status === 'Ready').length,
                    detail: 'Ready when you are',
                  },
                  {
                    label: 'YOUR MEDIA',
                    n: library.length,
                    detail: 'Photos and screenshots',
                  },
                ].map(s => (
                  <div key={s.label}>
                    <span>{t(s.label)}</span>
                    <strong>{s.n}</strong>
                    <small>{t(s.detail)}</small>
                  </div>
                ))}
              </section>
              <div className="homegrid">
                <section className="homeideas">
                  <div className="cardheading">
                    <div>
                      <div className="eyebrow">{t('THE CONTENT ENGINE')}</div>
                      <h2>{t('What are we creating today?')}</h2>
                    </div>
                    <Sparkles size={25} />
                  </div>
                  <p>
                    {t("Start with one problem, one photo or one idea worth sharing.")}
                  </p>
                  <div className="angles">
                    {[
                      {
                        name: 'Teach something',
                        sub: 'A useful little lesson',
                        icon: Lightbulb,
                        angle: 'Educational',
                      },
                      {
                        name: 'Solve a pain point',
                        sub: 'Make them feel seen',
                        icon: Heart,
                        angle: 'Pain point',
                      },
                      {
                        name: 'Show the difference',
                        sub: 'Before / after',
                        icon: Layers3,
                        angle: 'Before / after',
                      },
                      {
                        name: 'Keep it relatable',
                        sub: 'A real everyday moment',
                        icon: Sparkles,
                        angle: 'POV / Relatable',
                      },
                    ].map((a, i) => (
                      <button
                        className={'angle a' + i}
                        key={a.name}
                        onClick={() => start(a.angle)}
                      >
                        <a.icon size={23} />
                        <strong>{t(a.name)}</strong>
                        <small>{t(a.sub)}</small>
                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </div>
                </section>
                <section className="homebrand">
                  <div className="eyebrow">{t('ACTIVE BRAND')}</div>
                  <h2>{brand.name}</h2>
                  <p>{brand.audience || t('Define your audience in settings.')}</p>
                  <div className="dots">
                    <i style={{ background: brand.color }} />
                    <i style={{ background: brand.background }} />
                    <i style={{ background: '#191919' }} />
                  </div>
                  <div className="brand-detail">
                    {t('LANGUAGE')} <strong>{brand.language}</strong>
                  </div>
                  <div className="brand-detail">
                    {t('SAVED POSTS')} <strong>{mine.length}</strong>
                  </div>
                  <button
                    className="textlink"
                    onClick={() => {
                      setBrandForm(brand);
                      navigate('brands');
                    }}
                  >
                    {t("Edit brand profile")} <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <div className="sectionheading">
                <div>
                  <div className="eyebrow">{t('PICK UP WHERE YOU LEFT OFF')}</div>
                  <h2>{t('Recent creations')}</h2>
                </div>
                <button className="textlink" onClick={() => navigate('posts')}>
                  {t("View all")} <ArrowRight size={16} />
                </button>
              </div>
              {mine.length ? (
                <div className="recent">
                  {mine
                    .slice()
                    .reverse()
                    .slice(0, 4)
                    .map(p => (
                      <button key={p.id} onClick={() => edit(p)}>
                        <FolderOpen size={19} />
                        <span>
                          <strong>{p.title}</strong>
                          <small>
                            {p.format} · {p.angle}
                          </small>
                        </span>
                        <b>{p.status}</b>
                        <ArrowUpRight size={18} />
                      </button>
                    ))}
                </div>
              ) : (
                <div className="empty">
                  <Sparkles size={30} />
                  <h3>{t("Your best ideas begin here.")}</h3>
                  <p>{t("No content saved yet. Create your first piece.")}</p>
                  <small className="lab-empty-hint">{loginLanguage==='es'?'Para empezar, toca «+ Crear» en la barra superior.':'To begin, tap “+ Create” in the top bar.'}</small>
                </div>
              )}
            </>
          )}
          {brand && tab === 'prompts' && (
            <section className="panel">
              <div className="eyebrow">SAVED MASTER PROMPTS</div>
              <h2>{t("One Product → 8 Compositions")}</h2>
              <p>{t("Ocho composiciones publicitarias del mismo producto, una imagen por resultado.")}</p>
              <a className="btn dark" href="./prompts/" target="_blank" rel="noreferrer">{t("Abrir biblioteca de prompts")}</a>
            </section>
          )}
          {brand && tab === 'prompt-studio' && (
            <PromptStudio brand={brand} locale={loginLanguage} notify={toast} showError={err}
              onUse={(text,settings)=>{
                setChosenPrompt({version:Date.now(),text,settings});
                navigate('grid');
              }}/>
          )}
          {brand && tab === 'grid' && (
            <BrandGrid
              onUploadBackground={async file=>upload(file,'background')}
              promptSelection={chosenPrompt}
              onOpenPrompts={()=>navigate('prompt-studio')}
              onOpenCalendar={()=>navigate('calendar')}
              onOpenStickers={()=>navigate('stickers')}
              initialSelection={gridPref}
              isAdmin={Boolean(aiWallet?.admin)}
              wallet={aiWallet}
              brand={brand}
              assets={library}
              images={images}
              onUploadFile={upload}
              onNewAsset={(asset, src) => {
                setAssets(prev => [asset, ...prev]);
                setImages(prev => ({ ...prev, [asset.id]: src }));
              }}
              loadImage={imageLoad}
              notify={toast}
              showError={err}
            />
          )}
          {brand && tab === 'calendar' && (
            <ContentCalendar brand={brand} posts={posts} images={images} locale={loginLanguage}
              loadImage={id=>{void imageLoad(id)}}
              onPostSaved={updated=>setPosts(prev=>prev.map(p=>p.id===updated.id?updated as Post:p))}
              onNewPost={()=>start()}
              onOpenGrid={()=>navigate('grid')}
              notify={toast} showError={err}/>
          )}
          {brand && tab === 'factory' && (
            <CarouselFactory
              onUploadPhoto={async file=>upload(file,'original')}
              onUploadBackground={async file=>upload(file,'background')}
              initialBackground={backgroundPref.brandId===brand.id?backgroundPref:undefined}
              initialSticker={stickerPref.brandId===brand.id?stickerPref:undefined}
              brand={brand}
              post={editor}
              assets={library}
              images={images}
              onChange={setEditor}
              onSave={save}
              onNewAsset={(asset, src) => {
                setAssets(prev => [asset, ...prev]);
                setImages(prev => ({ ...prev, [asset.id]: src }));
              }}
              loadImage={imageLoad}
              uploadImage={() => uploadRef.current?.click()}
              onOpenStickers={()=>navigate('stickers')}
              notify={toast}
              showError={err}
              saving={busy === 'save'}
            />
          )}
          {brand && tab === 'vertical' && (
            <VerticalStudio post={editor} brand={brand} assets={library} images={images}
              locale={loginLanguage} saving={busy==='save'} onSave={save}
              onChange={patch=>setEditor(old=>({...old,...patch}))}
              onUploadPhoto={async file=>upload(file,'original',false)}
              onUploadBackground={async file=>upload(file,'background',false)}
              loadImage={imageLoad} onOpenStickers={()=>navigate('stickers')}
              notify={toast}/>
          )}
          {brand && tab === 'create' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">
                    CONTENT WORKSPACE / {brand.name.toUpperCase()}
                  </div>
                  <h1>
                    {t("Content")} <em>composer.</em>
                  </h1>
                  <p>{t('Give it a purpose. Give it your voice. Make it yours.')}</p>
                  {editor.format==='Carousel'&&<button className="btn dark" onClick={() => navigate('factory')}><Layers3 size={16} /> {loginLanguage==='es'?'Diseñar carrusel completo':'Design full carousel'}</button>}
                </div>
                <button className="btn ghost" onClick={() => start()}>
                  <RotateCcw size={16} /> {t("Start fresh")}
                </button>
              </div>
              <div className="composer">
                <div className="forms">
                  <section className="panel">
                    <div className="panelhead">
                      <span>01</span>
                      <h3>{loginLanguage==='es'?'Cuéntale a la IA qué quieres crear':'Tell AI what to create'}</h3>
                    </div>
                    <label>{loginLanguage==='es'?'Describe tu idea en tus palabras':'Describe your idea in your words'}</label>
                    <textarea
                      rows={3}
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder={
                        brand.language === 'English'
                          ? 'e.g. When quote requests get lost because you track everything by hand…'
                          : 'Ej. Cuando sientes que vas tarde y te comparas con los demás…'
                      }
                    />
                    <div className="double">
                      <div>
                        <label>{t('Format')}</label>
                        <select
                          value={editor.format}
                          onChange={e => change('format', e.target.value)}
                        >
                          <option value="Single post">{loginLanguage==='es'?'Post individual (4:5)':'Single post (4:5)'}</option>
                        </select>
                      </div>
                      <details className="lab-angle-advanced"><summary>{loginLanguage==='es'?'Ajustar enfoque':'Change content angle'}</summary>
                        <label>{t('Content angle')}</label>
                        <select value={editor.angle} onChange={e=>change('angle',e.target.value)}>
                          {angles.map(x=><option key={x}>{x}</option>)}
                        </select>
                      </details>
                    </div>
                    <p className="lab-ai-message">{loginLanguage==='es'?'Escribe como hablas. La IA propondrá el texto usando la voz de tu marca; tú decides qué conservar.':'Write naturally. AI drafts in your brand voice; you decide what to keep.'}</p>
                    <button
                      className="btn dark wide"
                      disabled={busy === 'ai'}
                      onClick={generate}
                    >
                      {busy === 'ai' ? (
                        <LoaderCircle className="spin" size={17} />
                      ) : (
                        <WandSparkles size={17} />
                      )}{' '}
                      {busy === 'ai'
                        ? (loginLanguage==='es'?'Creando…':'Creating…')
                        : (loginLanguage==='es'?'Crear con IA · 1 crédito':'Create with AI · 1 credit')}
                    </button>
                    <small className="note">{loginLanguage==='es'?'Puedes editar todo antes de guardar. Las fotos con IA se generan por separado.':'Everything is editable before saving. AI photos are generated separately.'}</small>
                    <button className="btn ghost wide" type="button" onClick={()=>setManualOpen(v=>!v)}>
                      {manualOpen?(loginLanguage==='es'?'Recoger editor':'Collapse editor'):(loginLanguage==='es'?'Editar todo manualmente':'Edit everything manually')}
                    </button>
                  </section>
                  <section className={'panel lab-manual-panel'+(manualOpen?' is-open':'')} hidden={!manualOpen}>
                    <div className="panelhead">
                      <span>02</span>
                      <h3>{loginLanguage==='es'?'Edita el resultado a tu manera':'Edit your result'}</h3>
                    </div>
                    <label>{t('Internal title *')}</label>
                    <input
                      value={editor.title}
                      onChange={e => change('title', e.target.value)}
                      placeholder={t('Name this idea')}
                    />
                    <label>{t('Cover hook')}</label>
                    <textarea
                      rows={2}
                      value={editor.hook}
                      onChange={e => change('hook', e.target.value)}
                      placeholder={t('A clear, specific opening…')}
                    />
                    {alternatives.length > 0 && (
                      <div className="alternatives">
                        <div className="eyebrow">ALTERNATIVE HOOKS</div>
                        {alternatives.map((s, i) => (
                          <button key={i} onClick={() => change('hook', s)}>
                            {s} <ArrowUpRight size={14} />
                          </button>
                        ))}
                      </div>
                    )}
                    <label>{t('Slides / Script')}</label>
                    <textarea
                      rows={5}
                      value={editor.slides}
                      onChange={e => change('slides', e.target.value)}
                      placeholder={t('One slide or talking point per line…')}
                    />
                    <label>{t('Caption')}</label>
                    <textarea
                      rows={5}
                      value={editor.caption}
                      onChange={e => change('caption', e.target.value)}
                      placeholder={t('Write like a human, not a template…')}
                    />
                    <label>{t('CTA')}</label>
                    <input
                      value={editor.cta}
                      onChange={e => change('cta', e.target.value)}
                      placeholder={t('What should they do next?')}
                    />
                    <label>{t('Visual direction')}</label>
                    <textarea
                      rows={2}
                      value={editor.visual}
                      onChange={e => change('visual', e.target.value)}
                      placeholder={t('Which photo or screenshot makes the story clearer?')}
                    />
                    <button className="btn ghost" onClick={copy}>
                      <Copy size={16} /> {t("Copy content")}
                    </button>
                  </section>
                  <section className="panel lab-save-panel">
                    <div className="panelhead">
                      <span>03</span>
                      <h3>{t('Save & organize')}</h3>
                    </div>
                    <div className="double">
                      <div>
                        <label>{t('Status')}</label>
                        <select
                          value={editor.status}
                          onChange={e => change('status', e.target.value)}
                        >
                          {['Idea', 'Draft', 'Ready', 'Published'].map(x => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>{t('Planned date')}</label>
                        <input
                          type="date"
                          value={editor.date}
                          onChange={e => change('date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>{loginLanguage==='es'?'Hora prevista':'Planned time'}</label>
                        <input type="time" value={editor.time||'09:00'}
                          onChange={e=>change('time',e.target.value)}/>
                      </div>
                    </div>
                    <p className="note">{loginLanguage==='es'?'La fecha y hora son para organizar tu calendario. No publican automáticamente.':'Date and time organize your calendar; they do not auto-publish.'}</p>
                    <button type="button" className="btn ghost wide" onClick={()=>navigate('calendar')}>
                      <CalendarDays size={16}/>{loginLanguage==='es'?'Ver calendario editorial':'View content calendar'}
                    </button>
                    <button
                      className="btn dark wide"
                      onClick={save}
                      disabled={busy === 'save'}
                    >
                      <Save size={17} />
                      {editor.id ? 'Update saved post' : 'Save to my library'}
                    </button>
                  </section>
                </div>
                <aside className="visual cover-studio">
                  <div className="cover-studio-heading">
                    <div className="eyebrow">{loginLanguage==='es'?'VISTA PREVIA':'PREVIEW'}</div>
                    <h3>{editor.format==='Reel'?'Reel':editor.format==='Story'?'Story':loginLanguage==='es'?'Tu diseño':'Your design'}</h3>
                    <small>Instagram · 1080 × {['Reel','Story'].includes(editor.format)?'1920 · 9:16':'1350 · 4:5'} PNG</small>
                  </div>
                  <FreePostStudio post={editor} brand={brand}
                    assets={library} images={images} locale={loginLanguage}
                    onChange={next=>setEditor(old=>({...old,
                      designData:writeCoverDecor(old.designData,next)}))}
                    onTitle={value=>change('hook',value)}
                    onUpload={async file=>upload(file,'original',false)}
                    loadImage={imageLoad} onOpenStickers={()=>navigate('stickers')}
                    onUploadBackground={async file=>upload(file,'background',false)}
                    notify={toast}/>

                </aside>
              </div>
            </>
          )}
          {brand && tab === 'posts' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">{t('YOUR CONTENT COLLECTION')}</div>
                  <h1>
                    {t("Everything you've")} <em>{t('made.')}</em>
                  </h1>
                  <p>Only publications belonging to {brand.name}.</p>
                </div>
              </div>
              <div className="search">
                <Search size={18} />
                <input
                  placeholder={t('Search posts…')}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              {mine.filter(p =>
                (p.title + p.hook + p.caption)
                  .toLowerCase()
                  .includes(query.toLowerCase())
              ).length ? (
                <div className="postgrid">
                  {mine
                    .filter(p =>
                      (p.title + p.hook + p.caption)
                        .toLowerCase()
                        .includes(query.toLowerCase())
                    )
                    .slice()
                    .reverse()
                    .map(p => (
                      <article className="postcard" key={p.id}>
                        <div className="posttop">
                          <span>
                            {p.format} · {p.angle}
                          </span>
                          <b>{p.status}</b>
                        </div>
                        <h3>{p.title}</h3>
                        <p>
                          {p.hook ||
                            p.caption ||
                            'A new idea waiting for your voice.'}
                        </p>
                        <div className="postbottom">
                          <small>{p.date || 'Saved draft'}</small>
                          <button
                            aria-label="Delete post"
                            onClick={() => remove(p)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            aria-label="Edit post"
                            onClick={() => edit(p)}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              ) : (
                <div className="empty">
                  <FolderOpen size={32} />
                  <h3>{t('Nothing here yet.')}</h3>
                  <p>{t('Start with one meaningful idea.')}</p>
                  <small className="lab-empty-hint">{loginLanguage==='es'?'Usa «+ Crear» arriba para empezar tu primera publicación.':'Use “+ Create” above to start your first post.'}</small>
                </div>
              )}
            </>
          )}
          {brand && tab === 'stickers' && <StickerDownloads brandId={brand.id} assets={library} images={images} isAdmin={Boolean(aiWallet?.admin)} onPublish={publishSharedSticker} onUpload={async file=>upload(file,'sticker')} onDelete={deleteLibraryAsset} loadImage={imageLoad} onUse={(id,destination)=>{
                    if(destination==='cover'){
                      setEditor(old=>{
                        const decor=readCoverDecor(old.designData);
                        return {...old,designData:writeCoverDecor(old.designData,{
                          ...decor,stickerIds:[...decor.stickerIds.filter(x=>x!==id),id].slice(-3)
                        })};
                      });
                      if(!images[id])void imageLoad(id);
                      navigate('create');
                    }else{
                      setStickerPref(p=>({version:p.version+1,brandId:brand.id,id}));
                      navigate('factory');
                    }
                  }}/>}
          {brand && tab === 'backgrounds' && <BackgroundLibrary
  isAdmin={Boolean(aiWallet?.admin)}
  assets={library} images={images} loadImage={imageLoad}
  onUpload={async(file,category)=>aiWallet?.admin?publishSharedBackground(file,category):upload(file,'background')}
  onDelete={deleteLibraryAsset}
  onDeletePreset={deleteIncludedBackground}
  onDesign={(id,imageAssetId)=>{setBackgroundPref(p=>({version:p.version+1,brandId:brand.id,id,imageAssetId}));navigate('factory')}}/>}
          {brand && tab === 'media' && (
             <MediaLibrary brand={brand} assets={library} images={images} busy={busy==='upload'}
               onUpload={async(file,category)=>upload(file,category)}
               onUpdate={updated=>setAssets(prev=>prev.map(a=>a.id===updated.id?updated:a))}
               onDelete={async a=>{try{await api.delete('/api/assets/'+a.id);setAssets(prev=>prev.filter(x=>x.id!==a.id));toast('Imagen eliminada de esta marca.')}catch(e){err(e)}}}
               onSaveDefaultReference={async id=>{const {data}=await api.put('/api/brands/'+brand.id,{referenceAssetId:id});setBrands(prev=>prev.map(x=>x.id===data.id?data:x))}}
               onCreateWithPhotos={(sourceId,referenceId)=>{setGridPref(p=>({version:p.version+1,brandId:brand.id,sourceId,referenceId}));navigate('grid')}}
               notify={toast} showError={err}/>
           )}
           {brand && tab === 'formats' && (
             <FormatGallery brand={brand} assets={library} images={images}
               onUpload={()=>navigate('media')}
               onChoose={format=>{setGridPref(p=>({version:p.version+1,brandId:brand.id,format}));navigate('grid')}}/>
           )}
           {tab === 'brands' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">SEPARATE BRANDS. CLEAR VOICES.</div>
                  <h1>
                    {t("Your brands,")}
                    <br />
                    <em>your rules.</em>
                  </h1>
                  <p>
                    {t("Every account gets its own language, audience and visuals.")}
                  </p>
                </div>
                <button
                  className="btn dark"
                  onClick={() => setBrandForm(newBrand())}
                >
                  <Plus size={16} /> {t("Add a brand")}
                </button>
              </div>
              {brandForm ? (
                <div className="panel brand-panel">
                  <div className="panelhead">
                    <span>
                      <Palette size={17} />
                    </span>
                    <h3>
                      {brandForm.id
                        ? 'Edit brand profile'
                        : 'Create brand profile'}
                    </h3>
                    <button
                      className="iconbtn"
                      onClick={() => setBrandForm(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="double">
                    <div>
                      <label>{t('Name *')}</label>
                      <input
                        value={brandForm.name}
                        onChange={e =>
                          setBrandForm({ ...brandForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label>{t("¿Para qué red vas a crear contenido principalmente?")}</label>
                      <select value={preferredPlatform(brandForm)} onChange={e=>setBrandForm({...brandForm,primaryPlatform:e.target.value as SocialPlatform})}>
                        {SOCIAL_PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <label>{t('Ideal audience')}</label>
                  <textarea
                    rows={2}
                    value={brandForm.audience}
                    onChange={e =>
                      setBrandForm({ ...brandForm, audience: e.target.value })
                    }
                  />
                  <label>{t('Voice & personality')}</label>
                  <textarea
                    rows={2}
                    value={brandForm.voice}
                    onChange={e =>
                      setBrandForm({ ...brandForm, voice: e.target.value })
                    }
                  />
                  <label>{t('Instructions for content AI')}</label>
                  <textarea
                    rows={4}
                    value={brandForm.rules}
                    onChange={e =>
                      setBrandForm({ ...brandForm, rules: e.target.value })
                    }
                  />
                  <div className="double">
                    <div>
                      <label>{t('Public content language')}</label>
                      <select
                        value={brandForm.language}
                        onChange={e =>
                          setBrandForm({
                            ...brandForm,
                            language: e.target.value as Brand['language'],
                          })
                        }
                      >
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                    <div>
                      <label>{t('Brand colors')}</label>
                      <div className="colorinputs">
                        <input
                          type="color"
                          value={brandForm.color}
                          onChange={e =>
                            setBrandForm({
                              ...brandForm,
                              color: e.target.value,
                            })
                          }
                        />
                        <input
                          type="color"
                          value={brandForm.background}
                          onChange={e =>
                            setBrandForm({
                              ...brandForm,
                              background: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="brandkit-extra">
                    <div className="eyebrow">BRAND KIT · PALETA PERSONAL PARA CADA MARCA</div>
                    <div className="lab-brand-palette-editor">
                      <div className="lab-brand-palette-head"><div><strong>Tu paleta de marca</strong><p>{t("Los colores base siguen activos. Agrega hasta 6 tonos adicionales para los fondos y acentos de tus carruseles.")}</p></div>
                        <button type="button" className="btn ghost" disabled={(brandForm.additionalColors||[]).length>=6} onClick={()=>setBrandForm({...brandForm,additionalColors:[...(brandForm.additionalColors||[]),['#C7DCE8','#F2D85B','#BFD5CC','#C4A7D8','#DBAE9E','#9BAEC7'][(brandForm.additionalColors||[]).length]]})}><Plus size={15}/> Añadir color</button>
                      </div>
                      <div className="lab-brand-palette-list">
                        {[{label:'Principal',color:brandForm.color},{label:'Fondo',color:brandForm.background},{label:'Secundario',color:brandForm.secondaryColor||'#E7D8C9'},...(brandForm.additionalColors||[]).map((c,i)=>({label:'Extra '+(i+1),color:c}))].map((item,i)=><div key={'brand-color-'+i} className="lab-brand-palette-tile">
                          <span className="lab-brand-palette-swatch" style={{background:item.color}}/>
                          <span className="lab-brand-palette-name">{item.label}<small>{item.color.toUpperCase()}</small></span>
                          {i>=3&&<><input aria-label={'Elegir color '+item.label} type="color" value={item.color} onChange={e=>setBrandForm({...brandForm,additionalColors:(brandForm.additionalColors||[]).map((v,n)=>n===i-3?e.target.value:v)})}/>
                            <button aria-label={'Eliminar '+item.label} type="button" className="lab-brand-color-remove" onClick={()=>setBrandForm({...brandForm,additionalColors:(brandForm.additionalColors||[]).filter((_,n)=>n!==i-3)})}><X size={16}/></button></>}
                        </div>)}
                      </div>
                      <small>Los tres primeros colores se editan en los campos de arriba y abajo. Los colores adicionales se guardan solo en esta marca.</small>
                    </div>
                    <div className="lab-social-accounts">
                      <div className="lab-social-accounts-head"><strong>¿En qué redes sociales está tu marca?</strong><p>Escribe tu usuario o el enlace de cada página. Puedes dejar campos vacíos. Solo guardamos esta información para personalizar tu contenido; no conectamos cuentas ni pedimos contraseñas.</p></div>
                      <div className="lab-social-accounts-grid">
                        {SOCIAL_PLATFORMS.map(p=><label className="lab-social-field" key={p.id}>
                          <span>{p.label}{preferredPlatform(brandForm)===p.id&&<small>{t("Principal")}</small>}</span>
                          <input maxLength={200} autoComplete="off" placeholder={p.placeholder}
                            aria-label={'Cuenta de '+p.label}
                            value={p.id==='instagram'?(brandForm.socialAccounts?.instagram??brandForm.handle):(brandForm.socialAccounts?.[p.id]||'')}
                            onChange={e=>setBrandForm({...brandForm,socialAccounts:{...brandForm.socialAccounts,[p.id]:e.target.value},...(p.id==='instagram'?{handle:e.target.value}:{})})}
                          />
                        </label>)}
                      </div>
                    </div>
                    <div className="double">
                      <div><label>{t("Color secundario")}</label><input type="color" value={brandForm.secondaryColor||'#E7D8C9'} onChange={e=>setBrandForm({...brandForm,secondaryColor:e.target.value})}/></div>
                      <div><label>{t("Logo guardado en biblioteca")}</label><select value={brandForm.logoAssetId||''} onChange={e=>setBrandForm({...brandForm,logoAssetId:e.target.value})}><option value="">{t("Sin logo")}</option>{assets.filter(a=>a.brandId===brandForm.id&&(assetCategory(a)==='logo'||a.id===brandForm.logoAssetId)).map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select><label style={{display:'block',marginTop:12}}>{t("Subir logo")}<input type="file" accept="image/*,.heic,.heif" disabled={!!busy} onChange={e=>{void uploadBrandImage(e.target.files?.[0],'logoAssetId');e.target.value='';}}/></label>{brandForm.logoAssetId&&images[brandForm.logoAssetId]&&<img src={images[brandForm.logoAssetId]} alt="Logo de la marca" style={{maxWidth:140,maxHeight:100,objectFit:'contain',marginTop:10}}/>}</div>
                    </div>
                    <div className="double">
                      <div><label>{t("Fuente para títulos")}</label><select value={brandForm.headingFont||'Prompt'} onChange={e=>setBrandForm({...brandForm,headingFont:e.target.value})}>{['Prompt','Georgia','Sans','Futura'].map(f=><option key={f}>{f}</option>)}</select></div>
                      <div><label>{t("Fuente de texto")}</label><select value={brandForm.bodyFont||'Futura'} onChange={e=>setBrandForm({...brandForm,bodyFont:e.target.value})}>{['Futura','Arial','Georgia','Prompt'].map(f=><option key={f}>{f}</option>)}</select></div>
                    </div>
                    <label>{t("Estilo de fotografía")}</label><textarea rows={2} value={brandForm.photoMood||''} onChange={e=>setBrandForm({...brandForm,photoMood:e.target.value})} placeholder="Ej. Fotografías reales, sombras naturales, editorial de producto."/>
                    <label>{t("Nunca generar / modificar")}</label><textarea rows={3} value={brandForm.avoid||''} onChange={e=>setBrandForm({...brandForm,avoid:e.target.value})} placeholder="Ej. No inventar logos, etiquetas, capturas de la App, rostros o precios."/>
                    <label>{t("Referencia de estilo por defecto")}</label><select value={brandForm.referenceAssetId||''} onChange={e=>setBrandForm({...brandForm,referenceAssetId:e.target.value})}><option value="">{t("Sin referencia fija")}</option>{assets.filter(a=>a.brandId===brandForm.id).map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select>
                    <label style={{display:'block',marginTop:12}}>{t("Subir foto de referencia")}<input type="file" accept="image/*,.heic,.heif" disabled={!!busy} onChange={e=>{void uploadBrandImage(e.target.files?.[0],'referenceAssetId');e.target.value='';}}/></label>
                    {brandForm.referenceAssetId&&images[brandForm.referenceAssetId]&&<img src={images[brandForm.referenceAssetId]} alt="Referencia de estilo" style={{maxWidth:220,maxHeight:180,objectFit:'contain',marginTop:10}}/>}
                    <small>Sube tus archivos aquí o elige uno guardado en esta marca. Toca Guardar perfil para conservar la selección.</small>
                  </div>
                  <div className="formend">
                    <button
                      className="btn ghost"
                      onClick={() => setBrandForm(null)}
                    >
                      {t("Cancel")}
                    </button>
                    <button
                      className="btn dark"
                      onClick={saveBrand}
                      disabled={!!busy}
                    >
                      <Save size={16} /> {t("Save profile")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="brandgrid">
                  {brands.map(b => (
                    <article className="brandcard" key={b.id}>
                      <div className="brandbig" style={{ background: b.color }}>
                        {b.name[0]}
                      </div>
                      <h3>{b.name}</h3>
                      <p>{socialAccount(b,preferredPlatform(b))||'Perfil de marca · redes opcionales'} · {platformName(preferredPlatform(b))}</p>
                      <div className="brandcolors">
                        {brandPalette(b).slice(0,9).map((c,n)=><i key={n} style={{background:c}} />)}
                        <i style={{background:b.background}} />
                      </div>
                      <div className="brandfoot">
                        <span>
                          {b.language}
                          {b.id === current ? ' · ACTIVE' : ''}
                        </span>
                        <button onClick={() => setBrandForm({ ...b })}>
                          <Pencil size={16} /> {t("Edit")}
                        </button>
                      </div>
                    </article>
                  ))}
                  <button
                    className="addcard"
                    onClick={() => setBrandForm(newBrand())}
                  >
                    <Plus size={30} />
                    <strong>{t('Add another account')}</strong>
                    <small>A fresh voice, a separate space.</small>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*,.heic,.heif"
          hidden
          onChange={e => upload(e.target.files?.[0])}
        />

        {notice && (
          <div className="toast">
            <Check size={18} />
            {notice}
            <button onClick={() => setNotice('')}>
              <X size={15} />
            </button>
          </div>
        )}
        <nav aria-label="Content Lab · Información legal" style={{padding:'18px 20px',display:'flex',gap:18,flexWrap:'wrap',fontSize:12}}><a href="./terminos.html" target="_blank" rel="noopener noreferrer">Términos del Lab</a><a href="./privacidad.html" target="_blank" rel="noopener noreferrer">Privacidad</a><a href="./reembolsos.html" target="_blank" rel="noopener noreferrer">Reembolsos</a></nav>
      </main>
      {/* Keep the dock outside the scrolling main so Safari never re-anchors it
          when the page content or browser controls resize. */}
      {account && <nav className="lab-mobile-dock" aria-label="Navegación rápida de Content Lab">
                {([{id:'home',label:'Inicio',icon:LayoutDashboard},{id:'factory',label:'Carruseles',icon:Layers3},
                    {id:'vertical',label:'Reels',icon:Film},{id:'calendar',label:'Calendario',icon:CalendarDays},
                    {id:'backgrounds',label:'Fondos',icon:Palette},{id:'posts',label:'Mis posts',icon:FolderOpen}] as const)
                  .map(item=><button type="button" key={item.id} aria-label={t(item.label)} aria-current={tab===item.id?'page':undefined}
                    className={tab===item.id?'active':''} onClick={()=>item.id==='factory'?startFactory():item.id==='vertical'?startVertical():navigate(item.id)}>
                    <item.icon size={21}/><span>{t(item.label)}</span></button>)}
              </nav>}
    </div>
  );
}
export default App;

