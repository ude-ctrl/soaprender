import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, Compass, Flame, Map, Moon, Settings2, Sun, Zap } from 'lucide-react';
import { catalog, type Item } from './content/catalog';
import { mastery, reviewIndex, reviewQueue, stats } from './engine/progress';
import { useStudy } from './store/study';
import { StudyMap } from './components/Map';
import { Practice } from './components/Practice';
import { ReviewPage } from './components/ReviewPage';
import { Settings } from './components/Settings';
import { UnitPage } from './components/UnitPage';

type Page = 'map' | 'unit' | 'review' | 'settings';
type Session = { items: Item[]; recovery: boolean; returnTo: Page };
const navigation = [
  { page: 'map', label: 'Trilha', icon: Map },
  { page: 'review', label: 'Revisões', icon: CalendarClock },
  { page: 'settings', label: 'Ajustes', icon: Settings2 },
] as const;

export default function App() {
  const { progress, error, update } = useStudy();
  const [page, setPage] = useState<Page>('map');
  const [discipline, setDiscipline] = useState('CE-GEO');
  const [unitId, setUnitId] = useState('');
  const [session, setSession] = useState<Session>();
  const [now, setNow] = useState(Date.now);
  const reviews = useMemo(() => reviewIndex(progress.attempts), [progress.attempts]);
  const due = useMemo(() => reviewQueue(catalog.items.values(), reviews, now), [reviews, now]);
  const scores = useMemo(() => stats(progress.attempts, new Date(now)), [progress.attempts, now]);
  const unit = catalog.units.get(unitId);

  useEffect(() => {
    document.documentElement.dataset.appearance = progress.appearance;
    document.documentElement.dataset.intensity = progress.intensity;
  }, [progress.appearance, progress.intensity]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  function go(next: Page) {
    setSession(undefined);
    setPage(next);
    setNow(Date.now());
    window.scrollTo(0, 0);
  }

  function start(items: Item[], recovery: boolean) {
    setSession({ items, recovery, returnTo: page });
    window.scrollTo(0, 0);
  }

  function practiceUnit(kind: Item['kind']) {
    if (!unit) return;
    const items = [...catalog.items.values()].filter(item => item.unit === unit && item.kind === kind);
    const dueIds = new Set(due.map(item => item.id));
    items.sort((a, b) => Number(dueIds.has(b.id)) - Number(dueIds.has(a.id)));
    start(items, false);
  }

  const focusPractice = session && progress.intensity === 'focus';
  return <>
    <header className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => go('map')}>
          <span><Compass size={20} /></span>SOaprender
        </button>
        <div className="top-controls">
          {!focusPractice && <div className="hud">
            <span title={`${scores.streak} dias de prática consecutiva`}><Flame size={16} /> {scores.streak}</span>
            <span className="xp" title={`Nível ${scores.level}`}><Zap size={16} /> {scores.xp} XP</span>
          </div>}
          <button className="mode" aria-pressed={progress.intensity === 'arena'} onClick={() =>
            update(p => ({ ...p, intensity: p.intensity === 'focus' ? 'arena' : 'focus' }))}>
            {progress.intensity === 'focus' ? 'Foco' : 'Arena'}
          </button>
          <button className="icon-button" aria-label={progress.appearance === 'light' ? 'Usar aparência escura' : 'Usar aparência clara'}
            onClick={() => update(p => ({ ...p, appearance: p.appearance === 'light' ? 'dark' : 'light' }))}>
            {progress.appearance === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
    <nav className="navigation" aria-label="Navegação principal"><div>
      {navigation.map(({ page: target, label, icon: Icon }) => <button key={target}
        aria-current={page === target || (target === 'map' && page === 'unit') ? 'page' : undefined}
        onClick={() => go(target)}><Icon size={18} />{label}{target === 'review' && due.length > 0 && <span>{due.length}</span>}</button>)}
    </div></nav>
    <main>
      {error && <p className="storage-error" role="alert">{error}</p>}
      {session ? <>
        <button className="back" onClick={() => go(session.returnTo)}><ArrowLeft size={17} /> Sair da sessão</button>
        <Practice items={session.items} recovery={session.recovery} onExit={() => go(session.returnTo)} />
      </> : page === 'unit' && unit ? <UnitPage key={unitId} unit={unit} score={mastery(unit, reviews)}
        onBack={() => go('map')} onPractice={practiceUnit} /> :
        page === 'review' ? <ReviewPage due={due} reviews={reviews} onPractice={items => start(items, true)} /> :
        page === 'settings' ? <Settings /> :
        <StudyMap reviews={reviews} disciplineId={discipline} onDiscipline={setDiscipline}
          onUnit={id => { setUnitId(id); go('unit'); }} onReview={() => go('review')} dueCount={due.length} />}
    </main>
  </>;
}
