import { useEffect, useState } from 'react';
import { DeviceControlPanel } from './panels/DeviceControlPanel';
import { SecurityInfoPanel } from './panels/SecurityInfoPanel';
import { SecurityLogPanel } from './panels/SecurityLogPanel';
import { FloorplanScene } from './scene/FloorplanScene';
import { RuleEditor } from './editor/RuleEditor';
import { hydrateRules, persistRulesOnChange } from './state/persist';

type Tab = 'rules' | 'devices' | 'security';

function App() {
  const [tab, setTab] = useState<Tab>('devices');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    hydrateRules();
    const unsubscribe = persistRulesOnChange();
    return unsubscribe;
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col bg-bg text-text">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <h1 className="text-sm font-medium">Smart Home Hub</h1>
        <nav className="flex gap-1 text-xs">
          {(['devices', 'rules', 'security'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1.5 capitalize ${
                tab === t ? 'bg-panel text-text' : 'text-muted hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <FloorplanScene onSelectDevice={(id) => (setSelectedDeviceId(id), setTab('security'))} />
        </div>

        <aside className="w-80 shrink-0 overflow-hidden border-l border-border bg-surface">
          {tab === 'devices' && <DeviceControlPanel />}
          {tab === 'security' &&
            (selectedDeviceId ? (
              <SecurityInfoPanel deviceId={selectedDeviceId} onClose={() => setSelectedDeviceId(null)} />
            ) : (
              <SecurityLogPanel />
            ))}
        </aside>
      </main>

      {tab === 'rules' && (
        <div className="fixed inset-0 z-20 bg-bg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 className="text-sm font-medium">Rule Builder</h2>
            <button onClick={() => setTab('devices')} className="text-xs text-muted hover:text-text">
              Close ✕
            </button>
          </div>
          <div className="h-[calc(100%-41px)]">
            <RuleEditor />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
