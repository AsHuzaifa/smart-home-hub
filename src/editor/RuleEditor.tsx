import { useCallback, useMemo, useRef } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { NODE_CATALOG } from '../data/nodeCatalog';
import { useRuleStore } from '../state/ruleStore';
import type { RuleNodeData } from '../types/rule';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { TriggerNode } from './nodes/TriggerNode';
import { NodePalette } from './NodePalette';
import { RuleValidationBanner } from './RuleValidationBanner';

const NODE_TYPES = { trigger: TriggerNode, condition: ConditionNode, action: ActionNode };

function Canvas() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useRuleStore();
  const reactFlowInstance = useReactFlow();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData('application/reactflow-kind') as
        | 'trigger'
        | 'condition'
        | 'action'
        | '';
      if (!kind) return;

      const template = NODE_CATALOG.find((t) => t.kind === kind);
      if (!template) return;

      const bounds = wrapperRef.current?.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - (bounds?.left ?? 0),
        y: event.clientY - (bounds?.top ?? 0),
      });

      addNode(structuredClone(template.defaultData) as RuleNodeData, position);
    },
    [reactFlowInstance, addNode],
  );

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(e) => (e.preventDefault(), (e.dataTransfer.dropEffect = 'move'))}
        nodeTypes={NODE_TYPES}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.16)" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function RuleEditor() {
  const nodes = useRuleStore((s) => s.nodes);
  const hasNodes = useMemo(() => nodes.length > 0, [nodes]);

  return (
    <div className="flex h-full flex-col">
      <RuleValidationBanner />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 shrink-0 border-r border-border/60">
          <NodePalette />
        </aside>
        <div className="relative flex-1">
          {!hasNodes && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-center text-sm text-muted">
              Drag Trigger / Condition / Action nodes here, then connect them to build a rule.
            </div>
          )}
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
