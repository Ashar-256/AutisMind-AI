# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**NeuroLens** - An AI-powered early autism risk screening application for toddlers (<3 years). The system uses behavioral observation through video and audio analysis to assess developmental markers.

This is a full-stack web application with:
- **Frontend**: React + TypeScript + Vite + shadcn/ui components
- **Backend**: Python FastAPI with MediaPipe for real-time pose tracking and analysis

## Development Commands

### Frontend (React/Vite)

```bash
# Install dependencies
pnpm i

# Start development server (http://localhost:5173)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint TypeScript/React code
pnpm run lint

# Deploy to GitHub Pages
pnpm run deploy
```

### Backend (Python FastAPI)

```bash
# First-time setup (Windows)
.\setup_backend.bat

# Start backend server (http://localhost:8000)
.\start_backend.bat

# Or manually:
neurolens_env\Scripts\activate.bat
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend Requirements:**
- Python 3.11 is required (specified in setup_backend.bat)
- Virtual environment created as `neurolens_env/`
- Backend runs on port 8000, frontend expects `http://localhost:8000`

## Architecture

### Multi-Module Screening Flow

The application implements a **5-step sequential screening process** managed by `ScreeningFlow.tsx`:

1. **Eye Contact Module** - Measures visual preference (social vs geometric patterns) using WebSocket real-time video analysis
2. **Name Response Module** - Detects head turning in response to name calls
3. **Vocalization Module** - Analyzes audio for speech patterns via WebSocket audio stream
4. **Gestures Module** - Tracks hand movements and pointing gestures
5. **Repetitive Behavior Module** - Detects repetitive patterns (hand flapping, rocking, arm swaying)

Each module is an independent React component in `src/components/modules/` that:
- Uses `ModuleProps` interface (accepts `onComplete` callback)
- Collects behavioral metrics during task execution
- Returns structured data conforming to `ScreeningResult` type
- Passes control to the next module via `onComplete`

### Real-Time Analysis Pipeline

**WebSocket-based dual-channel architecture:**

1. **Video Analysis WebSocket** (`/ws/analyze`)
   - Frontend captures video frames via `<canvas>` element at ~30 fps
   - Frames sent as base64-encoded JPEG to backend
   - Backend processes with MediaPipe (Face Mesh, Pose, Hands)
   - Returns real-time feedback (face detection, gaze direction, pose landmarks)
   - Session state accumulates metrics server-side

2. **Audio Analysis WebSocket** (`/ws/audio`)
   - Frontend captures audio chunks via MediaRecorder API
   - Chunks sent as base64-encoded PCM to backend
   - Backend analyzes RMS volume and speech detection
   - Returns vocalization percentage and speech events

**Backend Processing Stack:**

- `tracking_engine.py` - MediaPipe integration layer
  - Face Mesh: gaze estimation, head pose (yaw/pitch)
  - Pose: body landmark tracking for repetitive behaviors
  - Hands: gesture detection
  - `PoseTracker` class: advanced pattern recognition (hand flapping, rocking)

- `logic_engine.py` - NeuroLens scoring algorithm
  - Computes engagement score (0.0-1.0)
  - Calculates social vs geometric preference ratios
  - Classifies attention flexibility based on side switches
  - Generates natural language interpretation

- `audio_analyzer.py` - Audio signal processing
  - RMS volume calculation
  - Speech/silence classification
  - Vocalization percentage tracking

### Data Flow

```
User → Frontend Module → WebSocket → Backend Processing → Real-time Feedback → Frontend Update
                                          ↓
                                    Metrics Accumulation
                                          ↓
                                    Final Analysis
                                          ↓
                              Risk Score Calculation (ScreeningFlow)
                                          ↓
                                    Results Page
```

**Final submission (`/api/analyze` POST):**
- Frontend sends accumulated raw metrics to backend
- Backend returns `scores`, `classifications`, `interpretation`
- Frontend combines backend AI analysis with manual scoring
- Weighted risk calculation:
  - Social (30%): Backend engagement score
  - Name Response (20%)
  - Vocalization (20%)
  - Repetitive Behavior (20%)
  - Gestures (10%)

### Frontend Structure

**Route Configuration** (`App.tsx`):
- `/` - Landing page with consent (Index.tsx)
- `/screening` - Multi-step screening flow (ScreeningFlow.tsx)
- `/results` - Risk assessment report (ResultsPage.tsx)

**Global Context:**
- React Query (`@tanstack/react-query`) for async state
- Shadcn/ui Toaster + Sonner for notifications
- Prism component for animated background (WebGL-based)

**Component Organization:**
- `src/components/ui/` - shadcn/ui design system components
- `src/components/modules/` - Screening task modules
- `src/components/VideoCapture.tsx` - Reusable camera component
- `src/components/AudioCapture.tsx` - Audio recording component

### Type Definitions

**Core Types** (`src/types/screening.ts`):
```typescript
interface ScreeningResult {
  age_months: number;
  eye_contact_score: 0 | 1 | 2;          // 0=typical, 1=atypical, 2=concerning
  response_to_name_score: 0 | 1 | 2;
  response_latency_ms: number | null;
  vocalization_score: 0 | 1 | 2;
  gesture_joint_attention_score: 0 | 1 | 2;
  repetitive_behavior_score: 0 | 1 | 2;
}
```

## Important Development Notes

### Path Alias
- `@/` maps to `src/` directory (configured in vite.config.ts)
- Use `@/components/ui/button` not relative paths

### TypeScript Conventions
- **Do not re-export types you're already importing** (per README.md)
- Interfaces over types for object shapes
- `ScreeningResult` is the canonical data structure

### Backend Error Handling
- Backend connection failures should gracefully degrade
- `ScreeningFlow.tsx` has fallback logic if `http://localhost:8000` is unreachable
- Frontend can operate standalone with manual scoring only

### MediaPipe Pose Tracking
- `pose_tracker.py` logs all movements to timestamped CSV files
- Movement threshold: 0.02 (Euclidean distance in normalized coordinates)
- Pattern detection requires 10+ frame history (30 frames max)
- Hand flapping detected via vertical movement variance > 0.01

### Camera/Audio Permissions
- Must be granted before starting modules
- VideoCapture components handle permission errors with retry UI
- WebSocket connections fail silently if backend unavailable

### ESLint Configuration
- TypeScript unused vars warning disabled (`@typescript-eslint/no-unused-vars: off`)
- React Hooks rules enforced
- Files in `dist/` are ignored

## Testing Strategy

**No automated test suite currently exists.** To test:

1. Start backend: `.\start_backend.bat`
2. Start frontend: `pnpm run dev`
3. Navigate to `http://localhost:5173`
4. Complete screening flow with camera/microphone enabled
5. Verify WebSocket connections (check browser DevTools console for "Connected to NeuroLens Backend")
6. Inspect backend terminal for frame processing logs
7. Check CSV files in `backend/` for pose tracking data

**Critical test paths:**
- Backend unreachable → frontend should show "Disconnected" badge but continue
- No camera/mic permissions → VideoCapture shows error UI with retry button
- Completing all 5 modules → should navigate to `/results` with risk score

## Deployment Notes

- **GitHub Pages**: Uses `gh-pages` package, configured in package.json
- **Homepage**: Currently set to `https://surf3rr.github.io/mumbai-hacks/`
- Backend is NOT deployed (local development only)
- Production builds exclude backend dependency

## Common Issues

**Backend won't start:**
- Ensure Python 3.11 is installed (not 3.12 or 3.10)
- Check `neurolens_env/` exists (run `setup_backend.bat`)
- Verify port 8000 is not in use

**WebSocket connection fails:**
- Backend must be running on `localhost:8000`
- CORS is configured to allow all origins in `main.py`
- Check firewall/antivirus blocking WebSocket connections

**MediaPipe errors:**
- Requires compatible NumPy version (1.24.3 specified)
- OpenCV 4.8.1 required (newer versions may have issues)
- If imports fail, reinstall: `pip install -r backend\requirements.txt`

**Frontend build fails:**
- Run `pnpm i` to ensure all dependencies installed
- Check Node.js version (should be 18+ for Vite 5)
- TypeScript errors from shadcn/ui components usually mean missing peer dependencies
