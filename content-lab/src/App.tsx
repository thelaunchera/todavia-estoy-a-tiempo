import React, { useEffect, useState, useRef } from 'react';
import { api, auth, image } from './platform/client';
import heic2any from 'heic2any';
import BrandGrid, { CREATIVE_FORMATS } from './BrandGrid';
import {CreativeCover,exportCreativeCover} from './CreativeCover';
import './CreativeCover.css';
import CarouselFactory from './CarouselFactory';
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
type Asset = { id: string; brandId: string; name: string; mime: string };
type Tab = 'home' | 'create' | 'factory' | 'grid' | 'posts' | 'media' | 'formats' | 'brands';
const angles = [
  'Pain point',
  'Educational',
  'Before / after',
  'Product spotlight',
  'POV / Relatable',
  'Storytelling',
];
const formats = ['Carousel', 'Single post', 'Reel', 'Story'];
const templates = ['Editorial', 'Spotlight', 'Split', 'Bold', ...CREATIVE_FORMATS];
const nav: { id: Tab; title: string; icon: typeof Sparkles }[] = [
  { id: 'home', title: 'Overview', icon: LayoutDashboard },
  { id: 'create', title: 'Create content', icon: WandSparkles },
  { id: 'factory', title: 'Carousel Factory', icon: Layers3 },
  { id: 'grid', title: '1 Photo → 9 Posts', icon: Images },
  { id: 'posts', title: 'My content', icon: FolderOpen },
  { id: 'media', title: 'Media library', icon: Images },
  { id: 'formats', title: 'Creative formats', icon: Layers3 },
  { id: 'brands', title: 'Brand settings', icon: Settings2 },
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
      <ImagePlus size={30} /> Your image here
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
  const [loginEmail, setLoginEmail] = useState('');
  const [waiting, setWaiting] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [current, setCurrent] = useState('');
  const [tab, setTab] = useState<Tab>('home');
  const [menu, setMenu] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [editor, setEditor] = useState<Post>(newPost(''));
  const [brandForm, setBrandForm] = useState<Brand | null>(null);
  const [topic, setTopic] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
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
  const reload = async () => {
    const { data } = await api.get('/api/data');
    setBrands(data.brands || []);
    setPosts(data.posts || []);
    setAssets(data.assets || []);
    setCurrent(old =>
      data.brands.some((b: Brand) => b.id === old)
        ? old
        : data.brands[0]?.id || ''
    );
  };
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
  const brand = brands.find(b => b.id === current) || brands[0];
  const mine = posts.filter(p => p.brandId === brand?.id);
  const library = assets.filter(a => a.brandId === brand?.id);
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
    setBusy('brand');
    try {
      const { data } = brandForm.id
        ? await api.put('/api/brands/' + brandForm.id, brandForm)
        : await api.post('/api/brands', brandForm);
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
  const imageLoad = async (id: string) => {
    if (images[id]) return;
    try {
      const { data } = await api.get('/api/assets/' + id);
      setImages(old => ({
        ...old,
        [id]: 'data:' + data.mime + ';base64,' + data.content,
      }));
    } catch (e) {
      err(e);
    }
  };
  useEffect(() => {
    if (tab === 'media')
      library.forEach(a => {
        if (!images[a.id]) void imageLoad(a.id);
      });
    if (tab === 'create' && editor.assetId && !images[editor.assetId])
      void imageLoad(editor.assetId);
  }, [tab, current, assets, editor.assetId]);
  const upload = async (file?: File): Promise<Asset | null> => {
    if (!file) return null;
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
          maxDimension: 1500, maxPixels: 1800000, quality: 0.76, mimeType: 'image/jpeg'
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
        mime: prepared.mimeType,
        content: prepared.data,
      });
      const asset = data as Asset;
      setAssets(prev => [asset, ...prev]);
      setImages(prev => ({ ...prev, [asset.id]: 'data:' + prepared.mimeType + ';base64,' + prepared.data }));
      if (tab === 'create') change('assetId', asset.id);
      toast('Foto optimizada y guardada en ' + brand.name + ' ✓');
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
        <p>Opening your Content Lab…</p>
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
            <div className="eyebrow">YOUR PRIVATE CREATIVE SPACE</div>
            <h1>
              Less scrolling.
              <br />
              <em>More creating.</em>
            </h1>
            <p>A thoughtful home for your ideas, brands and content.</p>
          </div>
          <div className="login-tags">
            <span>CREATE</span>
            <span>CURATE</span>
            <span>PUBLISH</span>
          </div>
        </section>
        <section className="login-right">
          <div className="login-card">
            <div className="lockcircle">
              <LockKeyhole size={23} />
            </div>
            <div className="eyebrow">A SPACE JUST FOR YOU</div>
            <h2>
              Welcome to your
              <br />
              Content Lab.
            </h2>
            <p>
              Inicia sesión en tu espacio privado. Tus marcas y publicaciones
              estarán separadas del Studio.
            </p>
            <label htmlFor="lab-email">Correo privado</label>
            <input id="lab-email" type="email" placeholder="Tu correo autorizado" autoComplete="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <button
              className="btn dark wide"
              onClick={() => auth.signInWithOtp(loginEmail).then(() => toast('Enlace privado enviado. Comprueba tu correo.')).catch(err)}
            >
              Enviar enlace de acceso <ArrowRight size={18} />
            </button>
            <small>
              <ShieldCheck size={16} /> Protected personal access
            </small>
          </div>
        </section>
      </div>
    );
  return (
    <div className="app-shell">
      {menu && <div className="overlay" onClick={() => setMenu(false)} />}
      <aside className={'sidebar ' + (menu ? 'open' : '')}>
        <div className="identity">
          <div className="monogram">c.</div>
          <div>
            <div className="logo">
              content lab<span>.</span>
            </div>
            <small>YOUR CREATIVE HQ</small>
          </div>
        </div>
        <div className="side-label">YOUR ACCOUNTS</div>
        <div className="switchwrap">
          <button className="switch" onClick={() => setSwitcher(v => !v)}>
            <span className="brand-avatar" style={{ background: brand?.color }}>
              {brand?.name[0] || '+'}
            </span>
            <span>
              <strong>{brand?.name || 'Select a brand'}</strong>
              <small>{brand?.handle || 'Personal workspace'}</small>
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
                <Plus size={15} /> Add another account
              </button>
            </div>
          )}
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {nav.map(n => (
            <button
              key={n.id}
              className={tab === n.id ? 'active' : ''}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} strokeWidth={1.8} />
              {n.title}
              {n.id === 'posts' && <b>{mine.length}</b>}
            </button>
          ))}
        </nav>
        <div className="side-footer">
          <div className="side-inspo">
            <Sparkles size={21} />
            <strong>Good content starts with intention.</strong>
            <p>Less noise, more meaning.</p>
          </div>
          <button
            className="signout"
            onClick={() => auth.signOut().then(() => setAccount(null))}
          >
            <span className="person">D</span>
            <span>
              <strong>My private workspace</strong>
              <small>{account.email}</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <main>
        <header className="top">
          <div>
            <button className="hamburger" onClick={() => setMenu(true)}>
              <Menu size={22} />
            </button>
            <span className="eyebrow">MY WORKSPACE</span>
            <span className="slash">/</span>
            <strong>{nav.find(n => n.id === tab)?.title}</strong>
          </div>
          <div>
            <span className="private">
              <LockKeyhole size={13} /> PRIVATE
            </span>
            <button className="btn dark compact" onClick={() => start()}>
              <Plus size={16} /> Create content
            </button>
          </div>
        </header>
        <div className="content">
          {brand && tab === 'home' && (
            <>
              <section className="intro">
                <div>
                  <div className="eyebrow">
                    <i className="greendot" /> YOUR CREATIVE DESK
                  </div>
                  <h1>
                    Make room for
                    <br />
                    <em>better content.</em>
                  </h1>
                  <p>
                    One home for your ideas. A different voice for every brand.
                  </p>
                </div>
                <div className="hero-art">
                  <span>the</span>
                  <strong>
                    creative
                    <br />
                    process.
                  </strong>
                  <small>MADE SIMPLE ↗</small>
                </div>
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
                    <span>{s.label}</span>
                    <strong>{String(s.n).padStart(2, '0')}</strong>
                    <small>{s.detail}</small>
                  </div>
                ))}
              </section>
              <div className="homegrid">
                <section className="homeideas">
                  <div className="cardheading">
                    <div>
                      <div className="eyebrow">THE CONTENT ENGINE</div>
                      <h2>What are we creating today?</h2>
                    </div>
                    <Sparkles size={25} />
                  </div>
                  <p>
                    Start with one problem, one photo or one idea worth sharing.
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
                        <strong>{a.name}</strong>
                        <small>{a.sub}</small>
                        <ArrowUpRight size={17} />
                      </button>
                    ))}
                  </div>
                </section>
                <section className="homebrand">
                  <div className="eyebrow">ACTIVE BRAND</div>
                  <h2>{brand.name}</h2>
                  <p>{brand.audience || 'Define your audience in settings.'}</p>
                  <div className="dots">
                    <i style={{ background: brand.color }} />
                    <i style={{ background: brand.background }} />
                    <i style={{ background: '#191919' }} />
                  </div>
                  <div className="brand-detail">
                    LANGUAGE <strong>{brand.language}</strong>
                  </div>
                  <div className="brand-detail">
                    SAVED POSTS <strong>{mine.length}</strong>
                  </div>
                  <button
                    className="textlink"
                    onClick={() => {
                      setBrandForm(brand);
                      navigate('brands');
                    }}
                  >
                    Edit brand profile <ArrowRight size={16} />
                  </button>
                </section>
              </div>
              <div className="sectionheading">
                <div>
                  <div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div>
                  <h2>Recent creations</h2>
                </div>
                <button className="textlink" onClick={() => navigate('posts')}>
                  View all <ArrowRight size={16} />
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
                  <h3>Your best ideas begin here.</h3>
                  <p>No content saved yet. Create your first piece.</p>
                  <button className="btn dark" onClick={() => start()}>
                    Create my first post <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {brand && tab === 'grid' && (
            <BrandGrid
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
                    Content <em>composer.</em>
                  </h1>
                  <p>Give it a purpose. Give it your voice. Make it yours.</p>
                  <button className="btn dark" onClick={() => navigate('factory')}><Layers3 size={16} /> Design full carousel <ArrowRight size={16} /></button>
                </div>
                <button className="btn ghost" onClick={() => start()}>
                  <RotateCcw size={16} /> Start fresh
                </button>
              </div>
              <div className="composer">
                <div className="forms">
                  <section className="panel">
                    <div className="panelhead">
                      <span>01</span>
                      <h3>Set the direction</h3>
                    </div>
                    <label>What should we talk about?</label>
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
                        <label>Format</label>
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
                        <label>Content angle</label>
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
                      <h3>Refine the words</h3>
                    </div>
                    <label>Internal title *</label>
                    <input
                      value={editor.title}
                      onChange={e => change('title', e.target.value)}
                      placeholder="Name this idea"
                    />
                    <label>Cover hook</label>
                    <textarea
                      rows={2}
                      value={editor.hook}
                      onChange={e => change('hook', e.target.value)}
                      placeholder="A clear, specific opening…"
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
                    <label>Slides / Script</label>
                    <textarea
                      rows={5}
                      value={editor.slides}
                      onChange={e => change('slides', e.target.value)}
                      placeholder="One slide or talking point per line…"
                    />
                    <label>Caption</label>
                    <textarea
                      rows={5}
                      value={editor.caption}
                      onChange={e => change('caption', e.target.value)}
                      placeholder="Write like a human, not a template…"
                    />
                    <label>CTA</label>
                    <input
                      value={editor.cta}
                      onChange={e => change('cta', e.target.value)}
                      placeholder="What should they do next?"
                    />
                    <label>Visual direction</label>
                    <textarea
                      rows={2}
                      value={editor.visual}
                      onChange={e => change('visual', e.target.value)}
                      placeholder="Which photo or screenshot makes the story clearer?"
                    />
                    <button className="btn ghost" onClick={copy}>
                      <Copy size={16} /> Copy content
                    </button>
                  </section>
                  <section className="panel">
                    <div className="panelhead">
                      <span>03</span>
                      <h3>Save & organize</h3>
                    </div>
                    <div className="double">
                      <div>
                        <label>Status</label>
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
                        <label>Planned date</label>
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
                <aside className="visual">
                  <div className="eyebrow">COVER PREVIEW</div>
                  <h3>Your graphic direction</h3>
                  <small>Instagram · 1080 × 1350 PNG</small>
                  <CreativeCover
                    post={editor}
                    brand={brand}
                    photo={images[editor.assetId]}
                  />
                  <div className="eyebrow design-label">CHOOSE A FORMAT</div>
                  <div className="template-grid">
                    {templates.map(t => (
                      <button
                        key={t}
                        className={editor.template === t ? 'chosen' : ''}
                        onClick={() => change('template', t)}
                      >
                        <span className={'template-icon ' + t.toLowerCase()} />
                        {t}
                      </button>
                    ))}
                  </div>
                  <label>Choose an original image</label>
                  <select
                    value={editor.assetId}
                    onChange={e => change('assetId', e.target.value)}
                  >
                    <option value="">No image selected</option>
                    {library.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn ghost wide"
                    onClick={() => uploadRef.current?.click()}
                  >
                    <ImagePlus size={16} /> Upload photo / screenshot
                  </button>
                  <button
                    className="btn blue wide"
                    onClick={() =>
                      exportCreativeCover(editor, brand, images[editor.assetId])
                        .then(() => toast('PNG exportado.'))
                        .catch(err)
                    }
                  >
                    <Download size={17} /> Export cover PNG
                  </button>
                  <small className="note">
                    24 quick cover styles available. Export one independent PNG. For a 9-post brand feed, open 1 Photo → 9 Posts.
                  </small>
                </aside>
              </div>
            </>
          )}
          {brand && tab === 'posts' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">YOUR CONTENT COLLECTION</div>
                  <h1>
                    Everything you've <em>made.</em>
                  </h1>
                  <p>Only publications belonging to {brand.name}.</p>
                </div>
                <button className="btn dark" onClick={() => start()}>
                  <Plus size={16} /> New content
                </button>
              </div>
              <div className="search">
                <Search size={18} />
                <input
                  placeholder="Search posts…"
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
                  <h3>Nothing here yet.</h3>
                  <p>Start with one meaningful idea.</p>
                  <button className="btn dark" onClick={() => start()}>
                    Create content
                  </button>
                </div>
              )}
            </>
          )}
          {brand && tab === 'media' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">YOUR PRIVATE MEDIA BANK</div>
                  <h1>
                    The good <em>stuff.</em>
                  </h1>
                  <p>Real photos and screenshots, sorted by account.</p>
                </div>
                <button
                  className="btn dark"
                  onClick={() => uploadRef.current?.click()}
                >
                  <Upload size={16} />
                  {busy === 'upload' ? 'Uploading…' : 'Upload images'}
                </button>
              </div>
              <div className="mediahelp">
                <ImagePlus size={27} />
                <div>
                  <strong>One photo can tell so many stories.</strong>
                  <p>
                    Original visuals stay intact. Upload once and reuse them in
                    different covers.
                  </p>
                </div>
              </div>
              {library.length ? (
                <div className="mediagrid">
                  {library.map(a => (
                    <article className="mediacard" key={a.id}>
                      <div className="mediaphoto">
                        {images[a.id] ? (
                          <img src={images[a.id]} alt={a.name} />
                        ) : (
                          <LoaderCircle className="spin" />
                        )}
                      </div>
                      <div className="medialabel">
                        <span title={a.name}>{a.name}</span>
                        <button
                          aria-label="Delete image"
                          onClick={async () => {
                            if (!window.confirm('¿Eliminar esta imagen?'))
                              return;
                            try {
                              await api.delete('/api/assets/' + a.id);
                              setAssets(p => p.filter(x => x.id !== a.id));
                              toast('Imagen eliminada.');
                            } catch (e) {
                              err(e);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <Images size={32} />
                  <h3>Your media bank begins here.</h3>
                  <p>Add your first real photo or product screenshot.</p>
                  <button
                    className="btn dark"
                    onClick={() => uploadRef.current?.click()}
                  >
                    Upload a photo
                  </button>
                </div>
              )}
            </>
          )}
          {brand && tab === 'formats' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">THE CREATIVE PLAYBOOK</div>
                  <h1>
                    20 creative <em>formats.</em>
                  </h1>
                  <p>Una foto puede convertirse en veinte estilos visuales diferentes, y nueve posts independientes en tu Brand Grid.</p>
                  <button className="btn dark" onClick={() => navigate('grid')}><Images size={16}/> Crear grid de 9 posts <ArrowRight size={17}/></button>
                </div>
              </div>
              <div className="format-banner">
                <span>THE CONTENT LAB METHOD</span>
                <h2>
                  One real screenshot.
                  <br />A whole week of ideas.
                </h2>
                <p>Different stories, different goals, one consistent brand.</p>
              </div>
              <div className="eyebrow">20 FORMATS FOR BRAND GRID</div>
              <div className="format-catalog">
                {CREATIVE_FORMATS.map((f,i)=>(
                  <button key={f} onClick={()=>navigate('grid')}>
                    <span className="format-swatch"/>
                    <small>{String(i+1).padStart(2,'0')} / 20</small>
                    <strong>{f}</strong>
                    <small>Use in Brand Grid</small>
                  </button>
                ))}
              </div>
              <div className="eyebrow">STORYTELLING ANGLES</div>
              <div className="formats">
                {angles.map((a, i) => (
                  <button key={a} onClick={() => start(a)}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{a}</h3>
                      <p>
                        {
                          [
                            'Name a problem your audience knows too well.',
                            'Teach one thing they can use immediately.',
                            'Show the difference without made-up results.',
                            'Explain the value of one real product feature.',
                            'Share an everyday, human moment.',
                            'Build a short story with a genuine payoff.',
                          ][i]
                        }
                      </p>
                    </div>
                    <ArrowUpRight size={19} />
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === 'brands' && (
            <>
              <div className="pageheading">
                <div>
                  <div className="eyebrow">SEPARATE BRANDS. CLEAR VOICES.</div>
                  <h1>
                    Your brands,
                    <br />
                    <em>your rules.</em>
                  </h1>
                  <p>
                    Every account gets its own language, audience and visuals.
                  </p>
                </div>
                <button
                  className="btn dark"
                  onClick={() => setBrandForm(newBrand())}
                >
                  <Plus size={16} /> Add a brand
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
                      <label>Name *</label>
                      <input
                        value={brandForm.name}
                        onChange={e =>
                          setBrandForm({ ...brandForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label>Handle</label>
                      <input
                        placeholder="@account"
                        value={brandForm.handle}
                        onChange={e =>
                          setBrandForm({ ...brandForm, handle: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <label>Ideal audience</label>
                  <textarea
                    rows={2}
                    value={brandForm.audience}
                    onChange={e =>
                      setBrandForm({ ...brandForm, audience: e.target.value })
                    }
                  />
                  <label>Voice & personality</label>
                  <textarea
                    rows={2}
                    value={brandForm.voice}
                    onChange={e =>
                      setBrandForm({ ...brandForm, voice: e.target.value })
                    }
                  />
                  <label>Instructions for content AI</label>
                  <textarea
                    rows={4}
                    value={brandForm.rules}
                    onChange={e =>
                      setBrandForm({ ...brandForm, rules: e.target.value })
                    }
                  />
                  <div className="double">
                    <div>
                      <label>Public content language</label>
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
                      <label>Brand colors</label>
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
                  <div className="formend">
                    <button
                      className="btn ghost"
                      onClick={() => setBrandForm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn dark"
                      onClick={saveBrand}
                      disabled={busy === 'brand'}
                    >
                      <Save size={16} /> Save profile
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
                      <p>{b.handle || 'Personal account'}</p>
                      <div className="brandcolors">
                        <i style={{ background: b.color }} />
                        <i style={{ background: b.background }} />
                        <i style={{ background: '#191919' }} />
                      </div>
                      <div className="brandfoot">
                        <span>
                          {b.language}
                          {b.id === current ? ' · ACTIVE' : ''}
                        </span>
                        <button onClick={() => setBrandForm({ ...b })}>
                          <Pencil size={16} /> Edit
                        </button>
                      </div>
                    </article>
                  ))}
                  <button
                    className="addcard"
                    onClick={() => setBrandForm(newBrand())}
                  >
                    <Plus size={30} />
                    <strong>Add another account</strong>
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
      </main>
    </div>
  );
}
export default App;
