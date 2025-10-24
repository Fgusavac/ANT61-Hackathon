import { useState, useEffect } from "react";
import type { Satellite } from "../types/Satellite";
import { fetchConjunctionData, fetchCMEData } from "../utils/api";

export const useSatelliteData = () => {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const conjunctions = await fetchConjunctionData();
      const cme = await fetchCMEData();

      const newAlerts = conjunctions
        .filter(c => c.risk === "high")
        .map(c => `Satellite ${c.satelliteId} at high collision risk!`);
      
      if (cme.intensity === "high")
        newAlerts.push("⚠️ Strong CME detected — consider shutdown protocol.");

      setAlerts(newAlerts);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { satellites, setSatellites, alerts };
};
