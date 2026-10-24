import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownUp, ArrowRight, ArrowUpRight, Bookmark, Check, ChevronDown, Code2, Cpu, ExternalLink, Eye, EyeOff, FileText, Filter, Github, Heart, Layers3, LogIn, LogOut, Mail, Menu, MessageCircle, Plus, Search, PenLine, Palette, Save, Settings2, ShieldCheck, Sparkles, Star, Trophy, UserRound, Users, Wrench, X, Zap } from 'lucide-react'
import { configured, supabase } from './lib/supabase.js'

const CATEGORIES = ['All projects','Robotics','Mechanical','Electrical','Software','Civil','AI & Data','Sustainability']
const STATUSES = ['Idea','In progress','Prototype','Completed']
const APP_URL = 'https://nexbuildv555.pages.dev'
const PASSWORD_RESET_URL = `${APP_URL}/reset-password`
const AUTH_RETURN_URL = `${APP_URL}/`
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
function Art({project}) { const Icon = iconFor(project.category); return <div className={'project-art art-'+String(project.category || 'engineering').toLowerCase().replace(/[^a-z0-9]+/g,'-')}><span className="art-index">N / {String(project.id).slice(0,4).toUpperCase()}</span><div className="orbit orbit-a"></div><div className="orbit orbit-b"></div><div className="art-icon"><Icon size={46} strokeWidth={1.3}/></div><span className="art-equation">BUILD / TEST / REPEAT</span><span className="art-label">{project.category || 'Engineering'}</span></div> }
function Button({children,variant='primary',...props}) { return <button className={'btn btn-'+variant} {...props}>{children}</button> }

export default function App() {
  const [user,setUser] = useState(null), [profile,setProfile] = useState(null)
  const [profiles,setProfiles] = useState([]), [projects,setProjects] = useState([])
  const [likes,setLikes] = useState([]), [bookmarks,setBookmarks] = useState([])
  const [query,setQuery] = useState(''), [category,setCategory] = useState('All projects'), [sort,setSort] = useState('recent')
  const [page,setPage] = useState('Home'), [authMode,setAuthMode] = useState(''), [modal,setModal] = useState('')
  const [notice,setNotice] = useState(''), [busy,setBusy] = useState(false)
  const [authForm,setAuthForm] = useState({name:'',email:'',password:''})
  const [showPassword,setShowPassword] = useState(false)
  const [projectForm,setProjectForm] = useState({title:'',description:'',category:'Robotics',status:'In progress',tags:'',repo_url:'',demo_url:''})
  const [profileForm,setProfileForm] = useState({full_name:'',username:'',headline:'',bio:'',university:'',location:'',skills:'',github_url:'',linkedin_url:'',website_url:''})
  const [editingProject,setEditingProject] = useState(null)
  const [homeSettings,setHomeSettings] = useState({title:'Build what matters.',subtitle:'The next generation of engineering starts with people who make things.',creator_name:'Kareem',accent:'#8b5cf6',announcement:'A workshop for ideas that deserve to exist.'})
  const [homeDraft,setHomeDraft] = useState(null)
  const [creatorEmail,setCreatorEmail] = useState('')

  const toast = (message) => { setNotice(message); window.setTimeout(()=>setNotice(''),3500) }
  const loadData = useCallback(async (activeUser) => {
    if (!supabase) { setProjects(EXAMPLES); setProfiles(EXAMPLES.slice(0,5).map(p=>({...p.owner,id:p.owner_id,skills:['Engineering','Prototyping']}))); return }
    const [pRes,prRes,lRes,fRes,bRes,settingsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(100),
      supabase.from('projects').select('*').order('updated_at',{ascending:false}).limit(100),
      supabase.from('project_likes').select('project_id,user_id'),
      supabase.from('follows').select('follower_id,following_id'),
      activeUser ? supabase.from('project_bookmarks').select('project_id').eq('user_id',activeUser.id) : Promise.resolve({data:[]}),
      supabase.from('site_settings').select('value').eq('key','homepage').maybeSingle()
    ])
    if(settingsRes.data?.value) setHomeSettings(s=>({...s,...settingsRes.data.value}))
    if (pRes.error || prRes.error) { setProjects([]); if (pRes.error?.code !== 'PGRST205' && prRes.error?.code !== 'PGRST205') toast('Could not load marketplace. Check that supabase/schema.sql has been applied.'); return }
    const people = pRes.data || []; const peopleMap = Object.fromEntries(people.map(p=>[p.id,p]))
    const likeRows = lRes.data || []; const followRows = fRes.data || []
    setProfiles(people.map(p=>({...p,projectCount:(prRes.data||[]).filter(x=>x.owner_id===p.id).length,likesReceived:likeRows.filter(l=>(prRes.data||[]).some(x=>x.id===l.project_id && x.owner_id===p.id)).length,followers:followRows.filter(f=>f.following_id===p.id).length})))
    setProjects((prRes.data||[]).filter(p=>p.status==='approved'||p.owner_id===activeUser?.id||p.seller_id===activeUser?.id).map(p=>({...p,owner_id:p.owner_id||p.seller_id,moderation_status:p.status,status:p.workflow_stage||(p.status==='approved'?'Completed':'In progress'),owner:peopleMap[p.owner_id||p.seller_id]||{full_name:'Engineer',username:'builder'},likes:likeRows.filter(l=>l.project_id===p.id).length,liked:likeRows.some(l=>l.project_id===p.id&&l.user_id===activeUser?.id)})))
    setLikes(likeRows.filter(l=>l.user_id===activeUser?.id).map(l=>l.project_id))
    setBookmarks((bRes.data||[]).map(x=>x.project_id))
  },[])
  useEffect(()=>{
    if (!supabase) { loadData(null); return }
    supabase.auth.getSession().then(({data})=>{
      const activeUser=data.session?.user || null
      setUser(activeUser)
      if(window.location.pathname==='/reset-password') {
        if(data.session) { setAuthMode('new-password'); setAuthForm(f=>({...f,email:activeUser?.email || f.email,password:''})) }
        else { setAuthMode('reset-link-error'); setAuthForm(f=>({...f,password:''})) }
      }
      loadData(activeUser)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      const activeUser=session?.user || null
      if(event==='PASSWORD_RECOVERY') {
        window.history.replaceState({},document.title,PASSWORD_RESET_URL)
        setAuthMode('new-password')
        setAuthForm(f=>({...f,email:activeUser?.email || f.email,password:''}))
      }
      setUser(activeUser)
      setTimeout(()=>loadData(activeUser),0)
    })
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
  const canManageCreators = Boolean(profile?.is_admin || profile?.is_founder)
  const canAccessCreatorStudio = Boolean(profile?.is_admin || profile?.is_founder || profile?.is_creator)
  const requireAccount = () => { if(!user){setAuthMode('signin');return false} return true }

  async function handleAuth(e) {
    e.preventDefault(); if(!supabase){toast('Add your Supabase URL and public anon key first.');return}
    setBusy(true)
    try {
      if(authMode==='signup') {
        const {data,error}=await supabase.auth.signUp({email:authForm.email.trim().toLowerCase(),password:authForm.password,options:{data:{full_name:authForm.name.trim()},emailRedirectTo:APP_URL}})
        if(error) throw error
        if(data.user&&(data.user.identities||[]).length===0){toast('An account with this email may already exist. Sign in or use Forgot password.');setAuthMode('signin');return}
        if(!data.session) toast('Account created. Open the verification email on this device, then return here to sign in. Check spam if needed.')
        else toast('Welcome to Nexbuild!')
        setAuthMode('')
      } else if(authMode==='reset'||authMode==='reset-link-error') {
        const {error}=await supabase.auth.resetPasswordForEmail(authForm.email.trim().toLowerCase(),{redirectTo:PASSWORD_RESET_URL})
        if(error) throw error
        toast('If the email is registered, a reset link is on its way. Open it on this site to choose a new password.');setAuthMode('')
      } else if(authMode==='new-password') {
        const {error}=await supabase.auth.updateUser({password:authForm.password})
        if(error) throw error
        await supabase.auth.signOut({scope:'local'});toast('Password updated successfully. Sign in with your new password.');setAuthMode('signin');setAuthForm({name:'',email:authForm.email,password:''});window.history.replaceState({},document.title,APP_URL+'/')
      } else {
        const {error}=await supabase.auth.signInWithPassword({email:authForm.email.trim().toLowerCase(),password:authForm.password})
        if(error) throw error
        toast('Welcome back!');setAuthMode('')
      }
    } catch(err) { const message=String(err?.message||''); if(authMode==='signin' && /invalid login credentials/i.test(message)){toast('Email or password is incorrect. Use the exact registration email, or choose Forgot password.')} else if(/email not confirmed/i.test(message)){toast('Verify your email using the latest email from Nexbuild, then try again.')} else if(/redirect.*(allow|url)|not allowed/i.test(message)){toast('Supabase rejected the return URL. Add this site to Authentication → URL Configuration → Redirect URLs.')} else if(/rate.?limit|too many requests|email rate limit exceeded/i.test(message)){toast('Supabase email limit reached. Stop retries for now; wait for it to reset or configure custom SMTP in Supabase Auth.')} else if(/password.*(weak|short|least)/i.test(message)){toast('Use a password with at least 8 characters.')} else {toast(message || 'Authentication failed. Please try again.')} } finally { setBusy(false) }
  }
  async function signOut(){await supabase?.auth.signOut();setUser(null);setProfile(null);setPage('Home');toast('You are signed out.')}

  async function saveProject(e) {
    e.preventDefault(); if(!requireAccount()) return
    if(projectForm.title.trim().length<3){toast('Add a project title of at least 3 characters.');return}
    setBusy(true)
    const description=projectForm.description.trim(); if(description.length<40||description.length>800){toast('Project description must be between 40 and 800 characters.');setBusy(false);return}
    const payload={owner_id:user.id,seller_id:user.id,title:projectForm.title.trim().slice(0,60),description,summary:description.slice(0,240),category:projectForm.category.slice(0,30),status:editingProject?.moderation_status==='approved'?'approved':'pending',workflow_stage:projectForm.status,tags:projectForm.tags.split(',').map(x=>x.trim()).filter(Boolean).slice(0,12),formats:'Project files / documentation',includes:'Project overview and engineering notes',price_cents:0,repo_url:safeUrl(projectForm.repo_url)||null,demo_url:safeUrl(projectForm.demo_url)||null,visibility:true}
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
  function editHomepage(){if(!user||!canManageCreators){toast('Founder access only.');return}setHomeDraft({...homeSettings});setModal('homepage')}
  async function changeCreatorAccess(grantAccess){
    if(!user||!canManageCreators){toast('Only the founder or an administrator can manage creator roles.');return}
    const email=creatorEmail.trim().toLowerCase();
    if(!email||!email.includes('@')){toast('Enter the email address of an existing Nexbuild account.');return}
    setBusy(true);
    try{
      const {data,error}=await supabase.rpc('set_creator_access',{target_email:email,grant_access:grantAccess});
      if(error) throw error;
      toast(grantAccess?`Creator access granted to ${email}.`:`Creator access removed from ${email}.`);
      setCreatorEmail('');
      await loadData(user);
    }catch(err){toast(err?.message||'Could not update creator access.');}
    finally{setBusy(false)}
  }
  async function saveHomepage(e){e.preventDefault();if(!user||!profile?.is_admin)return;setBusy(true);const next=homeDraft||homeSettings;const {error}=await supabase.from('site_settings').upsert({key:'homepage',value:next,updated_by:user.id});setBusy(false);if(error){toast(error.message);return}setHomeSettings({...next});setModal('');toast('Your homepage is live with the new content.')}
  async function saveProfile(e){
    e.preventDefault();setBusy(true)
    const payload={id:user.id,full_name:profileForm.full_name.trim(),username:profileForm.username.toLowerCase().trim().replace(/[^a-z0-9-]/g,'-'),headline:profileForm.headline.trim(),bio:profileForm.bio.trim(),university:profileForm.university.trim(),location:profileForm.location.trim(),skills:profileForm.skills.split(',').map(x=>x.trim()).filter(Boolean).slice(0,30),github_url:safeUrl(profileForm.github_url)||null,linkedin_url:safeUrl(profileForm.linkedin_url)||null,website_url:safeUrl(profileForm.website_url)||null}
    const {data,error}=await supabase.from('profiles').upsert(payload).select().single()
    setBusy(false);if(error){toast(error.message);return}setProfile(data);setProfiles(old=>[data,...old.filter(p=>p.id!==data.id)]);setProjects(old=>old.map(p=>p.owner_id===data.id?{...p,owner:data}:p));setModal('');toast('Your CV profile is updated.')
  }

  const navItems=[['Home',Zap],['Marketplace',Search],['Leaderboard',Trophy],['Saved',Bookmark]]
  return <div className="app-shell" style={{"--mint":homeSettings.accent||"#b5ff5c"}}>
    <header className="topbar"><a href="#" className="brand" onClick={()=>setPage('Home')}><span className="brand-mark"><Zap size={21} fill="currentColor"/></span><span>nexbuild<span className="brand-dot">.</span><small>ENGINEERING COMMUNITY</small></span></a>
      <nav className="desktop-nav">{navItems.map(([label,Icon])=><button key={label} className={page===label?'nav-link active':'nav-link'} onClick={()=>setPage(label)}><Icon size={15}/>{label}</button>)}{canAccessCreatorStudio&&<button className={page==='Creator'?'nav-link active creator-nav':'nav-link creator-nav'} onClick={()=>setPage('Creator')}><Palette size={15}/>Creator studio</button>}</nav>
      <div className="top-actions">{user?<><button className="profile-chip" onClick={editProfile}><Avatar profile={profile||{full_name:user.email}}/><span>{profile?.full_name||user.email}</span><ChevronDown size={14}/></button><button className="icon-btn" title="Sign out" onClick={signOut}><LogOut size={17}/></button></>:<><Button variant="quiet" onClick={()=>{setAuthMode('signin');setAuthForm({name:'',email:'',password:''})}}>Sign in</Button><Button onClick={()=>{setAuthMode('signup');setAuthForm({name:'',email:'',password:''})}}>Join Nexbuild <ArrowRight size={15}/></Button></>}<button className="mobile-menu" onClick={()=>setPage(page==='Menu'?'Home':'Menu')}><Menu/></button></div>
    </header>
    {page==='Menu'&&<div className="mobile-nav">{navItems.map(([label,Icon])=><button key={label} onClick={()=>setPage(label)}><Icon size={16}/>{label}</button>)}{canAccessCreatorStudio&&<button onClick={()=>setPage('Creator')}><Palette size={16}/>Creator studio</button>}</div>}
    {(page==='Home'||page==='Marketplace'||page==='Creator')&&<>
      {page==='Home'&&<><main className="container homepage">
      <section className="creator-hero simple-hero">
        <div className="creator-hero-copy">
          <div className="eyebrow"><span className="pulse"></span>{homeSettings.announcement}</div>
          <div className="creator-kicker">THE ENGINEERING PLAYGROUND</div>
          <h1>{homeSettings.title.split(' ').slice(0,-1).join(' ')} <span>{homeSettings.title.split(' ').slice(-1).join(' ')}</span></h1>
          <p>{homeSettings.subtitle}</p>
          <div className="hero-actions">
            <Button onClick={()=>setPage('Marketplace')}><Layers3 size={17}/> Explore marketplace <ArrowRight size={16}/></Button>
            <Button variant="outline" onClick={()=>setPage('Leaderboard')}><Trophy size={16}/> View leaderboard</Button>
          </div>
          <div className="creator-signature"><span className="signature-line"></span><span>BUILT BY <b>{homeSettings.creator_name||'THE NEXBUILD TEAM'}</b></span><span className="signature-badge"><ShieldCheck size={13}/> FOUNDER-LED COMMUNITY</span></div>
        </div>
        <aside className="home-quick-panel">
          <div className="quick-panel-top"><span>EXPLORE NEXBUILD</span><span className="quick-status"><i></i> OPEN WORKSHOP</span></div>
          <button className="home-quick-link" onClick={()=>setPage('Marketplace')}><span className="quick-icon blue"><Layers3 size={18}/></span><span className="quick-link-copy"><b>Marketplace</b><small>Discover engineering projects</small></span><ArrowRight size={17}/></button>
          <button className="home-quick-link" onClick={()=>setPage('Leaderboard')}><span className="quick-icon sky"><Trophy size={18}/></span><span className="quick-link-copy"><b>Builder leaderboard</b><small>Celebrate makers and progress</small></span><ArrowRight size={17}/></button>
          <button className="home-quick-link" onClick={()=>setPage('Saved')}><span className="quick-icon orange"><Bookmark size={18}/></span><span className="quick-link-copy"><b>Your saved projects</b><small>Keep your next idea close</small></span><ArrowRight size={17}/></button>
          <div className="quick-panel-note"><Sparkles size={16}/><span><b>Build. Share. Grow.</b><small>Turn real work into a living CV.</small></span></div>
        </aside>
      </section>
      <section className="home-stats" aria-label="How Nexbuild works">
        <div><span>01 / DISCOVER</span><b>Explore projects</b><small>Find ideas across engineering disciplines.</small></div>
        <div><span>02 / BUILD</span><b>Share your work</b><small>Publish prototypes, code, and lessons learned.</small></div>
        <div><span>03 / CONNECT</span><b>Grow your portfolio</b><small>Build a CV from projects you actually make.</small></div>
      </section>
      <section className="creator-achievements">
        <div className="achievement-heading"><div className="eyebrow subdued">CREATOR SPOTLIGHT</div><h2>Built by creators. <span>For engineers.</span></h2><p>Meet the people shaping a more open engineering community.</p></div>
        <div className="achievement-grid">
          <article className="achievement-card"><span className="achievement-icon"><ShieldCheck size={21}/></span><div><small>CREATOR ACHIEVEMENT</small><b>Platform founder</b><p>Started Nexbuild to give engineering projects a place to be seen.</p></div><span className="achievement-tag">FOUNDER</span></article>
          <article className="achievement-card"><span className="achievement-icon"><Trophy size={21}/></span><div><small>MISSION BADGE</small><b>Builder-first vision</b><p>Celebrate the process, not just the finished result.</p></div><span className="achievement-tag">VISION</span></article>
          <article className="achievement-card"><span className="achievement-icon"><Users size={21}/></span><div><small>COMMUNITY BADGE</small><b>Open collaboration</b><p>Help makers learn from each other and find collaborators.</p></div><span className="achievement-tag">COMMUNITY</span></article>
        </div>
      </section>
      <section className="home-bottom"><span>YOUR NEXT BUILD STARTS HERE.</span><Button onClick={()=>setPage('Marketplace')}>Enter the marketplace <ArrowRight size={16}/></Button></section>
    </main><Footer/></>}{page==='Marketplace'&&<><main className="container marketplace-page"><div className="marketplace-intro"><div><div className="eyebrow subdued">THE COMMUNITY WORKSHOP</div><h1>Find your next <span>build.</span></h1><p>Real projects, useful ideas, and the engineers making them happen.</p></div><Button onClick={()=>openProjectEditor()}><Plus size={16}/> Publish a project</Button></div><section className="stats-strip"><div><strong>{projects.filter(p=>!p.demo).length.toString().padStart(2,'0')}</strong><span>LIVE PROJECTS</span></div><div><strong>{profiles.length.toString().padStart(2,'0')}</strong><span>BUILDERS</span></div><div><strong>{projects.reduce((n,p)=>n+(p.likes||0),0).toString().padStart(2,'0')}</strong><span>APPRECIATIONS</span></div><div className="stats-note"><ShieldCheck size={18}/><span>Real work. Real people.<br/><b>Find your next big thing.</b></span></div></section><section className="market-section"><div className="section-heading"><div><div className="eyebrow subdued">THE COMMUNITY WORKSHOP</div><h2>Explore the <span>builds.</span></h2><p>Ideas in motion, prototypes in progress, and projects worth learning from.</p></div><Button variant="outline" onClick={()=>openProjectEditor()}>Share your work <ArrowUpRight size={15}/></Button></div>
        <div className="market-controls"><label className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search projects, skills, or builders…"/>{query&&<button onClick={()=>setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label><label className="sort-select"><ArrowDownUp size={15}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Latest updates</option><option value="popular">Most appreciated</option><option value="alphabetical">A–Z</option></select></label></div>
        <div className="category-row">{CATEGORIES.map(cat=><button key={cat} className={category===cat?'category-pill selected':'category-pill'} onClick={()=>setCategory(cat)}>{cat==='All projects'?<Layers3 size={14}/>:null}{cat}</button>)}</div>
        {(!configured)&&<div className="preview-banner"><Sparkles size={16}/><span><strong>Preview mode</strong> — sample projects keep the workshop lively. Add your Supabase keys and run the schema to enable real accounts and live data.</span></div>}
        <div className="results-line"><span>{visibleProjects.length} projects to explore</span><span><span className="live-dot"></span> {configured?'Community feed':'Design preview'}</span></div>
        <div className="project-grid">{visibleProjects.map(p=>{const Icon=iconFor(p.category);const liked=likes.includes(p.id)||Boolean(p.liked);const saved=bookmarks.includes(p.id);const mine=user&&p.owner_id===user.id;return <article className="project-card" key={p.id}><div className="card-art-wrap"><Art project={p}/>{p.demo&&<span className="example-flag">EXAMPLE</span>}<span className={'status-tag status-'+String(p.status||'Idea').toLowerCase().replace(/\s/g,'-')}>{p.status||'Idea'}</span></div><div className="card-content"><div className="card-meta"><span><Icon size={13}/>{p.category}</span><span>{p.updated_at?new Date(p.updated_at).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'New build'}</span></div><h3>{p.title}</h3><p className="card-description">{p.description||'A project in progress. Share the process, what you learned, and what comes next.'}</p><div className="tag-row">{(p.tags||[]).slice(0,3).map(t=><span className="skill-tag" key={t}>{t}</span>)}</div><div className="card-footer"><button className="owner-link" onClick={()=>p.owner_id==='example-a'?toast('Example profile'):toast(p.owner?.full_name||'Community builder')}><Avatar profile={p.owner}/><span><b>{p.owner?.full_name||'Engineer'}</b><small>@{p.owner?.username||'builder'}</small></span></button><div className="card-tools"><button className={liked?'tool-btn liked':'tool-btn'} title="Appreciate project" onClick={()=>toggleLike(p)}><Heart size={16} fill={liked?'currentColor':'none'}/><span>{p.likes||0}</span></button><button className={saved?'tool-btn saved':'tool-btn'} title="Save privately" onClick={()=>toggleBookmark(p)}><Bookmark size={16} fill={saved?'currentColor':'none'}/></button>{mine&&<button className="tool-btn" title="Edit project" onClick={()=>openProjectEditor(p)}><Settings2 size={16}/></button>}</div></div><div className="card-links">{safeUrl(p.repo_url)&&<a href={safeUrl(p.repo_url)} target="_blank" rel="noreferrer"><Github size={14}/> Source <ExternalLink size={12}/></a>}{safeUrl(p.demo_url)&&<a href={safeUrl(p.demo_url)} target="_blank" rel="noreferrer"><Eye size={14}/> Live demo <ExternalLink size={12}/></a>}{mine&&<button onClick={()=>removeProject(p)} className="delete-link">Delete project</button>}</div></div></article>})}</div>
        {visibleProjects.length===0&&<div className="empty-state"><Search size={30}/><h3>No projects found</h3><p>Try another search or category.</p><Button variant="outline" onClick={()=>{setQuery('');setCategory('All projects');setPage('Marketplace')}}>Clear filters</Button></div>}
      </section>
      <section className="bottom-cta"><div className="cta-mark"><Zap size={26}/></div><div><h2>Your work deserves <span>to be seen.</span></h2><p>Start your project portfolio. Your next collaborator might be one post away.</p></div><Button onClick={()=>openProjectEditor()}>Build your portfolio <ArrowRight size={16}/></Button></section></main><Footer/></>}{page==='Creator'&&canAccessCreatorStudio&&<main><div className="container creator-studio"><div className="eyebrow"><span className="pulse"></span> FOUNDER ACCESS</div><h1>Creator <span>studio.</span></h1><p className="studio-intro">Shape the first thing visitors see. Changes are saved to your live homepage.</p>{canManageCreators?<div className="studio-layout"><section className="studio-editor"><div className="studio-heading"><Palette size={19}/><div><b>Homepage editor</b><small>LIVE SITE CONTENT</small></div></div><form className="form-stack" onSubmit={saveHomepage}><label>Announcement<input value={homeSettings.announcement} onChange={e=>setHomeSettings({...homeSettings,announcement:e.target.value})}/></label><label>Main headline<input value={homeSettings.title} onChange={e=>setHomeSettings({...homeSettings,title:e.target.value})} maxLength={70} required/></label><label>Introduction<textarea value={homeSettings.subtitle} onChange={e=>setHomeSettings({...homeSettings,subtitle:e.target.value})} rows={4} maxLength={280} required/></label><label>Creator name<input value={homeSettings.creator_name} onChange={e=>setHomeSettings({...homeSettings,creator_name:e.target.value})} maxLength={45}/></label><label>Accent color<input type="color" value={homeSettings.accent||'#8b5cf6'} onChange={e=>setHomeSettings({...homeSettings,accent:e.target.value})}/></label><Button type="submit" disabled={busy}><Save size={16}/>{busy?'Saving changes…':'Publish homepage changes'}</Button></form></section><section className="studio-preview" style={{'--creator-accent':homeSettings.accent||'#8b5cf6'}}><span className="preview-label">LIVE PREVIEW</span><div className="preview-shape"><Zap size={34}/></div><small>{homeSettings.announcement}</small><h2>{homeSettings.title}</h2><p>{homeSettings.subtitle}</p><span className="preview-byline">BY {homeSettings.creator_name}</span></section></div>:<section className="creator-member-panel"><div className="studio-heading"><ShieldCheck size={19}/><div><b>Creator account</b><small>CREATOR ACCESS ENABLED</small></div></div><p>Your creator role is active. Build your public portfolio, publish projects, and grow your engineering profile. Only the founder or an administrator can edit the global homepage and grant creator roles.</p></section>}<div className="studio-tools"><button onClick={()=>setPage('Marketplace')}><Search size={19}/><b>Marketplace</b><small>Review live projects</small></button><button onClick={()=>setPage('Leaderboard')}><Trophy size={19}/><b>Community ranking</b><small>See builder activity</small></button><button onClick={editProfile}><UserRound size={19}/><b>Your creator profile</b><small>Update your public CV</small></button></div>{canManageCreators&&<section className="creator-access-panel"><div className="studio-heading"><Users size={19}/><div><b>Manage creator access</b><small>FOUNDER / ADMIN CONTROL</small></div></div><p>Grant or revoke creator tools for an existing Nexbuild account. This never grants administrator or founder privileges.</p><form className="creator-access-form" onSubmit={e=>{e.preventDefault();changeCreatorAccess(true)}}><label>Account email<input type="email" required autoComplete="off" value={creatorEmail} onChange={e=>setCreatorEmail(e.target.value)} placeholder="builder@example.com"/></label><div className="creator-access-actions"><Button type="submit" disabled={busy}><ShieldCheck size={15}/> Grant creator</Button><Button type="button" variant="outline" disabled={busy} onClick={()=>changeCreatorAccess(false)}>Revoke creator</Button></div></form></section>}</div></main><Footer/>}
    
    </>}
    {page==='Leaderboard'&&<main className="container subpage"><div className="page-heading"><div className="eyebrow subdued">COMMUNITY MOMENTUM</div><h1>Builders to <span>watch.</span></h1><p>Celebrate the people shipping projects and sharing what they learn.</p></div><div className="leaderboard-panel"><div className="leaderboard-head"><Trophy size={19}/><span>THE NEXBUILD RANKINGS</span><small>ACTIVITY SCORE · NOT A SKILL RATING</small></div>{ranked.map((p,i)=><div className="leader-row" key={p.id}><strong className={'rank rank-'+(i+1)}>{String(i+1).padStart(2,'0')}</strong><Avatar profile={p} size="large"/><div className="leader-person"><b>{p.full_name||p.username}</b><small>@{p.username||'builder'} · {p.headline||'Engineering builder'}</small><div className="leader-skills">{(p.skills||[]).slice(0,3).map(s=><span key={s}>{s}</span>)}</div></div><div className="leader-metric"><b>{p.projectCount||0}</b><small>PROJECTS</small></div><div className="leader-metric"><b>{p.likesReceived||0}</b><small>APPRECIATIONS</small></div><div className="score-pill"><Sparkles size={14}/>{(p.projectCount||0)*50+(p.likesReceived||0)*3+(p.followers||0)*2} pts</div></div>)}{ranked.length===0&&<div className="empty-state"><Users size={30}/><h3>Your community starts here</h3><p>Publish the first project, then invite other builders to join.</p><Button onClick={()=>openProjectEditor()}>Publish a project</Button></div>}</div><p className="score-note"><ShieldCheck size={17}/> Scores are calculated from public projects, appreciations, and followers. They reward participation, not claimed talent, and can never guarantee hiring outcomes.</p></main>}
    {page==='Saved'&&<main className="container subpage"><div className="page-heading"><div className="eyebrow subdued">YOUR PRIVATE COLLECTION</div><h1>Saved <span>for later.</span></h1><p>Keep inspiration and useful builds in one place. Only you can see your bookmarks.</p></div>{!user&&<div className="preview-banner"><ShieldCheck size={16}/> Sign in to save projects privately.</div>}<div className="project-grid">{visibleProjects.map(p=><article className="project-card" key={p.id}><Art project={p}/><div className="card-content"><span className="category-mini">{p.category}</span><h3>{p.title}</h3><p className="card-description">{p.description}</p><button className="tool-btn saved" onClick={()=>toggleBookmark(p)}><Bookmark size={16} fill="currentColor"/> Remove saved</button></div></article>)}</div>{user&&visibleProjects.length===0&&<div className="empty-state"><Bookmark size={30}/><h3>Nothing saved yet</h3><p>Bookmark projects you want to revisit.</p><Button onClick={()=>setPage('Marketplace')}>Explore projects</Button></div>}</main>}
    {page!=='Home'&&page!=='Marketplace'&&page!=='Creator'&&page!=='Leaderboard'&&page!=='Saved'&&page!=='Menu'&&<main className="container subpage"><div className="page-heading"><h1>Discover.</h1></div></main>}
    <footer className="site-footer"><a href="#" className="brand footer-brand" onClick={()=>setPage('Home')}><span className="brand-mark"><Zap size={18} fill="currentColor"/></span><span>nexbuild<span className="brand-dot">.</span></span></a><span>Made for the people who make things work.</span><div><button onClick={()=>setPage('Leaderboard')}>Leaderboard</button><button onClick={()=>setAuthMode('signup')}>Join the community</button></div><small>© {new Date().getFullYear()} Nexbuild Engineering Community</small></footer>
    {authMode&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setAuthMode('')}}><section className="modal auth-modal"><button className="modal-close" onClick={()=>setAuthMode('')}><X size={19}/></button><div className="modal-symbol"><Zap size={23}/></div><div className="eyebrow subdued">{authMode==='signup'?'YOUR NEXT CHAPTER':(authMode==='reset'||authMode==='reset-link-error')?'ACCOUNT RECOVERY':'WELCOME BACK'}</div><h2>{authMode==='signup'?'Make room for your ideas.':(authMode==='reset'||authMode==='reset-link-error')?'Reset your password.':authMode==='new-password'?'Choose a new password.':'Good to see you again.'}</h2><p>{authMode==='signup'?'Create your account with an email address — no Google account required.':authMode==='reset'?'We will send a secure reset link to your email.':authMode==='reset-link-error'?'This reset link did not establish a secure recovery session. Enter your email to request a fresh link.':authMode==='new-password'?'Choose a new password for your account.':'Sign in and get back to building.'}</p><form onSubmit={handleAuth} className="form-stack">{authMode==='signup'&&<label>Full name<input required maxLength={40} value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name"/></label>}{authMode!=='new-password'&&<label>Email address<input type="email" autoComplete="email" required value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label>}{authMode!=='reset'&&authMode!=='reset-link-error'&&<label>Password<div className="password-field"><input minLength={authMode==='signup'||authMode==='new-password'?8:undefined} type={showPassword?'text':'password'} autoComplete={authMode==='signup'||authMode==='new-password'?'new-password':'current-password'} required value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder={authMode==='signin'?'Enter your password':'At least 8 characters'}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}<span>{showPassword?'Hide':'Show'}</span></button></div></label>}<Button disabled={busy} type="submit">{busy?'Please wait…':authMode==='signup'?'Create account':(authMode==='reset'||authMode==='reset-link-error')?'Send reset link':authMode==='new-password'?'Update password':'Sign in'} <ArrowRight size={16}/></Button></form>{authMode==='signin'&&<button className="modal-text-link" onClick={()=>setAuthMode('reset')}>Forgot password?</button>}{(authMode==='reset'||authMode==='reset-link-error'||authMode==='new-password')&&<button type="button" className="modal-text-link" onClick={()=>{setAuthMode('signin');setAuthForm({name:'',email:authForm.email,password:''})}}>Back to sign in</button>}<div className="auth-switch">{authMode==='signup'?'Already have an account?':authMode==='signin'?'New to Nexbuild?':''} {(authMode==='signup'||authMode==='signin')&&<button onClick={()=>{setAuthMode(authMode==='signup'?'signin':'signup');setAuthForm({name:'',email:authForm.email,password:''})}}>{authMode==='signup'?'Sign in':'Create an account'}</button>}</div><div className="auth-secure"><ShieldCheck size={15}/> SECURE EMAIL AUTH · POWERED BY SUPABASE</div></section></div>}
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('')}}><section className="modal editor-modal"><button className="modal-close" onClick={()=>setModal('')}><X size={19}/></button><div className="eyebrow subdued">{modal==='project'?'PUBLISH YOUR WORK':modal==='homepage'?'CREATOR STUDIO':'YOUR PROFESSIONAL PROFILE'}</div><h2>{modal==='project'?(editingProject?'Edit project':'Make something visible.'):modal==='homepage'?'Edit your homepage.':'Shape your living CV.'}</h2><p>{modal==='project'?'Share the process, the proof, and what you learned.':modal==='homepage'?'Customize the public creator homepage.':'Give collaborators a clear picture of the engineer behind the projects.'}</p>
      {modal==='homepage'?<form className="form-stack" onSubmit={saveHomepage}><label>Announcement<input value={homeDraft?.announcement||''} onChange={e=>setHomeDraft({...homeDraft,announcement:e.target.value})}/></label><label>Headline<input required value={homeDraft?.title||''} onChange={e=>setHomeDraft({...homeDraft,title:e.target.value})}/></label><label>Introduction<textarea rows={4} value={homeDraft?.subtitle||''} onChange={e=>setHomeDraft({...homeDraft,subtitle:e.target.value})}/></label><label>Creator name<input value={homeDraft?.creator_name||''} onChange={e=>setHomeDraft({...homeDraft,creator_name:e.target.value})}/></label><label>Accent color<input type="color" value={homeDraft?.accent||'#8b5cf6'} onChange={e=>setHomeDraft({...homeDraft,accent:e.target.value})}/></label><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setModal('')}>Cancel</Button><Button type="submit" disabled={busy}><Save size={15}/> Save homepage</Button></div></form>:modal==='project'?<form className="form-stack" onSubmit={saveProject}><label>Project title<input required minLength={3} maxLength={60} value={projectForm.title} onChange={e=>setProjectForm({...projectForm,title:e.target.value})} placeholder="e.g. Autonomous inspection rover"/></label><label>What does it do?<textarea rows={4} required minLength={40} maxLength={800} value={projectForm.description} onChange={e=>setProjectForm({...projectForm,description:e.target.value})} placeholder="Problem, approach, and what you learned…"/></label><div className="form-two"><label>Discipline<select value={projectForm.category} onChange={e=>setProjectForm({...projectForm,category:e.target.value})}>{CATEGORIES.slice(1).map(x=><option key={x}>{x}</option>)}</select></label><label>Stage<select value={projectForm.status} onChange={e=>setProjectForm({...projectForm,status:e.target.value})}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></label></div><label>Skills / technologies<input value={projectForm.tags} onChange={e=>setProjectForm({...projectForm,tags:e.target.value})} placeholder="Python, CAD, ESP32"/></label><div className="form-two"><label>Source code URL<input type="url" value={projectForm.repo_url} onChange={e=>setProjectForm({...projectForm,repo_url:e.target.value})} placeholder="https://github.com/…"/></label><label>Live demo URL<input type="url" value={projectForm.demo_url} onChange={e=>setProjectForm({...projectForm,demo_url:e.target.value})} placeholder="https://…"/></label></div><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setModal('')}>Cancel</Button><Button disabled={busy} type="submit">{busy?'Saving…':editingProject?'Save changes':'Publish project'} <ArrowUpRight size={15}/></Button></div></form>
      :<form className="form-stack" onSubmit={saveProfile}><label>Full name<input required value={profileForm.full_name||''} onChange={e=>setProfileForm({...profileForm,full_name:e.target.value})}/></label><label>Username<input required pattern="[A-Za-z0-9-]+" value={profileForm.username||''} onChange={e=>setProfileForm({...profileForm,username:e.target.value})}/></label><label>Headline<input maxLength={120} value={profileForm.headline||''} onChange={e=>setProfileForm({...profileForm,headline:e.target.value})} placeholder="Robotics engineer · prototyping useful machines"/></label><label>About you<textarea rows={3} value={profileForm.bio||''} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} placeholder="What do you build and what interests you?"/></label><label>Skills, comma separated<input value={profileForm.skills||''} onChange={e=>setProfileForm({...profileForm,skills:e.target.value})} placeholder="CAD, Python, Electronics"/></label><div className="form-two"><label>University / education<input value={profileForm.university||''} onChange={e=>setProfileForm({...profileForm,university:e.target.value})}/></label><label>Location<input value={profileForm.location||''} onChange={e=>setProfileForm({...profileForm,location:e.target.value})}/></label></div><div className="form-two"><label>GitHub URL<input type="url" value={profileForm.github_url||''} onChange={e=>setProfileForm({...profileForm,github_url:e.target.value})}/></label><label>LinkedIn URL<input type="url" value={profileForm.linkedin_url||''} onChange={e=>setProfileForm({...profileForm,linkedin_url:e.target.value})}/></label></div><label>Portfolio website<input type="url" value={profileForm.website_url||''} onChange={e=>setProfileForm({...profileForm,website_url:e.target.value})}/></label><div className="modal-actions"><Button variant="outline" type="button" onClick={()=>setModal('')}>Cancel</Button><Button disabled={busy} type="submit">{busy?'Saving…':'Save CV profile'} <Check size={15}/></Button></div><button type="button" className="print-cv" onClick={()=>window.print()}><FileText size={15}/> Print / save profile as PDF</button></form>}
    </section></div>}
    {notice&&<div className="toast"><Sparkles size={17}/>{notice}<button aria-label="Dismiss" onClick={()=>setNotice('')}><X size={15}/></button></div>}
  </div>
}
function Footer(){return null}