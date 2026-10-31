import React, { useEffect, useState, useRef } from 'react';
import { api, auth, image } from './platform/client';
import heic2any from 'heic2any';
import BrandGrid, { CREATIVE_FORMATS } from './BrandGrid';
import PromptStudio from './PromptStudio';
import './PromptStudio.css';
import type {PromptControls} from './PromptEngine';
import FreePostStudio from './FreePostStudio';
import {installLabLocale,uiText} from './LabLocale';
import './CreativeCover.css';
import CarouselFactory from './CarouselFactory';
import FreeDecorControls from './FreeDecorControls';
import {readCoverDecor,writeCoverDecor,type CoverDecor} from './CoverDecor';
import MediaLibrary from './MediaLibrary';
import StickerDownloads from './StickerDownloads';
import BackgroundLibrary from './BackgroundLibrary';
import type {FreeBackgroundId} from './FreeDesignAssets';
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
  updatedAt?: string;
  designData?: string;
};
type Asset = LibraryAsset;
type Tab = 'home' | 'create' | 'factory' | 'grid' | 'prompt-studio' | 'prompts' | 'posts' | 'media' | 'formats' | 'brands' | 'stickers' | 'backgrounds';
const angles = [
  'Pain point',
  'Educational',
  'Before / after',
  'Product spotlight',
  'POV / Relatable',
  'Storytelling',
];
const formats = ['Carousel', 'Single post', 'Reel', 'Story'];
const nav: { id: Tab; title: string; icon: typeof Sparkles }[] = [
  { id: 'home', title: 'Overview', icon: LayoutDashboard },
  { id: 'create', title: 'Create content', icon: WandSparkles },
  { id: 'factory', title: 'Carousel Factory', icon: Layers3 },
  { id: 'grid', title: '1 Photo → 9 Posts', icon: Images },
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
  {title:'CREAR',items:['home','factory','grid','create']},
  {title:'TUS RECURSOS',items:['media','backgrounds','stickers','formats']},
  {title:'INSPIRACIÓN',items:['prompt-studio','prompts']},
  {title:'GUARDAR Y ORGANIZAR',items:['posts','brands']},
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
  const [brandForm, setBrandForm] = useState<Brand | null>(null);
  const [topic, setTopic] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [gridPref,setGridPref]=useState<{version:number;brandId?:string;sourceId?:string;referenceId?:string;format?:string}>({version:0});
  const [backgroundPref,setBackgroundPref]=useState<{version:number;brandId?:string;id?:FreeBackgroundId;imageAssetId?:string}>({version:0});
  const [stickerPref,setStickerPref]=useState<{version:number;brandId?:string;id?:string}>({version:0});
  const uploadRef = useRef<HTMLInputElement>(null);
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
    setEditor(newPost(brand.id));
    navigate('factory');
  };
  const navigate = (id: Tab) => {
    setTab(id);
    setMenu(false);
    setSwitcher(false);
  };
  const start = (angle = 'Pain point') => {
    if (!brand) return;
    setEditor({ ...newPost(brand.id), angle });
    setTopic('');
    setAlternatives([]);
    navigate('create');
  };
  const edit = (post: Post) => {
    setCurrent(post.brandId);
    setEditor({ ...post });
    setTopic('');
    setAlternatives([]);
    navigate('create');
  };
  const save = async () => {
    if (!editor.title.trim()) return toast('Escribe un título para guardarlo.');
    setBusy('save');
    try {
      const { data } = editor.id
        ? await api.put('/api/posts/' + editor.id, editor)
        : await api.post('/api/posts', editor);
      setPosts(prev =>
        editor.id
          ? prev.map(x => (x.id === editor.id ? data : x))
          : [data, ...prev]
      );
      setEditor(data);
      toast('Guardado en tu biblioteca ✓');
    } catch (e) {
      err(e);
    } finally {
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
      toast('Ya tienes una propuesta para revisar ✨');
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
      const optimized=await image.resizeIfNeeded(original,{
        maxDimension:1500,maxPixels:1800000,quality:0.80,mimeType:mime
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
  const upload = async (file?: File, category:MediaCategory='original', autoSelect=true): Promise<Asset | null> => {
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
          const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.82 });
          input = Array.isArray(converted) ? converted[0] : converted;
        } catch {
          // Safari can decode some HEIC photos natively, so try native optimization next.
          input = file;
        }
      }
      let prepared;
      try {
        prepared = await image.resizeIfNeeded(input, {
          maxDimension: 1500, maxPixels: 1800000, quality: 0.76, mimeType: (category==='sticker'||category==='background')&&file.type==='image/png'?'image/png':'image/jpeg'
        });
      } catch {
        throw new Error('No se pudo convertir esta foto. Prueba la opción de foto compatible de tu iPhone.');
      }
      if (!prepared.data || prepared.data.length > 3850000) {
        throw new Error('No se pudo reducir suficientemente la foto. Intenta con otra.');
      }
      const { data } = await api.post('/api/assets', {
        brandId: brand.id,
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
            <small><ShieldCheck size={16}/>{loginLanguage==='es'?'Acceso personal protegido · $10 pago único próximamente':'Private access · $10 one-time purchase coming soon'}</small>
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
                onClick={()=>navigate(item.id)}>
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
              <span className="lab-page-short">{tab==='posts'?(loginLanguage==='es'?'Mis posts':'Posts'):t(nav.find(n => n.id === tab)?.title||'')}</span>
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
            <button type="button" className="btn dark compact lab-primary-create" onClick={() => start()}
              aria-label={t('Create content')}>
              <Plus size={18} /><span className="lab-create-label-long">{t("Create content")}</span>
              <span className="lab-create-label-short">{loginLanguage==='es'?'Crear':'Create'}</span>
            </button>
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
                      {loginLanguage==='es'?'Abrir carruseles':'Open carousels'}
                      <ArrowRight size={16} aria-hidden="true"/>
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
                    <strong>{String(s.n).padStart(2, '0')}</strong>
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
            <PromptStudio brand={brand} notify={toast} showError={err}
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
                  <button className="btn dark" onClick={() => navigate('factory')}><Layers3 size={16} /> {t("Design full carousel")} <ArrowRight size={16} /></button>
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
                      <h3>{t('Set the direction')}</h3>
                    </div>
                    <label>{t('What should we talk about?')}</label>
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
                          {formats.map(x => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>{t('Content angle')}</label>
                        <select
                          value={editor.angle}
                          onChange={e => change('angle', e.target.value)}
                        >
                          {angles.map(x => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="aiinfo">
                      <Sparkles size={17} /> Follows {brand.name}'s voice ·{' '}
                      {brand.language}
                    </div>
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
                        ? 'Creating your content…'
                        : 'Generate with AI'}{' '}
                      <ArrowRight size={17} />
                    </button>
                    <small className="note">
                      AI may consume AppDeploy credits. Check all details before
                      publishing.
                    </small>
                  </section>
                  <section className="panel">
                    <div className="panelhead">
                      <span>02</span>
                      <h3>{t('Refine the words')}</h3>
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
                  <section className="panel">
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
                    </div>
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
                    <div className="eyebrow">{t('COVER PREVIEW')}</div>
                    <h3>{t('Your graphic direction')}</h3>
                    <small>{t("Instagram · 1080 × 1350 PNG")}</small>
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
          {brand && tab === 'stickers' && <StickerDownloads brandId={brand.id} assets={library} images={images} isAdmin={Boolean(aiWallet?.admin)} onPublish={publishSharedSticker} onUpload={async file=>upload(file,'sticker')} loadImage={imageLoad} onUse={(id,destination)=>{
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
                      <div><label>{t("Logo guardado en biblioteca")}</label><select value={brandForm.logoAssetId||''} onChange={e=>setBrandForm({...brandForm,logoAssetId:e.target.value})}><option value="">{t("Sin logo")}</option>{assets.filter(a=>a.brandId===brandForm.id).map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select></div>
                    </div>
                    <div className="double">
                      <div><label>{t("Fuente para títulos")}</label><select value={brandForm.headingFont||'Prompt'} onChange={e=>setBrandForm({...brandForm,headingFont:e.target.value})}>{['Prompt','Georgia','Sans','Futura'].map(f=><option key={f}>{f}</option>)}</select></div>
                      <div><label>{t("Fuente de texto")}</label><select value={brandForm.bodyFont||'Futura'} onChange={e=>setBrandForm({...brandForm,bodyFont:e.target.value})}>{['Futura','Arial','Georgia','Prompt'].map(f=><option key={f}>{f}</option>)}</select></div>
                    </div>
                    <label>{t("Estilo de fotografía")}</label><textarea rows={2} value={brandForm.photoMood||''} onChange={e=>setBrandForm({...brandForm,photoMood:e.target.value})} placeholder="Ej. Fotografías reales, sombras naturales, editorial de producto."/>
                    <label>{t("Nunca generar / modificar")}</label><textarea rows={3} value={brandForm.avoid||''} onChange={e=>setBrandForm({...brandForm,avoid:e.target.value})} placeholder="Ej. No inventar logos, etiquetas, capturas de la App, rostros o precios."/>
                    <label>{t("Referencia de estilo por defecto")}</label><select value={brandForm.referenceAssetId||''} onChange={e=>setBrandForm({...brandForm,referenceAssetId:e.target.value})}><option value="">{t("Sin referencia fija")}</option>{assets.filter(a=>a.brandId===brandForm.id).map(a=><option key={a.id} value={a.id}>{displayAssetName(a)}</option>)}</select>
                    <small>Sube primero el logo y tus referencias en Media library con esta cuenta activa. Solo se mostrarán archivos de la misma marca.</small>
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
                      disabled={busy === 'brand'}
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
        {account && <nav className="lab-mobile-dock" aria-label="Navegación rápida de Content Lab">
          {([{id:'home',label:'Inicio',icon:LayoutDashboard},{id:'grid',label:'Diseñar',icon:WandSparkles},
              {id:'stickers',label:'Stickers',icon:ImagePlus},{id:'backgrounds',label:'Fondos',icon:Palette},
              {id:'posts',label:'Mis posts',icon:FolderOpen}] as const)
            .map(item=><button type="button" key={item.id} aria-label={t(item.label)} aria-current={tab===item.id?'page':undefined}
              className={tab===item.id?'active':''} onClick={()=>navigate(item.id)}>
              <item.icon size={21}/><span>{t(item.label)}</span></button>)}
        </nav>}
        {notice && (
          <div className="toast">
            <Check size={18} />
            {notice}
            <button onClick={() => setNotice('')}>
              <X size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
