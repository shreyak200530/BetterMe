import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border-2 border-red-500 p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Oops!</h2>
                <p className="text-slate-400">Something went wrong</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
