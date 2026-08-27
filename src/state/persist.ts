import { useRuleStore } from './ruleStore';

const RULES_KEY = 'smart-home-hub:rules';

export function hydrateRules() {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return;
    const { nodes, edges } = JSON.parse(raw);
    if (Array.isArray(nodes) && Array.isArray(edges)) {
      useRuleStore.setState({ nodes, edges });
    }
  } catch {
    // Corrupt or missing localStorage data — start from an empty rule graph.
  }
}

export function persistRulesOnChange() {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return useRuleStore.subscribe((state) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      localStorage.setItem(RULES_KEY, JSON.stringify({ nodes: state.nodes, edges: state.edges }));
    }, 300);
  });
}
