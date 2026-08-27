import { Handle, Position, type NodeProps } from 'reactflow';
import { FIELDS_BY_TYPE } from '../../data/deviceFields';
import { INITIAL_DEVICES } from '../../data/devices';
import { useRuleStore } from '../../state/ruleStore';
import type { ComparisonOperator, ConditionNodeData } from '../../types/rule';

const OPERATORS: ComparisonOperator[] = ['>', '<', '>=', '<=', '=='];

export function ConditionNode({ id, data }: NodeProps<ConditionNodeData>) {
  const updateNodeData = useRuleStore((s) => s.updateNodeData);
  const device = INITIAL_DEVICES.find((d) => d.id === data.sourceDeviceId);
  const fields = device ? FIELDS_BY_TYPE[device.type] : [];
  const fieldDef = fields.find((f) => f.key === data.field);

  return (
    <div className="min-w-[200px] rounded border border-accent-warn/40 bg-panel p-2 text-xs">
      <Handle type="target" position={Position.Left} />
      <div className="mb-1 font-medium text-accent-warn">Condition</div>

      <select
        className="mb-1 w-full rounded bg-surface px-1 py-1"
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
        className="mb-1 w-full rounded bg-surface px-1 py-1"
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
          className="rounded bg-surface px-1 py-1"
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
            className="flex-1 rounded bg-surface px-1 py-1"
            value={String(data.value)}
            onChange={(e) => updateNodeData(id, { value: e.target.value === 'true' })}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type="number"
            className="w-16 flex-1 rounded bg-surface px-1 py-1"
            value={Number(data.value)}
            onChange={(e) => updateNodeData(id, { value: Number(e.target.value) })}
          />
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
