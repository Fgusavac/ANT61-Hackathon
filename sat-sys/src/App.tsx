import { useSatelliteData } from "./hooks/useSatelliteData";
import SatelliteForm from "./components/SatelliteForm";
import SatelliteList from "./components/SatelliteList";
import AlertPanel from "./components/AlertPanel";
import SimulationControlPanel from "./components/SimulationControlPanel";
import { Satellite, SuggestedAction } from "./types/Satellite";

export default function App() {
  const { 
    satellites, 
    setSatellites, 
    alerts, 
    conjunctions,
    spaceWeatherAlerts,
    dismissedAlerts,
    setDismissedAlerts,
    threatAssessments,
    loading, 
    isSimulationRunning,
    isOfflineMode,
    startSimulation,
    stopSimulation,
    executeAction,
    //dismissAlert,  // Changed from executeDismiss
    predictCollisions
  } = useSatelliteData();

  const handleAddSatellite = (satellite: Satellite) => {
    setSatellites([...satellites, satellite]);
  };

  const handleRemoveSatellite = (id: string) => {
    setSatellites(satellites.filter(sat => sat.id !== id));
  };

  const handleExecuteAction = (satelliteId: string, action: SuggestedAction) => {
    console.log('🚀 Executing action for satellite:', satelliteId);
    console.log('Action details:', action);
    
    // Find satellite for better messaging
    const satellite = satellites.find(s => s.id === satelliteId);
    const satelliteName = satellite?.name || satelliteId;
    
    // Execute the action via the hook
    const success = executeAction(satelliteId, action);
    
    if (success) {
      console.log(`✅ Action executed successfully for ${satelliteName}`);
      
      // Mark the alert as dismissed through hook (consistent source of truth)
      // const alertId = `conjunction-${satelliteId}-${action.id}`;
      // dismissAlert(alertId);
      
      // Show success notification
      alert(`✅ Action Executed Successfully!

Satellite: ${satelliteName}
Action Type: ${action.type.replace('_', ' ').toUpperCase()}
Description: ${action.description}

${action.parameters?.deltaV ? `ΔV Applied: ${action.parameters.deltaV} m/s\n` : ''}${action.parameters?.burnDuration ? `Burn Duration: ${action.parameters.burnDuration}s\n` : ''}${action.estimatedFuelCost ? `Fuel Used: ${action.estimatedFuelCost} kg\n` : ''}
The satellite's orbit has been modified and the alert has been dismissed.`);
    } else {
      console.error(`❌ Failed to execute action for ${satelliteName}`);
      
      // Show error notification with helpful guidance
      alert(`❌ Failed to Execute Action

Satellite: ${satelliteName}

Possible reasons:
• Simulator not initialized yet
• Simulation needs to be started first
• Invalid action parameters

Try starting the simulation and wait a few seconds before executing actions.`);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    console.log("Dismissing alert:", alertId);
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    console.log('Alert dismissed successfully');
  };
  
  // Filter out dismissed alerts using unique IDs (NEW: no more index-based IDs)
  const activeConjunctions = conjunctions.filter(c => !dismissedAlerts.has(c.id));
  const activeSpaceWeatherAlerts = spaceWeatherAlerts.filter(alert => !dismissedAlerts.has(alert.id));  // Use built-in id
  
  // const handleDismissAlert = (alertId: string) => {
  //   console.log("Dismissing alert:", alertId);
  //   setDismissedAlerts(prev => new Set([...prev, alertId]));
  //   console.log('Alert dismissed successfully');
  //   //dismissAlert(alertId);
  // };
  
  // // Filter out dismissed alerts
  // const activeConjunctions = conjunctions.filter((_, index) => {
  //   const alertId = `conjunction-${index}`;
  //   return !dismissedAlerts.has(alertId);
  // });

  // const activeSpaceWeatherAlerts = spaceWeatherAlerts.filter((alert, index) => {
  //   const alertId = `space-weather-${index}`;
  //   return !dismissedAlerts.has(alertId);
  // });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🛰️ Unified Satellite Threat Monitor
          </h1>
          <p className="text-blue-200 text-lg mb-2">
            Real-time satellite collision detection and space weather monitoring
          </p>
          <p className="text-blue-300 text-sm">
            Combine orbital simulation with real-time threat assessment and automated response
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Satellite Management */}
          <div className="xl:col-span-1 space-y-6">
            <SatelliteForm onAdd={handleAddSatellite} />
            <SimulationControlPanel
              isSimulationRunning={isSimulationRunning}
              onStartSimulation={startSimulation}
              onStopSimulation={stopSimulation}
              onPredictCollisions={predictCollisions}
              satelliteCount={satellites.length}
            />
          </div>

          {/* Right Column - Monitoring and Alerts */}
          <div className="xl:col-span-2 space-y-6">
            <SatelliteList 
              satellites={satellites} 
              onRemove={handleRemoveSatellite}
              onExecuteAction={handleExecuteAction}
            />
            <AlertPanel 
              alerts={alerts}
              conjunctions={activeConjunctions}
              spaceWeatherAlerts={activeSpaceWeatherAlerts}
              onExecuteAction={handleExecuteAction}
              onDismissAlert={handleDismissAlert}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800 rounded-lg p-4 text-white">
          {isOfflineMode && (
            <div className="mb-4 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-yellow-200 font-medium">Offline Mode: Using cached/mock data due to network connectivity issues</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{satellites.length}</div>
              <div className="text-sm text-gray-300">Active Satellites</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{activeConjunctions.length}</div>
              <div className="text-sm text-gray-300">Conjunction Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{activeSpaceWeatherAlerts.length}</div>
              <div className="text-sm text-gray-300">Space Weather Alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {isSimulationRunning ? 'ON' : 'OFF'}
              </div>
              <div className="text-sm text-gray-300">Simulation Status</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-blue-300 text-sm mt-8">
          <div className="space-y-2">
            <p>
              <strong>Data Sources:</strong> CelesTrak (TLE) • NASA DONKI (CME) • NOAA (Space Weather)
            </p>
            <p>
              <strong>Features:</strong> Real-time monitoring • Collision prediction • Space weather alerts • Automated response suggestions
            </p>
            <p className="text-xs text-blue-400">
              Built for ANT61 Hackathon - Unified Satellite Threat Monitoring System
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
