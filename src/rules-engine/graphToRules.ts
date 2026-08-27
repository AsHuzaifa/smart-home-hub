import type { Edge } from 'reactflow';
import type { CompiledRule, RuleFlowNode } from '../types/rule';

const DEFAULT_DEBOUNCE_MS = 500;

// A rule is one connected subgraph ending in an action node. Walking edges
// backward from each action node: upstream condition nodes form the AND-list,
// upstream trigger nodes (no further upstream) become the rule's triggers.
export function graphToRules(nodes: RuleFlowNode[], edges: Edge[]): CompiledRule[] {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const incomingEdges = (nodeId: string) => edges.filter((e) => e.target === nodeId);

  const actionNodes = nodes.filter((n) => n.data.kind === 'action');

  return actionNodes.map((actionNode) => {
    const visited = new Set<string>();
    const conditions: CompiledRule['conditions'] = [];
    const triggers: CompiledRule['triggers'] = [];

    const walk = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const upstream = incomingEdges(nodeId);
      for (const edge of upstream) {
        const sourceNode = nodeById.get(edge.source);
        if (!sourceNode) continue;

        if (sourceNode.data.kind === 'condition') {
          conditions.push(sourceNode.data);
        } else if (sourceNode.data.kind === 'trigger') {
          triggers.push(sourceNode.data);
        }

        walk(sourceNode.id);
      }
    };

    walk(actionNode.id);

    const actionData = actionNode.data;
    if (actionData.kind !== 'action') throw new Error('Expected action node');

    return {
      id: actionNode.id,
      triggers,
      conditions,
      actions: [actionData],
      debounceMs: actionData.debounceMs ?? DEFAULT_DEBOUNCE_MS,
    };
  });
}
