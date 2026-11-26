import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CalendarClock, ChartNoAxesCombined, BookOpen, ChevronRight, FileText, Flame, House, Layers3, ListChecks, Map, Moon, PanelLeftClose, PanelLeftOpen, Settings2, Sun, Zap } from 'lucide-react';
import { catalog, type Item } from './content/catalog';
import { mastery, reviewIndex, reviewQueue, stats } from './engine/progress';
import { useStudy } from './store/study';
import { Contours } from './components/EditorialArt';
import { UnitSearch } from './components/UnitSearch';
import { ExamGuide } from './components/Content';
import { IconButton, usePreference } from './components/LayoutControls';
import { StudyMap } from './components/Map';
import { Practice } from './components/Practice';
import { ReviewPage } from './components/ReviewPage';
import { Settings } from './components/Settings';
import { PerformancePage, StudyHome } from './components/StudyOverview';
import { UnitPage } from './components/UnitPage';

type Page = 'home' | 'map' | 'unit' | 'review' | 'performance' | 'exam' | 'settings';
type Session = { items: Item[]; recovery: boolean; returnTo: Page; scrollY: number };
type NavTarget = Exclude<Page, 'unit'> | Item['kind'];
const navigation = [
  { page: 'home', label: 'Início', icon: House },
  { page: 'map', label: 'Trilha', icon: Map },
  { page: 'question', label: 'Questões FCC', icon: ListChecks },
  { page: 'review', label: 'Revisões', icon: CalendarClock },
  { page: 'card', label: 'Flashcards', icon: Layers3 },
  { page: 'performance', label: 'Desempenho', icon: ChartNoAxesCombined },
  { page: 'exam', label: 'Edital', icon: FileText },
  { page: 'settings', label: 'Ajustes', icon: Settings2 },
] as const;

export default function App() {
  const { progress, error, update } = useStudy();
  const [page, setPage] = useState<Page>('home');
  const [discipline, setDiscipline] = useState('CE-GEO');
  const [unitId, setUnitId] = useState('');
  const [session, setSession] = useState<Session>();
  const [now, setNow] = useState(Date.now);
  const [collapsed, setCollapsed] = usePreference('navigation', false, [true, false]);
  const [outlineHost, setOutlineHost] = useState<HTMLDivElement | null>(null);
  const [immersive, setImmersive] = useState(false);
  const pendingScroll = useRef<number | null>(null);
  const reviews = useMemo(() => reviewIndex(progress.attempts), [progress.attempts]);
  const due = useMemo(() => reviewQueue(catalog.items.values(), reviews, now), [reviews, now]);
  const scores = useMemo(() => stats(progress.attempts, new Date(now)), [progress.attempts, now]);
  const unit = catalog.units.get(unitId);

  useLayoutEffect(() => {
    document.documentElement.dataset.appearance = progress.appearance;
    document.documentElement.dataset.intensity = progress.intensity;
  }, [progress.appearance, progress.intensity]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  useLayoutEffect(() => {
    if (pendingScroll.current === null) return;
    window.scrollTo(0, pendingScroll.current);
    pendingScroll.current = null;
  });

  function go(next: Page, position = 0) {
    pendingScroll.current = position;
    setSession(undefined);
    setImmersive(false);
    setPage(next);
    setNow(Date.now());
    if (!position) window.scrollTo(0, 0);
  }

  function openUnit(id: string) {
    const target = catalog.units.get(id);
    if (!target) return;
    setDiscipline(target.disciplina_id);
    setUnitId(id);
    go('unit');
  }

  function openDiscipline(id: string) {
    if (page === 'map') { setDiscipline(id); return; }
    setDiscipline(id);
    go('map');
  }

  function start(items: Item[], recovery: boolean) {
    setSession({ items, recovery, returnTo: page, scrollY: session?.scrollY ?? window.scrollY });
    setImmersive(false);
    pendingScroll.current = 0;
  }

  function practiceUnit(kind: Item['kind'], target = unit) {
    if (!target) return;
    const items = [...catalog.items.values()].filter(item => item.unit === target && item.kind === kind);
    const dueIds = new Set(due.map(item => item.id));
    items.sort((a, b) => Number(dueIds.has(b.id)) - Number(dueIds.has(a.id)));
    start(items, false);
  }

  function openNavigation(target: NavTarget) {
    if (target !== 'question' && target !== 'card') {
      go(target);
      return;
    }
    const last = progress.attempts.at(-1);
    const recentUnit = last && catalog.items.get(last.itemId)?.unit;
    practiceUnit(target, unit ?? recentUnit ?? catalog.bundle.unidades[0]);
  }

  const focusPractice = session && progress.intensity === 'focus';
  const exitSession = () => { if (session) go(session.returnTo, session.scrollY); };
  const section = navigation.find(item => item.page === page)?.label ?? 'Unidade de estudo';
  const reading = page === 'unit' && !session;
  const sessionType = session?.items[0]?.kind;
  const disciplineName = unit && catalog.disciplines.find(d => d.disciplina_id === unit.disciplina_id)?.nome;

  return <div className={`app-shell ${reading ? 'study-view reading-view' : session ? 'study-view' : ''} ${collapsed ? 'nav-collapsed' : ''} ${immersive ? 'is-immersive' : ''}`}>
    <aside className="site-sidebar">
      <button className="brand" onClick={() => go('home')} aria-label="SOaprender, início">
        <span className="brand-mark"><BookOpen size={34} strokeWidth={1.45} /></span><span className="brand-name">SOaprender</span>
      </button>
      <IconButton className="nav-toggle" label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        icon={collapsed ? PanelLeftOpen : PanelLeftClose} aria-expanded={!collapsed} aria-controls="site-navigation"
        onClick={() => setCollapsed(!collapsed)} />
      <nav id="site-navigation" className="navigation" aria-label="Navegação principal">
        {navigation.map(({ page: target, label, icon: Icon }) => <button key={target} className={`nav-${target}`}
          aria-label={label} aria-current={(session ? target === (session.recovery ? 'review' : sessionType) :
            page === target || (target === 'map' && page === 'unit')) ? 'page' : undefined}
          onClick={() => openNavigation(target)}><Icon size={19} /><span className="nav-label">{label}</span>
          {target === 'review' && due.length > 0 && <span className="nav-count" aria-hidden="true">{due.length}</span>}
          <span className="nav-tip" aria-hidden="true">{label}</span>
        </button>)}
      </nav>
      <div className="sidebar-context" ref={setOutlineHost} />
      <Contours />
      <p className="sidebar-exam"><span>SEDUC–MA</span><small>Professor de Geografia</small></p>
    </aside>
    <div className="app-workspace">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand mobile-brand" onClick={() => go('home')} aria-label="SOaprender, início">
            <span className="brand-mark"><BookOpen size={24} strokeWidth={1.5} /></span><span className="brand-name">SOaprender</span>
          </button>
          <div className="topbar-section">
            <strong>{reading && disciplineName ? disciplineName : 'SEDUC–MA / FCC'}</strong>
            <ChevronRight size={15} aria-hidden="true" />
            <span>{reading ? unit?.topico_id : session ? session.recovery ? 'Sessão de revisão' : sessionType === 'card' ? 'Flashcards' : 'Questões FCC'
              : page === 'home' ? 'Professor de Geografia' : section}</span>
          </div>
          <UnitSearch onSelect={openUnit} />
          <div className="top-controls">
            {!focusPractice && <div className="hud">
              <span title={`${scores.streak} dias de prática consecutiva`}><Flame size={16} /> {scores.streak}</span>
              <span className="xp" title={`Nível ${scores.level}`}><Zap size={16} /> {scores.xp} XP</span>
            </div>}
            {(!session || session.items.every(item => item.kind === 'card')) && <button className="mode" aria-pressed={progress.intensity === 'arena'} onClick={() =>
              update(p => ({ ...p, intensity: p.intensity === 'focus' ? 'arena' : 'focus' }))}>
              {progress.intensity === 'focus' ? 'Foco' : 'Arena'}
            </button>}
            <IconButton label={progress.appearance === 'light' ? 'Usar aparência escura' : 'Usar aparência clara'}
              icon={progress.appearance === 'light' ? Moon : Sun}
              onClick={() => update(p => ({ ...p, appearance: p.appearance === 'light' ? 'dark' : 'light' }))} />
            <IconButton className="mobile-settings" label="Abrir ajustes" icon={Settings2} onClick={() => go('settings')} />
          </div>
        </div>
      </header>
      <main className={reading ? 'site-main reader-main' : session ? 'site-main practice-main' : 'site-main'}>
        {error && <p className="storage-error" role="alert">{error}</p>}
        {page === 'unit' && unit && <div hidden={Boolean(session)}><UnitPage key={unitId} unit={unit}
          score={mastery(unit, reviews)} outlineHost={reading && !collapsed ? outlineHost : null} onBack={() => go('map')} onPractice={practiceUnit}
          immersive={!session && immersive} onImmersion={setImmersive} /></div>}
        {page === 'review' && <div className="standard-page" hidden={Boolean(session)}>
          <ReviewPage due={due} reviews={reviews} onPractice={items => start(items, true)} />
        </div>}
        {session ? <>
          <button className="back session-exit" onClick={exitSession}><ArrowLeft size={17} /> Sair da sessão</button>
          <Practice items={session.items} reviews={reviews} recovery={session.recovery} onExit={exitSession}
            immersive={immersive} onImmersion={setImmersive} />
        </> : page === 'settings' ? <div className="standard-page"><Settings /></div> :
          page === 'exam' ? <div className="standard-page"><header className="page-heading"><h1>Edital e estratégia</h1></header><ExamGuide /></div> :
          page === 'performance' ? <PerformancePage reviews={reviews} attempts={progress.attempts} onDiscipline={openDiscipline} /> :
          page === 'map' ? <StudyMap reviews={reviews} disciplineId={discipline} onDiscipline={openDiscipline} onUnit={openUnit} /> :
          page === 'home' ? <StudyHome reviews={reviews} due={due} attempts={progress.attempts} onUnit={openUnit}
            onDiscipline={openDiscipline} onReview={() => go('review')} onMap={() => go('map')} onPerformance={() => go('performance')} /> : null}
      </main>
    </div>
  </div>;
}
