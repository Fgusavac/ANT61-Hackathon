import { useState, useEffect } from "react";
import type { Satellite } from "../types/Satellite";
import { createSatelliteSimulator, OrbitUtils } from "../utils/Satellite";

interface Props {
  satellites: Satellite[];
}

export default function SatelliteList({ satellites }: Props) {
  const [simulators, setSimulators] = useState(new Map());
  const [simulationData, setSimulationData] = useState(new Map());

  // Initialize simulators for each satellite
  useEffect(() => {
    const newSimulators = new Map();
    const newSimulationData = new Map();
    
    satellites.forEach(satellite => {
      if (!simulators.has(satellite.id)) {
        const simulator = createSatelliteSimulator(satellite);
        newSimulators.set(satellite.id, simulator);
        
        // Calculate initial orbital parameters
        const orbitalParams = simulator.getOrbitalParameters();
        newSimulationData.set(satellite.id, orbitalParams);
      } else {
        // Update existing simulator
        const simulator = simulators.get(satellite.id);
        simulator.updateSatellite(satellite);
        const orbitalParams = simulator.getOrbitalParameters();
        newSimulationData.set(satellite.id, orbitalParams);
      }
    });
    
    setSimulators(newSimulators);
    setSimulationData(newSimulationData);
  }, [satellites]);

  // Run simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const newSimulationData = new Map();
      
      simulators.forEach((simulator, satelliteId) => {
        // Update position and velocity
        simulator.calculatePosition(1); // 1 second time step
        simulator.calculateVelocity();
        
        const orbitalParams = simulator.getOrbitalParameters();
        newSimulationData.set(satelliteId, orbitalParams);
      });
      
      setSimulationData(newSimulationData);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [simulators]);

  const getOrbitTypeColor = (orbitType: string) => {
    switch (orbitType) {
      case "LEO": return "bg-blue-100 text-blue-800";
      case "Polar": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "danger": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "safe": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Satellites ({satellites.length})</h2>
      <div className="space-y-4">
        {satellites.map(satellite => {
          const simulation = simulationData.get(satellite.id);
          const isStable = OrbitUtils.isStableOrbit(satellite.altitude, satellite.eccentricity);
          
          return (
            <div key={satellite.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{satellite.name}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrbitTypeColor(satellite.orbitType)}`}>
                    {satellite.orbitType}
                  </span>
                  {satellite.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(satellite.status)}`}>
                      {satellite.status}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Basic Parameters</h4>
                  <p>Altitude: {satellite.altitude} km</p>
                  <p>Inclination: {satellite.inclination}°</p>
                  <p>Velocity: {satellite.velocity} km/s</p>
                </div>
                
                {simulation && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Orbital Parameters</h4>
                    <p>Period: {simulation.orbitalPeriod.toFixed(2)} hours</p>
                    <p>Eccentricity: {simulation.eccentricity.toFixed(3)}</p>
                    <p>Stable: {isStable ? "✅ Yes" : "❌ No"}</p>
                  </div>
                )}
              </div>

              {/* Orbit-specific parameters */}
              {satellite.orbitType === "LEO" && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Eccentricity: {satellite.eccentricity?.toFixed(3)}</p>
                  <p>Argument of Periapsis: {satellite.argumentOfPeriapsis}°</p>
                </div>
              )}
              
              {satellite.orbitType === "Polar" && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>RAAN: {satellite.rightAscensionOfAscendingNode}°</p>
                  <p>Mean Anomaly: {satellite.meanAnomaly}°</p>
                </div>
              )}

              {/* Real-time simulation data */}
              {simulation && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <h5 className="font-medium mb-1">Real-time Position:</h5>
                  <p>X: {simulation.currentPosition.x.toFixed(2)} km</p>
                  <p>Y: {simulation.currentPosition.y.toFixed(2)} km</p>
                  <p>Z: {simulation.currentPosition.z.toFixed(2)} km</p>
                  <p>Simulation Time: {simulation.simulationTime.toFixed(0)}s</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
