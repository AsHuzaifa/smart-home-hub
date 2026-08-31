import { ConnectivityBadge } from '../components/ConnectivityBadge';
import { Toggle } from '../components/Toggle';
import { ROOMS } from '../data/devices';
import { useDeviceStore } from '../state/deviceStore';
import type { Device, RoomDef } from '../types/device';

const BUTTON_CLASS =
  'rounded-full border border-border bg-white/5 px-2.5 py-1 text-[0.72rem] backdrop-blur-md transition-colors hover:border-accent hover:bg-white/10';

// Temperature zone boundaries (°C) - cold / comfortable / hot, matching the
// site's accent-info / accent / accent-danger tokens.
const TEMP_MIN = 10;
const TEMP_MAX = 35;
const COLD_END = 18;
const COMFY_END = 26;

function zonePercent(t: number) {
  return ((t - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 100;
}

const TEMP_ZONE_GRADIENT = `linear-gradient(to right,
  rgba(95, 184, 201, 0.55) 0%, rgba(95, 184, 201, 0.55) ${zonePercent(COLD_END)}%,
  rgba(143, 174, 93, 0.55) ${zonePercent(COLD_END)}%, rgba(143, 174, 93, 0.55) ${zonePercent(COMFY_END)}%,
  rgba(229, 101, 74, 0.55) ${zonePercent(COMFY_END)}%, rgba(229, 101, 74, 0.55) 100%)`;

function TemperatureSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const percent = zonePercent(value);
  const labelOnLeft = percent > 55;

  return (
    <div className="relative w-28">
      <input
        type="range"
        className="glass-slider w-full"
        min={TEMP_MIN}
        max={TEMP_MAX}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: TEMP_ZONE_GRADIENT }}
      />
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[0.62rem] font-medium text-white/90 ${
          labelOnLeft ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {value.toFixed(1)}°
      </span>
    </div>
  );
}

// Devices are named "<Room> <Thing>" in the data model (needed elsewhere, e.g. the
// rule editor's device dropdowns) - strip the room prefix here since it's now
// redundant under a room section header.
function shortLabel(roomLabel: string, deviceLabel: string) {
  return deviceLabel.startsWith(`${roomLabel} `) ? deviceLabel.slice(roomLabel.length + 1) : deviceLabel;
}

function DeviceRow({
  label,
  connectivity,
  children,
}: {
  label: string;
  connectivity: Device['connectivity'];
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[0.83rem]">
      <span className="flex items-center gap-2">
        {label}
        <ConnectivityBadge connectivity={connectivity} compact />
      </span>
      {children}
    </div>
  );
}

function ControlsForDevice({ device, label }: { device: Device; label: string }) {
  const setDeviceState = useDeviceStore((s) => s.setDeviceState);

  switch (device.state.type) {
    case 'light':
    case 'fan':
    case 'ac': {
      const on = device.state.on;
      const offline = !device.connectivity.online;
      return (
        <DeviceRow label={label} connectivity={device.connectivity}>
          <Toggle checked={on} disabled={offline} onChange={(v) => setDeviceState(device.id, { on: v })} />
        </DeviceRow>
      );
    }
    case 'door': {
      const doorState = device.state;
      const offline = !device.connectivity.online;
      return (
        <DeviceRow label={label} connectivity={device.connectivity}>
          <div className="flex gap-1.5">
            <button
              className={`${BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-white/5`}
              disabled={offline}
              onClick={() => setDeviceState(device.id, { locked: !doorState.locked })}
            >
              {doorState.locked ? 'Unlock' : 'Lock'}
            </button>
            <button
              className={`${BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-white/5`}
              disabled={offline || (doorState.locked && !doorState.open)}
              onClick={() => setDeviceState(device.id, { open: !doorState.open })}
            >
              {doorState.open ? 'Close' : 'Open'}
            </button>
          </div>
        </DeviceRow>
      );
    }
    case 'thermostat':
      return (
        <DeviceRow label={label} connectivity={device.connectivity}>
          <TemperatureSlider
            value={device.state.currentTemp}
            onChange={(v) => setDeviceState(device.id, { currentTemp: v })}
          />
        </DeviceRow>
      );
    case 'tempSensor':
      return (
        <DeviceRow label={label} connectivity={device.connectivity}>
          <TemperatureSlider value={device.state.temp} onChange={(v) => setDeviceState(device.id, { temp: v })} />
        </DeviceRow>
      );
    case 'motionSensor': {
      const offline = !device.connectivity.online;
      return (
        <DeviceRow label={label} connectivity={device.connectivity}>
          <button
            className={`${BUTTON_CLASS} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-white/5`}
            disabled={offline}
            onClick={() => setDeviceState(device.id, { motion: true, lastTriggeredAt: Date.now() })}
          >
            Trigger motion
          </button>
        </DeviceRow>
      );
    }
    default:
      return null;
  }
}

function RoomSection({ room, devices }: { room: RoomDef; devices: Device[] }) {
  return (
    <section className="shrink-0 overflow-hidden rounded-2xl border border-border bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <header className="flex items-center gap-2 border-b border-border/70 bg-white/[0.05] px-3 py-2">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-info shadow-[0_0_6px_rgba(95,184,201,0.85)]" />
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-wider text-text">{room.label}</h3>
        <span className="ml-auto text-[0.6rem] text-muted">
          {devices.length} device{devices.length === 1 ? '' : 's'}
        </span>
      </header>
      <div className="flex flex-col divide-y divide-border/40 px-3">
        {devices.map((device) => (
          <ControlsForDevice key={device.id} device={device} label={shortLabel(room.label, device.label)} />
        ))}
      </div>
    </section>
  );
}

export function DeviceControlPanel() {
  const devices = useDeviceStore((s) => s.devices);

  const groups = ROOMS.map((room) => ({
    room,
    devices: Object.values(devices).filter((d) => d.room === room.id),
  })).filter((g) => g.devices.length > 0);

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <h2 className="shrink-0 px-1 text-xs uppercase tracking-wide text-ink-muted">Control Panel</h2>
      {groups.map(({ room, devices: roomDevices }) => (
        <RoomSection key={room.id} room={room} devices={roomDevices} />
      ))}
    </div>
  );
}
