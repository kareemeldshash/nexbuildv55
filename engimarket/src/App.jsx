import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Check, CheckCircle2,
  ChevronDown, ChevronRight, CircleUserRound, Cog, Cpu, ExternalLink, Eye, EyeOff,
  FileText, Filter, Github, Globe2, Heart, LogIn, LogOut, Mail, Menu, MessageCircle,
  Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Star, Users,
  Wrench, X, Zap, Linkedin, Code2, Rocket, Camera, CircleHelp, Copy, Trash2, Upload,
  MapPin, CalendarDays, BadgeCheck, ChartNoAxesCombined, Handshake, Compass,
} from 'lucide-react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { hasSupabaseConfig, supabase } from './lib/supabase';

const ORANGE = '#f97316';
const founderFallback = {
  id: 'founder-demo', username: 'kareem-games', full_name: 'Kareem Games',
  headline: 'Mechanical & Robotics Engineer',
  bio: 'I turn engineering ideas into working projects — from robotics and embedded systems to computer vision and CAD. Building, learning, and sharing along the way.',
  location: 'Egypt', skills: ['Python', 'Pybricks', 'Arduino', 'Robotics', 'Computer Vision', 'CAD'],
  github_url: '', linkedin_url: '', website: '', avatar_url: '', is_founder: true,
  created_at: '2026-01-01T00:00:00.000Z',
};
const demoProjects = [
  {
    id: 'demo-line-follower', slug: 'autonomous-line-follower', title: 'Autonomous Line Follower',
    summary: 'A smart line-following robot using two color sensors and PID control.',
    description: 'A compact robotics build focused on repeatable movement, sensor calibration, and smooth line tracking. Add your wiring diagram, source code, and a short test video when publishing your own version.',
    category: 'Robotics', tags: ['Pybricks', 'Python', 'Sensors'], cover_image_url: 'https://images.unsplash.com/photo-1563207153-f403bf289096?auto=format&fit=crop&w=1000&q=85',
    owner: { full_name: 'Kareem Games', username: 'kareem-games', avatar_url: '' }, demo: true, likes: 18, views: 124,
  },
  {
    id: 'demo-smart-home', slug: 'smart-home-automation', title: 'Smart Home Automation',
    summary: 'Control lights and appliances using an Arduino and a mobile interface.',
    description: 'An embedded systems concept that combines a microcontroller, sensor inputs, and a simple control interface. Document the electrical design and include safe low-voltage wiring diagrams.',
    category: 'Arduino', tags: ['Arduino', 'IoT', 'Electronics'], cover_image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=85',
    owner: { full_name: 'Ahmed Hassan', username: 'ahmed-hassan', avatar_url: '' }, demo: true, likes: 12, views: 96,
  },
  {
    id: 'demo-vision', slug: 'object-detection-mediapipe', title: 'Object Detection with MediaPipe',
    summary: 'A real-time computer vision experiment with Python and OpenCV.',
    description: 'A computer vision project exploring image processing and real-time detection. Include sample results, a reproducible environment file, limitations, and a short demonstration.',
    category: 'AI / Computer Vision', tags: ['Python', 'OpenCV', 'AI'], cover_image_url: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=1000&q=85',
    owner: { full_name: 'Sara Mohamed', username: 'sara-mohamed', avatar_url: '' }, demo: true, likes: 9, views: 78,
  },
  {
    id: 'demo-cad', slug: 'gearbox-3d-model', title: 'Gearbox 3D Model',
    summary: 'A parametric mechanical assembly with a clean CAD workflow.',
    description: 'A mechanical CAD showcase with a focus on assembly structure, part naming, and presentation-quality drawings. Add rendered views, dimensions, and a bill of materials to make the project CV-ready.',
    category: 'CAD', tags: ['SolidWorks', 'Mechanical', '3D'], cover_image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=85',
    owner: { full_name: 'Omar Ali', username: 'omar-ali', avatar_url: '' }, demo: true, likes: 7, views: 65,
  },
  {
    id: 'demo-esp32', slug: 'esp32-sensor-station', title: 'ESP32 Sensor Station',
    summary: 'A connected sensor dashboard for monitoring a small environment.',
    description: 'An IoT prototype that records sensor readings and presents them in a compact dashboard. Publish connection details, setup steps, and a clear explanation of how the data moves from hardware to the interface.',
    category: 'Electronics', tags: ['ESP32', 'Sensors', 'IoT'], cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85',
    owner: { full_name: 'Mina Adel', username: 'mina-adel', avatar_url: '' }, demo: true, likes: 5, views: 52,
  },
  {
    id: 'demo-python', slug: 'engineering-task-automation', title: 'Engineering Task Automation',
    summary: 'Small Python utilities that remove repetitive engineering tasks.',
    description: 'A set of focused automation scripts for managing files, transforming data, or preparing engineering reports. A good project page explains the time saved, inputs and outputs, dependencies, and example runs.',
    category: 'Python', tags: ['Python', 'Automation', 'Tools'], cover_image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&q=85',
    owner: { full_name: 'Nour Samir', username: 'nour-samir', avatar_url: '' }, demo: true, likes: 11, views: 88,
  },
];
const categories = [
  { name: 'All', icon: Compass }, { name: 'Robotics', icon: Cog }, { name: 'Arduino', icon: Cpu },
  { name: 'AI / Computer Vision', icon: Eye }, { name: 'CAD', icon: Wrench },
  { name: 'Mechanical', icon: Settings2 }, { name: 'Electronics', icon: Zap }, { name: 'Python', icon: Code2 },
];

function cn(...parts) { return parts.filter(Boolean).join(' '); }
function initials(name = 'Engineer') { return name.split(/[\s_-]+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase(); }
function prettyDate(value) {
  if (!value) return 'Just joined';
  try { return new Date(value).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }); } catch { return 'Member'; }
}
function safeUsername(name = '') {
  return name.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 28) || `engineer-${Math.random().toString(36).slice(2, 7)}`;
}
function safeHttpUrl(value = '') {
  try { const parsed = new URL(value); return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : ''; }
  catch { return ''; }
}

function Avatar({ name, src, size = 'md', className = '' }) {
  const imageUrl = safeHttpUrl(src);
  return <div className={cn('avatar', `avatar-${size}`, className)}>{imageUrl ? <img src={imageUrl} alt={`${name || 'Creator'} avatar`} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : initials(name)}</div>;
}
function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return <button className={cn('btn', `btn-${variant}`, `btn-${size}`, className)} {...props}>{children}</button>;
}
function Badge({ children, variant = 'default' }) { return <span className={cn('badge', `badge-${variant}`)}>{children}</span>; }
function ProjectImage({ project, className = '' }) {
  return <div className={cn('project-image', className)}>
    {safeHttpUrl(project.cover_image_url) ? <img src={safeHttpUrl(project.cover_image_url)} alt={project.title} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : null}
    <span className="image-glow" />
    <span className="image-category">{project.category || 'Engineering'}</span>
  </div>;
}
function SocialLink({ href, icon: Icon, label }) {
  const safeHref = safeHttpUrl(href);
  if (!safeHref) return null;
  return <a className="social-link" href={safeHref} target="_blank" rel="noreferrer" aria-label={label}><Icon size={16} /></a>;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const user = session?.user ?? null;
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState(demoProjects);
  const [creators, setCreators] = useState([founderFallback]);
  const [likedIds, setLikedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [followedCreatorIds, setFollowedCreatorIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.warn('Could not restore session:', error.message);
      setSession(data?.session ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (!user || !supabase) { setProfile(null); return; }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (!active) return;
      if (data) setProfile(data);
      else {
        if (error) console.warn('Profile fetch:', error.message);
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Engineer';
        setProfile({ ...founderFallback, id: user.id, username: safeUsername(user.user_metadata?.username || displayName), full_name: displayName, bio: '', headline: 'Engineering Creator', skills: [], is_founder: false });
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [user?.id]);

  const refreshProjects = useCallback(async () => {
    setLoadingProjects(true);
    if (!supabase) { setProjects(demoProjects); setLoadingProjects(false); return; }
    const { data, error } = await supabase.from('projects')
      .select('*, owner:profiles!projects_owner_id_fkey(full_name, username, avatar_url)')
      .eq('is_published', true).order('created_at', { ascending: false }).limit(60);
    if (error) {
      console.warn('Project list:', error.message);
      setProjects(demoProjects);
    } else {
      const rows = data || [];
      let likesByProject = {};
      if (rows.length) {
        const { data: likeRows, error: likesError } = await supabase.from('project_likes').select('project_id').in('project_id', rows.map((p) => p.id));
        if (likesError) console.warn('Project likes:', likesError.message);
        else for (const like of (likeRows || [])) likesByProject[like.project_id] = (likesByProject[like.project_id] || 0) + 1;
      }
      const liveProjects = rows.map((p) => ({ ...p, likes: likesByProject[p.id] || 0, owner: p.owner || null, demo: false }));
      setProjects(liveProjects.length ? liveProjects : demoProjects);
    }
    setLoadingProjects(false);
  }, []);

  const refreshCreators = useCallback(async () => {
    if (!supabase) { setCreators([founderFallback]); return; }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(60);
    if (error) { console.warn('Creator list:', error.message); setCreators([founderFallback]); return; }
    const live = data || [];
    setCreators(live.length ? live : [founderFallback]);
  }, []);

  useEffect(() => { refreshProjects(); refreshCreators(); }, [refreshProjects, refreshCreators]);
  useEffect(() => {
    let active = true;
    async function loadUserActions() {
      if (!user || !supabase) { setLikedIds([]); setSavedIds([]); setFollowedCreatorIds([]); return; }
      const [likes, saves, follows] = await Promise.all([
        supabase.from('project_likes').select('project_id').eq('user_id', user.id),
        supabase.from('project_bookmarks').select('project_id').eq('user_id', user.id),
        supabase.from('creator_follows').select('creator_id').eq('follower_id', user.id),
      ]);
      if (!active) return;
      setLikedIds((likes.data || []).map((x) => x.project_id));
      setSavedIds((saves.data || []).map((x) => x.project_id));
      setFollowedCreatorIds((follows.data || []).map((x) => x.creator_id));
    }
    loadUserActions();
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => { setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null); setProfile(null); notify('You are signed out.'); navigate('/');
  };

  const toggleLike = async (project) => {
    if (project.demo) { notify('This is a preview project. Sign in and publish your own work to use project actions.', 'info'); return; }
    if (!user) { notify('Sign in to appreciate projects.', 'info'); navigate('/login'); return; }
    const liked = likedIds.includes(project.id);
    const result = liked
      ? await supabase.from('project_likes').delete().eq('project_id', project.id).eq('user_id', user.id)
      : await supabase.from('project_likes').insert({ project_id: project.id, user_id: user.id });
    if (result.error) { notify(result.error.message, 'error'); return; }
    setLikedIds((old) => liked ? old.filter((id) => id !== project.id) : [...old, project.id]);
    setProjects((old) => old.map((item) => item.id === project.id ? { ...item, likes: Math.max(0, (item.likes || 0) + (liked ? -1 : 1)) } : item));
  };
  const toggleSave = async (project) => {
    if (project.demo) { notify('Sign in and save a published project to build your shortlist.', 'info'); return; }
    if (!user) { notify('Sign in to save projects.', 'info'); navigate('/login'); return; }
    const saved = savedIds.includes(project.id);
    const result = saved
      ? await supabase.from('project_bookmarks').delete().eq('project_id', project.id).eq('user_id', user.id)
      : await supabase.from('project_bookmarks').insert({ project_id: project.id, user_id: user.id });
    if (result.error) { notify(result.error.message, 'error'); return; }
    setSavedIds((old) => saved ? old.filter((id) => id !== project.id) : [...old, project.id]);
    notify(saved ? 'Removed from saved projects.' : 'Project saved to your collection.');
  };

  const toggleFollow = async (creator) => {
    if (!user) { notify('Sign in to follow creators.', 'info'); navigate('/login'); return; }
    if (!creator?.id || creator.id === 'founder-demo') { notify('This is a sample creator profile.', 'info'); return; }
    if (creator.id === user.id) { notify('That is your own profile.', 'info'); navigate('/dashboard'); return; }
    const followed = followedCreatorIds.includes(creator.id);
    const result = followed
      ? await supabase.from('creator_follows').delete().eq('creator_id', creator.id).eq('follower_id', user.id)
      : await supabase.from('creator_follows').insert({ creator_id: creator.id, follower_id: user.id });
    if (result.error) { notify(result.error.message, 'error'); return; }
    setFollowedCreatorIds((old) => followed ? old.filter((id) => id !== creator.id) : [...old, creator.id]);
    notify(followed ? 'Creator unfollowed.' : `Following ${creator.full_name || 'creator'}.`);
  };

  const shell = {
    user, profile, projects, creators, likedIds, savedIds, followedCreatorIds, notify, navigate,
    setProfile, refreshProjects, refreshCreators, toggleLike, toggleSave, toggleFollow,
  };
  return <div className="app-shell">
    <Header {...shell} onSignOut={signOut} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />
    {!hasSupabaseConfig && <div className="config-banner"><CircleHelp size={15} /> Demo mode is active. Add your Supabase environment variables to enable accounts and live data.</div>}
    <main>
      <Routes>
        <Route path="/" element={<HomePage {...shell} loadingProjects={loadingProjects} />} />
        <Route path="/marketplace" element={<MarketplacePage {...shell} loadingProjects={loadingProjects} />} />
        <Route path="/creators" element={<CreatorsPage {...shell} />} />
        <Route path="/community" element={<CommunityPage {...shell} />} />
        <Route path="/login" element={<AuthPage mode="login" notify={notify} />} />
        <Route path="/signup" element={<AuthPage mode="signup" notify={notify} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage notify={notify} />} />
        <Route path="/reset-password" element={<ResetPasswordPage notify={notify} />} />
        <Route path="/dashboard" element={<DashboardPage {...shell} />} />
        <Route path="/profile/:username" element={<CreatorProfilePage {...shell} />} />
        <Route path="/project/:slug" element={<ProjectDetailPage {...shell} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <Footer />
    {toast && <div role="status" className={cn('toast', `toast-${toast.type}`)}><span className="toast-icon">{toast.type === 'error' ? <X size={17} /> : toast.type === 'info' ? <CircleHelp size={17} /> : <Check size={17} />}</span>{toast.message}<button className="toast-close" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15} /></button></div>}
  </div>;
}

function Header({ user, profile, onSignOut, mobileMenu, setMobileMenu }) {
  return <header className="site-header">
    <div className="header-inner container">
      <Link to="/" className="brand" aria-label="EngiMarket home"><span className="brand-mark"><Cog size={22} strokeWidth={2.8} /></span><span>Engi<span>Market</span></span></Link>
      <nav className={cn('desktop-nav', mobileMenu && 'nav-open')} aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink><NavLink to="/marketplace">Marketplace</NavLink><NavLink to="/creators">Creators</NavLink><NavLink to="/community">Community</NavLink>
      </nav>
      <div className="header-actions">
        <Link className="header-search" to="/marketplace"><Search size={16} /><span>Search projects, creators...</span><kbd>/</kbd></Link>
        {user ? <>
          <Link to="/dashboard" className="header-profile"><Avatar name={profile?.full_name || user.email} src={profile?.avatar_url} size="xs" /><span>My workspace</span></Link>
          <button className="icon-button signout-button" onClick={onSignOut} aria-label="Sign out"><LogOut size={17} /></button>
        </> : <><Link className="text-button login-link" to="/login">Log in</Link><Link className="btn btn-primary btn-sm header-signup" to="/signup">Join free <ArrowUpRight size={15} /></Link></>}
      </div>
      <button className="mobile-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
  </header>;
}

function HomePage({ profile, user, projects, creators, likedIds, savedIds, toggleLike, toggleSave, navigate }) {
  const featured = projects.slice(0, 3);
  const creator = user ? { ...founderFallback, ...profile, full_name: profile?.full_name || user.email?.split('@')[0] } : founderFallback;
  return <>
    <section className="hero container">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> THE ENGINEERING CREATOR SPACE</div>
        <h1>Engineering ideas into <span className="text-orange">real projects.</span></h1>
        <p className="hero-lede">A home for builders, makers, and problem-solvers. Share what you create, show how you think, and find people who want to build what’s next.</p>
        <div className="hero-actions"><Link to="/marketplace" className="btn btn-primary btn-lg">Explore marketplace <ArrowRight size={17} /></Link><Link to={user ? '/dashboard' : '/signup'} className="btn btn-secondary btn-lg">Build your profile <ArrowUpRight size={17} /></Link></div>
        <div className="hero-trust"><div className="avatar-stack"><Avatar name="Kareem" size="xs" /><Avatar name="Sara" size="xs" /><Avatar name="Ahmed" size="xs" /></div><span><strong>Made for people who build.</strong><br />Your projects deserve more than a folder.</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-visual-image"><img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1300&q=90" alt="Engineering workbench with a prototype" /></div>
        <div className="visual-fade" />
        <div className="floating-label floating-label-top"><span className="float-icon"><Cpu size={17} /></span><div><strong>Build something real</strong><small>Hardware · Software · Design</small></div></div>
        <div className="founder-float-card">
          <div className="founder-card-top"><Avatar name={creator.full_name} src={creator.avatar_url} size="lg" /><div className="founder-title"><div className="name-inline"><strong>{creator.full_name}</strong>{creator.is_founder !== false && <Badge variant="orange">Founder</Badge>}</div><span>{creator.headline || 'Engineering Creator'}</span><div className="online-label"><span /> Creator profile</div></div></div>
          <p>{creator.bio || 'Your story, skills, and best engineering work — in one professional place.'}</p>
          <div className="skill-list">{(creator.skills || founderFallback.skills).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>
          <Link to={user ? '/dashboard' : `/profile/${creator.username || 'kareem-games'}`} className="btn btn-outline btn-sm founder-card-cta">{user ? 'Edit your profile' : 'View creator profile'} <ArrowUpRight size={15} /></Link>
        </div>
        <div className="visual-caption"><span className="caption-pulse" /> YOUR NEXT BUILD STARTS HERE</div>
      </div>
      <div className="hero-side-note"><span>01</span><span className="side-note-line" /><span>DESIGNED FOR BUILDERS</span></div>
    </section>

    <section className="founder-strip container">
      <div className="founder-strip-icon"><Sparkles size={21} /></div><div className="founder-strip-copy"><span className="section-kicker">YOUR WORK. YOUR STORY.</span><h2>A portfolio that grows with you.</h2><p>Turn projects, experiments, and lessons learned into a profile people can actually explore.</p></div>
      <div className="founder-strip-points"><span><CheckCircle2 size={16} /> Share real builds</span><span><CheckCircle2 size={16} /> Show your process</span><span><CheckCircle2 size={16} /> Meet collaborators</span></div>
      <Link to={user ? '/dashboard' : '/signup'} className="btn btn-secondary">Create your profile <ArrowRight size={16} /></Link>
    </section>

    <section className="section container marketplace-preview" id="projects">
      <div className="section-heading-row"><div><div className="section-kicker">MADE, TESTED, SHARED</div><h2>Explore engineering projects<span className="text-orange">.</span></h2><p>Discover ideas, learn from the build, and find your next starting point.</p></div><Link to="/marketplace" className="text-link">Browse all projects <ArrowRight size={16} /></Link></div>
      <CategoryRail onPick={(category) => navigate(`/marketplace?category=${encodeURIComponent(category)}`)} />
      <ProjectGrid projects={featured} likedIds={likedIds} savedIds={savedIds} toggleLike={toggleLike} toggleSave={toggleSave} navigate={navigate} compact />
    </section>

    <section className="section container how-section">
      <div className="section-heading-row"><div><div className="section-kicker">A LITTLE MORE THAN A PORTFOLIO</div><h2>Build your name by building things<span className="text-orange">.</span></h2><p>Everything you need to make your engineering work visible and useful.</p></div></div>
      <div className="feature-grid">
        <FeatureCard icon={FileText} number="01" title="Make a CV people can explore" text="Showcase skills, project decisions, outcomes, code links, and the lessons behind the build." />
        <FeatureCard icon={Handshake} number="02" title="Find your people" text="Discover creators across robotics, electronics, software, CAD, and mechanical design." />
        <FeatureCard icon={ChartNoAxesCombined} number="03" title="Let your work speak" text="Build a transparent contribution history with published projects, peer feedback, and collaborations." />
        <FeatureCard icon={Rocket} number="04" title="Turn experiments into opportunities" text="Make it easier for teammates, mentors, and potential clients to understand what you can do." />
      </div>
    </section>

    <section className="cta-section container"><div className="cta-decoration"><Cog size={128} /></div><div className="cta-content"><span className="section-kicker">YOUR NEXT CHAPTER STARTS HERE</span><h2>Have an idea on your desk?</h2><p>Give it a page. Give it a story. Let the engineering community see what you’re building.</p><Link to={user ? '/dashboard' : '/signup'} className="btn btn-primary btn-lg">Get started for free <ArrowRight size={17} /></Link></div><div className="cta-side">No paid plan required to get started.<span>Build. Share. Collaborate.</span></div></section>
  </>;
}

function FeatureCard({ icon: Icon, number, title, text }) {
  return <div className="feature-card"><div className="feature-card-top"><span className="feature-icon"><Icon size={21} /></span><span className="feature-number">{number}</span></div><h3>{title}</h3><p>{text}</p><span className="feature-arrow"><ArrowUpRight size={16} /></span></div>;
}
function CategoryRail({ onPick, active = 'All' }) {
  return <div className="category-rail">{categories.map(({ name, icon: Icon }) => <button key={name} onClick={() => onPick?.(name)} className={cn('category-chip', active === name && 'category-chip-active')}><Icon size={17} /><span>{name}</span></button>)}</div>;
}

function ProjectGrid({ projects, likedIds = [], savedIds = [], toggleLike, toggleSave, navigate, compact = false }) {
  if (!projects.length) return <EmptyState icon={Compass} title="No projects found" text="Try another search or category, or be the first to publish a project." action={<Link to="/dashboard" className="btn btn-primary btn-sm">Publish a project <Plus size={15} /></Link>} />;
  return <div className={cn('project-grid', compact && 'project-grid-compact')}>
    {projects.map((project) => <article className="project-card" key={project.id}>
      <Link to={`/project/${project.slug || project.id}`} className="project-card-link" aria-label={`View ${project.title}`}><ProjectImage project={project} /><div className="project-card-body"><div className="project-meta"><span className="project-category">{project.category}</span>{project.demo && <span className="sample-tag">EXAMPLE</span>}</div><h3>{project.title}</h3><p>{project.summary}</p><div className="tag-row">{(project.tags || []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div></div></Link>
      <div className="project-card-footer"><Link to={`/profile/${project.owner?.username || 'kareem-games'}`} className="project-author"><Avatar name={project.owner?.full_name || 'Engineer'} src={project.owner?.avatar_url} size="xs" /><span>{project.owner?.full_name || 'Community creator'}</span></Link><div className="project-card-actions"><button className={cn('micro-action', likedIds.includes(project.id) && 'active-like')} onClick={() => toggleLike?.(project)} aria-label="Like project"><Heart size={15} fill={likedIds.includes(project.id) ? 'currentColor' : 'none'} /><span>{project.likes || 0}</span></button><button className={cn('micro-action', savedIds.includes(project.id) && 'active-save')} onClick={() => toggleSave?.(project)} aria-label="Save project"><Bookmark size={15} fill={savedIds.includes(project.id) ? 'currentColor' : 'none'} /></button></div></div>
    </article>)}
  </div>;
}

function MarketplacePage({ projects, likedIds, savedIds, toggleLike, toggleSave, navigate, loadingProjects }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('category') || 'All';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categories.some((x) => x.name === initialCategory) ? initialCategory : 'All');
  const [sort, setSort] = useState('newest');
  const [onlyCode, setOnlyCode] = useState(false);
  const filtered = useMemo(() => {
    let result = projects.filter((p) => {
      const query = search.toLowerCase().trim();
      const matchesSearch = !query || [p.title, p.summary, p.description, p.category, ...(p.tags || []), p.owner?.full_name].filter(Boolean).join(' ').toLowerCase().includes(query);
      const matchesCategory = category === 'All' || p.category === category || (category === 'Mechanical' && /mechanical|cad/i.test(p.category || ''));
      const matchesCode = !onlyCode || Boolean(p.repo_url);
      return matchesSearch && matchesCategory && matchesCode;
    });
    if (sort === 'title') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'likes') result = [...result].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return result;
  }, [projects, search, category, onlyCode, sort]);
  return <div className="page container">
    <PageIntro kicker="THE PROJECT FLOOR" title={<>The work is the <span className="text-orange">proof.</span></>} text="Search real builds, explore different disciplines, and find a starting point for your next idea." />
    <div className="marketplace-tools"><label className="search-field"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects, skills, tools..." aria-label="Search projects" /><kbd>⌘ K</kbd></label><label className="select-field"><SlidersHorizontal size={16} /><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort projects"><option value="newest">Latest</option><option value="likes">Most appreciated</option><option value="title">Title A–Z</option></select><ChevronDown size={15} /></label></div>
    <CategoryRail active={category} onPick={setCategory} />
    <div className="results-toolbar"><span>{filtered.length} {filtered.length === 1 ? 'project' : 'projects'} <span className="muted">in your view</span></span><label className="check-filter"><input type="checkbox" checked={onlyCode} onChange={(e) => setOnlyCode(e.target.checked)} /><span>Has a code repository</span></label></div>
    {loadingProjects ? <SkeletonGrid /> : <ProjectGrid projects={filtered} likedIds={likedIds} savedIds={savedIds} toggleLike={toggleLike} toggleSave={toggleSave} navigate={navigate} />}
    <div className="publish-prompt"><div className="publish-prompt-icon"><Plus size={22} /></div><div><strong>Missing a project you’ve built?</strong><span>Publish your work and add it to your engineering CV.</span></div><Link to="/dashboard" className="btn btn-primary btn-sm">Publish project <ArrowRight size={15} /></Link></div>
  </div>;
}

function PageIntro({ kicker, title, text }) {
  return <div className="page-intro"><span className="section-kicker">{kicker}</span><h1>{title}</h1><p>{text}</p></div>;
}
function SkeletonGrid() { return <div className="project-grid">{[1, 2, 3, 4].map((n) => <div key={n} className="project-skeleton"><div /><span /><span /><span /></div>)}</div>; }
function EmptyState({ icon: Icon = CircleHelp, title, text, action }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={25} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

function CreatorsPage({ creators, projects, user, navigate, followedCreatorIds = [], toggleFollow }) {
  const [query, setQuery] = useState('');
  const filtered = creators.filter((c) => [c.full_name, c.username, c.headline, ...(c.skills || [])].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase()));
  return <div className="page container"><PageIntro kicker="PEOPLE BEHIND THE BUILDS" title={<>Meet the <span className="text-orange">creators.</span></>} text="Engineering is better when knowledge travels. Find builders, see what they make, and discover who you could learn from." />
    <label className="search-field creator-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, discipline, or skill..." aria-label="Search creators" /></label>
    <div className="creator-grid">{filtered.map((creator) => {
      const count = projects.filter((p) => p.owner?.username === creator.username && !p.demo).length;
      return <article className="creator-card" key={creator.id || creator.username}><div className="creator-cover"><div className="creator-cover-grid" /><span className="creator-role">{creator.is_founder ? 'FOUNDING CREATOR' : 'COMMUNITY CREATOR'}</span></div><div className="creator-card-main"><Avatar name={creator.full_name} src={creator.avatar_url} size="xl" className="creator-avatar" /><div className="creator-card-name"><h3>{creator.full_name || 'Engineering Creator'}</h3>{creator.is_founder && <Badge variant="orange">Founder</Badge>}</div><p className="creator-headline">{creator.headline || 'Engineering Creator'}</p><p className="creator-bio">{creator.bio || 'Building projects, learning by doing, and sharing useful ideas with the community.'}</p><div className="skill-list">{(creator.skills || []).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}{!(creator.skills || []).length && <span>New profile</span>}</div><div className="creator-card-stats"><span><strong>{count}</strong> projects</span><span><CalendarDays size={13} /> Joined {prettyDate(creator.created_at)}</span></div><div className="creator-card-actions"><Link to={`/profile/${creator.username || 'kareem-games'}`} className="btn btn-secondary">View profile <ArrowRight size={15} /></Link>{user?.id !== creator.id && <Button variant={followedCreatorIds.includes(creator.id) ? 'primary' : 'secondary'} onClick={() => toggleFollow?.(creator)}>{followedCreatorIds.includes(creator.id) ? 'Following' : 'Follow'}</Button>}</div></div></article>;
    })}</div>
    {!filtered.length && <EmptyState icon={Users} title="No creators found" text="Try another name or skill." />}
    <div className="creator-join-panel"><div className="join-icon"><Users size={24} /></div><div><h3>Your name belongs here, too.</h3><p>Create your profile and let people explore what you can build.</p></div><Link to={user ? '/dashboard' : '/signup'} className="btn btn-primary">Join the creator space <ArrowRight size={16} /></Link></div>
  </div>;
}

function CommunityPage({ projects, creators, user }) {
  return <div className="page container"><PageIntro kicker="BUILDING IS BETTER TOGETHER" title={<>A community built around <span className="text-orange">doing.</span></>} text="Share a work-in-progress, explain a problem you solved, or connect with somebody who has tried it before." />
    <div className="community-layout"><div className="community-main"><div className="community-welcome panel"><div className="welcome-icon"><MessageCircle size={25} /></div><div><Badge variant="orange">COMMUNITY GUIDELINES</Badge><h2>Show the process, not just the finish.</h2><p>Good project posts explain the goal, what worked, what failed, and what another builder can learn.</p></div></div><div className="discussion-list"><div className="discussion-heading"><h2>Start exploring</h2><span>Fresh ways to get involved</span></div><Link to="/marketplace" className="discussion-item"><span className="discussion-icon orange-soft"><Compass size={19} /></span><span><strong>Explore project write-ups</strong><small>Browse builds and learn from each creator's approach.</small></span><ChevronRight size={18} /></Link><Link to="/creators" className="discussion-item"><span className="discussion-icon violet-soft"><Users size={19} /></span><span><strong>Find a collaborator</strong><small>Discover creators by discipline and skill.</small></span><ChevronRight size={18} /></Link><Link to={user ? '/dashboard' : '/signup'} className="discussion-item"><span className="discussion-icon green-soft"><Plus size={19} /></span><span><strong>Share what you're working on</strong><small>Start with a clear summary, process, and next step.</small></span><ChevronRight size={18} /></Link></div></div>
      <aside className="community-sidebar"><div className="panel sidebar-panel"><span className="section-kicker">COMMUNITY SNAPSHOT</span><div className="sidebar-stat"><span>Creator profiles</span><strong>{creators.filter((c) => c.id !== 'founder-demo').length}</strong></div><div className="sidebar-stat"><span>Published projects</span><strong>{projects.filter((p) => !p.demo).length}</strong></div><div className="sidebar-stat"><span>Core disciplines</span><strong>{categories.length - 1}</strong></div><p className="muted small">Counts reflect live records once your Supabase schema is connected.</p></div><div className="panel sidebar-panel rules-panel"><ShieldCheck size={22} /><h3>Keep it constructive.</h3><p>Credit collaborators, share safe build details, protect private information, and give useful feedback.</p></div></aside></div>
  </div>;
}

function AuthPage({ mode, notify }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const isSignup = mode === 'signup';
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    if (!supabase) { notify('Add Supabase environment variables to enable authentication.', 'error'); setBusy(false); return; }
    try {
      if (isSignup) {
        if (password.length < 8) { notify('Use at least 8 characters for your password.', 'error'); setBusy(false); return; }
        const handle = safeUsername(username || name);
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim(), username: handle }, emailRedirectTo: `${window.location.origin}/dashboard` } });
        if (error) throw error;
        if (data.session) { notify('Account created — welcome to EngiMarket!'); navigate('/dashboard'); }
        else { setSent(true); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        notify('Welcome back.'); navigate('/dashboard');
      }
    } catch (error) { notify(error.message || 'Authentication failed. Please try again.', 'error'); }
    finally { setBusy(false); }
  };
  if (sent) return <div className="auth-page container"><div className="auth-card auth-success"><span className="auth-big-icon"><Mail size={27} /></span><Badge variant="green">ONE MORE STEP</Badge><h1>Check your inbox.</h1><p>We sent a confirmation link to <strong>{email}</strong>. Open it to verify your email and activate your account.</p><div className="auth-note"><ShieldCheck size={17} /><span>Didn't see it? Check spam, then use the resend option in your Supabase email settings if needed.</span></div><Button onClick={() => navigate('/login')} variant="secondary" className="btn-block">Back to log in</Button></div></div>;
  return <div className="auth-page container"><div className="auth-showcase"><div className="auth-showcase-orb" /><Badge variant="orange">BUILT FOR BUILDERS</Badge><h1>{isSignup ? <>Every great build<br />starts with <span className="text-orange">a first step.</span></> : <>Good to have<br />you <span className="text-orange">back.</span></>}</h1><p>{isSignup ? 'Make a home for your engineering work, share the details, and connect with the people who get it.' : 'Pick up where you left off. Your projects and engineering profile are waiting.'}</p><div className="auth-benefits"><span><CheckCircle2 size={17} /> Free creator profile</span><span><CheckCircle2 size={17} /> Email-based account</span><span><CheckCircle2 size={17} /> Projects you can share</span></div><div className="auth-showcase-stamp"><Cog size={28} /><span>BUILD. SHARE.<br />COLLABORATE.</span></div></div>
    <div className="auth-card"><Link to="/" className="auth-back"><ArrowLeft size={15} /> Back home</Link><div className="auth-card-head"><span className="section-kicker">{isSignup ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}</span><h2>{isSignup ? 'Join EngiMarket' : 'Log in to EngiMarket'}</h2><p>{isSignup ? 'Start turning your work into opportunities.' : 'Sign in to manage your profile and projects.'}</p></div>
      <form onSubmit={submit} className="form-stack">
        {isSignup && <><label className="form-field"><span>Full name</span><div className="input-wrap"><CircleUserRound size={17} /><input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we call you?" required /></div></label><label className="form-field"><span>Username <small>· your public profile link</small></span><div className="input-wrap"><span className="input-prefix">@</span><input autoComplete="username" value={username} onChange={(e) => setUsername(safeUsername(e.target.value))} placeholder="your-handle" /></div><small className="field-hint">Letters, numbers, and hyphens work best.</small></label></>}
        <label className="form-field"><span>Email address</span><div className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div></label>
        <label className="form-field"><span>Password</span><div className="input-wrap"><ShieldCheck size={17} /><input type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'} required /><button className="input-icon-button" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {!isSignup && <div className="form-between"><label className="check-filter"><input type="checkbox" /><span>Remember me</span></label><Link to="/forgot-password" className="text-link small-link">Forgot password?</Link></div>}
        <Button type="submit" disabled={busy} className="btn-block btn-lg">{busy ? <span className="spinner" /> : isSignup ? 'Create free account' : 'Sign in'} {!busy && <ArrowRight size={16} />}</Button>
      </form>
      <div className="auth-foot">{isSignup ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New to EngiMarket? <Link to="/signup">Create a free account</Link></>}</div>
      <p className="auth-legal">By continuing, you agree to be respectful of creators and share only content you have permission to publish.</p>
    </div></div>;
}

function ForgotPasswordPage({ notify }) {
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  const submit = async (e) => { e.preventDefault(); if (!supabase) { notify('Supabase is not configured.', 'error'); return; } setBusy(true); const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` }); setBusy(false); if (error) notify(error.message, 'error'); else setSent(true); };
  return <div className="auth-page container"><div className="auth-card auth-narrow"><span className="auth-big-icon"><Mail size={27} /></span><span className="section-kicker">ACCOUNT RECOVERY</span><h1>Reset your password.</h1>{sent ? <><p>If the address belongs to an account, a reset link will arrive in your inbox.</p><Link className="btn btn-primary btn-block" to="/login">Back to log in</Link></> : <><p>Enter your account email and we’ll send you a secure password reset link.</p><form className="form-stack" onSubmit={submit}><label className="form-field"><span>Email address</span><div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" /></div></label><Button type="submit" disabled={busy} className="btn-block">{busy ? 'Sending…' : 'Send reset link'} <ArrowRight size={16} /></Button></form><Link to="/login" className="auth-back center-back"><ArrowLeft size={15} /> Back to log in</Link></>}</div></div>;
}
function ResetPasswordPage({ notify }) {
  const [password, setPassword] = useState(''); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const navigate = useNavigate();
  const submit = async (e) => { e.preventDefault(); if (password.length < 8) { notify('Use at least 8 characters.', 'error'); return; } if (!supabase) return; setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setBusy(false); if (error) notify(error.message, 'error'); else { setDone(true); notify('Password updated.'); } };
  return <div className="auth-page container"><div className="auth-card auth-narrow"><span className="auth-big-icon"><ShieldCheck size={27} /></span><span className="section-kicker">SECURE YOUR ACCOUNT</span><h1>Choose a new password.</h1>{done ? <><p>Your password has been updated successfully.</p><Button className="btn-block" onClick={() => navigate('/dashboard')}>Go to workspace <ArrowRight size={16} /></Button></> : <form className="form-stack" onSubmit={submit}><label className="form-field"><span>New password</span><div className="input-wrap"><ShieldCheck size={17} /><input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required placeholder="At least 8 characters" /><button type="button" className="input-icon-button" onClick={() => setShow(!show)}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label><Button type="submit" disabled={busy} className="btn-block">{busy ? 'Updating…' : 'Update password'} <ArrowRight size={16} /></Button></form>}</div></div>;
}

function DashboardPage({ user, profile, setProfile, projects, refreshProjects, notify }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', username: '', headline: '', bio: '', location: '', website: '', github_url: '', linkedin_url: '', avatar_url: '', skills: '' });
  const [projectForm, setProjectForm] = useState({ title: '', summary: '', description: '', category: 'Robotics', tags: '', cover_image_url: '', repo_url: '', demo_url: '' });
  const [myProjects, setMyProjects] = useState([]);
  useEffect(() => {
    setForm({ full_name: profile?.full_name || user?.user_metadata?.full_name || '', username: profile?.username || safeUsername(user?.email?.split('@')[0] || 'engineer'), headline: profile?.headline || '', bio: profile?.bio || '', location: profile?.location || '', website: profile?.website || '', github_url: profile?.github_url || '', linkedin_url: profile?.linkedin_url || '', avatar_url: profile?.avatar_url || '', skills: (profile?.skills || []).join(', ') });
  }, [profile?.id, profile?.updated_at, user?.id]);
  useEffect(() => { setMyProjects(projects.filter((p) => p.owner_id === user?.id && !p.demo)); }, [projects, user?.id]);

  if (!user) return <div className="page container"><div className="signed-out-panel"><span className="auth-big-icon"><CircleUserRound size={27} /></span><span className="section-kicker">YOUR WORKSPACE</span><h1>Your engineering story starts here.</h1><p>Sign in to edit your creator profile, publish projects, and build your public portfolio.</p><div className="hero-actions"><Link to="/login" className="btn btn-secondary">Log in</Link><Link to="/signup" className="btn btn-primary">Create account <ArrowRight size={16} /></Link></div></div></div>;

  const updateField = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  const updateProjectField = (key, value) => setProjectForm((old) => ({ ...old, [key]: value }));
  const saveProfile = async (e) => {
    e.preventDefault(); if (!supabase) { notify('Supabase is not configured.', 'error'); return; }
    setSaving(true);
    const username = safeUsername(form.username);
    const payload = { id: user.id, full_name: form.full_name.trim(), username, headline: form.headline.trim(), bio: form.bio.trim(), location: form.location.trim(), website: form.website.trim(), github_url: form.github_url.trim(), linkedin_url: form.linkedin_url.trim(), avatar_url: form.avatar_url.trim() || null, skills: form.skills.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 20) };
    const { data, error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select().single();
    setSaving(false);
    if (error) { notify(error.message.includes('username') ? 'That username is already in use. Try another one.' : error.message, 'error'); return; }
    setProfile(data); notify('Your creator profile is saved.');
  };
  const createProject = async (e) => {
    e.preventDefault(); if (!supabase) { notify('Supabase is not configured.', 'error'); return; }
    if (projectForm.summary.trim().length < 15) { notify('Add a little more detail to the summary (at least 15 characters).', 'error'); return; }
    setProjectSaving(true);
    const baseSlug = safeUsername(projectForm.title); const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const payload = { owner_id: user.id, title: projectForm.title.trim(), slug, summary: projectForm.summary.trim(), description: projectForm.description.trim(), category: projectForm.category, tags: projectForm.tags.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 12), cover_image_url: projectForm.cover_image_url.trim() || null, repo_url: projectForm.repo_url.trim() || null, demo_url: projectForm.demo_url.trim() || null, is_published: true };
    const { error } = await supabase.from('projects').insert(payload);
    setProjectSaving(false);
    if (error) { notify(error.message, 'error'); return; }
    setProjectForm({ title: '', summary: '', description: '', category: 'Robotics', tags: '', cover_image_url: '', repo_url: '', demo_url: '' }); setShowProjectForm(false); await refreshProjects(); notify('Project published!'); setTab('projects');
  };
  const completeness = [form.full_name, form.headline, form.bio, form.location, form.skills, form.github_url || form.website].filter((x) => String(x || '').trim()).length;
  const completenessPct = Math.round((completeness / 6) * 100);
  const avatar = profile?.avatar_url || '';
  return <div className="dashboard-page container">
    <div className="dashboard-heading"><div><span className="section-kicker">CREATOR WORKSPACE</span><h1>Make your work <span className="text-orange">count.</span></h1><p>Your public portfolio, projects, and professional story in one place.</p></div><Link to={`/profile/${profile?.username || safeUsername(user.email)}`} className="btn btn-secondary">View public profile <ExternalLink size={15} /></Link></div>
    <div className="dashboard-layout"><aside className="dashboard-sidebar"><div className="dash-profile-summary"><Avatar name={form.full_name || user.email} src={avatar} size="xl" /><div className="dash-profile-name">{form.full_name || user.email?.split('@')[0]}</div><div className="dash-profile-handle">@{form.username || 'your-handle'}</div>{profile?.is_founder && <Badge variant="orange">Founder</Badge>}<div className="profile-completeness"><div className="completeness-line"><span>Profile strength</span><strong>{completenessPct}%</strong></div><div className="progress-track"><span style={{ width: `${completenessPct}%` }} /></div><small>A complete profile helps people understand your work.</small></div></div>
      <div className="dashboard-menu"><button className={cn(tab === 'profile' && 'active')} onClick={() => setTab('profile')}><CircleUserRound size={17} /> Edit profile</button><button className={cn(tab === 'projects' && 'active')} onClick={() => setTab('projects')}><Cpu size={17} /> My projects <span>{myProjects.length}</span></button><button className={cn(tab === 'activity' && 'active')} onClick={() => setTab('activity')}><ChartNoAxesCombined size={17} /> Activity & CV</button></div>
      <div className="dashboard-sidebar-note"><ShieldCheck size={16} /><span>Your account is connected to Supabase Auth. Keep your password private and only publish files you have permission to share.</span></div></aside>
      <div className="dashboard-content">
        {tab === 'profile' && <section className="panel dashboard-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR INTRODUCTION</span><h2>Creator profile</h2><p>This information appears on your public profile.</p></div><Badge variant="green"><CheckCircle2 size={13} /> Auto-save after submit</Badge></div><form onSubmit={saveProfile} className="dashboard-form">
          <div className="form-grid"><label className="form-field"><span>Full name</span><input className="plain-input" value={form.full_name} onChange={(e) => updateField('full_name', e.target.value)} required maxLength={80} placeholder="Your full name" /></label><label className="form-field"><span>Username</span><div className="input-wrap compact-input"><span className="input-prefix">@</span><input value={form.username} onChange={(e) => updateField('username', safeUsername(e.target.value))} required maxLength={30} /></div></label><label className="form-field full-field"><span>Profile image URL</span><input className="plain-input" type="url" value={form.avatar_url} onChange={(e) => updateField('avatar_url', e.target.value)} placeholder="https://... (optional)" /></label><label className="form-field full-field"><span>Professional headline</span><input className="plain-input" value={form.headline} onChange={(e) => updateField('headline', e.target.value)} maxLength={120} placeholder="e.g. Robotics Engineer · Python · CAD" /></label><label className="form-field full-field"><span>About you</span><textarea className="plain-input" rows="4" maxLength={700} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} placeholder="Tell people what you build, what you care about, and what you want to learn next." /></label><label className="form-field"><span>Location</span><div className="input-wrap compact-input"><MapPin size={16} /><input value={form.location} onChange={(e) => updateField('location', e.target.value)} maxLength={80} placeholder="City, country (optional)" /></div></label><label className="form-field"><span>Skills <small>· comma separated</small></span><input className="plain-input" value={form.skills} onChange={(e) => updateField('skills', e.target.value)} placeholder="Python, Robotics, CAD" /></label><label className="form-field"><span>Portfolio or website</span><div className="input-wrap compact-input"><Globe2 size={16} /><input type="url" value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="https://..." /></div></label><label className="form-field"><span>GitHub</span><div className="input-wrap compact-input"><Github size={16} /><input type="url" value={form.github_url} onChange={(e) => updateField('github_url', e.target.value)} placeholder="https://github.com/..." /></div></label><label className="form-field"><span>LinkedIn</span><div className="input-wrap compact-input"><Linkedin size={16} /><input type="url" value={form.linkedin_url} onChange={(e) => updateField('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." /></div></label></div>
          <div className="form-footer"><span><ShieldCheck size={15} /> Your email and password are not shown publicly.</span><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'} <Check size={16} /></Button></div>
        </form></section>}
        {tab === 'projects' && <section className="panel dashboard-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR BUILDS</span><h2>My projects</h2><p>Publish work that demonstrates your thinking and skills.</p></div><Button onClick={() => setShowProjectForm(!showProjectForm)}><Plus size={16} /> {showProjectForm ? 'Close form' : 'New project'}</Button></div>
          {showProjectForm && <form className="project-create-form" onSubmit={createProject}><h3>Publish a project</h3><div className="form-grid"><label className="form-field full-field"><span>Project title</span><input className="plain-input" required maxLength={100} value={projectForm.title} onChange={(e) => updateProjectField('title', e.target.value)} placeholder="What did you build?" /></label><label className="form-field full-field"><span>Short summary</span><textarea className="plain-input" rows="2" required maxLength={240} value={projectForm.summary} onChange={(e) => updateProjectField('summary', e.target.value)} placeholder="What it does and what makes it useful..." /></label><label className="form-field"><span>Category</span><select className="plain-input" value={projectForm.category} onChange={(e) => updateProjectField('category', e.target.value)}>{categories.filter((x) => x.name !== 'All').map((x) => <option key={x.name}>{x.name}</option>)}</select></label><label className="form-field"><span>Tags <small>· comma separated</small></span><input className="plain-input" value={projectForm.tags} onChange={(e) => updateProjectField('tags', e.target.value)} placeholder="Arduino, Python, Sensors" /></label><label className="form-field full-field"><span>Full description</span><textarea className="plain-input" rows="4" maxLength={5000} value={projectForm.description} onChange={(e) => updateProjectField('description', e.target.value)} placeholder="Explain the problem, tools, build steps, and what you learned." /></label><label className="form-field"><span>Cover image URL</span><input className="plain-input" type="url" value={projectForm.cover_image_url} onChange={(e) => updateProjectField('cover_image_url', e.target.value)} placeholder="https://..." /></label><label className="form-field"><span>Repository URL</span><input className="plain-input" type="url" value={projectForm.repo_url} onChange={(e) => updateProjectField('repo_url', e.target.value)} placeholder="https://github.com/..." /></label><label className="form-field full-field"><span>Demo URL <small>· optional</small></span><input className="plain-input" type="url" value={projectForm.demo_url} onChange={(e) => updateProjectField('demo_url', e.target.value)} placeholder="https://..." /></label></div><div className="form-footer"><span><ShieldCheck size={15} /> Only publish content you own or have permission to share.</span><Button type="submit" disabled={projectSaving}>{projectSaving ? 'Publishing…' : 'Publish project'} <ArrowUpRight size={16} /></Button></div></form>}
          {myProjects.length ? <div className="my-project-list">{myProjects.map((p) => <div className="my-project-row" key={p.id}><ProjectImage project={p} className="my-project-thumb" /><div className="my-project-info"><strong>{p.title}</strong><span>{p.category} · {prettyDate(p.created_at)}</span></div><Badge variant="green">Published</Badge><Link to={`/project/${p.slug}`} className="icon-button"><ArrowUpRight size={17} /></Link></div>)}</div> : !showProjectForm && <EmptyState icon={Cpu} title="Your first project goes here" text="A strong project entry includes a problem, tools used, what you built, and links to the code or demo." action={<Button onClick={() => setShowProjectForm(true)}><Plus size={15} /> Create your first project</Button>} />}</section>}
        {tab === 'activity' && <section className="panel dashboard-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR PROFESSIONAL STORY</span><h2>Activity & CV</h2><p>Use these checkpoints to make your public profile more useful.</p></div><Badge variant="orange">In progress</Badge></div><div className="cv-checklist"><CVItem complete={Boolean(form.full_name)} title="Add your name and headline" text="Make it clear what kind of engineering work you do." /><CVItem complete={Boolean(form.bio)} title="Write a short professional summary" text="Explain your interests, approach, and direction." /><CVItem complete={Boolean(form.skills)} title="List your skills" text="Use specific languages, tools, and methods you can demonstrate." /><CVItem complete={myProjects.length > 0} title="Publish at least one project" text="Document the goal, your contribution, and the outcome." /><CVItem complete={Boolean(form.github_url || form.website)} title="Link to supporting work" text="Connect a repository, demo, or portfolio when available." /></div><div className="cv-export-note"><FileText size={20} /><div><strong>CV-ready profile</strong><p>Share your public creator page as a portfolio link or use Save CV / PDF on the public profile to print it or save it as a PDF.</p></div></div></section>}
      </div>
    </div>
  </div>;
}
function CVItem({ complete, title, text }) { return <div className={cn('cv-item', complete && 'cv-item-complete')}><span className="cv-check">{complete ? <Check size={16} /> : <span />}</span><div><strong>{title}</strong><p>{text}</p></div><Badge variant={complete ? 'green' : 'default'}>{complete ? 'Done' : 'Next step'}</Badge></div>; }

function CreatorProfilePage({ creators, projects, user, profile, navigate, notify, followedCreatorIds = [], toggleFollow }) {
  const { username } = useParams(); const creator = creators.find((c) => c.username === username) || (profile?.username === username ? profile : username === 'kareem-games' ? founderFallback : null);
  const creatorProjects = projects.filter((p) => p.owner?.username === username || p.owner_id === creator?.id).filter((p) => !p.demo || username === 'kareem-games');
  const isOwner = user && creator?.id === user.id;
  if (!creator) return <div className="page container"><EmptyState icon={CircleUserRound} title="Creator not found" text="The profile may be private, unavailable, or the username may have changed." action={<Link className="btn btn-secondary" to="/creators">Explore creators</Link>} /></div>;
  const skills = creator.skills || [];
  return <div className="page container profile-page"><div className="profile-banner"><div className="profile-banner-grid" /><div className="profile-banner-content"><Badge variant="orange">{creator.is_founder ? 'FOUNDING CREATOR' : 'ENGINEERING CREATOR'}</Badge><h1>{creator.full_name || 'Engineering Creator'}<span className="text-orange">.</span></h1><p>{creator.headline || 'Building projects, learning, and sharing engineering work.'}</p><div className="profile-loc"><MapPin size={14} /> {creator.location || 'Location not added'} <span /> <CalendarDays size={14} /> Joined {prettyDate(creator.created_at)}</div><div className="profile-banner-actions">{isOwner ? <Link className="btn btn-secondary btn-sm" to="/dashboard">Edit profile <ArrowUpRight size={14} /></Link> : <Button size="sm" variant={followedCreatorIds.includes(creator.id) ? 'secondary' : 'primary'} onClick={() => toggleFollow?.(creator)}><Users size={14} /> {followedCreatorIds.includes(creator.id) ? 'Following' : 'Follow creator'}</Button>}<Button size="sm" variant="secondary" onClick={() => window.print()}><FileText size={14} /> Save CV / PDF</Button></div></div><Avatar name={creator.full_name} src={creator.avatar_url} size="2xl" className="profile-banner-avatar" /></div>
    <div className="profile-main-grid"><div className="profile-primary"><section className="panel profile-section"><div className="profile-section-heading"><h2>About</h2>{isOwner && <Link className="text-link" to="/dashboard">Edit profile <ArrowUpRight size={14} /></Link>}</div><p className="profile-about-text">{creator.bio || 'This creator is just getting started. Check back as they add more details about their engineering journey.'}</p><div className="profile-links"><SocialLink href={creator.github_url} icon={Github} label="GitHub" /><SocialLink href={creator.linkedin_url} icon={Linkedin} label="LinkedIn" /><SocialLink href={creator.website} icon={Globe2} label="Website" /></div></section>
      <section className="profile-section projects-section"><div className="profile-section-heading"><div><span className="section-kicker">WORK THAT SPEAKS</span><h2>Featured projects</h2></div><span className="count-badge">{creatorProjects.length}</span></div>{creatorProjects.length ? <ProjectGrid projects={creatorProjects} navigate={navigate} /> : <EmptyState icon={Cpu} title="Projects are coming" text={isOwner ? 'Publish your first project to make your profile more useful.' : 'This creator has not published any projects yet.'} action={isOwner ? <Link to="/dashboard" className="btn btn-primary btn-sm">Add a project</Link> : null} />}</section></div>
      <aside className="profile-aside"><section className="panel profile-section"><div className="profile-section-heading"><h2>Skills & tools</h2></div><div className="profile-skill-list">{skills.length ? skills.map((skill) => <span key={skill}>{skill}</span>) : <span>Add skills to show your strengths.</span>}</div></section><section className="panel profile-section reputation-panel"><span className="section-kicker">PROFILE SNAPSHOT</span><div className="reputation-metric"><span><Cpu size={16} /> Published projects</span><strong>{creatorProjects.filter((p) => !p.demo).length}</strong></div><div className="reputation-metric"><span><BadgeCheck size={16} /> Email verified</span><strong>{creator.id === 'founder-demo' ? '—' : 'Account'}</strong></div><p className="muted small">Reputation is based on visible contributions, not a hidden popularity score.</p></section><section className="panel profile-section profile-contact"><span className="section-kicker">CONNECT</span><h3>Build something together.</h3><p>Reach out through the creator's linked profiles or start by exploring their work.</p>{safeHttpUrl(creator.website) ? <a href={safeHttpUrl(creator.website)} target="_blank" rel="noreferrer" className="btn btn-secondary btn-block">Visit website <ExternalLink size={15} /></a> : <Link to="/marketplace" className="btn btn-secondary btn-block">Explore projects <ArrowRight size={15} /></Link>}</section></aside></div>
  </div>;
}

function ProjectDetailPage({ projects, user, likedIds, savedIds, toggleLike, toggleSave, navigate, notify }) {
  const { slug } = useParams(); const [project, setProject] = useState(projects.find((p) => p.slug === slug || p.id === slug) || null); const [comments, setComments] = useState([]); const [commentText, setCommentText] = useState(''); const [commentBusy, setCommentBusy] = useState(false);
  useEffect(() => { let active = true; async function load() { const found = projects.find((p) => p.slug === slug || p.id === slug); if (found) { setProject(found); return; } if (!supabase) return; const { data } = await supabase.from('projects').select('*, owner:profiles!projects_owner_id_fkey(full_name, username, avatar_url)').eq('slug', slug).maybeSingle(); if (active && data) setProject({ ...data, demo: false }); } load(); return () => { active = false; }; }, [slug, projects]);
  useEffect(() => { let active = true; async function loadComments() { if (!supabase || !project || project.demo) { setComments([]); return; } const { data } = await supabase.from('project_comments').select('*, author:profiles!project_comments_user_id_fkey(full_name, username, avatar_url)').eq('project_id', project.id).order('created_at', { ascending: false }).limit(50); if (active) setComments(data || []); } loadComments(); return () => { active = false; }; }, [project?.id]);
  const submitComment = async (e) => { e.preventDefault(); if (!user) { notify('Sign in to join the discussion.', 'info'); navigate('/login'); return; } if (!project || project.demo || !supabase) { notify('Comments are available on live projects.', 'info'); return; } if (!commentText.trim()) return; setCommentBusy(true); const { error } = await supabase.from('project_comments').insert({ project_id: project.id, user_id: user.id, body: commentText.trim() }); setCommentBusy(false); if (error) { notify(error.message, 'error'); return; } setCommentText(''); const { data } = await supabase.from('project_comments').select('*, author:profiles!project_comments_user_id_fkey(full_name, username, avatar_url)').eq('project_id', project.id).order('created_at', { ascending: false }).limit(50); setComments(data || []); notify('Comment added.'); };
  if (!project) return <div className="page container"><EmptyState icon={Cpu} title="Project not found" text="This project may have been removed or the link may be outdated." action={<Link className="btn btn-secondary" to="/marketplace">Back to marketplace</Link>} /></div>;
  return <div className="page container project-detail-page"><Link to="/marketplace" className="back-link"><ArrowLeft size={15} /> Back to marketplace</Link><div className="project-detail-hero"><ProjectImage project={project} className="project-detail-image" /><div className="project-detail-heading"><span className="section-kicker">{project.category} · PROJECT SHOWCASE</span><h1>{project.title}<span className="text-orange">.</span></h1><p>{project.summary}</p><div className="project-detail-author"><Avatar name={project.owner?.full_name || 'Engineer'} src={project.owner?.avatar_url} size="sm" /><div><Link to={`/profile/${project.owner?.username || 'kareem-games'}`}>{project.owner?.full_name || 'Community creator'}</Link><small>Project creator · {prettyDate(project.created_at)}</small></div></div><div className="project-detail-actions"><Button onClick={() => toggleLike(project)} variant={likedIds.includes(project.id) ? 'primary' : 'secondary'}><Heart size={16} fill={likedIds.includes(project.id) ? 'currentColor' : 'none'} /> Appreciate</Button><Button onClick={() => toggleSave(project)} variant="secondary"><Bookmark size={16} fill={savedIds.includes(project.id) ? 'currentColor' : 'none'} /> {savedIds.includes(project.id) ? 'Saved' : 'Save project'}</Button>{safeHttpUrl(project.repo_url) && <a href={safeHttpUrl(project.repo_url)} target="_blank" rel="noreferrer" className="btn btn-secondary"><Github size={16} /> View code <ExternalLink size={14} /></a>}{safeHttpUrl(project.demo_url) && <a href={safeHttpUrl(project.demo_url)} target="_blank" rel="noreferrer" className="btn btn-primary">Live demo <ArrowUpRight size={15} /></a>}</div></div></div>
    <div className="project-detail-content"><div className="project-description panel"><span className="section-kicker">THE BUILD NOTES</span><h2>About this project</h2><p>{project.description || project.summary}</p><h3>Tools & technologies</h3><div className="tag-row detail-tags">{(project.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>{project.demo && <div className="demo-notice"><CircleHelp size={16} /><span>This is a demonstration project included to show how EngiMarket can look. Publish a project from your workspace to add live content.</span></div>}</div>
      <aside className="project-detail-sidebar"><div className="panel project-details-card"><h3>Project overview</h3><div className="overview-row"><span>Category</span><strong>{project.category}</strong></div><div className="overview-row"><span>Appreciations</span><strong>{project.likes || 0}</strong></div><div className="overview-row"><span>Posted</span><strong>{prettyDate(project.created_at)}</strong></div><div className="overview-row"><span>Source code</span><strong>{project.repo_url ? 'Available' : 'Not linked'}</strong></div><Button className="btn-block" onClick={() => { if (!user) navigate('/signup'); else navigate('/dashboard'); }}>{user ? 'Publish your own project' : 'Create your profile'} <ArrowRight size={15} /></Button></div></aside></div>
    <section className="comments-section"><div className="section-heading-row"><div><span className="section-kicker">SHARE USEFUL FEEDBACK</span><h2>Project discussion</h2></div><Badge>{comments.length} comments</Badge></div><form className="comment-form" onSubmit={submitComment}><Avatar name={user?.user_metadata?.full_name || user?.email || 'You'} size="sm" /><textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} rows="2" placeholder={user ? 'Ask a question or share constructive feedback...' : 'Sign in to join the conversation...'} disabled={!user} /><Button type="submit" disabled={!user || commentBusy || !commentText.trim()}>{commentBusy ? 'Posting…' : 'Comment'} <ArrowRight size={15} /></Button></form>{comments.length ? <div className="comments-list">{comments.map((c) => <div className="comment-row" key={c.id}><Avatar name={c.author?.full_name} src={c.author?.avatar_url} size="sm" /><div><div className="comment-author"><strong>{c.author?.full_name || 'Creator'}</strong><span>{prettyDate(c.created_at)}</span></div><p>{c.body}</p></div></div>)}</div> : <p className="muted small comments-empty">{project.demo ? 'Comments will appear when a live project is published.' : 'No comments yet. Start with a useful question or a note about the build.'}</p>}</section>
  </div>;
}

function NotFoundPage() { return <div className="page container"><div className="signed-out-panel"><span className="section-kicker">404 · LOST IN THE WORKSHOP</span><h1>This page isn't wired up yet.</h1><p>Head back to the home page and keep exploring.</p><Link to="/" className="btn btn-primary">Go home <ArrowRight size={16} /></Link></div></div>; }

function Footer() {
  return <footer className="site-footer"><div className="container footer-top"><div className="footer-brand-col"><Link to="/" className="brand"><span className="brand-mark"><Cog size={22} strokeWidth={2.8} /></span><span>Engi<span>Market</span></span></Link><p>Where engineering ideas become shareable work. Build a profile, publish projects, and learn from other creators.</p><div className="footer-social"><a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a><a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a><a href="mailto:hello@engimarket.example" aria-label="Email"><Mail size={17} /></a></div></div><div className="footer-links-col"><strong>Explore</strong><Link to="/marketplace">Marketplace</Link><Link to="/creators">Creators</Link><Link to="/community">Community</Link></div><div className="footer-links-col"><strong>Your space</strong><Link to="/signup">Create account</Link><Link to="/login">Log in</Link><Link to="/dashboard">Creator workspace</Link></div><div className="footer-note"><span className="footer-note-icon"><Cog size={21} /></span><strong>Built by builders.</strong><span>Made for the next generation of engineering work.</span></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} EngiMarket. A community project.</span><span>Build. Share. Collaborate. <span className="text-orange">●</span></span></div></footer>;
}
