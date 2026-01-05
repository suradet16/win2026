import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/app';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white relative">
          <div className="grid-overlay" aria-hidden="true"></div>
          <div className="relative z-10 glass-strong rounded-3xl p-8 max-w-md mx-4 text-center space-y-6 border border-white/15">
            <div className="text-6xl">💥</div>
            <div>
              <h1 className="font-manrope font-bold text-2xl mb-2">เกิดข้อผิดพลาด</h1>
              <p className="text-white/60 text-sm">
                มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง
              </p>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="glass rounded-xl p-4 text-left border border-red-500/30 bg-red-500/10">
                <div className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleGoHome}
                className="glass rounded-xl px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all border border-white/20"
              >
                กลับหน้าหลัก
              </button>
              <button
                onClick={this.handleReload}
                className="btn-primary rounded-xl px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition-all"
              >
                โหลดใหม่
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
