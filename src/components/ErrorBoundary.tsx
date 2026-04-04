import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-8">
          <div className="max-w-md w-full space-y-4">
            <h1 className="text-2xl font-mono uppercase tracking-widest text-red-500">System Error</h1>
            <p className="text-zinc-400 font-sans">An unexpected error occurred in the studio environment.</p>
            <pre className="bg-zinc-900 p-4 rounded border border-zinc-800 overflow-auto text-xs font-mono text-zinc-500">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-zinc-100 text-zinc-950 font-mono uppercase text-xs tracking-widest hover:bg-zinc-300 transition-colors"
            >
              Restart Environment
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
