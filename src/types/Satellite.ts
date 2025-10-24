export interface Satellite {
  id: string;
  name: string;
  altitude: number; // km
  inclination: number; // degrees
  velocity: number; // km/s
  status?: "safe" | "warning" | "danger";
}
