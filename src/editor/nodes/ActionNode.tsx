import { Handle, Position, type NodeProps } from 'reactflow';
import { FIELDS_BY_TYPE } from '../../data/deviceFields';
import { INITIAL_DEVICES } from '../../data/devices';
import { useRuleStore } from '../../state/ruleStore';
import type { ActionNodeData } from '../../types/rule';

export function ActionNode({ id, data }: NodeProps<ActionNodeData>) {
  const updateNodeData = useRuleStore((s) => s.updateNodeData);
  const removeNode = useRuleStore((s) => s.removeNode);
  const device = INITIAL_DEVICES.find((d) => d.id === data.targetDeviceId);
  const fields = device ? FIELDS_BY_TYPE[device.type] : [];
  const [patchKey, patchValue] = Object.entries(data.patch)[0] ?? [];
  const fieldDef = fields.find((f) => f.key === patchKey);

  return (
    <div className="min-w-[200px] rounded-2xl border border-accent/40 bg-panel p-2.5 text-xs shadow-lg backdrop-blur-xl">
      <Handle type="target" position={Position.Left} />
      <div className="mb-1 flex items-center gap-1.5 font-medium text-ink">
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
        Action
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
        className="mb-1 w-full rounded-lg bg-bg-deep text-paper px-2 py-1.5"
        value={data.targetDeviceId}
        onChange={(e) => updateNodeData(id, { targetDeviceId: e.target.value, patch: {} })}
      >
        <option value="">Select device…</option>
        {INITIAL_DEVICES.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>

      <select
        className="mb-1 w-full rounded-lg bg-bg-deep text-paper px-2 py-1.5"
        value={patchKey ?? ''}
        onChange={(e) => {
          const key = e.target.value;
          const def = fields.find((f) => f.key === key);
          updateNodeData(id, { patch: { [key]: def?.type === 'boolean' ? true : 0 } });
        }}
        disabled={!device}
      >
        <option value="">Set field…</option>
        {fields.map((f) => (
          <option key={f.key} value={f.key}>
            {f.key}
          </option>
        ))}
      </select>

      {patchKey &&
        (fieldDef?.type === 'boolean' ? (
          <select
            className="w-full rounded-lg bg-bg-deep text-paper px-2 py-1.5"
            value={String(patchValue)}
            onChange={(e) => updateNodeData(id, { patch: { [patchKey]: e.target.value === 'true' } })}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type="number"
            className="w-full rounded-lg bg-bg-deep text-paper px-2 py-1.5"
            value={Number(patchValue)}
            onChange={(e) => updateNodeData(id, { patch: { [patchKey]: Number(e.target.value) } })}
          />
        ))}
    </div>
  );
}
