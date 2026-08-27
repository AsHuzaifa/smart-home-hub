export interface SimulatedCommand {
  deviceId: string;
  patch: Record<string, unknown>;
  timestamp: number;
}

export type SecurityVerdict = 'accepted' | 'rejected';

export interface SecurityEvent {
  id: string;
  deviceId: string;
  timestamp: number;
  verdict: SecurityVerdict;
  reason: string;
}
