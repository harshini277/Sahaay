import React, {useEffect, useMemo, useRef, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams} from 'react-router-dom'
import {citizens} from './data'
import {authorityFor} from './authority'
import {addGrievance,getGrievance,getGrievances,updateGrievance} from './store'
import type {Grievance, Session, Status} from './types'
import {api} from './api'
import type {Conversation} from './conversation'
import './styles.css'

const A='/about', pension='PG-2026-08425-017'
const formatEventDate=(date=new Date())=>new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true}).format(date).replace(',', ' ·')
const eventMinutesAgo=(minutes:number,from=new Date())=>formatEventDate(new Date(from.getTime()-minutes*60*1000))
const LOCATION_HINTS:[string,string,string][]=[
  ['bengaluru','Karnataka','Bengaluru'],['bangalore','Karnataka','Bengaluru'],['sarjapur','Karnataka','Bengaluru'],
  ['chennai','Tamil Nadu','Chennai'],['mylapore','Tamil Nadu','Chennai'],['coimbatore','Tamil Nadu','Coimbatore'],
  ['pune','Maharashtra','Pune'],['mumbai','Maharashtra','Mumbai'],['nagpur','Maharashtra','Nagpur'],
  ['hyderabad','Telangana','Hyderabad'],['warangal','Telangana','Warangal'],
  ['delhi','Delhi','Delhi'],['new delhi','Delhi','Delhi'],['kolkata','West Bengal','Kolkata'],
  ['ahmedabad','Gujarat','Ahmedabad'],['jaipur','Rajasthan','Jaipur'],['lucknow','Uttar Pradesh','Lucknow'],
  ['bhopal','Madhya Pradesh','Bhopal'],['bhubaneswar','Odisha','Bhubaneswar'],['patna','Bihar','Patna'],
  ['amritsar','Punjab','Amritsar'],['guwahati','Assam','Guwahati'],['thiruvananthapuram','Kerala','Thiruvananthapuram'],
  ['kochi','Kerala','Kochi'],['goa','Goa','Goa'],['chandigarh','Chandigarh','Chandigarh'],
  ['dehradun','Uttarakhand','Dehradun'],['ranchi','Jharkhand','Ranchi'],['indore','Madhya Pradesh','Indore']
]
const inferLocation=(text:string)=>{const s=text.toLowerCase();const hit=LOCATION_HINTS.find(([k])=>s.includes(k));return hit?{state:hit[1],district:hit[2]}:{state:'',district:''}}

function ConversationJourney(){
  const nav=useNavigate();
  const initial=sessionStorage.getItem('sahaay-description')||'';
  const [draft,setDraft]=useState('');
  const [conversation,setConversation]=useState<Conversation|null>(null);
  const [busy,setBusy]=useState(false);
  const {c}=useCitizen();

  const send=async(text=draft)=>{
    const clean=text.trim();
    if(!clean||busy)return;
    setBusy(true);
    setDraft('');
    try{
      // This MVP uses a deterministic conversation engine rather than a
      // remote or browser-loaded LLM. That keeps the demo reliable offline
      // and makes every required workflow step predictable.
      const base = conversation ? await api.chat.reply(conversation,clean) : await api.chat.start(clean);
      if ((base.intent==='view_grievances' || base.intent==='track_grievance') && !conversation) {
        sessionStorage.removeItem('sahaay-description');
        nav('/track');
        return;
      }
      setConversation(base);
    } finally { setBusy(false); }
  };

  const choose=(x:string)=>send(x);
  const intent=conversation?.intent||'unknown';
  const complete=conversation?.complete||false;
  const out=conversation?.intent==='out_of_scope_rti'||conversation?.intent==='out_of_scope_emergency';
  const understanding=conversation?.understanding;
  const service=understanding?.entities.service;
  const categoryLabel=understanding?.category==='pension'
    ? (understanding.subtype==='amount_issue'?'Pension amount issue':understanding.subtype==='not_started'?'Pension not started':'Pension payment delay')
    : understanding?.category==='complaint_lifecycle'
      ? (understanding.subtype==='no_response'?'No response to a grievance':'Unsatisfactory complaint resolution')
      : understanding?.category==='service_delay'?'Delayed government service':'Government service grievance';
  const review=()=>{if(!conversation)return;sessionStorage.setItem('sahaay-conversation',JSON.stringify(conversation));nav('/submit')};

  useEffect(()=>{
    if(initial&&!conversation){
      send(initial);
      sessionStorage.removeItem('sahaay-description');
    }
  },[]);

  if(!c)return <><Header/><main id="main-content" className="auth journey-gate"><p className="eyebrow">Secure grievance guidance</p><h1>Sign in before you start a grievance</h1><p>Your grievance conversation is private. Sign in first so the information you provide stays linked to your citizen account.</p><SignInModal onSuccess={()=>window.location.reload()}/></main></>;
  if(out)return <><Header/><main id="main-content" className="guard"><p className="eyebrow">A different public service</p><h1>This request follows a different route.</h1><p>{conversation?.messages.at(-1)?.text}</p><div className="route-help"><h2>Want to try a grievance instead?</h2><p>Tell Sahaay what happened and we'll help you find the closest public-service route.</p><button onClick={()=>{sessionStorage.removeItem('sahaay-description');setConversation(null);setDraft('');nav('/start',{replace:true})}}>Describe another problem →</button></div></main></>;

  return <>
    <Header/>
    <main id="main-content" className="conversation-shell">
      <section className="journey journey-live">
        <p className="eyebrow">Your grievance journey</p>
        {['Understand your issue','Identify grievance type','Prepare information','Review & submit','Government review','Resolution','Feedback / appeal'].map((x,i)=>{
          const active=!conversation?i===0:complete?i===3:i===Math.min(2,conversation.turn+1);
          const done=conversation&&(i===0||(i===1&&conversation.turn>0)||(i===2&&complete));
          return <div className={'road '+(done?'done':active?'next':'')} key={x}>
            <span>{done?'✓':active?'●':i+1}</span>
            <div>
              <b>{x}</b>
              {i===1&&service&&<small>{service}</small>}
              {i===1&&!service&&intent==='pension_payment_delay'&&<small>Pension payment issue</small>}
              {i===2&&complete&&<small>Ready to review</small>}
            </div>
          </div>
        })}
      </section>

      <section className="conversation-area">
        <div className="conversation-head">
          <div>
            <p className="eyebrow">Lodge grievance</p>
            <h1>Sahaay</h1>
            <p>Explain what went wrong in your own words. Sahaay will work out the route.</p>
          </div>
        </div>

        <div className="messages" aria-live="polite">
          {!conversation&&<div className="empty-chat">
            <div className="empty-chat-icon" aria-hidden="true">✦</div>
            <h2>Start with the problem</h2>
            <p>Describe what happened in your own words. Sahaay will ask only what helps identify the right path.</p>
          </div>}

          {conversation?.messages.map((m,i)=><div key={i} className={'message '+m.role}>
            <b>{m.role==='user'?'You':m.role==='assistant'?'Sahaay':'Notice'}</b>
            <p>{m.text}</p>
            {m.why&&<details className="why-detail"><summary>Why am I being asked this?</summary><p>{m.why}</p></details>}
            {m.options&&i===conversation.messages.length-1&&<div className={"chat-options "+(m.options.length>8?"fallback-options":"")}>
              {m.options.map(o=><button key={o} onClick={()=>choose(o)} disabled={busy}>{o}</button>)}
            </div>}
          </div>)}

        </div>

        {complete&&<div className="path-ready">
          <div>
            <p className="eyebrow">Your grievance path</p>
            <h2>{categoryLabel}</h2>
            {service&&<p><b>Service:</b> {service}</p>}
            {understanding?.entities.duration&&<p><b>How long:</b> {understanding.entities.duration}</p>}
            <p>Based on what you've told us, this is the likely path. You can still ask Sahaay questions below before reviewing the grievance.</p>
          </div>
          <button onClick={review}>Review grievance →</button>
        </div>}

        <div className="composer composer-ai">
          <label className="sr-only" htmlFor="chat-input">Message Sahaay</label>
          <textarea id="chat-input" placeholder={conversation?'Ask a follow-up or tell Sahaay anything else…':'Tell Sahaay what happened…'} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}/>
          <div className="composer-toolbar">
            <div className="composer-tools">
              <button type="button" className="icon-button" aria-label="Voice input" title="Voice input is not enabled in this service">⌁</button>
              <span>Don't share Aadhaar, OTPs, passwords or bank details.</span>
            </div>
            <button className="send-button" aria-label="Send message" onClick={()=>send()} disabled={!draft.trim()||busy}><span aria-hidden="true">↑</span><span>Send</span></button>
          </div>
        </div>
      </section>

      <aside className="guide-panel">
        <p className="eyebrow">Sahaay</p>
        <h2>Guidance, not bureaucracy.</h2>
        <p>Tell us what happened in ordinary language. You don't need to know which department, category or process applies.</p>
        <div className="privacy"><b>Privacy first</b><br/>Sahaay only needs the information required to understand your problem. Never share Aadhaar, OTPs, passwords or bank details here.</div>
      </aside>
    </main>
  </>
}
function useCitizen(){
  const [id,setId]=useState(()=>localStorage.getItem('sahaay-citizen'));
  const base=id?citizens.find(x=>x.id===id):undefined;
  const stored=base?JSON.parse(localStorage.getItem(`sahaay-profile-${base.id}`)||'{}'):{}; const c=base?{...base,...stored,state:stored.state||base.state||'',district:stored.district||base.district||'',address:stored.address||base.address||''}:undefined;
  return {c,login:(v:string)=>{localStorage.setItem('sahaay-citizen',v);setId(v)},logout:()=>{localStorage.removeItem('sahaay-citizen');setId(null)}}
}
function SignInModal({onSuccess,onClose}:{onSuccess:()=>void;onClose?:()=>void}){
  const {login}=useCitizen();
  const [email,setEmail]=useState(''),[pass,setPass]=useState(''),[err,setErr]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setErr('');const c=await api.auth.login(email.trim(),pass);if(c){login(c.id);onSuccess()}else setErr('We could not verify those credentials. Try the credentials provided for this service.')}
  return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&onClose)onClose()}}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="signin-title">
      {onClose&&<button className="modal-close" onClick={onClose} aria-label="Close sign in">×</button>}
      <p className="eyebrow">Sign in required</p>
      <h2 id="signin-title">Sign in before you submit</h2>
      <p>Reviewing your grievance is open to everyone. Registration and submission require a signed-in citizen account.</p>
      <form onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label>
        <label>Password<input type="password" value={pass} onChange={e=>setPass(e.target.value)} autoComplete="current-password" required/></label>
        {err&&<p className="error" role="alert">{err}</p>}
        <button>Verify and continue →</button>
      </form>
      <p className="fine">Use your Sahaay account credentials. Identity verification and OTP are represented with synthetic account behaviour.</p>
      <Link className="modal-register" to="/register">Need an account? Register</Link>
    </section>
  </div>
}
function Header({citizen}:{citizen?:string}){
  const {c,logout}=useCitizen();
  const [open,setOpen]=useState(false);
  const [access,setAccess]=useState(false);
  const [confirmSignOut,setConfirmSignOut]=useState(false);
  const [font,setFont]=useState(()=>localStorage.getItem('sahaay-font-size')||'100');
  useEffect(()=>{document.documentElement.style.fontSize=`${font}%`;localStorage.setItem('sahaay-font-size',font)},[font]);
  const signedIn=Boolean(c||citizen);
  const displayName=(c?.name||citizen||'').trim().split(/\s+/)[0] || 'Account';
  const setFontSize=(v:number)=>setFont(String(Math.max(90,Math.min(115,v))));
  const signOut=()=>{logout();setConfirmSignOut(false);setOpen(false);window.location.href='/'};
  return <>
    <div className="utility-bar">
      <div className="utility-inner">
        <span>Sahaay · Public grievance guidance</span>
        <div className="utility-actions">
          <Link to="/help">Help & FAQs</Link>
          <button type="button" onClick={()=>setAccess(v=>!v)} aria-expanded={access}>Accessibility</button>
        </div>
      </div>
    </div>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    {access&&<div className="access-panel" role="region" aria-label="Accessibility options"><b>Text size</b><button onClick={()=>setFontSize(Number(font)-5)} aria-label="Decrease text size">A−</button><button onClick={()=>setFontSize(100)} aria-label="Reset text size">A</button><button onClick={()=>setFontSize(Number(font)+5)} aria-label="Increase text size">A+</button></div>}
    <header className="portal-header">
      <Link className="service-lockup" to="/" aria-label="Sahaay home">
        <span className="sahaay-mark" aria-hidden="true"><img src="/sahaay-logo.png" alt="" /></span>
        <span><b>Sahaay</b><small>Know what to do next.</small></span>
      </Link>
      <button className="menu-button" aria-expanded={open} aria-controls="portal-nav" onClick={()=>setOpen(!open)}><span className="menu-icon" aria-hidden="true">☰</span> Menu</button>
      <nav id="portal-nav" className={open?'open':''}>
        <div className="nav-main">
          <Link to="/" onClick={()=>setOpen(false)}>Home</Link>
          <Link to="/start" onClick={()=>setOpen(false)}>Lodge grievance</Link>
          <Link to="/track" onClick={()=>setOpen(false)}>Track grievance</Link>
          <Link to="/how-it-works" onClick={()=>setOpen(false)}>How it works</Link>
        </div>
        <div className="nav-account">
          {!signedIn
            ? <><Link className="register-link" to="/register" onClick={()=>setOpen(false)}>Register</Link><Link className="signin-link" to="/login" onClick={()=>setOpen(false)}>Sign in</Link></>
            : <>
              <Link className="profile-link" to="/profile" onClick={()=>setOpen(false)} aria-label={`Open ${displayName}'s profile`}><span className="profile-avatar">{displayName.charAt(0).toUpperCase()}</span><span>{displayName}</span></Link>
              <button className="signout-icon" type="button" aria-label="Sign out" title="Sign out" onClick={()=>setConfirmSignOut(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M14 8l4 4-4 4M9 12h9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            </>}
        </div>
      </nav>
    </header>
    {confirmSignOut&&<div className="modal-backdrop" role="presentation"><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="signout-title"><div className="confirm-icon" aria-hidden="true">↪</div><h2 id="signout-title">Sign out of Sahaay?</h2><p>You'll need to sign in again to view your grievances or submit a new one.</p><div className="confirm-actions"><button className="quiet" onClick={()=>setConfirmSignOut(false)}>Cancel</button><button onClick={signOut}>Sign out</button></div></section></div>}
  </>
}
function Disclosure(){return <section className="disclosure"><b>About this service</b><p>Government submissions, identity verification, documents, notifications and integrations use synthetic data in this service. No real government account or production system is connected.</p><Link to={A}>How this could work safely →</Link></section>}
function Footer(){return <footer><div className="footer-grid"><div><div className="footer-brand">Sahaay <small>Citizen assistance</small></div><p>Clearer guidance for public grievances, inspired by CPGRAMS.</p></div><div><b>Sahaay</b><Link to={A}>About this service</Link><Link to="/how-it-works">How it works</Link><Link to={A}>Privacy</Link></div><div><b>Grievance services</b><Link to="/start">Lodge grievance</Link><Link to="/track">Track grievance</Link><Link to="/help">Appeal</Link></div><div><b>Help</b><Link to="/help">FAQs</Link><Link to="/help">Contact & support</Link></div></div><div className="footer-note">Government submissions, identity verification, documents and integrations are simulated with synthetic data. No connection to CPGRAMS production systems is made.</div></footer>}
function Home(){
  const [text,setText]=useState('');
  const [signIn,setSignIn]=useState(false);
  const nav=useNavigate();
  const {c}=useCitizen();
  const go=()=>{
    if(!text.trim())return;
    sessionStorage.setItem('sahaay-description',text.trim());
    if(c) nav('/start');
    else setSignIn(true);
  };
  const examples=['My pension hasn’t arrived','My driving licence renewal is stuck','There are potholes on my road','My certificate application is delayed'];
  return <><Header/>
    <main id="main-content" className="home-portal">
      <section className="home-hero">
        <p className="eyebrow">Citizen grievance guidance</p>
        <h1>What went wrong?</h1>
        <p className="home-hero-lead">Tell Sahaay what happened in your own words. We'll help you find the right grievance path.</p>
        <div className="hero-chat">
          <div className="hero-chat-top"><span className="hero-chat-label">Sahaay</span><span className="secure-label">{c?'Signed in · ready to begin':'Sign in required to continue'}</span></div>
          <textarea aria-label="Tell Sahaay what happened" placeholder="Describe your problem…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}}}/>
          <div className="hero-chat-bottom">
            <div className="hero-chat-hint"><span>Press Enter to continue</span></div>
            <button className="hero-send" onClick={go} disabled={!text.trim()} aria-label="Start guidance"><span aria-hidden="true">↑</span></button>
          </div>
        </div>
        <div className="hero-examples"><span>Try:</span>{examples.map(x=><button key={x} onClick={()=>setText(x)}>{x}</button>)}</div>
        <p className="hero-privacy">Your grievance is private and linked to your signed-in account. Never share Aadhaar, OTPs, passwords or bank details.</p>
      </section>
      <section className="how-summary">
        <div className="section-title"><p className="eyebrow">A simpler journey</p><h2>From your words to a clear next step.</h2></div>
        <ol>{[['Describe','Tell us what happened in your own words.'],['Understand','Sahaay identifies the likely grievance path.'],['Prepare','See what information you need before submission.'],['Submit','Review your details before registering the grievance.'],['Track','Follow every stage and know when you need to act.']].map(([t,d],i)=><li key={t}><span>{i+1}</span><b>{t}</b><p>{d}</p></li>)}</ol>
      </section>
      <section className="quick-services">
        <div className="section-title"><p className="eyebrow">Your options</p><h2>What would you like to do?</h2></div>
        <div className="service-cards">
          <Link to="/start"><span className="card-number">01</span><h3>Lodge a grievance</h3><p>Describe your problem and get guided through the right path.</p><b>Get guidance →</b></Link>
          <Link to="/track"><span className="card-number">02</span><h3>Track my grievances</h3><p>See every case linked to your account and what happens next.</p><b>View my grievances →</b></Link>
          <Link to="/how-it-works"><span className="card-number">03</span><h3>Understand the process</h3><p>See how a grievance moves from submission to resolution or appeal.</p><b>View the process →</b></Link>
        </div>
      </section>
      <section className="difference">
        <div><p className="eyebrow">Designed around the citizen</p><h2>You shouldn't have to understand the bureaucracy to navigate it.</h2></div>
        <p>Sahaay turns a plain-language description into a clear, explainable grievance journey. The government workflow remains authoritative; Sahaay makes that path easier to understand and follow.</p>
      </section>
      <section className="faq-preview">
        <div className="section-title"><p className="eyebrow">Help centre</p><h2>Frequently asked questions</h2></div>
        {['What is a grievance?','How long does resolution usually take?','What happens after I submit?','Can I appeal a resolution?'].map((q,i)=><details key={q}><summary>{q}<span>+</span></summary><p>{i===0?'A grievance is a complaint about a problem with a public service.':i===1?'The expected response date is shown clearly on your case timeline.':i===2?'Your grievance is registered, routed to the responsible authority, reviewed and followed by a response.':'If you remain dissatisfied and are eligible, you can request a review of the resolution.'}</p></details>)}
        <Link to="/help">Visit help & FAQs →</Link>
      </section>
    </main>
    <Footer/>
    {signIn&&<SignInModal onSuccess={()=>{setSignIn(false);nav('/start')}} onClose={()=>setSignIn(false)}/>}
  </>;
}
function Login(){const {login}=useCitizen(),nav=useNavigate(); const [email,setEmail]=useState(''),[pass,setPass]=useState(''),[err,setErr]=useState(''); const submit=async(e:React.FormEvent)=>{e.preventDefault();const c=await api.auth.login(email.trim(),pass);if(c){login(c.id);nav('/dashboard')}else setErr('We could not sign you in. Check the credentials provided to you.')};return <><Header/><main id="main-content" className="auth"><p className="eyebrow">Citizen sign in</p><h1>Welcome back</h1><p>Sign in to see your grievance updates and continue where you left off.</p><form onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required autoComplete="email"/></label><label>Password<input value={pass} onChange={e=>setPass(e.target.value)} type="password" required autoComplete="current-password"/></label>{err&&<p className="error" role="alert">{err}</p>}<button>Sign in securely →</button></form><p className="fine">Synthetic account only. No real identity verification or OTP is used.</p></main></>}
function Register(){const {login}=useCitizen();const nav=useNavigate();const [form,setForm]=useState({name:'',phone:'',email:'',password:'',confirm:'',state:'',district:'',address:''});const [err,setErr]=useState('');const submit=async(e:React.FormEvent)=>{e.preventDefault();if(form.password!==form.confirm){setErr('Passwords do not match.');return}const citizen=await api.auth.register({name:form.name,email:form.email,phone:form.phone}); localStorage.setItem(`sahaay-profile-${citizen.id}`,JSON.stringify({name:form.name,email:form.email,phone:form.phone,state:form.state,district:form.district,address:form.address})); login(citizen.id); nav('/dashboard')};return <><Header/><main id="main-content" className="auth"><p className="eyebrow">Create an account</p><h1>Register for Sahaay</h1><p>Use synthetic information only. Identity verification is simulated for this service.</p><form onSubmit={submit}><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Mobile<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>State<input required value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></label><label>District / city<input required value={form.district} onChange={e=>setForm({...form,district:e.target.value})}/></label><label>Address<input required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><label>Confirm password<input type="password" required value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/></label>{err&&<p className="error" role="alert">{err}</p>}<button>Create account →</button></form></main></>}
function Profile(){
  const {c,login}=useCitizen();
  const [saved,setSaved]=useState(false);
  const [confirmSignOut,setConfirmSignOut]=useState(false);
  const [form,setForm]=useState({name:'',email:'',phone:'',state:'',district:'',address:''});
  useEffect(()=>{
    if(c){
      const stored=JSON.parse(localStorage.getItem(`sahaay-profile-${c.id}`)||'null');
      setForm({name:stored?.name||c.name,email:stored?.email||c.email,phone:stored?.phone||c.phone,state:stored?.state||c.state||'',district:stored?.district||c.district||'',address:stored?.address||c.address||''});
    }
  },[c?.id]);
  if(!c)return <Navigate to="/login" replace/>;
  const update=(key:keyof typeof form,value:string)=>{setSaved(false);setForm(prev=>({...prev,[key]:value}))};
  const save=(e:React.FormEvent)=>{
    e.preventDefault();
    const next={...c,...form};
    Object.assign(c,next);
    localStorage.setItem(`sahaay-profile-${c.id}`,JSON.stringify(form));
    login(c.id);
    setSaved(true);
  };
  return <><Header citizen={form.name}/><main id="main-content" className="profile-page">
    <div className="profile-page-head"><div><p className="eyebrow">Your account</p><h1>Personal details</h1><p>Keep your contact details up to date for your grievance journey.</p></div><Link className="button quiet" to="/track">My grievances →</Link></div>
    <section className="profile-card">
      <div className="profile-card-intro"><span className="profile-avatar profile-avatar-xl">{form.name.trim().charAt(0).toUpperCase()}</span><div><h2>{form.name || 'Your details'}</h2><p>{form.email}</p></div><button className="profile-signout" type="button" onClick={()=>setConfirmSignOut(true)} aria-label="Sign out">Sign out</button></div>
      <form onSubmit={save} className="profile-form">
        <div className="form-grid"><label>Full name<input value={form.name} onChange={e=>update('name',e.target.value)} required/></label><label>Email address<input type="email" value={form.email} onChange={e=>update('email',e.target.value)} required/></label><label>Mobile number<input value={form.phone} onChange={e=>update('phone',e.target.value)} inputMode="tel" required/></label><label>State<input value={form.state} onChange={e=>update('state',e.target.value)} required/></label><label>District / city<input value={form.district} onChange={e=>update('district',e.target.value)} required/></label><label className="full-field">Address<input value={form.address} onChange={e=>update('address',e.target.value)} required/></label></div>
        <div className="profile-actions"><span className="fine">Your account uses synthetic information in this service.</span><button type="submit">Save changes →</button></div>
        {saved&&<p className="success" role="status">Your details have been updated.</p>}
      </form>
    </section>
    
  {confirmSignOut&&<div className="modal-backdrop" role="presentation"><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="profile-signout-title"><div className="confirm-icon" aria-hidden="true">↪</div><h2 id="profile-signout-title">Sign out of Sahaay?</h2><p>You’ll need to sign in again to view your grievances or submit a new one.</p><div className="confirm-actions"><button className="quiet" onClick={()=>setConfirmSignOut(false)}>Cancel</button><button onClick={()=>{localStorage.removeItem('sahaay-citizen');window.location.href='/'}}>Sign out</button></div></section></div>}
  </main></>;}
function Dashboard(){const {c}=useCitizen(); if(!c)return <Navigate to="/login" replace/>; const gs=getGrievances().filter(g=>g.citizenId===c.id); const isPast=(g:Grievance)=>g.status==='feedback'&&typeof g.rating==='number'; const active=gs.filter(g=>!isPast(g)); const past=gs.filter(isPast); return <><Header citizen={c.name}/><main id="main-content" className="dash"><div className="title-row"><div><p className="eyebrow">Your citizen space</p><h1>{c.greeting}, {c.name.split(' ')[0]}</h1><p>Here’s what needs your attention.</p></div></div><section className="grievance-section"><p className="eyebrow">Active grievances</p>{active.length?active.map(g=><article className="active" key={g.id}><div><p className="eyebrow">{g.category}</p><h2>{g.title}</h2><p>{g.id} · <b className={'status '+g.status}>{label(g.status)}</b></p></div><Link className="button" to={'/track/'+g.id}>View progress →</Link></article>):<section className="empty"><h2>No active grievances</h2><p>Start by describing the problem in everyday language.</p><Link className="button" to="/start">Describe a problem →</Link></section>}</section>{active.some(g=>g.status==='action_required')&&<section className="attention"><b>Action needed</b><p>Provide additional information so the department can continue.</p><Link to={'/track/'+active.find(g=>g.status==='action_required')!.id}>Provide information →</Link></section>}<section className="grievance-section past-grievances"><p className="eyebrow">Past grievances</p>{past.length?past.map(g=><article className="active past-card" key={g.id}><div><p className="eyebrow">{g.category}</p><h2>{g.title}</h2><p>{g.id} · <b className={'status '+g.status}>{label(g.status)}</b></p><p className="fine">Resolution feedback submitted</p></div><Link className="button quiet" to={'/track/'+g.id}>View details →</Link></article>):<p className="fine">Resolved grievances will appear here after you submit your feedback.</p>}</section><Link className="new-link" to="/start">Need help with a new problem? →</Link></main></>}
function infer(t:string){const x=t.toLowerCase();if(/rti|right to information/.test(x))return 'rti';if(/emergency|police|ambulance/.test(x))return 'emergency';if(/pension/.test(x))return 'pension';if(/closed|still not solved|unresolved/.test(x))return 'existing';if(/pending|application/.test(x))return 'service';return 'unknown'}
const qs:{[key:string]:{q:string, why:string, options:string[]}[]}={pension:[{q:'Is this a pension payment that was expected but did not arrive?',why:'This identifies the right grievance path.',options:['Yes, a payment did not arrive','No, it is about starting my pension','The amount seems incorrect']},{q:'When was the payment expected?',why:'This helps explain the delay clearly.',options:['This month','Last month','More than one month ago']},{q:'Is this the first missed payment?',why:'This helps the department understand the pattern.',options:['Yes, the first time','No, it has happened before']},{q:'Do you know the pension scheme or department?',why:'This can improve the suggested route.',options:['Yes, I know it','No, I am not sure']}],service:[{q:'What is delayed?',why:'This helps identify the service.',options:['An application decision','A certificate or document','A service request']},{q:'How long has it been pending?',why:'This shows the expected wait has passed.',options:['A few weeks','About two months','Longer than two months']}],existing:[{q:'What happened to your previous grievance?',why:'This helps find the right next step.',options:['It was closed but unresolved','The response did not address my issue','I received incorrect information']}],unknown:[{q:'Which best describes the problem?',why:'This helps us suggest a suitable path.',options:['A payment or pension issue','A delayed government service','An existing complaint is unresolved','Something else']} ]}
function Journey(){const nav=useNavigate();const {c}=useCitizen();const [desc,setDesc]=useState(()=>sessionStorage.getItem('sahaay-description')||'');const [intent,setIntent]=useState(()=>infer(desc));const [step,setStep]=useState(0);const [answers,setAnswers]=useState<string[]>([]);const [open,setOpen]=useState(true);const [mobile,setMobile]=useState(false);const current=qs[intent]||qs.unknown; const guard=intent==='rti'||intent==='emergency';const choose=(a:string)=>{setAnswers([...answers,a]); if(step+1<current.length)setStep(step+1);else setStep(current.length)}; const ready=step>=current.length; const begin=()=>{setIntent(infer(desc));setStep(0);setAnswers([])};
  if(!c) return <><Header/><main id="main-content" className="auth journey-gate"><p className="eyebrow">Secure grievance guidance</p><h1>Sign in before you start a grievance</h1><p>Your grievance journey is private. Sign in first so your conversation and any saved grievance details stay linked to your citizen account.</p><SignInModal onSuccess={()=>window.location.reload()}/></main></>;
  if(guard)return <><Header/><main id="main-content" className="guard"><p className="eyebrow">A helpful next step</p><h1>{intent==='rti'?"This isn't the right service for an RTI request.":'For urgent help, use emergency services.'}</h1><p>{intent==='rti'?'CPGRAMS does not handle RTI matters. An RTI request asks a public authority for information and follows a separate route.':'This grievance guide cannot provide urgent emergency help. Please contact local emergency services.'}</p><Link className="button" to="/">Describe another problem →</Link></main></>;return <><Header/><main id="main-content" className="workspace"><section className="journey"><p className="eyebrow">Your grievance journey</p>{['Understand your issue','Confirm grievance type','Prepare your information','Review & submit','Department review','Resolution','Feedback / appeal'].map((x,i)=><div className={'road '+(i<3?'done':i===3&&ready?'next':'')} key={x}><span>{i<3?'✓':i+1}</span><div><b>{x}</b>{i===1&&intent==='pension'&&<small>Pension payment issue</small>}{i===2&&<small>{ready?'Ready':'Almost ready'}</small>}</div></div>)}</section><section className="work"><div className="mobile-ai"><button onClick={()=>setMobile(true)}>Ask Sahaay’s guide</button></div>{!ready?<><p className="eyebrow">Let’s understand your issue</p><h1>{desc?'A few quick questions':'Describe the problem'}</h1>{!desc?<><textarea aria-label="Describe your problem" placeholder="Describe your problem…" value={desc} onChange={e=>setDesc(e.target.value)}/><button onClick={begin} disabled={!desc.trim()}>Continue →</button></>:<div className="question"><p className="count">Question {step+1} of {current.length}</p><h2>{current[step].q}</h2><p className="why"><b>Why we’re asking:</b> {current[step].why}</p><div>{current[step].options.map(o=><button className="option" onClick={()=>choose(o)} key={o}>{o}<span>→</span></button>)}</div></div>}</>:<Ready description={desc} intent={intent} answers={answers} onSubmit={()=>nav('/submit')}/>}</section>{open&&<aside className="assistant"><button className="close" aria-label="Collapse guide" onClick={()=>setOpen(false)}>×</button><p className="eyebrow">Sahaay guide</p><h2>I’m here to make the process clearer.</h2><div className="bubble">I’ll ask only what helps identify the right path. You can review everything before any simulated submission.</div><div className="privacy"><b>Privacy first</b><br/>Don’t share Aadhaar numbers, OTPs, passwords, bank details or other sensitive information here.</div></aside>}{!open&&<button className="guide-tab" onClick={()=>setOpen(true)}>Open guide</button>}</main>{mobile&&<div className="sheet"><div><button className="close" onClick={()=>setMobile(false)}>×</button><p className="eyebrow">Sahaay guide</p><h2>Clear steps, in plain language.</h2><p>We only ask non-sensitive questions to help you find the right grievance path.</p><div className="privacy"><b>Privacy first</b><br/>Never share Aadhaar, OTPs, passwords or bank details.</div></div></div>}</>}
function Ready({description,intent,onSubmit}:{description:string,intent:string,answers:string[],onSubmit:()=>void}){return <div className="ready"><p className="eyebrow">Your suggested path</p><h1>You’re ready to submit</h1><p>We’ve translated your problem into a clear grievance summary. Review it before you register the grievance.</p><dl><div><dt>Problem</dt><dd>{intent==='pension'?'Pension payment not received':intent==='service'?'Government service delayed':'Existing grievance unresolved'}</dd></div><div><dt>Issue</dt><dd>{intent==='pension'?'Delayed payment':'Service delivery concern'}</dd></div><div><dt>Expected date</dt><dd>5 August 2026</dd></div><div><dt>Service</dt><dd>{intent==='pension'?'Pension':'Public service'}</dd></div></dl><section className="process"><h2>What happens after you submit?</h2><ol><li>Your grievance is registered.</li><li>It is routed to the relevant authority.</li><li>The responsible grievance officer reviews it.</li><li>The department sends a response.</li><li>You can provide feedback or appeal if eligible.</li></ol><p><b>Responsible grievance officer</b> means the officer designated to handle grievances for the relevant organisation.</p></section><button onClick={onSubmit}>Review & submit →</button></div>}
function Submit(){
  const nav=useNavigate();
  const {c}=useCitizen();
  if(!c) return <><Header/><main id="main-content" className="guard"><p className="eyebrow">Sign in required</p><h1>Sign in before submitting</h1><p>Your grievance can be reviewed without an account, but registering it requires a signed-in citizen.</p><SignInModal onSuccess={()=>nav('/submit')}/></main></>;
  const conversation=JSON.parse(sessionStorage.getItem('sahaay-conversation')||'null') as Conversation|null;
  const u=conversation?.understanding;
  const serviceLabel=u?.entities.service;
  const title=u?.category==='pension'?'Pension payment delay':u?.category==='complaint_lifecycle'?'Previous complaint remains unresolved':serviceLabel==='Roads / public works'?'Road maintenance issue':serviceLabel==='Sanitation / waste service'?'Garbage or sanitation issue':serviceLabel==='Water supply / drainage'?'Water supply or drainage issue':serviceLabel?`${serviceLabel} issue`:'Government service issue';
  const category=u?.category==='pension'?'Pension grievance':u?.category==='complaint_lifecycle'?(u.subtype==='no_response'?'No response to grievance':'Complaint resolution review'):u?.entities.service==='Roads / public works'?'Roads & public works':u?.entities.service==='Sanitation / waste service'?'Sanitation & waste':u?.entities.service==='Water supply / drainage'?'Water & drainage':u?.subtype==='licence_service'?'Driving licence / vehicle service':u?.subtype==='registration_service'?'Vehicle registration / permit':u?.subtype==='certificate_pending'?'Certificates & documents':u?.subtype==='tax_service'?'Tax / property tax service':u?.entities.service||'Government service';
  const issue=conversation?.originalDescription||'Government service concern';
  const detail=[u?.entities.duration&&'Duration: '+u.entities.duration,u?.entities.expected&&'Expected: '+u.entities.expected].filter(Boolean).join(' · ')||'Details prepared from your guidance conversation';
  const inferred=inferLocation([conversation?.originalDescription||'',conversation?.entities?.location||'',...(conversation?.answers||[])].join(' '));
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState({
    fullName:c?.name||'',
    email:c?.email||'',
    mobile:c?.phone||'',
    state:c?.state||inferred.state,
    district:c?.district||inferred.district,
    address:c?.address||'',
    referenceNumber:u?.entities.referenceAvailable===false?'':''
  });
  const update=(key:keyof typeof form,value:string)=>setForm(prev=>({...prev,[key]:value}));
  const submit=async()=>{
    setLoading(true);
    const submittedAt=new Date();
    const id=`PG-${new Date().getFullYear()}-08425-${String(Date.now()).slice(-3)}`;
    const g:Grievance={
      id,
      citizenId:c?.id||'anita',
      title,
      category,
      issue,
      authority:authorityFor(form.state,form.district,u?.entities.service).name,
      status:'under_review',
      expected:'15 Sep 2026',
      submittedAt:formatEventDate(submittedAt),
      submission:form,
      events:[
        {title:'Submitted',date:formatEventDate(submittedAt),detail:'Your grievance was successfully registered with the information you reviewed.',action:'Nothing needed — your grievance is safely registered.',state:'done'},
        {title:'Routed to responsible authority',date:formatEventDate(new Date(submittedAt.getTime()+1000)),detail:`Your grievance was sent to ${authorityFor(form.state,form.district,u?.entities.service).role} ${authorityFor(form.state,form.district,u?.entities.service).name}.`,action:'Nothing needed right now. You can view the responsible authority below.',state:'done'},
        {title:'Under review',date:formatEventDate(new Date(submittedAt.getTime()+2000)),detail:'The responsible grievance officer is reviewing the information you submitted.',action:'Nothing required from you right now.',state:'current'}
      ]
    };
    await api.grievances.create(g);
    setLoading(false);
    sessionStorage.removeItem('sahaay-conversation');
    nav('/submitted/'+id);
  };
  return <><Header citizen={c?.name}/><main id="main-content" className="submit">
    <p className="eyebrow">Secure submission</p>
    <h1>Review and register your grievance</h1>
    <p>We first helped you understand the problem. Now enter the citizen and service details needed to create the grievance record shown in this service.</p>

    <section className="review">
      <div className="submission-section">
        <p className="eyebrow">01 · Grievance summary</p>
        <h2>{title}</h2>
        <p>{category} · {detail}</p>
        <div className="summary-box"><b>What you told Sahaay</b><p>{issue}</p></div>
      </div>

      <div className="submission-section">
        <p className="eyebrow">02 · Citizen details</p>
        <p className="fine">These details are linked to your signed-in Sahaay account.</p>
        <div className="form-grid">
          <label>Full name<input value={form.fullName} onChange={e=>update('fullName',e.target.value)} required/></label>
          <label>Mobile number<input value={form.mobile} onChange={e=>update('mobile',e.target.value)} inputMode="tel" required/></label>
          <label>Email address<input type="email" value={form.email} onChange={e=>update('email',e.target.value)} required/></label>
          <label>State<input value={form.state} onChange={e=>update('state',e.target.value)} required/></label>
          <label>District / city<input value={form.district} onChange={e=>update('district',e.target.value)} required/></label>
          <label>State<input value={form.state} onChange={e=>update('state',e.target.value)} required/></label><label>District / city<input value={form.district} onChange={e=>update('district',e.target.value)} required/></label><label className="full-field">Address<input value={form.address} onChange={e=>update('address',e.target.value)} required/></label>
        </div>
      </div>

      <div className="submission-section">
        <p className="eyebrow">03 · Responsible authority</p>
        <div className="submission-authority">
          {(() => { const a=authorityFor(form.state,form.district,u?.entities.service); return <>
            <div><b>{a.name}</b><span>{a.role} · {a.department}</span><span>{a.office}</span></div>
            <div className="submission-authority-contact"><span>{a.phone}</span><span>{a.email}</span></div>
            <small>Demo directory · synthetic contact. The local route is selected from the location you provide.</small>
          </> })()}
        </div>
      </div>

      <div className="submission-section">
        <p className="eyebrow">04 · Service details</p>
        <label>Application / registration / reference number <span className="optional">(if you have one)</span>
          <input value={form.referenceNumber} onChange={e=>update('referenceNumber',e.target.value)} placeholder="e.g. DL-APP-2026-0817"/>
        </label>
        <p className="fine">You don't need to enter Aadhaar, OTPs, passwords or bank details to lodge this grievance.</p>
        <div className="document"><b>{u?.category==='pension'?'Pension_Payment_Record_Example.pdf':'Service_Application_Record_Example.pdf'}</b><span>Example document — not uploaded to any government system.</span></div>
      </div>

      <div className="submission-section">
        <p className="eyebrow">05 · Before you submit</p>
        <div className="submit-checks">
          <span>✓ Your grievance summary is ready</span>
          <span>✓ Your details are synthetic</span>
          <span>✓ No information is sent to a government production system</span>
        </div>
      </div>
    </section>
    <button onClick={submit} disabled={loading || !form.fullName.trim() || !form.mobile.trim() || !form.email.trim() || !form.state.trim() || !form.district.trim() || !form.address.trim()}>
      {loading?'Registering your grievance…':'Submit grievance →'}
    </button>
  </main></>;
}
function Submitted(){const {id=''}=useParams();const {c}=useCitizen();if(!c)return <><Header/><main id="main-content" className="auth track-gate"><p className="eyebrow">Secure grievance confirmation</p><h1>Sign in to view your submission</h1><p>Your registration confirmation is private. Sign in to view the grievance you just registered.</p><SignInModal onSuccess={()=>window.location.reload()}/></main></>;const g=getGrievance(id);if(g&&g.citizenId!==c.id)return <><Header citizen={c.name}/><main id="main-content" className="guard"><p className="eyebrow">Private grievance</p><h1>We can't show that submission here.</h1><p>For your privacy, this grievance is available only to the citizen who registered it.</p><Link className="button" to="/track">Back to my grievances →</Link></main></>;return <><Header citizen={c.name}/><main id="main-content" className="confirmation"><div className="check">✓</div><p className="eyebrow">Submission complete</p><h1>Grievance submitted</h1><p>Your registration ID</p><h2>{id}</h2><p>Submitted {g?.submittedAt||formatEventDate()}<br/>Your grievance has been routed to the responsible service authority (simulated).<br/>Next step: review by the responsible grievance officer · Target response: 15 Sep 2026</p><p className="fine">This submission is shown with synthetic data. No information is sent to a government production system.</p><Link className="button" to={'/track/'+id}>Track my grievance →</Link></main></>}
function label(s:Status){return ({draft:'Draft',submitted:'Submitted',routed:'Routed to responsible authority',under_review:'Under review',clarification_required:'Additional information requested',clarification_submitted:'Information submitted',action_required:'Additional information requested',delayed:'Response taking longer than expected',resolved:'Resolved',feedback:'Feedback requested',appeal_available:'Appeal available',appeal_submitted:'Appeal submitted'} as Record<Status,string>)[s]}
function Track(){
  const {c}=useCitizen();
  if(!c) return <><Header/><main id="main-content" className="auth track-gate"><p className="eyebrow">Secure grievance tracking</p><h1>Sign in to see your grievances</h1><p>Your grievance history is private. Sign in to see all grievances registered to your account — no registration ID needed.</p><SignInModal onSuccess={()=>window.location.reload()}/><p className="fine">You can register for an account if you do not have one yet.</p></main></>;
  const gs=getGrievances().filter(g=>g.citizenId===c.id); const isPast=(g:Grievance)=>g.status==='feedback'&&typeof g.rating==='number'; const active=gs.filter(g=>!isPast(g)); const past=gs.filter(isPast); const card=(g:Grievance,pastCard=false)=><article className={'grievance-card '+(pastCard?'past-card':'')} key={g.id}><div><p className="eyebrow">{g.category}</p><h2>{g.title}</h2><p className="id">{g.id} · <b className={'status '+g.status}>{label(g.status)}</b></p><p className="fine">Latest: {g.events[g.events.length-1]?.detail}</p></div><Link className="button quiet" to={'/track/'+g.id}>{pastCard?'View details →':'View progress →'}</Link></article>; return <><Header citizen={c.name}/><main id="main-content" className="track-list"><div className="title-row"><div><p className="eyebrow">Grievance tracking</p><h1>Your grievances</h1><p>See every grievance linked to your account, its latest status and what you need to do next.</p></div><Link className="button" to="/start">Lodge a new grievance →</Link></div><section className="grievance-section"><p className="eyebrow">Active grievances</p>{active.length?<div className="grievance-list">{active.map(g=>card(g))}</div>:<section className="empty"><h2>No active grievances</h2><p>Start by describing the problem in everyday language.</p><Link className="button" to="/start">Describe a problem →</Link></section>}</section>{past.length>0&&<section className="grievance-section past-grievances"><p className="eyebrow">Past grievances</p><div className="grievance-list">{past.map(g=>card(g,true))}</div></section>}<div className="tracking-note"><b>Why no registration ID?</b><p>You can still use the ID from your confirmation, but signing in lets Sahaay show your complete grievance history without making you remember or copy a number.</p></div></main></>}
function Tracker(){const {id=''}=useParams();const {c}=useCitizen();const [g,setG]=useState(()=>getGrievance(id));if(!c)return <><Header/><main id="main-content" className="auth track-gate"><p className="eyebrow">Secure grievance tracking</p><h1>Sign in to view this grievance</h1><p>This grievance is available only to the signed-in citizen who registered it.</p><SignInModal onSuccess={()=>window.location.reload()}/></main></>;if(g&&g.citizenId!==c.id)return <><Header citizen={c.name}/><main id="main-content" className="guard"><p className="eyebrow">Private grievance</p><h1>We can't show that grievance here.</h1><p>For your privacy, you can only view grievances linked to your signed-in account.</p><Link className="button" to="/track">Back to my grievances →</Link></main></>;const [expanded,setExpanded]=useState<number|null>(2);const [appeal,setAppeal]=useState(false),[reason,setReason]=useState(''),[customReason,setCustomReason]=useState('');const [resolutionChoice,setResolutionChoice]=useState<'yes'|'no'|''>('');const [rating,setRating]=useState(0);const update=(next:Grievance)=>{updateGrievance(next);setG(next)}; if(!g)return <Navigate to="/track"/>;
  const authority=authorityFor(g.submission?.state,g.submission?.district,g.authority)
  const clarification=()=>update({...g,status:'under_review',events:g.events.map(x=>x.title==='Information needed'?{...x,title:'Clarification submitted',date:formatEventDate(),detail:'Your document was added to the review.',action:'Nothing right now.',state:'done'}:x)});
  const reminder=()=>update({...g,status:'under_review',events:[...g.events,{title:'Reminder sent',date:formatEventDate(),detail:'You asked the department for an update because the usual target passed.',action:'Nothing else is needed right now.',state:'current'}]});
  const resolve=()=>update({...g,status:'resolved',events:[...g.events,{title:'Resolution received',date:formatEventDate(),detail:`The responsible authority has provided a simulated response for your ${g.title.toLowerCase()}.`,action:'Tell us whether this solved your problem.',state:'current'}]});
  const submitAppeal=()=>{
    const appealId=`AP-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const finalReason=reason==='Other'?customReason.trim():reason;
    if(!finalReason)return;
    const next={...g,status:'appeal_submitted' as Status,appealId,events:[...g.events,{title:'Appeal submitted',date:formatEventDate(),detail:`Appeal ${appealId} was sent to ${authority.escalationRole}. Reason: ${finalReason}.`,action:'Nothing needed right now. The appellate authority will review your appeal.',state:'done' as const},{title:'Appeal under review',date:formatEventDate(),detail:`The appeal is with ${authority.escalationName}, ${authority.escalationRole}.`,action:'We will show the outcome here when a response is recorded.',state:'current' as const},{title:'Appeal outcome',date:'Waiting',detail:'The appeal outcome will appear here after authority review.',action:'No action is required until an outcome is recorded.',state:'upcoming' as const}],appealReason:finalReason};
    update(next);setAppeal(false);setReason('');setCustomReason('');
  };
  return <><Header/><main id="main-content" className="tracker"><p className="eyebrow">Your grievance</p><h1>{g.title}</h1><p className="id">{g.id} · <b className={'status '+g.status}>{label(g.status)}</b></p>
  <section className="authority-card"><div><p className="eyebrow">Who is handling this?</p><h2>{authority.name}</h2><p className="authority-role">{authority.role} · {authority.department}</p><p>{authority.office}</p><div className="authority-grid"><div><b>Contact</b><a href={`tel:${authority.phone.replace(/\s/g,'')}`}>{authority.phone}</a><a href={`mailto:${authority.email}`}>{authority.email}</a></div><div><b>Expected response</b><span>{authority.responseWindow}</span><b>Escalation</b><span>{authority.escalationRole}</span></div></div><p className="authority-source"><span>{authority.synthetic?'Demo directory · synthetic contact':'Verified government directory'}</span> · <a href={authority.sourceUrl} target="_blank" rel="noreferrer">Source</a></p></div></section>
  <div className="timeline">{g.events.map((e,i)=><article className={'event '+e.state} key={i}><button onClick={()=>setExpanded(expanded===i?null:i)}><span className="dot">{e.state==='done'?'✓':e.state==='attention'?'!':'●'}</span><div><h2>{e.title}</h2><p>{e.date}</p></div><span>{expanded===i?'−':'+'}</span></button>{expanded===i&&<div className="event-detail"><p><b>What’s happening:</b><br/>{e.detail}</p><p><b>What you need to do:</b><br/>{e.action}</p></div>}</article>)}</div>
  {g.status==='action_required'&&<section className="action-box"><h2>The department needs information</h2><p>Upload your synthetic payment record to continue.</p><button onClick={clarification}>Provide information →</button></section>}
  {g.status==='under_review'&&<section className="demo-controls"><button className="quiet" onClick={()=>update({...g,status:'delayed'})}>My response is being delayed</button><button onClick={resolve}>Resolved?</button></section>}
  {g.status==='delayed'&&<section className="action-box"><h2>Response taking longer than expected</h2><p>The usual response target has passed. You can ask the department for an update.</p><button onClick={reminder}>Send a reminder →</button></section>}
  {g.status==='resolved'&&!appeal&&<section className="feedback"><h2>Resolved?</h2><p className="fine">Has the resolution solved your problem?</p>{!resolutionChoice&&<div className="feedback-actions"><button onClick={()=>setResolutionChoice('yes')}>Yes</button><button onClick={()=>{setResolutionChoice('no');setAppeal(true)}}>No</button></div>}{resolutionChoice==='yes'&&<div className="rating-box"><h3>How would you rate the resolution?</h3><div className="star-rating" role="radiogroup" aria-label="Rate the resolution from 1 to 5 stars">{[1,2,3,4,5].map(n=><button key={n} type="button" className={n<=rating?'selected':''} onClick={()=>setRating(n)} aria-label={`${n} star${n>1?'s':''}`}>{n<=rating?'★':'☆'}</button>)}</div><button disabled={!rating} onClick={()=>update({...g,status:'feedback',feedback:'Resolved',rating,submittedAt:g.submittedAt||new Date().toISOString(),events:[...g.events,{title:'Feedback received',date:formatEventDate(),detail:`You rated the resolution ${rating} out of 5 stars.`,action:'No further action is needed.',state:'current'}]})}>Submit rating →</button></div>}</section>}
  {g.status==='feedback'&&<section className="feedback feedback-success"><div className="feedback-check">✓</div><div><p className="eyebrow">Feedback recorded</p><h2>Thanks for letting us know.</h2><p>{g.feedback==='Partially'?'We’ve recorded that the resolution only partly solved the issue. You can continue with the responsible service if anything remains unresolved.':'We’ve recorded that the resolution solved the problem.'}</p><Link className="button quiet" to="/dashboard">Back to my grievances →</Link></div></section>}
  {appeal&&<section className="appeal"><p className="eyebrow">No, my problem still remains</p><h2>Request a review of this resolution</h2><p>An appeal is a request for the resolution to be reviewed by the next responsible authority.</p><div className="escalation-note"><b>Escalation authority</b><span>{authority.escalationName} · {authority.escalationRole}</span><span>{authority.escalationOffice}</span></div><label>Why are you dissatisfied?<select value={reason} onChange={e=>{setReason(e.target.value);if(e.target.value!=='Other')setCustomReason('')}}><option value="">Choose a reason</option><option>Problem still unresolved</option><option>Response did not address my complaint</option><option>Incorrect information</option><option>Other</option></select></label>{reason==='Other'&&<label className="appeal-custom-reason">Tell us what happened<textarea value={customReason} onChange={e=>setCustomReason(e.target.value)} placeholder="Describe why the resolution did not solve your problem…" rows={5} required/></label>}<button disabled={!reason||(reason==='Other'&&!customReason.trim())} onClick={submitAppeal}>Submit appeal →</button></section>}
  {g.status==='appeal_submitted'&&<section className="action-box appeal-success"><p className="eyebrow">Appeal submitted</p><h2>Your appeal is now in the review queue.</h2><p><b>Appeal ID:</b> {g.appealId}</p><div className="appeal-contact"><b>Next contact point</b><strong>{authority.escalationName}</strong><span>{authority.escalationRole}</span><span>{authority.escalationOffice}</span><a href={`tel:${(authority.escalationPhone||authority.phone).replace(/\s/g,'')}`}>{authority.escalationPhone||authority.phone}</a><a href={`mailto:${authority.escalationEmail||authority.email}`}>{authority.escalationEmail||authority.email}</a></div><p>Keep your Appeal ID for reference when contacting the appellate authority. You do not need to submit another appeal for the same issue.</p><div className="action-actions"><Link className="button" to="/track">View my grievances →</Link><Link className="button quiet" to="/dashboard">Back to my account</Link></div></section>}
  </main></>}
function About(){return <><Header/><main id="main-content" className="about"><p className="eyebrow">About this service</p><h1>A citizen-friendly interpretation layer for grievance systems.</h1><p className="lead">Sahaay is a citizen-guidance experience inspired by CPGRAMS. It is designed to make the grievance journey easier to understand—not to replace the government system behind it.</p><section><h2>Honest by design</h2><p>Government submissions, identity checks, routing, documents and notifications use synthetic data here. No real government account or production system is connected.</p></section><section><h2>How it could safely scale</h2><div className="architecture"><b>Citizen experience</b><span>↓</span><b>AI interpretation</b><span>↓</span><b>Deterministic policy & routing</b><span>↓</span><b>Secure government systems</b><span>↓</span><b>Audit & security</b></div><p><b>AI proposes. Rules validate. Government systems execute.</b> A future language model may translate everyday wording into a structured proposal, but it must never make independent eligibility or irreversible government decisions.</p></section></main></>}
function HowItWorks(){return <><Header/><main id="main-content" className="content-page"><div className="breadcrumb">Home <span>/</span> How Sahaay works</div><p className="eyebrow">How it works</p><h1>One clear path from problem to progress</h1><p className="lead">Sahaay turns an unfamiliar government process into a sequence of clear decisions — what happened, where it belongs, what happens next, and what you can do if it stalls.</p><div className="how-highlights"><div><b>Start with your problem</b><span>No department knowledge required</span></div><div><b>Know where it goes</b><span>Service, jurisdiction and authority</span></div><div><b>Know what happens next</b><span>Updates, escalation and appeal</span></div></div><div className="process-list">{[['1','Describe your issue','Use everyday language. We only ask non-sensitive questions that help identify a suitable grievance path.'],['2','Review the suggested path','Sahaay explains the likely category, the information to prepare and what happens next.'],['3','Submit securely','In a production service, you would review details before a secure government submission. This service records the step with synthetic data.'],['4','Stay informed','Track each stage, see who is reviewing the case, and know whether any action is needed.'],['5','Give feedback or appeal','Tell us if the response solved the problem. If eligible, request a review of an unsatisfactory resolution.']].map(x=><section key={x[0]}><span>{x[0]}</span><div><h2>{x[1]}</h2><p>{x[2]}</p></div></section>)}</div></main><Footer/></>}
function Help(){return <><Header/><main id="main-content" className="content-page"><div className="breadcrumb">Home <span>/</span> Help & FAQs</div><p className="eyebrow">Help centre</p><h1>Help with your grievance journey</h1><p className="lead">Plain-language answers about submitting, tracking and responding to a grievance.</p><div className="help-grid"><section><h2>Common questions</h2>{['What is a grievance?','What does “responsible grievance officer” mean?','What is a clarification?','What is a reminder?','What is an appeal?'].map((x,i)=><details key={x}><summary>{x}<span>+</span></summary><p>{['A complaint about a problem with a public service.','The officer designated to handle grievances for the relevant organisation.','Additional information requested by the department.','A request for an update when your grievance has been pending longer than expected.','A request to review a resolution you are not satisfied with.'][i]}</p></details>)}</section><aside className="support-panel"><h2>Ready to begin?</h2><p>Describe the problem in your own words. You do not need to know where it should be routed.</p><Link className="button" to="/start">Lodge a grievance →</Link><hr/><p className="fine">Never share Aadhaar, OTPs, passwords or bank details in guidance.</p></aside></div></main><Footer/></>}
function App(){return <Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="/profile" element={<Profile/>}/><Route path="/start" element={<ConversationJourney/>}/><Route path="/submit" element={<Submit/>}/><Route path="/submitted/:id" element={<Submitted/>}/><Route path="/track" element={<Track/>}/><Route path="/track/:id" element={<Tracker/>}/><Route path="/about" element={<About/>}/><Route path="/how-it-works" element={<HowItWorks/>}/><Route path="/help" element={<Help/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>};createRoot(document.getElementById('root')!).render(<BrowserRouter><App/></BrowserRouter>)
