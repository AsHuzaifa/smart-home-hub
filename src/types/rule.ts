import type { Node } from 'reactflow';
import type { DeviceState } from './device';

export type ComparisonOperator = '>' | '<' | '==' | '>=' | '<=';

export interface TriggerNodeData {
  kind: 'trigger';
  sourceDeviceId: string;
  event: 'motion' | 'stateChanged';
}

export interface ConditionNodeData {
  kind: 'condition';
  sourceDeviceId: string;
  field: string;
  operator: ComparisonOperator;
  value: number | boolean;
}

export interface ActionNodeData {
  kind: 'action';
  targetDeviceId: string;
  patch: Partial<DeviceState>;
  debounceMs?: number;
}

export type RuleNodeData = TriggerNodeData | ConditionNodeData | ActionNodeData;

export type RuleFlowNode = Node<RuleNodeData>;

export interface CompiledRule {
  id: string;
  triggers: TriggerNodeData[];
  conditions: ConditionNodeData[];
  actions: ActionNodeData[];
  debounceMs: number;
}
