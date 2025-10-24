# ANT61 Satellite Monitor - Hackathon October 2025

## Project Overview
A real-time satellite threat monitoring system that allows operators to track multiple satellites, receive alerts about potential dangers (space debris conjunctions and CME events), and visualize threats with suggested mitigation actions.

---

## 🎯 Core Features
- **Multi-satellite tracking** using orbital parameters (TLE format)
- **Real-time threat detection** for:
  - Conjunction events (debris/asteroid close approaches)
  - CME (Coronal Mass Ejection) events from solar activity
- **3D Visualization** of Earth, satellites, debris, and CME propagation
- **Timeline Controls** to scrub forward/backward in time
- **Alert Dashboard** with suggested mitigation actions
- **Decision Support** for operators to execute orbital maneuvers

---

## 🛠️ Technology Stack

### Frontend Framework
- **React 18+** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling

### 3D Visualization
- **Three.js** - 3D rendering engine
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Useful helpers for React Three Fiber
- **CesiumJS** (alternative option) - Geospatial 3D globe visualization

### Satellite Orbit Calculations
- **satellite.js** - SGP4/SDP4 orbit propagation from TLE data
- **TLE data format** - Two-Line Element sets for orbital parameters

### State Management
- **React Context API** or **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management and caching

### Time Management
- **date-fns** or **Day.js** - Date manipulation for timeline
- **Custom timeline slider** - For time-based simulation

### UI Components
- **Radix UI** or **shadcn/ui** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** or **D3.js** - Data visualization for metrics

---

## 🌐 APIs & Data Sources

### Space Debris & Conjunction Data
- **Space-Track.org API** - Official US Space Surveillance Network data
  - TLE data for satellites and debris
  - Conjunction Data Messages (CDMs)
  - Requires free account registration
- **CelesTrak** - Alternative TLE data source
- **ESA Discos Database** - European Space Agency debris catalog

### Space Weather & CME Data
- **NOAA Space Weather Prediction Center API**
  - Solar wind data
  - CME predictions and alerts
  - Geomagnetic storm indices
- **NASA DONKI API** (Database Of Notifications, Knowledge, Information)
  - CME analysis and predictions
  - Solar flare data
  - Free, no API key required
- **NASA CCMC (Community Coordinated Modeling Center)**
  - WSA-ENLIL Solar Wind Prediction model

### Satellite Catalog Data
- **N2YO API** - Satellite tracking and predictions
- **Open Notify API** - ISS and satellite position data

---

## 🚀 Hosting & Deployment

### Recommended: Vercel
- **Why**: Seamless GitHub integration, automatic deployments, serverless functions
- **Setup**: Connect GitHub repo, auto-deploy on push to main
- **Edge Functions**: For API proxying and data aggregation
- **Free tier**: Suitable for hackathon/demo projects

### Alternatives
- **Netlify** - Similar to Vercel with good React support
- **GitHub Pages** - Free static hosting (limited backend capability)
- **Railway** or **Render** - If backend API server needed
- **AWS Amplify** - Full-stack deployment with AWS services

---

## 📋 Development Phases

### Phase 1: Project Setup & Core Infrastructure (2-3 hours)
**Goals**: Get the development environment ready with essential libraries

1. Initialize Vite + React + TypeScript project
   ```bash
   npm create vite@latest ant61-satellite-monitor -- --template react-ts
   ```

2. Install core dependencies
   ```bash
   npm install satellite.js three @react-three/fiber @react-three/drei
   npm install @tanstack/react-query date-fns
   npm install -D tailwindcss postcss autoprefixer
   ```

3. Setup Tailwind CSS configuration

4. Create basic project structure:
   - `/src/components` - UI components
   - `/src/hooks` - Custom React hooks
   - `/src/utils` - Helper functions
   - `/src/types` - TypeScript interfaces
   - `/src/services` - API integration layer

5. Setup environment variables for API keys

**Deliverable**: Working dev environment with routing and basic layout

---

### Phase 2: Data Layer & API Integration (3-4 hours)
**Goals**: Fetch and process real satellite and threat data

1. **Implement TLE Data Fetching**
   - Create service to fetch TLE data from Space-Track.org or CelesTrak
   - Parse TLE format into usable satellite objects
   - Use satellite.js to propagate orbits

2. **Implement Space Weather API**
   - Integrate NASA DONKI API for CME data
   - Fetch NOAA space weather alerts
   - Create data models for CME events

3. **Implement Conjunction Detection**
   - Fetch CDM data from Space-Track
   - Calculate close approach distances
   - Determine threat levels based on miss distance

4. **Create Data Hooks**
   - `useSatelliteData()` - Manage satellite list and orbital states
   - `useCMEData()` - Track solar events
   - `useConjunctionAlerts()` - Monitor debris threats
   - `useTimelineControl()` - Manage simulation time

**Deliverable**: Working data pipeline with real API integration

---

### Phase 3: 3D Visualization (4-5 hours)
**Goals**: Create immersive 3D visualization of Earth, satellites, and threats

1. **Setup Three.js Scene**
   - Create Earth sphere with texture mapping
   - Add starfield background
   - Implement camera controls (orbit, zoom, pan)

2. **Render Satellites**
   - Use satellite.js to calculate ECI/ECEF positions
   - Convert to Three.js coordinates
   - Render satellite models/markers with labels
   - Show orbital paths as curved lines

3. **Visualize Threats**
   - **Debris**: Render as colored spheres with proximity indicators
   - **CME**: Render as expanding particle cloud/wave from Sun
   - Use color coding (green = safe, yellow = caution, red = danger)

4. **Add Visual Effects**
   - Glow effects for threats
   - Particle systems for CME visualization
   - Connection lines between conjuncting objects
   - Satellite selection highlighting

**Deliverable**: Interactive 3D globe with real-time satellite tracking

---

### Phase 4: Timeline & Simulation Controls (2-3 hours)
**Goals**: Allow time-based simulation and playback

1. **Timeline UI Component**
   - Horizontal slider to scrub through time
   - Play/pause controls
   - Speed controls (1x, 10x, 100x, 1000x)
   - Date/time display

2. **Time-based Orbit Propagation**
   - Use satellite.js to calculate positions at any given time
   - Update satellite positions based on timeline
   - Animate CME propagation over time

3. **Event Markers**
   - Show predicted conjunction events on timeline
   - Mark CME arrival times
   - Color-code by severity

**Deliverable**: Fully functional timeline with playback controls

---

### Phase 5: Alert Dashboard & Decision Support (3-4 hours)
**Goals**: Present actionable information to operators

1. **Alert Panel Component**
   - List view of active threats
   - Priority sorting (high, medium, low risk)
   - Real-time countdown to conjunction
   - Alert filtering and search

2. **Threat Detail View**
   - Detailed metrics (miss distance, relative velocity, probability)
   - Visualize approach geometry
   - Historical data and trends

3. **Suggested Actions**
   - Algorithm to recommend maneuvers:
     - Delta-V calculations
     - Optimal maneuver timing
     - Fuel cost estimates
   - Display multiple action options
   - "Execute Maneuver" simulation button

4. **CME Impact Assessment**
   - Expected radiation levels
   - Safe mode recommendations
   - Equipment protection suggestions

**Deliverable**: Complete operator interface with decision support

---

### Phase 6: Satellite Management Interface (2 hours)
**Goals**: Allow operators to add/manage satellites

1. **Satellite Input Form**
   - TLE input (manual or paste)
   - Load from catalog search
   - Custom satellite naming
   - Orbital parameter display

2. **Satellite List Component**
   - Table view of tracked satellites
   - Status indicators (operational, at-risk, safe)
   - Quick actions (focus, remove, details)
   - Export satellite data

**Deliverable**: User-friendly satellite management system

---

### Phase 7: Polish & Optimization (2-3 hours)
**Goals**: Improve UX and performance

1. **Performance Optimization**
   - Implement LOD (Level of Detail) for 3D objects
   - Lazy load non-critical components
   - Optimize API calls with caching
   - Use Web Workers for heavy calculations

2. **UI/UX Enhancements**
   - Loading states and skeletons
   - Error handling and user feedback
   - Responsive design for different screens
   - Dark/light theme toggle
   - Tooltips and help text

3. **Testing**
   - Test with multiple satellites
   - Verify calculations accuracy
   - Cross-browser testing
   - Mobile responsiveness check

**Deliverable**: Production-ready application

---

### Phase 8: Deployment (1 hour)
**Goals**: Deploy to production

1. **Prepare for Deployment**
   - Environment variables configuration
   - Build optimization
   - Add error tracking (Sentry)
   - Analytics setup (optional)

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```
   - Or connect GitHub repo to Vercel dashboard
   - Configure environment variables in Vercel
   - Setup custom domain (optional)

3. **Post-deployment**
   - Test production build
   - Monitor performance
   - Share demo link

**Deliverable**: Live, publicly accessible application

---

## 📦 Complete Dependency List

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "satellite.js": "^5.0.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0",
    "@tanstack/react-query": "^5.17.0",
    "date-fns": "^3.0.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 🔑 API Keys Required

1. **Space-Track.org** - Register at https://www.space-track.org/auth/createAccount
2. **NASA APIs** - Register at https://api.nasa.gov/ (optional, DONKI is open)
3. **NOAA** - Most endpoints are open, no key needed

---

## 📝 Notes & Considerations

- **TLE Data**: Updates daily, cache and refresh periodically
- **CME Modeling**: Simplified propagation model (CME data doesn't have TLE format)
- **Coordinate Systems**: Convert between ECI, ECEF, and lat/lon as needed
- **Performance**: Limit visible satellites/debris to prevent rendering bottlenecks
- **Data Freshness**: Real APIs may have rate limits, implement proper caching
- **Time Zones**: Use UTC for all calculations, display local time to user

---

## 🎓 Learning Resources

- [satellite.js Documentation](https://github.com/shashwatak/satellite-js)
- [Three.js Fundamentals](https://threejs.org/manual/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Space-Track.org API Guide](https://www.space-track.org/documentation)
- [NASA DONKI API](https://ccmc.gsfc.nasa.gov/tools/DONKI/)

---

## 📞 Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd ANT61-Hackathon
npm install

# Setup environment variables
cp .env.example .env
# Add your API keys to .env

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

**Good luck with the hackathon! 🚀🛰️**

