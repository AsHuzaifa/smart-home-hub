import { useEffect } from 'react';
import { useDeviceStore } from '../state/deviceStore';

const TICK_MS = 3500;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

// Drives the two things that make the simulation feel like a live network
// instead of a static mock: sensor readings drift on their own (so telemetry
// has something to show without the visitor touching a slider, and so
// temperature-based rules can fire from ambient change), and connectivity
// wanders realistically - signal strength walks, battery drains, and devices
// occasionally drop offline and recover.
export function useSimulationHeartbeat() {
  useEffect(() => {
    const interval = setInterval(() => {
      const { devices, setDeviceState, setConnectivity } = useDeviceStore.getState();

      for (const device of Object.values(devices)) {
        if (device.state.type === 'tempSensor') {
          setDeviceState(device.id, { temp: round1(clamp(device.state.temp + (Math.random() - 0.5) * 0.6, 10, 35)) });
        } else if (device.state.type === 'thermostat') {
          setDeviceState(device.id, {
            currentTemp: round1(clamp(device.state.currentTemp + (Math.random() - 0.5) * 0.4, 10, 35)),
          });
        }

        const c = device.connectivity;
        const signalStrength = Math.round(clamp(c.signalStrength + (Math.random() - 0.5) * 6, 10, 100));
        const batteryLevel = c.batteryLevel === null ? null : round1(clamp(c.batteryLevel - Math.random() * 0.25, 0, 100));

        let online = c.online;
        if (online && Math.random() < 0.02) online = false;
        else if (!online && Math.random() < 0.3) online = true;
        if (batteryLevel !== null && batteryLevel <= 0) online = false;

        setConnectivity(device.id, { signalStrength, batteryLevel, online });
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);
}
