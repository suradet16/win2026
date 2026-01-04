import clsx from 'clsx';

type Tone = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type?: Tone; // legacy prop name
  tone?: Tone; // new prop name
  message?: string;
  title?: string;
}

export function Alert({ type = 'info', tone, message, title }: AlertProps) {
  const variant: Tone = tone || type || 'info';
  const text = message || title;
  if (!text) return null;

  const styles: Record<Tone, string> = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  return (
    <div className={clsx('border rounded-lg px-3 py-2 text-sm', styles[variant])}>
      {text}
    </div>
  );
}
