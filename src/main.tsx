import React, {FormEvent, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, BarChart3, BookOpen, Brain, ChevronDown, Clock3, Flame, Menu, Moon, Play, Sparkles, Trophy, Users, Zap} from 'lucide-react';
import {backendConfigured, supabase} from './supabase';
import './styles.css';

const features=[
  {icon:<Zap/>,title:'Turn WhatsApp messages into participation',copy:'Post the link where your community already talks. Activa handles the activity, scores and results.'},
  {icon:<Sparkles/>,title:'Create activities in minutes',copy:'Build a quiz yourself or start with an AI-generated draft you can review and refine.'},
  {icon:<BarChart3/>,title:'See who participated',copy:'Understand engagement with clear results, completion rates and a live leaderboard.'},
  {icon:<Users/>,title:'One account, every community',copy:'Switch between every community you belong to, without juggling accounts.'}
];

type View='home'|'signin'|'signup'|'dashboard';

function Logo({goHome}:{goHome:()=>void}){return <button className="logo logoButton" onClick={goHome}><span className="logoMark">A</span><span>Activa</span></button>}

function App(){
 const [dark,setDark]=useState(false);
 const [menu,setMenu]=useState(false);
 const [view,setView]=useState<View>('home');
 const [userEmail,setUserEmail]=useState<string|null>(null);

 useEffect(()=>{
  if(!supabase) return;
  supabase.auth.getSession().then(({data})=>{
   if(data.session?.user.email){
    setUserEmail(data.session.user.email);
    setView('dashboard');
   }
  });
  const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{
   setUserEmail(session?.user.email ?? null);
  });
  return ()=>listener.subscription.unsubscribe();
 },[]);

 const go=(next:View)=>{setView(next);setMenu(false);window.scrollTo({top:0,behavior:'smooth'});};

 if(view==='signin') return <AuthPage mode="signin" dark={dark} onTheme={()=>setDark(!dark)} onHome={()=>go('home')} onSwitch={()=>go('signup')} onSuccess={(email)=>{setUserEmail(email);go('dashboard')}}/>;
 if(view==='signup') return <AuthPage mode="signup" dark={dark} onTheme={()=>setDark(!dark)} onHome={()=>go('home')} onSwitch={()=>go('signin')} onSuccess={(email)=>{setUserEmail(email);go('dashboard')}}/>;
 if(view==='dashboard') return <Dashboard dark={dark} email={userEmail} onTheme={()=>setDark(!dark)} onHome={()=>go('home')} onSignOut={async()=>{if(supabase) await supabase.auth.signOut();setUserEmail(null);go('home')}}/>;

 return <div className={dark?'app dark':'app'}>
  <header><div className="nav"><Logo goHome={()=>go('home')}/><nav className={menu?'open':''}><a href="#how" onClick={()=>setMenu(false)}>How it works</a><a href="#features" onClick={()=>setMenu(false)}>Features</a><a href="#community" onClick={()=>setMenu(false)}>For communities</a><button className="navLink" onClick={()=>go('signin')}>Sign in</button><button className="navCta navButton" onClick={()=>go('signup')}>Get started <ArrowRight size={16}/></button></nav><div className="navTools"><button aria-label="Toggle theme" className="iconBtn" onClick={()=>setDark(!dark)}><Moon size={19}/></button><button aria-label="Menu" className="iconBtn menu" onClick={()=>setMenu(!menu)}><Menu size={21}/></button></div></div></header>
  <main>
   <section className="hero"><div className="orb one"/><div className="orb two"/><div className="heroCopy"><div className="eyebrow"><span/><b>WHERE COMMUNITIES COME ALIVE</b></div><h1>Your community already has a place to talk.<br/><em>Now give them a place to play.</em></h1><p>Activa helps communities create quizzes, challenges and activities members can actually participate in, with scores and leaderboards built in.</p><div className="heroActions"><button className="primary actionButton" onClick={()=>go('signup')}>Create a community <ArrowRight/></button><a className="secondary" href="#demo"><Play fill="currentColor"/> Explore Activa</a></div><div className="trust"><div className="avatars"><i>AM</i><i>JO</i><i>SK</i><i>+2k</i></div><span><b>Built for real communities</b><small>Churches, clubs, cohorts & groups</small></span></div></div>
    <Phone onPlay={()=>go('signup')}/>
   </section>
   <section className="position" id="how"><p>KEEP THE CONVERSATION. ADD THE PARTICIPATION.</p><h2>Keep your community where they already talk.<br/><span>Use Activa for what they can't easily do there.</span></h2><div className="flow"><div><span className="wa">W</span><b>Share on WhatsApp</b><small>Drop one simple link</small></div><ArrowRight/><div><span className="act">A</span><b>Play on Activa</b><small>Quiz, challenge, complete</small></div><ArrowRight/><div><span className="win"><Trophy/></span><b>Celebrate together</b><small>Scores, streaks & ranks</small></div></div></section>
   <section className="features" id="features"><div className="sectionHead"><span>MADE FOR MOMENTUM</span><h2>Participation, made simple.</h2><p>No new group chat. No complicated setup. Just meaningful activities your members will want to join.</p></div><div className="featureGrid">{features.map((x,i)=><article key={x.title} className={'f'+i}><div>{x.icon}</div><h3>{x.title}</h3><p>{x.copy}</p><button className="learnButton" onClick={()=>go('signup')}>Get started <ArrowRight size={16}/></button></article>)}</div></section>
   <section className="cta" id="start"><div><span>READY TO BRING THE ENERGY?</span><h2>Create your first community.</h2><p>Start free. Create something your community can play today.</p></div><button className="whiteButton actionButton" onClick={()=>go('signup')}>Get started free <ArrowRight/></button></section>
  </main><footer><Logo goHome={()=>go('home')}/><p>© 2026 Activa. Where communities come alive.</p><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></footer>
 </div>
}

function AuthPage({mode,dark,onTheme,onHome,onSwitch,onSuccess}:{mode:'signin'|'signup';dark:boolean;onTheme:()=>void;onHome:()=>void;onSwitch:()=>void;onSuccess:(email:string)=>void}){
 const [name,setName]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');

 async function submit(e:FormEvent){
  e.preventDefault();
  setError(''); setMessage('');
  if(!supabase){
   setError('The Activa backend is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a local .env file, then restart the dev server.');
   return;
  }
  setBusy(true);
  try{
   if(mode==='signup'){
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name||email.split('@')[0]}}});
    if(error) throw error;
    if(data.session) onSuccess(data.user?.email ?? email);
    else setMessage('Account created. Check your email for the confirmation link, then sign in.');
   }else{
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    onSuccess(data.user.email ?? email);
   }
  }catch(err){
   setError(err instanceof Error?err.message:'Something went wrong. Please try again.');
  }finally{setBusy(false)}
 }

 return <div className={dark?'app dark authApp':'app authApp'}>
  <header><div className="nav"><Logo goHome={onHome}/><div className="authNavActions"><button className="iconBtn" onClick={onTheme}><Moon size={19}/></button><button className="navLink" onClick={onHome}>Back to home</button></div></div></header>
  <main className="authMain">
   <section className="authCard">
    <div className="authBadge">{mode==='signup'?'CREATE YOUR ACTIVA ACCOUNT':'WELCOME BACK'}</div>
    <h1>{mode==='signup'?'Bring your community to life.':'Sign in to Activa.'}</h1>
    <p>{mode==='signup'?'Create activities, share them on WhatsApp and see your community climb the leaderboard.':'Continue managing your communities, activities and results.'}</p>
    {!backendConfigured&&<div className="backendNotice"><b>Backend setup required</b><span>The screen is working, but Supabase credentials have not been added to this local app yet.</span></div>}
    <form onSubmit={submit}>
     {mode==='signup'&&<label>Display name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ada Okafor" required/></label>}
     <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
     <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required/></label>
     {error&&<div className="formError">{error}</div>}
     {message&&<div className="formSuccess">{message}</div>}
     <button className="primary authSubmit" disabled={busy}>{busy?'Please wait...':mode==='signup'?'Create account':'Sign in'} <ArrowRight size={18}/></button>
    </form>
    <div className="authSwitch">{mode==='signup'?'Already have an account?':'New to Activa?'} <button onClick={onSwitch}>{mode==='signup'?'Sign in':'Create an account'}</button></div>
   </section>
   <aside className="authStory"><div><span>ACTIVA</span><h2>Talk on WhatsApp.<br/>Play on Activa.</h2><p>One link turns a group conversation into a challenge, quiz or community activity.</p></div></aside>
  </main>
 </div>
}

function Dashboard({dark,email,onTheme,onHome,onSignOut}:{dark:boolean;email:string|null;onTheme:()=>void;onHome:()=>void;onSignOut:()=>void}){
 return <div className={dark?'app dark dashboardApp':'app dashboardApp'}>
  <header><div className="nav"><Logo goHome={onHome}/><div className="authNavActions"><button className="iconBtn" onClick={onTheme}><Moon size={19}/></button><span className="userChip">{email??'Activa member'}</span><button className="navLink" onClick={onSignOut}>Sign out</button></div></div></header>
  <main className="dashboardMain">
   <div className="dashboardIntro"><span>YOUR ACTIVA SPACE</span><h1>Ready to make something people can play?</h1><p>This is the beginning of the signed-in application. Community creation, quiz building, sharing, results and leaderboards will connect here next.</p></div>
   <div className="dashboardGrid">
    <article><Users/><h3>Create a community</h3><p>Set up a home for your WhatsApp group, church, club, cohort or team.</p><button disabled={!backendConfigured}>Create community</button></article>
    <article><Brain/><h3>Create an activity</h3><p>Build a quiz or challenge, publish it and share one simple link.</p><button disabled>Create activity</button></article>
    <article><Trophy/><h3>Leaderboard</h3><p>See points, ranks and participation after members complete activities.</p><button disabled>View leaderboard</button></article>
   </div>
  </main>
 </div>
}

function Phone({onPlay}:{onPlay:()=>void}){return <div className="phoneWrap" id="demo"><div className="floatCard fc1"><Users/><span><b>38 playing now</b><small>Your community is active</small></span></div><div className="floatCard fc2"><Flame/><span><b>7 day streak!</b><small>Keep it going</small></span></div><div className="phone"><div className="speaker"/><div className="phoneHead"><span><b>Good morning, Ada 👋</b><small>PSF — Lagos Province 76 <ChevronDown/></small></span><i>AO</i></div><div className="todayLabel"><span>TODAY'S CHALLENGE</span><i>LIVE</i></div><div className="challenge"><div className="challengeIcon"><Brain/></div><div className="pills"><b>⚡ LIVE QUIZ</b><span>38 PLAYING</span></div><h3>Bible Speed<br/>Challenge</h3><p>How well do you know the book of Acts? Ready, set, go!</p><div className="stats"><span><Brain/><b>15</b><small>QUESTIONS</small></span><span><Clock3/><b>05:00</b><small>TIME</small></span><span><Trophy/><b>100</b><small>POINTS</small></span></div><button onClick={onPlay}><Play fill="currentColor"/> PLAY NOW</button></div><div className="progressTitle"><b>YOUR PROGRESS</b><small>View all</small></div><div className="miniStats"><span><Trophy/><b>840</b><small>Points</small></span><span><Flame/><b>7</b><small>Day streak</small></span><span><BarChart3/><b>#4</b><small>Your rank</small></span></div><div className="phoneNav"><span><Zap/><b>Home</b></span><span><BookOpen/><b>Activities</b></span><span><Trophy/><b>Leaders</b></span><span><i>AO</i><b>Profile</b></span></div></div></div>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'));
