import type { ActionNodeData, ConditionNodeData, TriggerNodeData } from '../types/rule';

export interface NodeTemplate {
  kind: 'trigger' | 'condition' | 'action';
  label: string;
  defaultData: TriggerNodeData | ConditionNodeData | ActionNodeData;
}

export const NODE_CATALOG: NodeTemplate[] = [
  {
    kind: 'trigger',
    label: 'Trigger',
    defaultData: { kind: 'trigger', sourceDeviceId: '', event: 'stateChanged' },
  },
  {
    kind: 'condition',
    label: 'Condition',
    defaultData: { kind: 'condition', sourceDeviceId: '', field: '', operator: '>', value: 0 },
  },
  {
    kind: 'action',
    label: 'Action',
    defaultData: { kind: 'action', targetDeviceId: '', patch: {} },
  },
];
