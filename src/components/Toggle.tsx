export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 backdrop-blur-md transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? 'border-accent-info/50 bg-gradient-to-br from-accent-info/50 to-accent-info/25'
          : 'border-border bg-gradient-to-br from-white/15 to-white/5'
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.35)] transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
