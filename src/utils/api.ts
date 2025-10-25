export async function fetchConjunctionData() {
  return [
    { satelliteId: "1", risk: "low" },
    { satelliteId: "2", risk: "high" },
  ];
}

export async function fetchCMEData() {
  return { intensity: "moderate", timestamp: new Date().toISOString() };
}
