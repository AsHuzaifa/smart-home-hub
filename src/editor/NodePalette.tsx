import { NODE_CATALOG } from '../data/nodeCatalog';

const COLORS: Record<string, string> = {
  trigger: 'border-accent-info/50 text-accent-info',
  condition: 'border-accent-warn/50 text-accent-warn',
  action: 'border-accent/50 text-accent',
};

export function NodePalette() {
  return (
    <div className="flex flex-col gap-2 p-3">
      <h2 className="text-xs uppercase tracking-wide text-muted">Drag onto canvas</h2>
      {NODE_CATALOG.map((template) => (
        <div
          key={template.kind}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/reactflow-kind', template.kind);
            e.dataTransfer.effectAllowed = 'move';
          }}
          className={`cursor-grab rounded border bg-panel px-3 py-2 text-xs ${COLORS[template.kind]}`}
        >
          {template.label}
        </div>
      ))}
    </div>
  );
}
