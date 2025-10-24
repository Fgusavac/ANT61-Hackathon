interface Props {
  alerts: string[];
}

export default function AlertPanel({ alerts }: Props) {
  return (
    <div className="p-4 border rounded-lg bg-red-50">
      <h2>Alerts</h2>
      {alerts.length === 0 ? <p>No alerts 🚀</p> : (
        <ul>{alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
      )}
    </div>
  );
}
