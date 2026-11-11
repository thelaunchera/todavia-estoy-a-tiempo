import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Image as ImageIcon, Layers3, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import InstallContentLab from './InstallContentLab';
import './AuthExperience.css';

type Language = 'es' | 'en';
type Props = {
  language: Language;
  email: string;
  pendingEmail: string;
  code: string;
  stage: 'email' | 'code';
  busy: boolean;
  configured: boolean;
  expiredEmail: string;
  resendReadyAt: number;
  error: string;
  onLanguage: (language: Language) => void;
  onEmail: (value: string) => void;
  onCode: (value: string) => void;
  onRequestCode: () => void;
  onVerifyCode: () => void;
  onBack: () => void;
  onChangeAccount: () => void;
};

const PURCHASE_URL = 'https://buy.stripe.com/14AdR8dHp6Dnd8B1IM93y0Z';

export default function AuthExperience({
  language, email, pendingEmail, code, stage, busy, configured,
  expiredEmail, resendReadyAt, error, onLanguage, onEmail, onCode,
  onRequestCode, onVerifyCode, onBack, onChangeAccount,
}: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const expired = Boolean(expiredEmail);
  const es = language === 'es';

  useEffect(() => {
    if (stage !== 'code') return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((resendReadyAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [stage, resendReadyAt]);

  return (
    <div className={`lab-auth-screen${expired ? ' lab-auth-expired' : ''}`} lang={es ? 'es' : 'en'}>
      {expired ? (
        <div className="lab-auth-dashboard-ghost" aria-hidden="true">
          <aside className="lab-auth-ghost-sidebar"><b>the content lab.</b><span>Overview</span><span>My posts</span><span>Carousel</span><span>Calendar</span></aside>
          <div className="lab-auth-ghost-main">
            <div className="lab-auth-ghost-top">Your creative workspace <span>Today</span></div>
            <div className="lab-auth-ghost-heading">Everything you're creating, in one place.</div>
            <div className="lab-auth-ghost-grid"><i /><i /><i /></div>
            <div className="lab-auth-ghost-panels"><i /><i /></div>
          </div>
        </div>
      ) : (
        <>
          <header className="lab-auth-brand">
            <span className="lab-auth-wordmark">the content lab<span>.</span></span>
            <p>{es ? 'UN ESPACIO PARA CREAR A TU MANERA' : 'A SPACE TO CREATE YOUR WAY'}</p>
          </header>
          <div className="lab-auth-floating lab-auth-float-one" aria-hidden="true"><Layers3 size={23} /><span>{es ? 'Carruseles' : 'Carousels'}</span></div>
          <div className="lab-auth-floating lab-auth-float-two" aria-hidden="true"><ImageIcon size={23} /><span>{es ? 'Mis fotos' : 'My photos'}</span></div>
          <div className="lab-auth-floating lab-auth-float-three" aria-hidden="true"><CalendarDays size={23} /><span>{es ? 'Calendario' : 'Calendar'}</span></div>
        </>
      )}
      <main className={`lab-auth-card${expired ? ' lab-auth-dialog' : ''}`} role={expired ? 'dialog' : undefined} aria-modal={expired ? true : undefined} aria-labelledby="lab-auth-heading">
        <div className="lab-auth-topline">
          <div className="lab-auth-lock"><LockKeyhole size={23} strokeWidth={1.8}/></div>
          <div className="lab-auth-languages" role="group" aria-label="Idioma / Language">
            <button type="button" className={es ? 'selected' : ''} onClick={() => onLanguage('es')} aria-pressed={es}>ES</button>
            <button type="button" className={!es ? 'selected' : ''} onClick={() => onLanguage('en')} aria-pressed={!es}>EN</button>
          </div>
        </div>

        {stage === 'code' ? (
          <section className="lab-auth-mail-stage" aria-live="polite">
            <div className="lab-auth-envelope-visual" aria-hidden="true">
              <div className="lab-auth-ring lab-auth-ring-one" /><div className="lab-auth-ring lab-auth-ring-two" />
              <div className="lab-auth-envelope"><Mail size={39} strokeWidth={1.5}/></div>
            </div>
            <p className="lab-auth-kicker">{expired ? (es ? 'REACTIVA TU SESIÓN' : 'RESTORE YOUR SESSION') : (es ? 'UN PASO MÁS' : 'ONE MORE STEP')}</p>
            <h1 id="lab-auth-heading">{es ? 'Revisa tu correo.' : 'Check your email.'}</h1>
            <p className="lab-auth-description">{es ? 'Te enviamos un enlace y un código de acceso a' : 'We sent a sign-in link and code to'} <strong className="lab-auth-email-display">{pendingEmail}</strong></p>
            <form onSubmit={event => { event.preventDefault(); onVerifyCode(); }} className="lab-auth-form">
              <label htmlFor="lab-code">{es ? 'Código de verificación' : 'Verification code'}</label>
              <input id="lab-code" type={expired ? 'password' : 'text'} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={code} onChange={event => onCode(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="••••••" className="lab-auth-code-input" />
              {error && <p className="lab-auth-error" role="alert">{error}</p>}
              <button className="lab-auth-submit" type="submit" disabled={busy || code.length < 6}>{busy ? <LoaderCircle size={19} className="lab-auth-spin" /> : <ShieldCheck size={19} />}{expired ? (es ? 'Continuar' : 'Continue') : (es ? 'Entrar a mi Content Lab' : 'Open my Content Lab')}</button>
            </form>
            <div className="lab-auth-resend">
              <span>{es ? '¿No recibiste el correo?' : "Didn't receive the email?"}</span>
              <button type="button" disabled={busy || secondsLeft > 0} onClick={onRequestCode}>{secondsLeft > 0 ? `${es ? 'Reenviar en' : 'Resend in'} ${secondsLeft}s` : (es ? 'Reenviar código' : 'Resend code')}</button>
            </div>
            <button type="button" className="lab-auth-text-button" onClick={onBack} disabled={busy}>{es ? 'Cambiar correo' : 'Change email'}</button>
          </section>
        ) : expired ? (
          <section className="lab-auth-recovery">
            <p className="lab-auth-kicker">{es ? 'TU ESPACIO SIGUE AQUÍ' : 'YOUR WORKSPACE IS HERE'}</p>
            <h1 id="lab-auth-heading">{es ? 'Tu sesión venció.' : 'Your session expired.'}</h1>
            <p className="lab-auth-description">{es ? 'Tus proyectos están guardados. Verifica tu cuenta para volver a tu espacio.' : 'Your projects are saved. Verify your account to return to your workspace.'}</p>
            <form onSubmit={event => { event.preventDefault(); onRequestCode(); }} className="lab-auth-form">
              <label htmlFor="lab-email">{es ? 'Mi cuenta' : 'My account'}</label>
              <input id="lab-email" type="email" autoComplete="email" value={email} readOnly required className="lab-auth-account-input" />
              {error && <p className="lab-auth-error" role="alert">{error}</p>}
              <button className="lab-auth-submit" type="submit" disabled={busy || !configured}>{busy ? <LoaderCircle size={19} className="lab-auth-spin" /> : <ArrowRight size={19} />}{es ? 'Enviar código para continuar' : 'Send code to continue'}</button>
            </form>
            <button type="button" className="lab-auth-text-button" onClick={onChangeAccount}>{es ? 'Usar otra cuenta' : 'Use another account'}</button>
          </section>
        ) : (
          <section className="lab-auth-entry" key={mode}>
            <div className="lab-auth-tabs" role="group" aria-label={es ? 'Modo de acceso' : 'Sign-in mode'}>
              <button type="button" className={mode === 'signin' ? 'selected' : ''} aria-pressed={mode === 'signin'} onClick={() => setMode('signin')}>{es ? 'Entrar' : 'Sign in'}</button>
              <button type="button" className={mode === 'signup' ? 'selected' : ''} aria-pressed={mode === 'signup'} onClick={() => setMode('signup')}>{es ? 'Crear cuenta' : 'Sign up'}</button>
            </div>
            <p className="lab-auth-kicker">{es ? 'TU ESTUDIO CREATIVO PRIVADO' : 'YOUR PRIVATE CREATIVE STUDIO'}</p>
            <h1 id="lab-auth-heading">{mode === 'signin' ? (es ? 'Qué bueno verte.' : 'Welcome back.') : (es ? 'Empieza a crear.' : 'Make room to create.')}</h1>
            <p className="lab-auth-description">{mode === 'signin' ? (es ? 'Tus ideas, tus marcas y tus proyectos en un solo lugar.' : 'Your ideas, brands, and projects in one place.') : (es ? 'Activa tu espacio con el correo que usaste en tu compra.' : 'Activate your space with the email used for your purchase.')}</p>
            <form className="lab-auth-form" onSubmit={event => { event.preventDefault(); onRequestCode(); }}>
              <label htmlFor="lab-email">{es ? 'Correo electrónico' : 'Email address'}</label>
              <input id="lab-email" type="email" required autoComplete="email" placeholder={es ? 'tucorreo@ejemplo.com' : 'you@example.com'} value={email} onChange={event => onEmail(event.target.value)} />
              {error && <p className="lab-auth-error" role="alert">{error}</p>}
              {!configured && <p className="lab-auth-error" role="status">{es ? 'El acceso no está disponible en este momento.' : 'Sign-in is temporarily unavailable.'}</p>}
              <button className="lab-auth-submit" type="submit" disabled={busy || !configured}>{busy ? <LoaderCircle size={19} className="lab-auth-spin" /> : <ArrowRight size={19} />}{es ? 'Continuar con mi correo' : 'Continue with email'}</button>
            </form>
            <p className="lab-auth-security"><ShieldCheck size={15}/>{es ? 'Acceso seguro por correo · Sin contraseña' : 'Secure email sign-in · No password needed'}</p>
          </section>
        )}
        {!expired && <>
          <div className="lab-auth-rule" />
          <div className="lab-auth-extras">
            <InstallContentLab locale={language} compact />
            <a href="./prompts/">{es ? 'Probar los 8 Master Prompts gratuitos' : 'Try the 8 free Master Prompts'}</a>
            <span>{es ? '¿Aún no tienes acceso?' : 'Not a member yet?'} <a href={PURCHASE_URL} target="_blank" rel="noopener noreferrer">{es ? 'Consigue Content Lab · $10' : 'Get Content Lab · $10'}</a></span>
          </div>
        </>}
      </main>
      {!expired && <footer className="lab-auth-foot">{es ? 'Menos desplazarte. Más crear.' : 'Less scrolling. More creating.'}</footer>}
    </div>
  );
}
