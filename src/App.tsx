import React, { Component, type ReactNode } from 'react';
import { EcoRouteProvider } from './context/EcoRouteContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MapCanvas } from './components/map/MapCanvas';
import { AnalyticsDrawer } from './components/layout/AnalyticsDrawer';
import { BinEditModal } from './components/modals/BinEditModal';
import { RoadEditModal } from './components/modals/RoadEditModal';
import { MatrixModal } from './components/modals/MatrixModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EcoRoute Simulator caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('ecoroute_town_data_v1');
      localStorage.removeItem('ecoroute_town_data_v2');
      localStorage.removeItem('ecoroute_settings_v1');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-slate-900 text-white p-6 select-none">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Application Notice</h2>
              <p className="text-sm text-slate-300 mt-1">
                A rendering issue occurred. You can restore the app instantly with the clean demo setup below.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-left text-xs font-mono text-rose-300 max-h-32 overflow-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset & Reload Demo State</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardContent: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* 1. Top Navigation & Global KPIs */}
      <Header />

      {/* 2. Main Middle Workspace: Sidebar + Virtual Map Canvas */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* Left Control & Configuration Panel */}
        <Sidebar />

        {/* Central Virtual SVG Town Map (Occupies 70-75% of space) */}
        <main className="flex-1 relative h-full overflow-hidden bg-slate-100">
          <MapCanvas />
        </main>
      </div>

      {/* 3. Bottom Expandable Analytics & Itinerary Drawer */}
      <AnalyticsDrawer />

      {/* 4. Interactive Modals */}
      <BinEditModal />
      <RoadEditModal />
      <MatrixModal />
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppErrorBoundary>
      <EcoRouteProvider>
        <DashboardContent />
      </EcoRouteProvider>
    </AppErrorBoundary>
  );
}
