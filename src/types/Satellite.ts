export type OrbitType = "LEO" | "Polar";

export interface Satellite {
  id: string;
  name: string;
  orbitType: OrbitType;
  altitude: number; // km
  inclination: number; // degrees
  velocity: number; // km/s
  status?: "safe" | "warning" | "danger";
  tle?: string[]; // optional TLE lines
  // LEO specific properties
  eccentricity?: number; // for LEO orbits
  argumentOfPeriapsis?: number; // degrees, for LEO orbits
  // Polar orbit specific properties
  rightAscensionOfAscendingNode?: number; // degrees, for polar orbits
  meanAnomaly?: number; // degrees, for polar orbits
}

