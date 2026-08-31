import { useEffect, useState } from 'react';
import { DeviceControlPanel } from './panels/DeviceControlPanel';
import { NetworkPanel } from './panels/NetworkPanel';
import { SecurityInfoPanel } from './panels/SecurityInfoPanel';
import { SecurityLogPanel } from './panels/SecurityLogPanel';
import { FloorplanScene } from './scene/FloorplanScene';
import { RuleEditor } from './editor/RuleEditor';
import { HelpButton } from './components/HelpButton';
import { InfoModal } from './components/InfoModal';
import { useSimulationHeartbeat } from './hooks/useSimulationHeartbeat';
import { hydrateRules, persistRulesOnChange } from './state/persist';

type Tab = 'rules' | 'devices' | 'network' | 'security';

function AboutContent() {
  return (
    <>
      <p>
        Smart Home Hub is a simulated smart-home dashboard: a live 3D floorplan of a house
        with devices that react in real time, a drag-and-drop rule builder to automate them,
        and a couple of layers that model what real IoT systems have to deal with -
        network reliability and command security. Everything runs client-side in the
        browser; there's no real hardware or backend behind any of it.
      </p>
      <div>
        <p className="font-medium text-text">Devices</p>
        <p>
          The control panel for every simulated device in the house - lights, fans, an AC
          unit, thermostats, temperature sensors, motion sensors, and doors. Toggle things
          on/off, lock/unlock and open/close doors, and adjust temperatures directly. Changes
          here are reflected instantly in the 3D house on the left. A device that's offline
          (see Network) can't be commanded from here until it reconnects.
        </p>
      </div>
      <div>
        <p className="font-medium text-text">Rules</p>
        <p>
          A visual automation builder, similar in spirit to Node-RED. Drag Trigger,
          Condition, and Action nodes onto the canvas and connect them to build "when this
          happens, do that" logic - e.g. "when the temperature sensor reads above 25°, turn
          on the fan." Rules run live: changing a device fires any rule wired to it.
        </p>
      </div>
      <div>
        <p className="font-medium text-text">Network</p>
        <p>
          A simulated connectivity layer. Every device has a signal strength, and
          battery-powered devices drain over time and can lose connection. Devices also
          drift and disconnect on their own periodically to mimic real-world flakiness. This
          is wired into the rules engine for real: a rule can't fire off a stale reading from
          a device that's currently unreachable.
        </p>
      </div>
      <div>
        <p className="font-medium text-text">Security</p>
        <p>
          A teaching-oriented demo of IoT security concepts - not real cryptography. Every
          device has a simulated token, every command is checked against an expected schema,
          and there's a simulated replay-attack demo per device that shows how a naive
          freshness check would (or wouldn't) catch a re-sent stale command. All simulated
          activity shows up in the Security Log.
        </p>
      </div>
    </>
  );
}

function App() {
  const [tab, setTab] = useState<Tab>('devices');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  useSimulationHeartbeat();

  useEffect(() => {
    hydrateRules();
    const unsubscribe = persistRulesOnChange();
    return unsubscribe;
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col gap-3 p-3 text-text">
      <header className="glass-panel flex shrink-0 items-center justify-between rounded-full px-5 py-2.5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-medium tracking-tight">Smart Home Hub</h1>
          <button
            onClick={() => setShowAbout(true)}
            className="rounded-full border border-border bg-white/5 px-2.5 py-1 text-[0.68rem] text-muted transition-colors hover:border-accent hover:bg-white/10 hover:text-text"
          >
            About
          </button>
        </div>
        <nav className="flex gap-1 text-xs">
          {(['devices', 'rules', 'network', 'security'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 capitalize transition-colors ${
                tab === t ? 'bg-white/15 text-text' : 'text-muted hover:bg-white/5 hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div className="glass-frame relative min-h-0 flex-1 overflow-hidden rounded-3xl">
          <FloorplanScene onSelectDevice={(id) => (setSelectedDeviceId(id), setTab('security'))} />
        </div>

        <aside className="glass-panel min-h-0 w-80 shrink-0 overflow-hidden rounded-3xl text-text">
          {tab === 'devices' && <DeviceControlPanel />}
          {tab === 'network' && <NetworkPanel />}
          {tab === 'security' &&
            (selectedDeviceId ? (
              <SecurityInfoPanel deviceId={selectedDeviceId} onClose={() => setSelectedDeviceId(null)} />
            ) : (
              <SecurityLogPanel />
            ))}
        </aside>
      </main>

      {tab === 'rules' && (
        <div className="glass-frame fixed inset-3 z-20 overflow-hidden rounded-3xl bg-bg/92 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-medium">Rule Builder</h2>
              <HelpButton title="Rule Builder">
                <p>
                  Rules are built from three kinds of nodes, dragged from the left palette onto
                  the canvas and wired together left to right:
                </p>
                <p>
                  <span className="font-medium text-text">Trigger</span> - picks a source device.
                  The rule is re-evaluated whenever that device's state changes.
                </p>
                <p>
                  <span className="font-medium text-text">Condition</span> - picks a device field
                  (e.g. temperature, motion) and compares it against a value (&gt;, &lt;, =).
                  Optional - a rule can go straight from a Trigger to an Action.
                </p>
                <p>
                  <span className="font-medium text-text">Action</span> - picks a target device and
                  the state change to apply to it (e.g. turn a light on, unlock a door). A rule
                  needs at least one Action to do anything.
                </p>
                <p>
                  Connect nodes by dragging from one node's edge handle to another's. The banner
                  at the top of the canvas warns about unconnected nodes, missing device/field
                  selections, or a rule with no Action. Rule changes are evaluated live - as soon
                  as nodes are connected and complete, changing the source device on the
                  Devices/Network tab (or via another rule) will fire this one. A rule can't
                  chain more than 5 actions deep, and it won't fire off a device that's currently
                  offline (see the Network tab).
                </p>
              </HelpButton>
            </div>
            <button
              onClick={() => setTab('devices')}
              className="rounded-full px-2.5 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-text"
            >
              Close ✕
            </button>
          </div>
          <div className="h-[calc(100%-45px)]">
            <RuleEditor />
          </div>
        </div>
      )}
      {showAbout && (
        <InfoModal title="About Smart Home Hub" onClose={() => setShowAbout(false)}>
          <AboutContent />
        </InfoModal>
      )}
    </div>
  );
}

export default App;
