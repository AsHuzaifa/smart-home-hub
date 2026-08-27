import { useDeviceStore } from '../state/deviceStore';
import { useRuleStore } from '../state/ruleStore';
import type { CompiledRule } from '../types/rule';
import { canFire } from './debounce';
import { evaluateCondition } from './evaluateCondition';
import { graphToRules } from './graphToRules';

const MAX_CHAIN_DEPTH = 5;

let compiledRules: CompiledRule[] = [];
let rulesByDeviceId = new Map<string, CompiledRule[]>();

function recompile() {
  const { nodes, edges } = useRuleStore.getState();
  compiledRules = graphToRules(nodes, edges);

  rulesByDeviceId = new Map();
  for (const rule of compiledRules) {
    const referencedDeviceIds = new Set([
      ...rule.triggers.map((t) => t.sourceDeviceId),
      ...rule.conditions.map((c) => c.sourceDeviceId),
    ]);
    for (const deviceId of referencedDeviceIds) {
      const existing = rulesByDeviceId.get(deviceId) ?? [];
      existing.push(rule);
      rulesByDeviceId.set(deviceId, existing);
    }
  }
}

useRuleStore.subscribe(recompile);
recompile();

function fireRule(rule: CompiledRule, depth: number) {
  if (depth > MAX_CHAIN_DEPTH) {
    console.warn(`Rule chain exceeded max depth (${MAX_CHAIN_DEPTH}); stopping to avoid a loop.`);
    return;
  }
  if (!canFire(rule.id, rule.debounceMs)) return;

  for (const action of rule.actions) {
    useDeviceStore.getState().setDeviceState(action.targetDeviceId, action.patch);
  }
}

export const engine = {
  onDeviceChanged(deviceId: string, depth = 0) {
    const affectedRules = rulesByDeviceId.get(deviceId);
    if (!affectedRules) return;

    const devices = useDeviceStore.getState().devices;
    for (const rule of affectedRules) {
      const allConditionsPass = rule.conditions.every((c) => evaluateCondition(c, devices));
      if (allConditionsPass) fireRule(rule, depth + 1);
    }
  },
};
