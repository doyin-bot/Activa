import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, BarChart3, BookOpen, Brain, Check, ChevronDown, Clock3, Flame, Menu, Moon, Play, Sparkles, Trophy, Users, Zap} from 'lucide-react';
import './styles.css';

const features=[
  {icon:<Zap/>,title:'Turn WhatsApp messages into participation',copy:'Post the link where your community already talks. Activa handles the activity, scores and results.'},
  {icon:<Sparkles/>,title:'Create activities in minutes',copy:'Build a quiz yourself or start with an AI-generated draft you can review and refine.'},
  {icon:<BarChart3/>,title:'See who participated',copy:'Understand engagement with clear results, completion rates and a live leaderboard.'},
  {icon:<Users/>,title:'One account, every community',copy:'Switch between every community you belong to, without juggling accounts.'}
];

function Logo(){return <a className="logo" href="#"><span className="logoMark">A</span><span>Activa</span></a>}
function App(){
 const [dark,setDark]=useState(false); const [menu,setMenu]=useState(false);
 return <div className={dark?'app dark':'app'}>
  <header><div className="nav"><Logo/><nav className={menu?'open':''}><a href="#how">How it works</a><a href="#features">Features</a><a href="#community">For communities</a><a href="#login">Sign in</a><a className="navCta" href="#start">Get started <ArrowRight size={16}/></a></nav><div className="navTools"><button aria-label="Toggle theme" className="iconBtn" onClick={()=>setDark(!dark)}><Moon size={19}/></button><button aria-label="Menu" className="iconBtn menu" onClick={()=>setMenu(!menu)}><Menu size={21}/></button></div></div></header>
  <main>
   <section className="hero"><div className="orb one"/><div className="orb two"/><div className="heroCopy"><div className="eyebrow"><span/><b>WHERE COMMUNITIES COME ALIVE</b></div><h1>Your community already has a place to talk.<br/><em>Now give them a place to play.</em></h1><p>Activa helps communities create quizzes, challenges and activities members can actually participate in, with scores and leaderboards built in.</p><div className="heroActions"><a className="primary" href="#start">Create a community <ArrowRight/></a><a className="secondary" href="#demo"><Play fill="currentColor"/> Explore Activa</a></div><div className="trust"><div className="avatars"><i>AM</i><i>JO</i><i>SK</i><i>+2k</i></div><span><b>Built for real communities</b><small>Churches, clubs, cohorts & groups</small></span></div></div>
    <Phone/>
   </section>
   <section className="position" id="how"><p>KEEP THE CONVERSATION. ADD THE PARTICIPATION.</p><h2>Keep your community where they already talk.<br/><span>Use Activa for what they can't easily do there.</span></h2><div className="flow"><div><span className="wa">W</span><b>Share on WhatsApp</b><small>Drop one simple link</small></div><ArrowRight/><div><span className="act">A</span><b>Play on Activa</b><small>Quiz, challenge, complete</small></div><ArrowRight/><div><span className="win"><Trophy/></span><b>Celebrate together</b><small>Scores, streaks & ranks</small></div></div></section>
   <section className="features" id="features"><div className="sectionHead"><span>MADE FOR MOMENTUM</span><h2>Participation, made simple.</h2><p>No new group chat. No complicated setup. Just meaningful activities your members will want to join.</p></div><div className="featureGrid">{features.map((x,i)=><article key={x.title} className={'f'+i}><div>{x.icon}</div><h3>{x.title}</h3><p>{x.copy}</p><a href="#start">Learn more <ArrowRight size={16}/></a></article>)}</div></section>
   <section className="cta" id="start"><div><span>READY TO BRING THE ENERGY?</span><h2>Create your first community.</h2><p>Start free. Create something your community can play today.</p></div><a className="whiteButton" href="#signup">Get started free <ArrowRight/></a></section>
  </main><footer><Logo/><p>© 2026 Activa. Where communities come alive.</p><div><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div></footer>
 </div>
}

function Phone(){return <div className="phoneWrap" id="demo"><div className="floatCard fc1"><Users/><span><b>38 playing now</b><small>Your community is active</small></span></div><div className="floatCard fc2"><Flame/><span><b>7 day streak!</b><small>Keep it going</small></span></div><div className="phone"><div className="speaker"/><div className="phoneHead"><span><b>Good morning, Ada 👋</b><small>PSF — Lagos Province 76 <ChevronDown/></small></span><i>AO</i></div><div className="todayLabel"><span>TODAY'S CHALLENGE</span><i>LIVE</i></div><div className="challenge"><div className="challengeIcon"><Brain/></div><div className="pills"><b>⚡ LIVE QUIZ</b><span>38 PLAYING</span></div><h3>Bible Speed<br/>Challenge</h3><p>How well do you know the book of Acts? Ready, set, go!</p><div className="stats"><span><Brain/><b>15</b><small>QUESTIONS</small></span><span><Clock3/><b>05:00</b><small>TIME</small></span><span><Trophy/><b>100</b><small>POINTS</small></span></div><button><Play fill="currentColor"/> PLAY NOW</button></div><div className="progressTitle"><b>YOUR PROGRESS</b><small>View all</small></div><div className="miniStats"><span><Trophy/><b>840</b><small>Points</small></span><span><Flame/><b>7</b><small>Day streak</small></span><span><BarChart3/><b>#4</b><small>Your rank</small></span></div><div className="phoneNav"><span><Zap/><b>Home</b></span><span><BookOpen/><b>Activities</b></span><span><Trophy/><b>Leaders</b></span><span><i>AO</i><b>Profile</b></span></div></div></div>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'));
