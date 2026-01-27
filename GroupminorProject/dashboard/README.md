# Smart Irrigation Digital Twin Dashboard

React + Next.js based Digital Twin dashboard for real-time monitoring and predictive maintenance of smart irrigation systems.

## Features

- ✅ Real-time sensor data visualization
- ✅ Live pump status monitoring
- ✅ ML-based predictions (Leakage, Blockage, Failure)
- ✅ Historical analytics and trends
- ✅ Remote pump control
- ✅ Live camera feed integration
- ✅ Alert system and recommendations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, Tailwind CSS
- **Charts**: Recharts
- **Real-time**: WebSocket (Socket.io)
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dashboard/
├── app/
│   ├── page.tsx          # Home/Dashboard overview
│   ├── dashboard/        # Live sensor data
│   ├── analytics/        # Historical data
│   ├── predictions/     # ML predictions
│   ├── control/         # Pump control
│   └── camera/          # Camera feed
├── components/          # Reusable components
└── lib/                 # Utilities and API clients
```

## Environment Variables

Create a `.env.local` file:

```env
API_URL=http://localhost:3001
WS_URL=ws://localhost:3001
NEXT_PUBLIC_CAMERA_URL=http://your-camera-ip:8080/stream
```

## API Integration

The dashboard expects a backend API running on port 3001 with the following endpoints:

- `GET /api/sensors` - Current sensor readings
- `GET /api/predictions` - ML predictions
- `POST /api/pump/control` - Pump ON/OFF control
- WebSocket: Real-time sensor updates

## Build for Production

```bash
npm run build
npm start
```

## License

Academic/Research Project
