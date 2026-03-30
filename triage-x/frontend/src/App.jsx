import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';
import Map from './components/Map';
import Controls from './components/Controls';
import Metrics from './components/Metrics';

function App() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedBoatId, setSelectedBoatId] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const connect = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => setConnected(true);
    ws.current.onclose = () => {
      setConnected(false);
      setTimeout(connect, 2000); // Reconnect
    };
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setState(data);
    };
  };

  const sendAction = (action, payload) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, ...payload }));
    }
  };

  const handleCellClick = (x, y) => {
    if (state?.mode === 'manual' && selectedBoatId) {
      sendAction('assign_boat', { boat_id: selectedBoatId, target_x: x, target_y: y });
      setSelectedBoatId(null); // deselect after assigning
    }
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-100/80 to-purple-50/80">
        <div className="text-xl text-slate-500 animate-pulse flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
          Connecting to TRIAGE-X server...
        </div>
      </div>
    );
  }

  const getBackgroundClass = () => {
    switch (state.scenario) {
      case 'low': return 'bg-gradient-to-br from-indigo-100/80 via-purple-50/70 to-blue-100/80';
      case 'flash': return 'bg-gradient-to-br from-violet-200/80 via-fuchsia-100/70 to-orange-100/80';
      case 'extreme': return 'bg-gradient-to-br from-rose-200/80 via-purple-200/70 to-slate-400/80';
      default: return 'bg-gradient-to-br from-indigo-100/80 via-purple-50/70 to-blue-100/80';
    }
  };

  return (
    <div className={`min-h-screen text-slate-800 p-6 font-sans transition-colors duration-1000 ${getBackgroundClass()}`}>
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
            <ShieldAlert className="text-blue-600" size={32} />
            TRIAGE-X
          </h1>
          <p className="text-slate-500 font-medium">Real-Time AI Emergency Dispatch Simulation</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-sm font-semibold text-slate-600">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Metrics metrics={state.metrics} />
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <Map 
              grid={state.grid} 
              boats={state.boats} 
              onCellClick={handleCellClick}
              selectedBoatId={selectedBoatId}
              onSelectBoat={setSelectedBoatId}
              mode={state.mode}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Controls 
            mode={state.mode} 
            scenario={state.scenario} 
            onModeChange={(mode) => sendAction('set_mode', { mode })}
            onScenarioChange={(scenario) => sendAction('set_scenario', { scenario })}
            selectedBoatId={selectedBoatId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
