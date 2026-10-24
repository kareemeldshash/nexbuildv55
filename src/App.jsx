import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownUp, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown, Code2, Cpu, ExternalLink, Eye, FileText, Filter, Github, Heart, Layers3, LogIn, LogOut, Mail, Menu, MessageCircle, Plus, Search, Settings2, ShieldCheck, Sparkles, Star, Trophy, UserRound, Users, Wrench, X, Zap } from 'lucide-react'
import { configured, supabase } from './lib/supabase.js'

const CATEGORIES = ['All projects','Robotics','Mechanical','Electrical','Software','Civil','AI & Data','Sustainability']
const STATUSES = ['Idea','In progress','Prototype','Completed']
const EXAMPLES = [
  {id:'example-1',title:'Luma — autonomous rover',description:'A palm-sized rover that maps a room, avoids obstacles, and finds its way home.',category:'Robotics',tags:['ROS 2','SLAM','Python'],status:'Prototype',owner_id:'example-a',owner:{full_name:'Maya Chen',username:'mayabuilds'},likes:128,created_at:'2026-10-17',repo_url:'https://github.com',demo:true},
  {id:'example-2',title:'SunTrace energy dashboard',description:'A clear dashboard for understanding solar generation, storage, and household energy use.',category:'Sustainability',tags:['React','Energy','Data'],status:'Completed',owner_id:'example-b',owner:{full_name:'Sofia Reyes',username:'sofia.engineers'},likes:94,created_at:'2026-10-15',repo_url:'https://github.com',demo:true},
  {id:'example-3',title:'Open-source irrigation node',description:'An affordable sensor node that uses soil moisture readings to reduce unnecessary watering.',category:'Electrical',tags:['ESP32','IoT','PCB'],status:'In progress',owner_id:'example-c',owner:{full_name:'Omar Hassan',username:'omar.hassan'},likes:76,created_at:'2026-10-12',repo_url:'https://github.com',demo:true},
  {id:'example-4',title:'Modular desk lamp',description:'A repairable desk lamp built from printed parts, standard fasteners, and a low-voltage circuit.',category:'Mechanical',tags:['CAD','3D printing','Design'],status:'Completed',owner_id:'example-d',owner:{full_name:'Daniel Park',username:'dparkdesigns'},likes:61,created_at:'2026-10-08',repo_url:'https://github.com',demo:true},
  {id:'example-5',title:'BearingBuddy predictive maintenance',description:'An experimental model that spots early bearing wear from vibration readings.',category:'AI & Data',tags:['Python','ML','Signal processing'],status:'Prototype',owner_id:'example-e',owner:{full_name:'Nour El-Sayed',username:'nour.codes'},likes:88,created_at:'2026-10-05',repo_url:'https://github.com',demo:true},
  {id:'example-6',title:'GripperLab open hardware',description:'Low-cost gripper experiments with printable parts, build notes, and repeatable tests.',category:'Robotics',tags:['Open hardware','CAD','Arduino'],status:'Completed',owner_id:'example-a',owner:{full_name:'Maya Chen',username:'mayabuilds'},likes:53,created_at:'2026-09-28',repo_url:'https://github.com',demo:true},
]
const iconFor = (cat) => ({Robotics:Cpu,Mechanical:Wrench,Electrical:Zap,Software:Code2,'AI & Data':Sparkles,Civil:Layers3,Sustainability:Activity}[cat] || Cpu)
const initials = (name='Builder') => name.split(/\s+/).slice(0,2).map(x=>x[0] || '').join('').toUpperCase()
const safeUrl = (url='') => { try { const u = new URL(url); return ['https:','http:'].includes(u.protocol) ? u.href : '' } catch { return '' } }
function Avatar({profile,size=''}) { return <span className={'avatar '+size}>{safeUrl(profile?.avatar_url) ? <img src={safeUrl(profile.avatar_url)} alt="" /> : initials(profile?.full_name || profile?.username)}</span> }
function Art({project}) { const Icon = iconFor(project.category); return <div className={'project-art art-'+String(project.category || 'engineering').toLowerCase().replace(/[^a-z0-9]+/g,'-')}><span className="art-index">F / {String(project.id).slice(0,4).toUpperCase()}</span><div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="art-icon"><Icon size={46} strokeWidth={1.3}/></div><span className="art-equation">BUILD / TEST / REPEAT</span><span className="art-label">{project.category || 'Engineering'}</span></div> }
function Button({children,variant='primary',...props}) { return <button className={'btn btn-'+variant} {...props}>{children}</button> }

export default function App() {
  const [user,setUser] = useState(null), [profile,setProfile] = useState(null)
  const [profiles,setProfiles] = useState([]), [projects,setProjects] = useState([])
  const [likes,setLikes] = useState([]), [bookmarks,setBookmarks] = useState([])
  const [query,setQuery] = useState(''), [category,setCategory] = useState('All projects'), [sort,setSort] = useState('recent')
  const [page,setPage] = useState('Discover'), [authMode,setAuthMode] = useState(''), [modal,setModal] = useState('')
  const [notice,setNotice] = useState(''), [busy,setBusy] = useState(false)
  const [authForm,setAuthForm] = useState({name:'',email:'',password:''})
  const [projectForm,setProjectForm] = useState({title:'',description:'',category:'Robotics',status:'In progress',tags:'',repo_url:'',demo_url:''})
  const [profileForm,setProfileForm] = useState({full_name:'',username:'',headline:'',bio:'',university:'',location:'',skills:'',github_url:'',linkedin_url:'',website_url:''})
  const [editingProject,setEditingProject] = useState(null)

  const toast = (message) => { setNotice(message); window.setTimeout(()=>setNotice(''),3500) }
  const loadData = useCallback(async (activeUser) => {
    if (!supabase) { setProjects(EXAMPLES); setProfiles(EXAMPLES.slice(0,5).map(p=>({...p.owner,id:p.owner_id,skills:['Engineering','Prototyping']}))); return }
    const [pRes,prRes,lRes,fRes,bRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(100),
      supabase.from('projects').select('*').eq('visibility',true).order('updated_at',{ascending:false}).limit(100),
      supabase.from('project_likes').select('project_id,user_id'),
      supabase.from('follows').select('follower_id,following_id'),
      activeUser ? supabase.from('project_bookmarks').select('project_id').eq('user_id',activeUser.id) : Promise.resolve({data:[]})
    ])
    if (pRes.error || prRes.error) { setProjects([]); if (pRes.error?.code !== 'PGRST205' && prRes.error?.code !== 'PGRST205') toast('Could not load marketplace. Check that supabase/schema.sql has been applied.'); return }
    const people = pRes.data || []; const peopleMap = Object.fromEntries(people.map(p=>[p.id,p]))
    const likeRows = lRes.data || []; const followRows = fRes.data || []
    setProfiles(people.map(p=>({...p,projectCount:(prRes.data||[]).filter(x=>x.owner_id===p.id).length,likesReceived:likeRows.filter(l=>(prRes.data||[]).some(x=>x.id===l.project_id && x.owner_id===p.id)).length,followers:followRows.filter(f=>f.following_id===p.id).length})))
    setProjects((prRes.data||[]).map(p=>({...p,owner:peopleMap[p.owner_id] || {full_name:'Engineer',username:'builder'},likes:likeRows.filter(l=>l.project_id===p.id).length,liked:likeRows.some(l=>l.project_id===p.id && l.user_id===activeUser?.id)})))
    setLikes(likeRows.filter(l=>l.user_id===activeUser?.id).map(l=>l.project_id))
    setBookmarks((bRes.data||[]).map(x=>x.project_id))
  },[])
  useEffect(()=>{
    if (!supabase) { loadData(null); return }
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user || null); loadData(data.session?.user || null)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{const u=session?.user || null;if(_event==='PASSWORD_RECOVERY')setAuthMode('new-password');setUser(u);setTimeout(()=>loadData(u),0)})
    return ()=>subscription.unsubscribe()
  },[loadData])
  useEffect(()=>{ if(user && !profile) { supabase?.from('profiles').select('*').eq('id',user.id).maybeSingle().then(({data})=>{if(data){setProfile(data);setProfileForm({...data,skills:(data.skills||[]).join(', ')})}}) } },[user,profile])

  const visibleProjects = useMemo(()=>{
    const needle=query.toLowerCase().trim()
    let result=projects.filter(p=>(category==='All projects'||p.category===category) && (!needle || [p.title,p.description,p.category,(p.tags||[]).join(' '),p.owner?.full_name,p.owner?.username].join(' ').toLowerCase().includes(needle)) && (page!=='Saved' || bookmarks.includes(p.id)))
    if(sort==='popular') result.sort((a,b)=>(b.likes||0)-(a.likes||0))
    else if(sort==='alphabetical') result.sort((a,b)=>a.title.localeCompare(b.title))
    else result.sort((a,b)=>new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at))
    return result
  },[projects,category,query,sort,page,bookmarks])
  const ranked = useMemo(()=>[...profiles].sort((a,b)=>(b.projectCount||0)*50+(b.likesReceived||0)*3+(b.followers||0)*2-((a.projectCount||0)*50+(a.likesReceived||0)*3+(a.followers||0)*2)).slice(0,8),[profiles])
  const requireAccount = () => { if(!user){setAuthMode('signin');return false} return true }

  async function handleAuth(e) {
    e.preventDefault(); if(!supabase){toast('Add your Supabase URL and public anon key first.');return}
    setBusy(true)
    try {
      if(authMode==='signup') {
        const {data,error}=await supabase.auth.signUp({email:authForm.email,password:authForm.password,options:{data:{full_name:authForm.name},emailRedirectTo:window.location.origin}})
        if(error) throw error
        if(!data.session) toast('Account created. Check your email to verify it, then sign in.')
        else toast('Welcome to Forge!')
        setAuthMode('')
      } else if(authMode==='reset') {
        const {error}=await supabase.auth.resetPasswordForEmail(authForm.email,{redirectTo:window.location.origin})
        if(error) throw error
        toast('If the email is registered, a reset link is on its way.');setAuthMode('')
      } else if(authMode==='new-password') {
        const {error}=await supabase.auth.updateUser({password:authForm.password})
        if(error) throw error
        toast('Your password has been updated.');setAuthMode('');setAuthForm({name:'',email:'',password:''})
      } else {
        const {error}=await supabase.auth.signInWithPassword({email:authForm.email,password:authForm.password})
        if(error) throw error
        toast('Welcome back!');setAuthMode('')
      }
    } catch(err) { toast(err.message || 'Authentication failed.') } finally { setBusy(false) }
  }
  async function signOut(){await supabase?.auth.signOut();setUser(null);setProfile(null);setPage('Discover');toast('You are signed out.')}

  async function saveProject(e) {
    e.preventDefault(); if(!requireAccount()) return
    if(projectForm.title.trim().length<3){toast('Add a project title of at least 3 characters.');return}
    setBusy(true)
    const payload={owner_id:user.id,title:projectForm.title.trim(),description:projectForm.description.trim(),category:projectForm.category,status:projectForm.status,tags:projectForm.tags.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12),repo_url:safeUrl(projectForm.repo_url)||null,demo_url:safeUrl(projectForm.demo_url)||null,visibility:true}
    try {
      const result=editingProject ? await supabase.from('projects').update(payload).eq('id',editingProject.id).eq('owner_id',user.id).select().single() : await supabase.from('projects').insert(payload).select().single()
      if(result.error) throw result.error
      setProjects(old=>editingProject?old.map(p=>p.id===editingProject.id?{...result.data,owner:profile,likes:p.likes||0}:p):[{...result.data,owner:profile,likes:0},...old])
      setProjectForm({title:'',description:'',category:'Robotics',status:'In progress',tags:'',repo_url:'',demo_url:''});setEditingProject(null);setModal('');toast(editingProject?'Project updated.':'Your project is published.')
      loadData(user)
    } catch(err){toast(err.message||'Could not save project. Apply the Supabase schema first.')} finally{setBusy(false)}
  }
  function openProjectEditor(p=null) {
    if(!requireAccount())return
    setEditingProject(p)
    setProjectForm(p?{title:p.title,description:p.description||'',category:p.category||'Robotics',status:p.status||'In progress',tags:(p.tags||[]).join(', '),repo_url:p.repo_url||'',demo_url:p.demo_url||''}:{title:'',description:'',category:'Robotics',status:'In progress',tags:'',repo_url:'',demo_url:''})
    setModal('project')
  }
  async function removeProject(p) {
    if(!requireAccount() || !window.confirm('Delete this project permanently?'))return
    const {error}=await supabase.from('projects').delete().eq('id',p.id).eq('owner_id',user.id)
    if(error){toast(error.message);return}setProjects(old=>old.filter(x=>x.id!==p.id));toast('Project deleted.')
  }
  async function toggleLike(p) {
    if(p.demo){toast('Sign in and publish projects to interact with the live community.');return}
    if(!requireAccount())return
    const isLiked=likes.includes(p.id)
    const {error}=isLiked?await supabase.from('project_likes').delete().eq('project_id',p.id).eq('user_id',user.id):await supabase.from('project_likes').insert({project_id:p.id,user_id:user.id})
    if(error){toast(error.message);return}
    setLikes(old=>isLiked?old.filter(id=>id!==p.id):[...old,p.id]);setProjects(old=>old.map(x=>x.id===p.id?{...x,likes:Math.max(0,(x.likes||0)+(isLiked?-1:1))}:x))
  }
  async function toggleBookmark(p) {
    if(p.demo){toast('Preview projects cannot be saved.');return}
    if(!requireAccount())return
    const saved=bookmarks.includes(p.id)
    const {error}=saved?await supabase.from('project_bookmarks').delete().eq('project_id',p.id).eq('user_id',user.id):await supabase.from('project_bookmarks').insert({project_id:p.id,user_id:user.id})
    if(error){toast(error.message);return}
    setBookmarks(old=>saved?old.filter(id=>id!==p.id):[...old,p.id]);toast(saved?'Removed from saved projects.':'Project saved privately.')
  }
  function editProfile(){if(!requireAccount())return;setProfileForm({...profile,skills:(profile?.skills||[]).join(', ')});setModal('profile')}
  async function saveProfile(e){
    e.preventDefault();setBusy(true)
    const payload={id:user.id,full_name:profileForm.full_name.trim(),username:profileForm.username.toLowerCase().trim().replace(/[^a-z0-9-]/g,'-'),headline:profileForm.headline.trim(),bio:profileForm.bio.trim(),university:profileForm.university.trim(),location:profileForm.location.trim(),skills:profileForm.skills.split(',').map(x=>x.trim()).filter(Boolean).slice(0,30),github_url:safeUrl(profileForm.github_url)||null,linkedin_url:safeUrl(profileForm.linkedin_url)||null,website_url:safeUrl(profileForm.website_url)||null}
    const {data,error}=await supabase.from('profiles').upsert(payload).select().single()
    setBusy(false);if(error){toast(error.message);return}setProfile(data);setProfiles(old=>[data,...old.filter(p=>p.id!==data.id)]);setProjects(old=>old.map(p=>p.owner_id===data.id?{...p,owner:data}:p));setModal('');toast('Your CV profile is updated.')
  }

  const navItems=[['Discover',Search],['Leaderboard',Trophy],['Saved',Bookmark]]
  return <div className="app-shell">
    <header className="topbar"><a href="#" className="brand" onClick={()=>setPage('Discover')}><span className="brand-mark"><Zap size={21} fill="currentColor"/></span><span>forge<span className="brand-dot">.</span><small>ENGINEERING COMMUNITY</small></span></a>
      <nav className="desktop-nav">{navItems.map(([label,Icon])=><button key={label} className={page===label?'nav-link active':'nav-link'} onClick={()=>setPage(label)}><Icon size={15}/>{label}</button>)}</nav>
      <div className="top-actions">{user?<><button className="profile-chip" onClick={editProfile}><Avatar profile={profile||{full_name:user.email}}/><span>{profile?.full_name||user.email}</span><ChevronDown size={14}/></button><button className="icon-btn" title="Sign out" onClick={signOut}><LogOut size={17}/></button></>:<><Button variant="quiet" onClick={()=>{setAuthMode('signin');setAuthForm({name:'',email:'',password:''})}}>Sign in</Button><Button onClick={()=>{setAuthMode('signup');setAuthForm({name:'',email:'',password:''})}}>Join Forge <ArrowRight size={15}/></Button></>}<button className="mobile-menu" onClick={()=>setPage(page==='Menu'?'Discover':'Menu')}><Menu/></button></div>
    </header>
    {page==='Menu'&&<div className="mobile-nav">{navItems.map(([label,Icon])=><button key={label} onClick={()=>setPage(label)}><Icon size={16}/>{label}</button>)}</div>}
    {page==='Discover'&&<><main className="container">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="pulse"></span> THE ENGINEERING SHOWCASE <span className="eyebrow-line"></span> BUILT BY YOU</div><h1>Ideas are good.<br/><span>Proof is better.</span></h1><p>A living portfolio for people who make things work. Share your build, learn from the community, and turn projects into opportunities.</p><div className="hero-actions"><Button onClick={()=>openProjectEditor()}><Plus size={17}/> Publish a project</Button><button className="text-link" onClick={()=>setPage('Leaderboard')}>Meet the builders <ArrowUpRight size={16}/></button></div><div className="hero-proof"><div className="proof-avatars">{EXAMPLES.slice(0,4).map((p,i)=><Avatar key={p.id} profile={{full_name:p.owner.full_name}} />)}</div><span><strong>For curious minds.</strong><br/>From first prototype to finished build.</span></div></div>
        <div className="hero-visual"><div className="visual-grid"></div><div className="visual-orbit visual-orbit-one"></div><div className="visual-orbit visual-orbit-two"></div><div className="visual-core"><Zap size={62} strokeWidth={1.2}/></div><div className="float-card float-card-top"><span className="float-icon mint"><Activity size={17}/></span><span><b>Make it real</b><small>Build · test · share</small></span><Check size={16}/></div><div className="float-card float-card-bottom"><span className="float-icon violet"><Trophy size={17}/></span><span><b>Show your impact</b><small>Projects that speak for you</small></span></div><span className="visual-code code-a">x(t) = A sin(ωt + φ)</span><span className="visual-code code-b">ITERATION 01 — 100%</span></div>
      </section>
      <section className="stats-strip"><div><strong>{projects.filter(p=>!p.demo).length.toString().padStart(2,'0')}</strong><span>LIVE PROJECTS</span></div><div><strong>{profiles.length.toString().padStart(2,'0')}</strong><span>BUILDERS</span></div><div><strong>{projects.reduce((n,p)=>n+(p.likes||0),0).toString().padStart(2,'0')}</strong><span>APPRECIATIONS</span></div><div className="stats-note"><ShieldCheck size={18}/><span>Real work. Real people.<br/><b>Your next big thing starts here.</b></span></div></section>
      <section className="market-section"><div className="section-heading"><div><div className="eyebrow subdued">THE COMMUNITY WORKSHOP</div><h2>Explore the <span>builds.</span></h2><p>Ideas in motion, prototypes in progress, and projects worth learning from.</p></div><Button variant="outline" onClick={()=>openProjectEditor()}>Share your work <ArrowUpRight size={15}/></Button></div>
        <div className="market-controls"><label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects, skills, or builders…"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label><label className="sort-select"><ArrowDownUp size={15}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Latest updates</option><option value="popular">Most appreciated</option><option value="alphabetical">A–Z</option></select></label></div>
        <div className="category-row">{CATEGORIES.map(cat=><button key={cat} className={category===cat?'category-pill selected':'category-pill'} onClick={()=>setCategory(cat)}>{cat==='All projects'?<Layers3 size={14}/>:null}{cat}</button>)}</div>
        {(!configured)&&<div className="preview-banner"><Sparkles size={16}/><span><strong>Preview mode</strong> — sample projects keep the workshop lively. Add your Supabase keys and run the schema to enable real accounts and live data.</span></div>}
        <div className="results-line"><span>{visibleProjects.length} projects to explore</span><span><span className="live-dot"></span> {configured?'Community feed':'Design preview'}</span></div>
        <div className="project-grid">{visibleProjects.map(p=>{const Icon=iconFor(p.category);const liked=likes.includes(p.id)||Boolean(p.liked);const saved=bookmarks.includes(p.id);const mine=user&&p.owner_id===user.id;return <article className="project-card" key={p.id}><div className="card-art-wrap"><Art project={p}/>{p.demo&&<span className="example-flag">EXAMPLE</span>}<span className={'status-tag status-'+String(p.status||'Idea').toLowerCase().replace(/\s/g,'-')}>{p.status||'Idea'}</span></div><div className="card-content"><div className="card-meta"><span><Icon size={13}/>{p.category}</span><span>{p.updated_at?new Date(p.updated_at).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'New build'}</span></div><h3>{p.title}</h3><p className="card-description">{p.description||'A project in progress. Share the process, what you learned, and what comes next.'}</p><div className="tag-row">{(p.tags||[]).slice(0,3).map(t=><span className="skill-tag" key={t}>{t}</span>)}</div><div className="card-footer"><button className="owner-link" onClick={()=>p.owner_id==='example-a'?toast('Example profile'):toast(p.owner?.full_name||'Community builder')}><Avatar profile={p.owner}/><span><b>{p.owner?.full_name||'Engineer'}</b><small>@{p.owner?.username||'builder'}</small></span></button><div className="card-tools"><button className={liked?'tool-btn liked':'tool-btn'} title="Appreciate project" onClick={()=>toggleLike(p)}><Heart size={16} fill={liked?'currentColor':'none'}/><span>{p.likes||0}</span></button><button className={saved?'tool-btn saved':'tool-btn'} title="Save privately" onClick={()=>toggleBookmark(p)}><Bookmark size={16} fill={saved?'currentColor':'none'}/></button>{mine&&<button className="tool-btn" title="Edit project" onClick={()=>openProjectEditor(p)}><Settings2 size={16}/></button>}</div></div><div className="card-links">{safeUrl(p.repo_url)&&<a href={safeUrl(p.repo_url)} target="_blank" rel="noreferrer"><Github size={14}/> Source <ExternalLink size={12}/></a>}{safeUrl(p.demo_url)&&<a href={safeUrl(p.demo_url)} target="_blank" rel="noreferrer"><Eye size={14}/> Live demo <ExternalLink size={12}/></a>}{mine&&<button onClick={()=>removeProject(p)} className="delete-link">Delete project</button>}</div></div></article>})}</div>
        {visibleProjects.length===0&&<div className="empty-state"><Search size={30}/><h3>No projects found</h3><p>Try another search or category.</p><Button variant="outline" onClick={()=>{setQuery('');setCategory('All projects');setPage('Discover')}}>Clear filters</Button></div>}
      </section>
      <section className="bottom-cta"><div className="cta-mark"><Zap size={26}/></div><div><h2>Your work deserves <span>to be seen.</span></h2><p>Start your project portfolio. Your next collaborator might be one post away.</p></div><Button onClick={()=>openProjectEditor()}>Build your portfolio <ArrowRight size={16}/></Button></section>
    </main><Footer/></>}
    {page==='Leaderboard'&&<main className="container subpage"><div className="page-heading"><div className="eyebrow subdued">COMMUNITY MOMENTUM</div><h1>Builders to <span>watch.</span></h1><p>Celebrate the people shipping projects and sharing what they learn.</p></div><div className="leaderboard-panel"><div className="leaderboard-head"><Trophy size={19}/><span>THE FORGE RANKINGS</span><small>ACTIVITY SCORE · NOT A SKILL RATING</small></div>{ranked.map((p,i)=><div className="leader-row" key={p.id}><strong className={'rank rank-'+(i+1)}>{String(i+1).padStart(2,'0')}</strong><Avatar profile={p} size="large"/><div className="leader-person"><b>{p.full_name||p.username}</b><small>@{p.username||'builder'} · {p.headline||'Engineering builder'}</small><div className="leader-skills">{(p.skills||[]).slice(0,3).map(s=><span key={s}>{s}</span>)}</div></div><div className="leader-metric"><b>{p.projectCount||0}</b><small>PROJECTS</small></div><div className="leader-metric"><b>{p.likesReceived||0}</b><small>APPRECIATIONS</small></div><div className="score-pill"><Sparkles size={14}/>{(p.projectCount||0)*50+(p.likesReceived||0)*3+(p.followers||0)*2} pts</div></div>)}{ranked.length===0&&<div className="empty-state"><Users size={30}/><h3>Your community starts here</h3><p>Publish the first project, then invite other builders to join.</p><Button onClick={()=>openProjectEditor()}>Publish a project</Button></div>}</div><p className="score-note"><ShieldCheck size={17}/> Scores are calculated from public projects, appreciations, and followers. They reward participation, not claimed talent, and can never guarantee hiring outcomes.</p></main>}
    {page==='Saved'&&<main className="container subpage"><div className="page-heading"><div className="eyebrow subdued">YOUR PRIVATE COLLECTION</div><h1>Saved <span>for later.</span></h1><p>Keep inspiration and useful builds in one place. Only you can see your bookmarks.</p></div>{!user&&<div className="preview-banner"><ShieldCheck size={16}/> Sign in to save projects privately.</div>}<div className="project-grid">{visibleProjects.map(p=><article className="project-card" key={p.id}><Art project={p}/><div className="card-content"><span className="category-mini">{p.category}</span><h3>{p.title}</h3><p className="card-description">{p.description}</p><button className="tool-btn saved" onClick={()=>toggleBookmark(p)}><Bookmark size={16} fill="currentColor"/> Remove saved</button></div></article>)}</div>{user&&visibleProjects.length===0&&<div className="empty-state"><Bookmark size={30}/><h3>Nothing saved yet</h3><p>Bookmark projects you want to revisit.</p><Button onClick={()=>setPage('Discover')}>Explore projects</Button></div>}</main>}
    {page!=='Discover'&&page!=='Leaderboard'&&page!=='Saved'&&page!=='Menu'&&<main className="container subpage"><div className="page-heading"><h1>Discover.</h1></div></main>}
    <footer className="site-footer"><a href="#" className="brand footer-brand" onClick={()=>setPage('Discover')}><span className="brand-mark"><Zap size={18} fill="currentColor"/></span><span>forge<span className="brand-dot">.</span></span></a><span>Made for the people who make things work.</span><div><button onClick={()=>setPage('Leaderboard')}>Leaderboard</button><button onClick={()=>setAuthMode('signup')}>Join the community</button></div><small>© {new Date().getFullYear()} Forge Engineering Community</small></footer>
    {authMode&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setAuthMode('')}}><section className="modal auth-modal"><button className="modal-close" onClick={()=>setAuthMode('')}><X size={19}/></button><div className="modal-symbol"><Zap size={23}/></div><div className="eyebrow subdued">{authMode==='signup'?'YOUR NEXT CHAPTER':'WELCOME BACK'}</div><h2>{authMode==='signup'?'Make room for your ideas.':authMode==='reset'?'Reset your password.':authMode==='new-password'?'Choose a new password.':'Good to see you again.'}</h2><p>{authMode==='signup'?'Create your account with an email address — no Google account required.':authMode==='reset'?'We will send a secure reset link to your email.':authMode==='new-password'?'Choose a fresh password to secure your account.':'Sign in and get back to building.'}</p><form onSubmit={handleAuth} className="form-stack">{authMode==='signup'&&<label>Full name<input required value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label>}{authMode!=='new-password'&&<label>Email address<input type="email" autoComplete="email" required value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label>}{authMode!=='reset'&&<label>Password<input minLength={8} type="password" autoComplete={authMode==='signup'?'new-password':'current-password'} required value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder="At least 8 characters"/></label>}<Button disabled={busy} type="submit">{busy?'Please wait…':authMode==='signup'?'Create account':authMode==='reset'?'Send reset link':authMode==='new-password'?'Update password':'Sign in'} <ArrowRight size={16}/></Button></form>{authMode==='signin'&&<button className="modal-text-link" onClick={()=>setAuthMode('reset')}>Forgot password?</button>}<div className="auth-switch">{authMode==='signup'?'Already have an account?':'New to Forge?'} <button onClick={()=>{setAuthMode(authMode==='signup'?'signin':'signup');setAuthForm({name:'',email:authForm.email,password:''})}}>{authMode==='signup'?'Sign in':'Create an account'}</button></div><div className="auth-secure"><ShieldCheck size={15}/> Passwords and verification are handled by Supabase Auth.</div></section></div>}
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('')}}><section className="modal editor-modal"><button className="modal-close" onClick={()=>setModal('')}><X size={19}/></button><div className="eyebrow subdued">{modal==='project'?'PUBLISH YOUR WORK':'YOUR PROFESSIONAL PROFILE'}</div><h2>{modal==='project'?(editingProject?'Edit project':'Make something visible.'):'Shape your living CV.'}</h2><p>{modal==='project'?'Share the process, the proof, and what you learned.':'Give collaborators a clear picture of the engineer behind the projects.'}</p>
      {modal==='project'?<form className="form-stack" onSubmit={saveProject}><label>Project title<input required minLength={3} maxLength={90} value={projectForm.title} onChange={e=>setProjectForm({...projectForm,title:e.target.value})} placeholder="e.g. Autonomous inspection rover"/></label><label>What does it do?<textarea rows={4} maxLength={1800} value={projectForm.description} onChange={e=>setProjectForm({...projectForm,description:e.target.value})} placeholder="Problem, approach, and what you learned…"/></label><div className="form-two"><label>Discipline<select value={projectForm.category} onChange={e=>setProjectForm({...projectForm,category:e.target.value})}>{CATEGORIES.slice(1).map(x=><option key={x}>{x}</option>)}</select></label><label>Stage<select value={projectForm.status} onChange={e=>setProjectForm({...projectForm,status:e.target.value})}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></label></div><label>Skills / technologies<input value={projectForm.tags} onChange={e=>setProjectForm({...projectForm,tags:e.target.value})} placeholder="Python, CAD, ESP32"/></label><div className="form-two"><label>Source code URL<input type="url" value={projectForm.repo_url} onChange={e=>setProjectForm({...projectForm,repo_url:e.target.value})} placeholder="https://github.com/…"/></label><label>Live demo URL<input type="url" value={projectForm.demo_url} onChange={e=>setProjectForm({...projectForm,demo_url:e.target.value})} placeholder="https://…"/></label></div><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setModal('')}>Cancel</Button><Button disabled={busy} type="submit">{busy?'Saving…':editingProject?'Save changes':'Publish project'} <ArrowUpRight size={15}/></Button></div></form>
      :<form className="form-stack" onSubmit={saveProfile}><label>Full name<input required value={profileForm.full_name||''} onChange={e=>setProfileForm({...profileForm,full_name:e.target.value})}/></label><label>Username<input required pattern="[A-Za-z0-9-]+" value={profileForm.username||''} onChange={e=>setProfileForm({...profileForm,username:e.target.value})}/></label><label>Headline<input maxLength={120} value={profileForm.headline||''} onChange={e=>setProfileForm({...profileForm,headline:e.target.value})} placeholder="Robotics engineer · prototyping useful machines"/></label><label>About you<textarea rows={3} value={profileForm.bio||''} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} placeholder="What do you build and what interests you?"/></label><label>Skills, comma separated<input value={profileForm.skills||''} onChange={e=>setProfileForm({...profileForm,skills:e.target.value})} placeholder="CAD, Python, Electronics"/></label><div className="form-two"><label>University / education<input value={profileForm.university||''} onChange={e=>setProfileForm({...profileForm,university:e.target.value})}/></label><label>Location<input value={profileForm.location||''} onChange={e=>setProfileForm({...profileForm,location:e.target.value})}/></label></div><div className="form-two"><label>GitHub URL<input type="url" value={profileForm.github_url||''} onChange={e=>setProfileForm({...profileForm,github_url:e.target.value})}/></label><label>LinkedIn URL<input type="url" value={profileForm.linkedin_url||''} onChange={e=>setProfileForm({...profileForm,linkedin_url:e.target.value})}/></label></div><label>Portfolio website<input type="url" value={profileForm.website_url||''} onChange={e=>setProfileForm({...profileForm,website_url:e.target.value})}/></label><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setModal('')}>Cancel</Button><Button disabled={busy} type="submit">{busy?'Saving…':'Save CV profile'} <Check size={15}/></Button></div><button type="button" className="print-cv" onClick={()=>window.print()}><FileText size={15}/> Print / save profile as PDF</button></form>}
    </section></div>}
    {notice&&<div className="toast"><Sparkles size={17}/>{notice}<button aria-label="Dismiss" onClick={()=>setNotice('')}><X size={15}/></button></div>}
  </div>
}
function Footer(){return null}