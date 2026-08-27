import { Handle, Position, type NodeProps } from 'reactflow';
import { INITIAL_DEVICES } from '../../data/devices';
import { useRuleStore } from '../../state/ruleStore';
import type { TriggerNodeData } from '../../types/rule';

export function TriggerNode({ id, data }: NodeProps<TriggerNodeData>) {
  const updateNodeData = useRuleStore((s) => s.updateNodeData);

  return (
    <div className="min-w-[180px] rounded border border-accent-info/40 bg-panel p-2 text-xs">
      <div className="mb-1 font-medium text-accent-info">Trigger</div>
      <select
        className="w-full rounded bg-surface px-1 py-1"
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
