import { useRuleStore } from '../state/ruleStore';

export function RuleValidationBanner() {
  const nodes = useRuleStore((s) => s.nodes);
  const edges = useRuleStore((s) => s.edges);

  const warnings: string[] = [];

  const connectedIds = new Set(edges.flatMap((e) => [e.source, e.target]));
  const unconnected = nodes.filter((n) => !connectedIds.has(n.id) && nodes.length > 1);
  if (unconnected.length > 0) {
    warnings.push(`${unconnected.length} node(s) aren't connected to anything.`);
  }

  const incompleteDevice = nodes.filter((n) => {
    if (n.data.kind === 'trigger') return !n.data.sourceDeviceId;
    if (n.data.kind === 'condition') return !n.data.sourceDeviceId || !n.data.field;
    if (n.data.kind === 'action') return !n.data.targetDeviceId || Object.keys(n.data.patch).length === 0;
    return false;
  });
  if (incompleteDevice.length > 0) {
    warnings.push(`${incompleteDevice.length} node(s) are missing a device or field selection.`);
  }

  const hasAction = nodes.some((n) => n.data.kind === 'action');
  if (nodes.length > 0 && !hasAction) {
    warnings.push('No action node yet — a rule needs at least one action to do anything.');
  }

  if (warnings.length === 0) return null;

  return (
    <div className="border-b border-accent-warn/30 bg-accent-warn/10 px-4 py-2 text-xs text-accent-warn">
      {warnings.join(' ')}
    </div>
  );
}
