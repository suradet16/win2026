interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="flex items-center gap-3 text-slate-700">
      <span className="h-5 w-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" aria-hidden />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
