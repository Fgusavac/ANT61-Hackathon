import { useState } from "react";
import type { Satellite, OrbitType } from "../types/Satellite";

interface Props {
  onAdd: (satellite: Satellite) => void;
}

export default function SatelliteForm({ onAdd }: Props) {
  const [form, setForm] = useState({ 
    name: "", 
    orbitType: "LEO" as OrbitType,
    altitude: "", 
    inclination: "", 
    velocity: "",
    // LEO specific fields
    eccentricity: "",
    argumentOfPeriapsis: "",
    // Polar orbit specific fields
    rightAscensionOfAscendingNode: "",
    meanAnomaly: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const satellite: Satellite = {
      id: Date.now().toString(),
      name: form.name,
      orbitType: form.orbitType,
      altitude: Number(form.altitude),
      inclination: Number(form.inclination),
      velocity: Number(form.velocity),
    };

    // Add orbit-specific parameters
    if (form.orbitType === "LEO") {
      satellite.eccentricity = Number(form.eccentricity);
      satellite.argumentOfPeriapsis = Number(form.argumentOfPeriapsis);
    } else if (form.orbitType === "Polar") {
      satellite.rightAscensionOfAscendingNode = Number(form.rightAscensionOfAscendingNode);
      satellite.meanAnomaly = Number(form.meanAnomaly);
    }

    onAdd(satellite);
    setForm({ 
      name: "", 
      orbitType: "LEO",
      altitude: "", 
      inclination: "", 
      velocity: "",
      eccentricity: "",
      argumentOfPeriapsis: "",
      rightAscensionOfAscendingNode: "",
      meanAnomaly: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg flex flex-col gap-2">
      <input 
        placeholder="Satellite Name" 
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} 
        required
      />
      
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Orbit Type:</label>
        <select 
          value={form.orbitType}
          onChange={e => setForm({ ...form, orbitType: e.target.value as OrbitType })}
          className="p-2 border rounded"
        >
          <option value="LEO">Low Earth Orbit (LEO)</option>
          <option value="Polar">Polar Orbit</option>
        </select>
      </div>

      <input 
        placeholder="Altitude (km)" 
        value={form.altitude}
        onChange={e => setForm({ ...form, altitude: e.target.value })} 
        type="number"
        required
      />
      
      <input 
        placeholder="Inclination (°)" 
        value={form.inclination}
        onChange={e => setForm({ ...form, inclination: e.target.value })} 
        type="number"
        required
      />
      
      <input 
        placeholder="Velocity (km/s)" 
        value={form.velocity}
        onChange={e => setForm({ ...form, velocity: e.target.value })} 
        type="number"
        required
      />

      {/* LEO specific parameters */}
      {form.orbitType === "LEO" && (
        <>
          <input 
            placeholder="Eccentricity (0-1)" 
            value={form.eccentricity}
            onChange={e => setForm({ ...form, eccentricity: e.target.value })} 
            type="number"
            min="0"
            max="1"
            step="0.01"
            required
          />
          <input 
            placeholder="Argument of Periapsis (°)" 
            value={form.argumentOfPeriapsis}
            onChange={e => setForm({ ...form, argumentOfPeriapsis: e.target.value })} 
            type="number"
            min="0"
            max="360"
            required
          />
        </>
      )}

      {/* Polar orbit specific parameters */}
      {form.orbitType === "Polar" && (
        <>
          <input 
            placeholder="Right Ascension of Ascending Node (°)" 
            value={form.rightAscensionOfAscendingNode}
            onChange={e => setForm({ ...form, rightAscensionOfAscendingNode: e.target.value })} 
            type="number"
            min="0"
            max="360"
            required
          />
          <input 
            placeholder="Mean Anomaly (°)" 
            value={form.meanAnomaly}
            onChange={e => setForm({ ...form, meanAnomaly: e.target.value })} 
            type="number"
            min="0"
            max="360"
            required
          />
        </>
      )}

      <button 
        type="submit" 
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
      >
        Add Satellite
      </button>
    </form>
  );
}
