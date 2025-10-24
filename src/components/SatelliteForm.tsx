import { useState } from "react";
import { Satellite } from "../types/Satellite";

interface Props {
  onAdd: (satellite: Satellite) => void;
}

export default function SatelliteForm({ onAdd }: Props) {
  const [form, setForm] = useState({ name: "", altitude: "", inclination: "", velocity: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      name: form.name,
      altitude: Number(form.altitude),
      inclination: Number(form.inclination),
      velocity: Number(form.velocity),
    });
    setForm({ name: "", altitude: "", inclination: "", velocity: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg flex flex-col gap-2">
      <input placeholder="Name" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Altitude (km)" value={form.altitude}
        onChange={e => setForm({ ...form, altitude: e.target.value })} />
      <input placeholder="Inclination (°)" value={form.inclination}
        onChange={e => setForm({ ...form, inclination: e.target.value })} />
      <input placeholder="Velocity (km/s)" value={form.velocity}
        onChange={e => setForm({ ...form, velocity: e.target.value })} />
      <button type="submit">Add Satellite</button>
    </form>
  );
}
