import { Handle, Position, type NodeProps } from 'reactflow';
import { FIELDS_BY_TYPE } from '../../data/deviceFields';
import { INITIAL_DEVICES } from '../../data/devices';
import { useDeviceStore } from '../../state/deviceStore';
import { useRuleStore } from '../../state/ruleStore';
import type { ComparisonOperator, ConditionNodeData } from '../../types/rule';

const OPERATORS: ComparisonOperator[] = ['>', '<', '>=', '<=', '=='];

export function ConditionNode({ id, data }: NodeProps<ConditionNodeData>) {
  const updateNodeData = useRuleStore((s) => s.updateNodeData);
  const removeNode = useRuleStore((s) => s.removeNode);
  const device = INITIAL_DEVICES.find((d) => d.id === data.sourceDeviceId);
  const fields = device ? FIELDS_BY_TYPE[device.type] : [];
  const fieldDef = fields.find((f) => f.key === data.field);
  const liveDevice = useDeviceStore((s) => s.devices[data.sourceDeviceId]);

  return (
    <div className="min-w-[200px] rounded-2xl border border-accent-warn/40 bg-panel p-2.5 text-xs shadow-lg backdrop-blur-xl">
      <Handle type="target" position={Position.Left} />
      <div className="mb-1 flex items-center gap-1.5 font-medium text-ink">
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent-warn" />
        Condition
        {liveDevice && (
          <span
            className={`h-1.5 w-1.5 rounded-full ${liveDevice.connectivity.online ? 'bg-accent-info' : 'bg-accent-danger'}`}
            title={liveDevice.connectivity.online ? 'Device online' : 'Device offline - this condition fails closed'}
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
        className="mb-1 w-full rounded-lg bg-bg-deep text-paper px-2 py-1.5"
        value={data.sourceDeviceId}
        onChange={(e) => updateNodeData(id, { sourceDeviceId: e.target.value, field: '' })}
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
        value={data.field}
        onChange={(e) => updateNodeData(id, { field: e.target.value })}
        disabled={!device}
      >
        <option value="">Field…</option>
        {fields.map((f) => (
          <option key={f.key} value={f.key}>
            {f.key}
          </option>
        ))}
      </select>

      <div className="flex gap-1">
        <select
          className="rounded-lg bg-bg-deep text-paper px-2 py-1.5"
          value={data.operator}
          onChange={(e) => updateNodeData(id, { operator: e.target.value as ComparisonOperator })}
        >
          {OPERATORS.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        {fieldDef?.type === 'boolean' ? (
          <select
            className="flex-1 rounded-lg bg-bg-deep text-paper px-2 py-1.5"
            value={String(data.value)}
            onChange={(e) => updateNodeData(id, { value: e.target.value === 'true' })}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type="number"
            className="w-16 flex-1 rounded-lg bg-bg-deep text-paper px-2 py-1.5"
            value={Number(data.value)}
            onChange={(e) => updateNodeData(id, { value: Number(e.target.value) })}
          />
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
