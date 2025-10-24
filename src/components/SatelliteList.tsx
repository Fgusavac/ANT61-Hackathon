import { Satellite } from "../types/Satellite";

interface Props {
  satellites: Satellite[];
}

export default function SatelliteList({ satellites }: Props) {
  return (
    <div className="p-4 border rounded-lg">
      <h2>Satellites</h2>
      <ul>
        {satellites.map(s => (
          <li key={s.id}>
            {s.name} — Alt: {s.altitude} km, Inc: {s.inclination}°, Vel: {s.velocity} km/s
          </li>
        ))}
      </ul>
    </div>
  );
}
