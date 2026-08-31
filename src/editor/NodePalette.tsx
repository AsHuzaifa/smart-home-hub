import { NODE_CATALOG } from '../data/nodeCatalog';

// Dot colors carry the category identity; the label itself always stays
// dark ink for guaranteed contrast against the terracotta panel background.
const DOT_COLORS: Record<string, string> = {
  trigger: 'bg-accent-info',
  condition: 'bg-accent-warn',
  action: 'bg-accent',
};

const BORDER_COLORS: Record<string, string> = {
  trigger: 'border-accent-info/50',
  condition: 'border-accent-warn/50',
  action: 'border-accent/50',
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
          className={`flex cursor-grab items-center gap-2 rounded-xl border bg-panel px-3 py-2 text-xs text-ink shadow-sm backdrop-blur-md transition-colors hover:bg-white/10 ${BORDER_COLORS[template.kind]}`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[template.kind]}`} />
          {template.label}
        </div>
      ))}
    </div>
  );
}
