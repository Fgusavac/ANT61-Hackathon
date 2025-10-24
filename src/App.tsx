import { useSatelliteData } from "./hooks/useSatelliteData";
import SatelliteForm from "./components/SatelliteForm";
import SatelliteList from "./components/SatelliteList";
import AlertPanel from "./components/AlertPanel";

export default function App() {
  const { satellites, setSatellites, alerts } = useSatelliteData();

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">🛰️ AN61 Satellite Monitor</h1>
      <SatelliteForm onAdd={(s) => setSatellites([...satellites, s])} />
      <SatelliteList satellites={satellites} />
      <AlertPanel alerts={alerts} />
    </div>
  );
}
