import { ConnectivityBadge } from '../components/ConnectivityBadge';
import { Sparkline } from '../components/Sparkline';
import { ROOMS } from '../data/devices';
import { useDeviceStore } from '../state/deviceStore';
import { useTelemetryStore } from '../state/telemetryStore';
import type { Device, RoomDef } from '../types/device';

const BUTTON_CLASS =
  'rounded-full border border-border bg-white/5 px-2.5 py-1 text-[0.72rem] backdrop-blur-md transition-colors hover:border-accent hover:bg-white/10';

function shortLabel(roomLabel: string, deviceLabel: string) {
  return deviceLabel.startsWith(`${roomLabel} `) ? deviceLabel.slice(roomLabel.length + 1) : deviceLabel;
}

function NetworkRow({ device, label }: { device: Device; label: string }) {
  const setConnectivity = useDeviceStore((s) => s.setConnectivity);
  const history = useTelemetryStore((s) => s.history[device.id]);
  const hasTelemetry = device.state.type === 'tempSensor' || device.state.type === 'thermostat';
  const currentValue =
    device.state.type === 'tempSensor' ? device.state.temp : device.state.type === 'thermostat' ? device.state.currentTemp : null;

  return (
    <div className="flex flex-col gap-1.5 py-2 text-[0.83rem]">
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <button
          className={BUTTON_CLASS}
          onClick={() => setConnectivity(device.id, { online: !device.connectivity.online })}
        >
          {device.connectivity.online ? 'Disconnect' : 'Reconnect'}
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <ConnectivityBadge connectivity={device.connectivity} />
        {hasTelemetry && (
          <div className="flex items-center gap-1.5 text-accent-info">
            <Sparkline points={history ?? []} width={64} height={20} />
            {currentValue !== null && <span className="text-[0.68rem] tabular-nums text-muted">{currentValue.toFixed(1)}°</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomSection({ room, devices }: { room: RoomDef; devices: Device[] }) {
  const onlineCount = devices.filter((d) => d.connectivity.online).length;

  return (
    <section className="shrink-0 overflow-hidden rounded-2xl border border-border bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <header className="flex items-center gap-2 border-b border-border/70 bg-white/[0.05] px-3 py-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            onlineCount === devices.length ? 'bg-accent-info shadow-[0_0_6px_rgba(95,184,201,0.85)]' : 'bg-accent-danger'
          }`}
        />
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-text">{room.label}</h3>
        <span className="ml-auto text-[0.6rem] text-muted">
          {onlineCount}/{devices.length} online
        </span>
      </header>
      <div className="flex flex-col divide-y divide-border/40 px-3">
        {devices.map((device) => (
          <NetworkRow key={device.id} device={device} label={shortLabel(room.label, device.label)} />
        ))}
      </div>
    </section>
  );
}

export function NetworkPanel() {
  const devices = useDeviceStore((s) => s.devices);

  const groups = ROOMS.map((room) => ({
    room,
    devices: Object.values(devices).filter((d) => d.room === room.id),
  })).filter((g) => g.devices.length > 0);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <div className="shrink-0 px-1">
        <h2 className="text-xs uppercase tracking-wide text-ink-muted">Network</h2>
        <p className="mt-1 text-[0.68rem] text-muted">
          Simulated connectivity - signal, battery, and reachability. A rule can't fire off a device it can't
          currently reach: disconnect one below, then try to trigger a rule that depends on it.
        </p>
      </div>
      {groups.map(({ room, devices: roomDevices }) => (
        <RoomSection key={room.id} room={room} devices={roomDevices} />
      ))}
    </div>
  );
}
