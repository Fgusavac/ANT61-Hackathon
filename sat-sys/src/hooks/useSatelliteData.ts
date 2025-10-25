import { useState, useEffect, useCallback } from "react";
import { Satellite, ConjunctionEvent, SpaceWeatherAlert, ThreatAssessment, SuggestedAction } from "../types/Satellite";
import { fetchConjunctionData, fetchLatestCMEPrediction, fetchGeomagneticStorm, fetchSpaceWeatherAlerts, generateSuggestedAction } from "../utils/api";
import { createSatelliteSimulator, OrbitUtils } from "../utils/SatelliteSimulator";

export const useSatelliteData = () => {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [conjunctions, setConjunctions] = useState<ConjunctionEvent[]>([]);
  const [spaceWeatherAlerts, setSpaceWeatherAlerts] = useState<SpaceWeatherAlert[]>([]);
  const [threatAssessments, setThreatAssessments] = useState<Map<string, ThreatAssessment>>(new Map());
  const [simulators, setSimulators] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Initialize simulators when satellites change
  useEffect(() => {
    const newSimulators = new Map();
    satellites.forEach(sat => {
      if (!simulators.has(sat.id)) {
        newSimulators.set(sat.id, createSatelliteSimulator(sat));
      } else {
        newSimulators.set(sat.id, simulators.get(sat.id));
      }
    });
    setSimulators(newSimulators);
  }, [satellites]);

  // Real-time threat monitoring
  useEffect(() => {
    const monitorThreats = async () => {
      try {
        // If no satellites are added, clear all alerts and return
        if (satellites.length === 0) {
          setAlerts([]);
          setConjunctions([]);
          setSpaceWeatherAlerts([]);
          setThreatAssessments(new Map());
          return;
        }

        // Use Promise.allSettled to handle individual API failures gracefully
        const [conjunctionResult, cmeResult, geomagneticResult, weatherResult] = await Promise.allSettled([
          fetchConjunctionData(),
          fetchLatestCMEPrediction(),
          fetchGeomagneticStorm(),
          fetchSpaceWeatherAlerts()
        ]);
        console.log('CME Result:', cmeResult);

        // Extract data from successful promises, use fallback for failed ones
        const conjunctionData = conjunctionResult.status === 'fulfilled' && Array.isArray(conjunctionResult.value) ? conjunctionResult.value : [];
        const cmeEvent = cmeResult.status === 'fulfilled' && Array.isArray(cmeResult.value) ? cmeResult.value : [];        
        const geomagneticData = geomagneticResult.status === 'fulfilled' && Array.isArray(geomagneticResult.value) ? geomagneticResult.value : [];
        const weatherAlerts = weatherResult.status === 'fulfilled' && Array.isArray(weatherResult.value) ? weatherResult.value : [];

        // Check if we're in offline mode (all APIs failed)
        const allFailed = conjunctionResult.status === 'rejected' && 
                         cmeResult.status === 'rejected' && 
                         geomagneticResult.status === 'rejected' && 
                         weatherResult.status === 'rejected';
        
        setIsOfflineMode(allFailed);

        // Process conjunction alerts - only for satellites that exist in the system
        const conjunctionAlerts: string[] = [];
        const newConjunctions: ConjunctionEvent[] = [];

        conjunctionData.forEach(c => {
          // Only process conjunctions for satellites that are actually in our system
          const satelliteExists = satellites.some(sat => sat.id === c.satelliteId);
          if (!satelliteExists) {
            return; // Skip this conjunction if the satellite doesn't exist
          }

          const timeUntil = new Date(c.tca).getTime() - Date.now();
          const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60));
          
          // Add suggested action
          const suggestedAction = generateSuggestedAction(c);
          const enhancedConjunction = { ...c, suggestedAction };
          newConjunctions.push(enhancedConjunction);
          
          if (c.risk === "high") {
            conjunctionAlerts.push(
              `🚨 HIGH RISK: ${c.objectName} approaching ${c.satelliteId} in ${hoursUntil}h - Miss distance: ${c.missDistance}km`
            );
          } else if (c.risk === "medium") {
            conjunctionAlerts.push(
              `⚠️ MEDIUM RISK: ${c.objectName} approaching ${c.satelliteId} in ${hoursUntil}h - Miss distance: ${c.missDistance}km`
            );
          }
        });

        // Process CME alerts
        console.log('CME Event:', cmeEvent);
        const cmeAlerts: string[] = [];

        if (Array.isArray(cmeEvent)) {
          const prediction = cmeEvent.find(p => p.predictedMethodName === 'Average of all Methods');
          console.log('CME Prediction:', prediction);
          console.log("Available Methods:", cmeEvent.map(p => p.predictedMethodName));

          if (prediction) {
            const predictedArrival = new Date(prediction.predictedArrivalTime);
            const submissionTime = new Date(prediction.submissionTime);
            const leadTime = parseFloat(prediction.leadTimeInHrs);

            cmeAlerts.push(
              `☀️ CME PREDICTION: ${prediction.predictedMethodName} predicts arrival on ${predictedArrival.toISOString()} with Kp range ${prediction.predictedMaxKpLowerRange}-${prediction.predictedMaxKpUpperRange}`
            );

            // Create space weather alert - only if we have satellites to affect
            if (satellites.length > 0) {
              const spaceWeatherAlert: SpaceWeatherAlert = {
                id: `cme-${prediction.predictedMethodName}`, // Adjusted ID since cmeID is not present
                type: 'cme',
                severity: 'medium', // Adjust severity based on Kp range or other criteria
                message: `CME predicted by ${prediction.predictedMethodName}: Arrival on ${predictedArrival.toISOString()} with Kp range ${prediction.predictedMaxKpLowerRange}-${prediction.predictedMaxKpUpperRange}`,
                timestamp: submissionTime.toISOString(),
                affectedSatellites: satellites.map(sat => sat.id), // Only affect existing satellites
                suggestedAction: {
                  id: `action-cme-${prediction.predictedMethodName}`,
                  type: 'monitor',
                  description: 'Monitor satellite systems for potential impact',
                  priority: 'medium',
                  estimatedTimeToExecute: 15,
                  successProbability: 0.9
                }
              };
              setSpaceWeatherAlerts(prev => [...prev, spaceWeatherAlert]);
              console.log('Added Space Weather Alert for CME:', spaceWeatherAlert);
            }
          }
        }

        // Process geomagnetic storm alerts
        const geomagneticAlerts: string[] = [];
        if (geomagneticData.length > 0) {
          const latestKp = geomagneticData[geomagneticData.length - 1];
          if (latestKp.kp_index > 5) {
            geomagneticAlerts.push(
              `🌪️ GEOMAGNETIC STORM: Kp index ${latestKp.kp_index} - Monitor satellite health`
            );
          }
        }

        // Update state
        setConjunctions(newConjunctions);
        setAlerts([...conjunctionAlerts, ...cmeAlerts, ...geomagneticAlerts]);

        // Update threat assessments
        updateThreatAssessments(newConjunctions);

      } catch (error) {
        console.error("Error monitoring threats:", error);
        // Don't add network errors to alerts - just log them
        // Only add user-friendly error messages for critical issues
        if (error instanceof Error && (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK'))) {
          console.warn("Network connectivity issue - using cached/mock data");
          // Continue with mock data or cached data instead of showing error
          return;
        }
        // For other errors, add a user-friendly message
        setAlerts(prev => [...prev, `⚠️ Monitoring service temporarily unavailable - using cached data`]);
      }
    };

    // Initial monitoring
    monitorThreats();

    // Set up interval for continuous monitoring
    const interval = setInterval(monitorThreats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [satellites]); // Re-run when satellites change

  // Update threat assessments for each satellite
  const updateThreatAssessments = useCallback((conjunctions: ConjunctionEvent[]) => {
    const newAssessments = new Map<string, ThreatAssessment>();
    
    satellites.forEach(sat => {
      const satelliteConjunctions = conjunctions.filter(c => c.satelliteId === sat.id);
      
      if (satelliteConjunctions.length > 0) {
        const threats = satelliteConjunctions.map(c => ({
          type: 'collision' as const,
          severity: c.risk === 'high' ? 9 : c.risk === 'medium' ? 6 : 3,
          timeToImpact: (new Date(c.tca).getTime() - Date.now()) / (1000 * 60), // minutes
          description: `${c.objectName} - Miss distance: ${c.missDistance}km`
        }));

        const threatLevel = satelliteConjunctions.some(c => c.risk === 'high') ? 'critical' :
                           satelliteConjunctions.some(c => c.risk === 'medium') ? 'high' : 'medium';

        const recommendedActions = satelliteConjunctions
          .filter(c => c.suggestedAction)
          .map(c => c.suggestedAction!)
          .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });

        newAssessments.set(sat.id, {
          satelliteId: sat.id,
          threatLevel,
          threats,
          recommendedActions,
          lastAssessment: new Date().toISOString()
        });
      }
    });

    setThreatAssessments(newAssessments);
  }, [satellites]);

  // Simulation functions
  const startSimulation = useCallback(() => {
    setIsSimulationRunning(true);
    
    const simulationInterval = setInterval(() => {
      setSimulators(prevSimulators => {
        const updatedSimulators = new Map();
        
        prevSimulators.forEach((simulator, satelliteId) => {
          // Update simulation time
          simulator.calculatePosition(60); // 1 minute time step
          
          // Update satellite position in state
          const state = simulator.getCurrentState();
          setSatellites(prevSats => 
            prevSats.map(sat => 
              sat.id === satelliteId 
                ? { 
                    ...sat, 
                    currentPosition: state.position,
                    currentVelocity: state.velocity,
                    lastUpdated: new Date().toISOString()
                  }
                : sat
            )
          );
          
          updatedSimulators.set(satelliteId, simulator);
        });
        
        return updatedSimulators;
      });
    }, 1000); // Update every second

    // Store interval ID for cleanup
    (window as any).simulationInterval = simulationInterval;
  }, []);

  const stopSimulation = useCallback(() => {
    setIsSimulationRunning(false);
    if ((window as any).simulationInterval) {
      clearInterval((window as any).simulationInterval);
    }
  }, []);

  const executeAction = useCallback((satelliteId: string, action: SuggestedAction): boolean => {
    const simulator = simulators.get(satelliteId);
    if (!simulator) return false;

    const success = simulator.executeAction(action);
    
    if (success) {
      // Update satellite with new parameters
      setSatellites(prevSats => 
        prevSats.map(sat => 
          sat.id === satelliteId 
            ? { ...sat, lastUpdated: new Date().toISOString() }
            : sat
        )
      );
      
      // Add execution alert
      setAlerts(prev => [...prev, `✅ Action executed for ${satellites.find(s => s.id === satelliteId)?.name}: ${action.description}`]);
    }
    
    return success;
  }, [simulators, satellites]);

  // Collision prediction between satellites
  const predictCollisions = useCallback(() => {
    const collisionPredictions: string[] = [];
    
    for (let i = 0; i < satellites.length; i++) {
      for (let j = i + 1; j < satellites.length; j++) {
        const sat1 = simulators.get(satellites[i].id);
        const sat2 = simulators.get(satellites[j].id);
        
        if (sat1 && sat2) {
          const prediction = OrbitUtils.predictCollisionRisk(sat1, sat2);
          
          if (prediction.risk !== 'low') {
            collisionPredictions.push(
              `⚠️ ${prediction.risk.toUpperCase()} collision risk between ${satellites[i].name} and ${satellites[j].name} - Min distance: ${prediction.minDistance.toFixed(2)}km`
            );
          }
        }
      }
    }
    
    if (collisionPredictions.length > 0) {
      setAlerts(prev => [...prev, ...collisionPredictions]);
    }
  }, [satellites, simulators]);

  return { 
    satellites, 
    setSatellites, 
    alerts, 
    conjunctions,
    spaceWeatherAlerts,
    threatAssessments,
    simulators,
    loading, 
    setLoading,
    isSimulationRunning,
    isOfflineMode,
    startSimulation,
    stopSimulation,
    executeAction,
    predictCollisions
  };
};
