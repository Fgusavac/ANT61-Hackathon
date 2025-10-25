/**
 * Satellite Orbit Simulation Library
 * Provides orbital mechanics calculations for LEO and Polar orbits
 */

class SatelliteSimulator {
  constructor(satellite) {
    this.satellite = satellite;
    this.time = 0; // simulation time in seconds
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.orbitalElements = this.calculateOrbitalElements();
  }

  /**
   * Calculate orbital elements based on satellite parameters
   */
  calculateOrbitalElements() {
    const { altitude, inclination, velocity, orbitType } = this.satellite;
    
    // Earth's radius in km
    const earthRadius = 6371;
    const semiMajorAxis = altitude + earthRadius;
    
    // Convert inclination to radians
    const inclinationRad = (inclination * Math.PI) / 180;
    
    // Calculate orbital period (Kepler's third law)
    const mu = 3.986004418e5; // Earth's gravitational parameter (km³/s²)
    const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
    
    // Calculate mean motion (rad/s)
    const meanMotion = 2 * Math.PI / orbitalPeriod;
    
    let orbitalElements = {
      semiMajorAxis,
      inclination: inclinationRad,
      meanMotion,
      orbitalPeriod,
      eccentricity: 0,
      argumentOfPeriapsis: 0,
      rightAscensionOfAscendingNode: 0,
      meanAnomaly: 0
    };

    // Add orbit-specific elements
    if (orbitType === "LEO") {
      orbitalElements.eccentricity = this.satellite.eccentricity || 0.01;
      orbitalElements.argumentOfPeriapsis = (this.satellite.argumentOfPeriapsis || 0) * Math.PI / 180;
    } else if (orbitType === "Polar") {
      orbitalElements.rightAscensionOfAscendingNode = (this.satellite.rightAscensionOfAscendingNode || 0) * Math.PI / 180;
      orbitalElements.meanAnomaly = (this.satellite.meanAnomaly || 0) * Math.PI / 180;
    }

    return orbitalElements;
  }

  /**
   * Calculate satellite position using Kepler's equation
   */
  calculatePosition(timeStep = 1) {
    this.time += timeStep;
    
    const { semiMajorAxis, eccentricity, inclination, 
            rightAscensionOfAscendingNode, argumentOfPeriapsis, 
            meanMotion, meanAnomaly } = this.orbitalElements;

    // Calculate current mean anomaly
    const currentMeanAnomaly = meanAnomaly + meanMotion * this.time;
    
    // Solve Kepler's equation for eccentric anomaly
    const eccentricAnomaly = this.solveKeplersEquation(currentMeanAnomaly, eccentricity);
    
    // Calculate true anomaly
    const trueAnomaly = 2 * Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // Calculate orbital radius
    const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));

    // Calculate position in orbital plane
    const xOrbital = radius * Math.cos(trueAnomaly);
    const yOrbital = radius * Math.sin(trueAnomaly);

    // Transform to Earth-centered inertial coordinates
    const cosRAAN = Math.cos(rightAscensionOfAscendingNode);
    const sinRAAN = Math.sin(rightAscensionOfAscendingNode);
    const cosInc = Math.cos(inclination);
    const sinInc = Math.sin(inclination);
    const cosArgP = Math.cos(argumentOfPeriapsis);
    const sinArgP = Math.sin(argumentOfPeriapsis);

    // Rotation matrices for coordinate transformation
    const x = xOrbital * (cosRAAN * cosArgP - sinRAAN * sinArgP * cosInc) - 
              yOrbital * (cosRAAN * sinArgP + sinRAAN * cosArgP * cosInc);
    
    const y = xOrbital * (sinRAAN * cosArgP + cosRAAN * sinArgP * cosInc) - 
              yOrbital * (sinRAAN * sinArgP - cosRAAN * cosArgP * cosInc);
    
    const z = xOrbital * sinArgP * sinInc + yOrbital * cosArgP * sinInc;

    this.position = { x, y, z };
    return this.position;
  }

  /**
   * Solve Kepler's equation using Newton-Raphson method
   */
  solveKeplersEquation(meanAnomaly, eccentricity, maxIterations = 10) {
    let eccentricAnomaly = meanAnomaly; // Initial guess
    
    for (let i = 0; i < maxIterations; i++) {
      const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
      const fPrime = 1 - eccentricity * Math.cos(eccentricAnomaly);
      
      if (Math.abs(f) < 1e-6) break;
      
      eccentricAnomaly = eccentricAnomaly - f / fPrime;
    }
    
    return eccentricAnomaly;
  }

  /**
   * Calculate orbital velocity
   */
  calculateVelocity() {
    const { semiMajorAxis, eccentricity } = this.orbitalElements;
    const mu = 3.986004418e5; // Earth's gravitational parameter
    
    // Vis-viva equation
    const r = Math.sqrt(this.position.x**2 + this.position.y**2 + this.position.z**2);
    const velocityMagnitude = Math.sqrt(mu * (2/r - 1/semiMajorAxis));
    
    // Calculate velocity components (simplified)
    const velocityDirection = this.calculateVelocityDirection();
    
    this.velocity = {
      x: velocityMagnitude * velocityDirection.x,
      y: velocityMagnitude * velocityDirection.y,
      z: velocityMagnitude * velocityDirection.z
    };
    
    return this.velocity;
  }

  /**
   * Calculate velocity direction (simplified)
   */
  calculateVelocityDirection() {
    // Simplified velocity direction calculation
    // In a real simulation, this would be more complex
    const angle = Math.atan2(this.position.y, this.position.x) + Math.PI / 2;
    
    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
      z: 0
    };
  }

  /**
   * Get orbital parameters for display
   */
  getOrbitalParameters() {
    const { orbitalPeriod, semiMajorAxis, eccentricity, inclination } = this.orbitalElements;
    
    return {
      orbitalPeriod: orbitalPeriod / 3600, // Convert to hours
      altitude: semiMajorAxis - 6371, // Convert to altitude above Earth
      eccentricity,
      inclination: inclination * 180 / Math.PI, // Convert to degrees
      currentPosition: this.position,
      currentVelocity: this.velocity,
      simulationTime: this.time
    };
  }

  /**
   * Reset simulation
   */
  reset() {
    this.time = 0;
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.orbitalElements = this.calculateOrbitalElements();
  }

  /**
   * Update satellite parameters and recalculate orbital elements
   */
  updateSatellite(newSatellite) {
    this.satellite = { ...this.satellite, ...newSatellite };
    this.orbitalElements = this.calculateOrbitalElements();
  }
}

/**
 * Factory function to create satellite simulators
 */
export function createSatelliteSimulator(satellite) {
  return new SatelliteSimulator(satellite);
}

/**
 * Utility functions for orbit calculations
 */
export const OrbitUtils = {
  /**
   * Calculate orbital period from altitude
   */
  calculateOrbitalPeriod(altitudeKm) {
    const earthRadius = 6371;
    const semiMajorAxis = altitudeKm + earthRadius;
    const mu = 3.986004418e5;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
  },

  /**
   * Calculate orbital velocity from altitude
   */
  calculateOrbitalVelocity(altitudeKm) {
    const earthRadius = 6371;
    const radius = altitudeKm + earthRadius;
    const mu = 3.986004418e5;
    return Math.sqrt(mu / radius);
  },

  /**
   * Check if orbit is stable
   */
  isStableOrbit(altitudeKm, eccentricity = 0) {
    const earthRadius = 6371;
    const minAltitude = 160; // Minimum stable altitude (km)
    const maxAltitude = 2000; // Maximum LEO altitude (km)
    
    return altitudeKm >= minAltitude && 
           altitudeKm <= maxAltitude && 
           eccentricity >= 0 && 
           eccentricity < 1;
  },

  /**
   * Calculate ground track coordinates
   */
  calculateGroundTrack(position, time) {
    const earthRadius = 6371;
    const latitude = Math.asin(position.z / Math.sqrt(position.x**2 + position.y**2 + position.z**2));
    const longitude = Math.atan2(position.y, position.x) - (time * 7.292115e-5); // Earth's rotation rate
    
    return {
      latitude: latitude * 180 / Math.PI,
      longitude: longitude * 180 / Math.PI
    };
  }
};

export default SatelliteSimulator;
