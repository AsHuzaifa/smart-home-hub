import { Handle, Position, type NodeProps } from 'reactflow';
import { INITIAL_DEVICES } from '../../data/devices';
import { useDeviceStore } from '../../state/deviceStore';
import { useRuleStore } from '../../state/ruleStore';
import type { TriggerNodeData } from '../../types/rule';

export function TriggerNode({ id, data }: NodeProps<TriggerNodeData>) {
  const updateNodeData = useRuleStore((s) => s.updateNodeData);
  const removeNode = useRuleStore((s) => s.removeNode);
  const liveDevice = useDeviceStore((s) => s.devices[data.sourceDeviceId]);

  return (
    <div className="min-w-[180px] rounded-2xl border border-accent-info/40 bg-panel p-2.5 text-xs shadow-lg backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-1.5 font-medium text-ink">
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent-info" />
        Trigger
        {liveDevice && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${liveDevice.connectivity.online ? 'bg-accent-info' : 'bg-accent-danger'}`}
            title={liveDevice.connectivity.online ? 'Device online' : 'Device offline - this trigger is inert'}
          />
        )}
        <button
          type="button"
          aria-label="Delete node"
          title="Delete node"
          onClick={() => removeNode(id)}
          className="nodrag ml-auto rounded-full px-1 text-ink-muted transition-colors hover:bg-accent-danger/20 hover:text-accent-danger"
        >
          ✕
        </button>
      </div>
      <select
        className="w-full rounded-lg bg-bg-deep text-paper px-2 py-1.5"
        value={data.sourceDeviceId}
        onChange={(e) => updateNodeData(id, { sourceDeviceId: e.target.value })}
      >
        <option value="">Select device…</option>
        {INITIAL_DEVICES.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
