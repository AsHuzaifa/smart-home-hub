import { useDeviceStore } from '../state/deviceStore';
import type { Device } from '../types/device';

function ControlsForDevice({ device }: { device: Device }) {
  const setDeviceState = useDeviceStore((s) => s.setDeviceState);

  switch (device.state.type) {
    case 'light':
      return (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{device.label}</span>
          <input
            type="checkbox"
            checked={device.state.on}
            onChange={(e) => setDeviceState(device.id, { on: e.target.checked })}
          />
        </label>
      );
    case 'fan':
      return (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{device.label}</span>
          <input
            type="checkbox"
            checked={device.state.on}
            onChange={(e) => setDeviceState(device.id, { on: e.target.checked })}
          />
        </label>
      );
    case 'door': {
      const doorState = device.state;
      return (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>{device.label}</span>
          <div className="flex gap-2">
            <button
              className="rounded border border-border px-2 py-0.5 text-xs hover:border-accent"
              onClick={() => setDeviceState(device.id, { locked: !doorState.locked })}
            >
              {doorState.locked ? 'Unlock' : 'Lock'}
            </button>
            <button
              className="rounded border border-border px-2 py-0.5 text-xs hover:border-accent"
              onClick={() => setDeviceState(device.id, { open: !doorState.open })}
            >
              {doorState.open ? 'Close' : 'Open'}
            </button>
          </div>
        </div>
      );
    }
    case 'thermostat':
      return (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{device.label}: {device.state.currentTemp.toFixed(1)}°</span>
          <input
            type="range"
            min={10}
            max={35}
            step={0.5}
            value={device.state.currentTemp}
            onChange={(e) => setDeviceState(device.id, { currentTemp: Number(e.target.value) })}
          />
        </label>
      );
    case 'tempSensor':
      return (
        <label className="flex items-center justify-between gap-3 text-sm">
          <span>{device.label}: {device.state.temp.toFixed(1)}°</span>
          <input
            type="range"
            min={10}
            max={35}
            step={0.5}
            value={device.state.temp}
            onChange={(e) => setDeviceState(device.id, { temp: Number(e.target.value) })}
          />
        </label>
      );
    case 'motionSensor':
      return (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span>{device.label}</span>
          <button
            className="rounded border border-border px-2 py-0.5 text-xs hover:border-accent"
            onClick={() => setDeviceState(device.id, { motion: true, lastTriggeredAt: Date.now() })}
          >
            Trigger motion
          </button>
        </div>
      );
    default:
      return null;
  }
}

export function DeviceControlPanel() {
  const devices = useDeviceStore((s) => s.devices);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-4">
      <h2 className="text-xs uppercase tracking-wide text-muted">Simulate Sensors & Devices</h2>
      {Object.values(devices).map((device) => (
        <ControlsForDevice key={device.id} device={device} />
      ))}
    </div>
  );
}
