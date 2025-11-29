# AutisMind AI - Project Technical Overview

## 1. Project Identity
*   **Name:** AutisMind AI (formerly EarlyDetect AI)
*   **Purpose:** AI-Powered Early Autism Risk Assessment for Toddlers.
*   **Core Function:** A web-based screening tool that uses computer vision and audio analysis to assess behavioral markers associated with autism spectrum disorder (ASD).

## 2. Technology Stack

### Frontend
*   **Framework:** React 19 (via Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Vanilla CSS (for custom animations)
*   **UI Library:** shadcn/ui (Radix UI primitives)
*   **Icons:** Lucide React
*   **Graphics/Effects:** OGL (for "Aurora" and "Iridescence" backgrounds)
*   **State Management:** React Hooks (`useState`, `useContext`), React Router DOM v6
*   **AI/CV Models (Client-side):**
    *   `@mediapipe/face_detection`
    *   `@tensorflow-models/face-landmarks-detection`
    *   `@tensorflow/tfjs-core` & `backend-webgl`

### Backend
*   **Framework:** FastAPI (Python)
*   **Communication:** REST API (`/api/analyze`) and WebSockets (`/ws/analyze`, `/ws/audio`)
*   **Core Logic:** Custom `NeuroLensLogicEngine` for risk assessment.
*   **CV Engine:** `TrackingEngine` (likely uses MediaPipe/OpenCV Python bindings).
*   **Audio Engine:** `AudioAnalyzer` for vocalization processing.

## 3. Architecture & Data Flow

### High-Level Flow
1.  **Landing Page (`/`):** User learns about the tool and initiates screening.
2.  **Screening Flow (`/screening`):** A multi-step wizard guiding the user through 5 behavioral modules.
3.  **Data Collection:**
    *   Frontend captures video/audio streams.
    *   Modules extract raw metrics (e.g., frames face detected, head yaw, audio RMS) locally or stream frames to backend via WebSocket.
4.  **Analysis:**
    *   **Real-time:** WebSockets provide immediate feedback (e.g., "Face Detected").
    *   **Post-Task:** `ScreeningFlow.tsx` aggregates metrics and sends a payload to `http://localhost:8000/api/analyze`.
5.  **Risk Calculation:**
    *   Backend computes `engagementScore`, `socialPreference`, `geometricPreference`, and `attentionShifts`.
    *   Frontend combines these with manual/heuristic scores from other modules to calculate a `totalRisk` score (0-100).
6.  **Results (`/results`):** Displays the risk band (Low/Moderate/High), detailed domain scores, and AI interpretation.

### Directory Structure
*   `src/`
    *   `App.tsx`: Main routing configuration.
    *   `pages/`: Top-level page components (`LandingPage`, `ScreeningFlow`, `ResultsPage`, etc.).
    *   `components/`: Reusable UI components and specific modules.
        *   `modules/`: The 5 screening task components (`EyeContactModule`, `NameResponseModule`, etc.).
        *   `Aurora.tsx`: The active background effect.
        *   `OldLandingContent.tsx`: Legacy content merged into the new landing page.
    *   `lib/`: Utility functions.
*   `backend/`
    *   `main.py`: FastAPI entry point.
    *   `logic_engine.py`: Core logic for interpreting metrics and generating risk scores.
    *   `tracking_engine.py`: Computer vision processing logic.
    *   `audio_analyzer.py`: Audio processing logic.

## 4. Key Features & Modules

### Landing Page
*   **New Design:** Modern, dark-themed, "Aurora" background, glassmorphism cards.
*   **Content:** Hero section, Feature grid, plus original detailed explanations (Process, Privacy) appended at the bottom.
*   **Navigation:** Links to placeholder pages (`Technology`, `Healthcare`, `Solutions`).

### Screening Modules
1.  **Eye Contact:** Measures gaze preference between "social" (left) and "geometric" (right) stimuli.
2.  **Name Response:** Detects head turning (yaw change) in response to name calling.
3.  **Vocalization:** Analyzes audio for speech vs. silence and volume levels.
4.  **Gestures:** Detects hand presence and movement (simulated/manual entry in current flow).
5.  **Repetitive Behavior:** Analyzes body movement patterns (rocking, swaying).

### Analysis Logic (`logic_engine.py`)
*   **Engagement:** Ratio of frames with face detected.
*   **Visual Preference:** Ratio of gaze towards social vs. geometric side.
*   **Attention Flexibility:** Number of gaze switches between sides.
*   **Interpretation:** Generates natural language summaries based on these metrics.

## 5. Design System
*   **Theme:** Dark mode by default (`class="dark"` in `html`).
*   **Colors:**
    *   Background: Deep dark (via Tailwind `bg-background`).
    *   Accents: Lime Green (`text-lime-400`, `bg-lime-400`) for "AI/Tech" feel.
    *   Secondary: Blue/Purple gradients for glass effects.
*   **Typography:** Sans-serif (Inter/default).

## 6. Recent Changes
*   Renamed application from "EarlyDetect AI" to "AutisMind AI".
*   Replaced particle background with "Aurora" effect.
*   Implemented new Landing Page with "Technology", "Healthcare", "Solutions" subpages.
*   Replaced placeholder images with local assets from `src/PicsVideos`.
*   Merged old landing page content (`Index.tsx`) into the new `LandingPage.tsx` via `OldLandingContent` component.
