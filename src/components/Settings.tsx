import { useEffect, useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { initialProgress, type UserProgress } from '../engine/progress';
import { parseBackup } from '../engine/storage';
import { useStudy } from '../store/study';

export function Confirm({ title, children, action, onCancel, onConfirm }: {
  title: string; children: string; action: string; onCancel: () => void; onConfirm: () => boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="panel" aria-labelledby="confirm-title"
    onCancel={event => { event.preventDefault(); onCancel(); }}>
    <h2 id="confirm-title">{title}</h2><p>{children}</p>
    <div className="actions"><button autoFocus onClick={onCancel}>Cancelar</button>
      <button className="danger" onClick={() => { if (onConfirm()) onCancel(); }}>{action}</button></div>
  </dialog>;
}

function download(progress: UserProgress) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'soaprender-progresso.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Settings() {
  const { progress, update } = useStudy();
  const [imported, setImported] = useState<UserProgress | null>(null);
  const [reset, setReset] = useState(false);
  const [message, setMessage] = useState('');
  return <>
    <header className="page-heading"><h1>Configurações</h1></header>
    <section className="panel preferences">
      <h2>Preferências</h2>
      <fieldset><legend>Aparência</legend><div className="actions">
        <button aria-pressed={progress.appearance === 'light'} onClick={() => update(p => ({ ...p, appearance: 'light' }))}>Clara</button>
        <button aria-pressed={progress.appearance === 'dark'} onClick={() => update(p => ({ ...p, appearance: 'dark' }))}>Escura</button>
      </div></fieldset>
      <fieldset><legend>Intensidade</legend><div className="actions">
        <button aria-pressed={progress.intensity === 'focus'} onClick={() => update(p => ({ ...p, intensity: 'focus' }))}>Foco</button>
        <button aria-pressed={progress.intensity === 'arena'} onClick={() => update(p => ({ ...p, intensity: 'arena' }))}>Arena</button>
      </div><p className="muted">Foco oferece prática sem relógio. Arena adiciona tempo de treino e combos às sessões.</p></fieldset>
    </section>
    <section className="panel preferences">
      <h2>Dados locais</h2><p>Exporte um backup para guardar seu histórico ou transferi-lo para outro dispositivo.</p>
      <div className="actions">
        <button onClick={() => download(progress)}><Download size={17} /> Exportar progresso</button>
        <label className="file-button"><Upload size={17} /> Importar progresso
          <input className="sr-only" type="file" accept="application/json,.json" aria-label="Importar progresso"
            onChange={async event => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              try {
                setImported(parseBackup(await file.text()));
                setMessage('');
              } catch {
                setMessage('Arquivo inválido ou incompatível com este catálogo.');
              }
            }} />
        </label>
      </div>
      {message && <p role="status">{message}</p>}
      <button className="danger" onClick={() => setReset(true)}><RotateCcw size={17} /> Reset geral</button>
    </section>
    {imported && <Confirm title="Importar progresso?" action="Substituir" onCancel={() => setImported(null)}
      onConfirm={() => {
        if (!update(() => imported)) return false;
        setMessage('Progresso importado.');
        return true;
      }}>O backup substituirá o histórico e as preferências salvos neste navegador.</Confirm>}
    {reset && <Confirm title="Zerar todo o progresso?" action="Zerar progresso" onCancel={() => setReset(false)}
      onConfirm={() => update(p => ({ ...initialProgress, appearance: p.appearance, intensity: p.intensity }))}>
      As tentativas, revisões, o domínio e o XP de todas as unidades serão apagados.
    </Confirm>}
  </>;
}
