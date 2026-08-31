// Cosmetic simulation only - NOT real cryptography. Deterministically derives a
// fake per-device "token" string so the UI has something stable to display.
export function issueToken(deviceId: string): string {
  let hash = 0;
  for (let i = 0; i < deviceId.length; i++) {
    hash = (hash * 31 + deviceId.charCodeAt(i)) >>> 0;
  }
  return `sim_${hash.toString(16).padStart(8, '0')}`;
}
