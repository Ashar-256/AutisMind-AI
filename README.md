# AutisMind AI

**AutisMind AI** is a cutting-edge, web-based screening tool designed to assess behavioral markers associated with Autism Spectrum Disorder (ASD) in toddlers and young children. By leveraging computer vision and audio analysis, it provides an accessible, preliminary screening mechanism that can be used from the comfort of home.

## 🚀 Features

*   **Eye Contact Tracking**: Uses MediaPipe Face Mesh to analyze gaze patterns and detect avoidance or preference for geometric patterns.
*   **Name Response Detection**: Measures response latency and head turning when the child's name is called.
*   **Vocalization Analysis**: Analyzes audio for speech-like sounds vs. silence or crying, providing real-time volume feedback.
*   **Gesture Recognition**: Detects pointing and other communicative gestures using hand tracking.
*   **Repetitive Behavior Detection**: Identifies repetitive body movements like rocking or hand flapping.
*   **Privacy First**: All analysis is performed in real-time. No video or audio is permanently stored on the server.

## 🛠️ Technology Stack

### Frontend (The "Face")
*   **React**: UI Library
*   **Vite**: Build Tool
*   **TypeScript**: Type Safety
*   **Tailwind CSS**: Styling
*   **Shadcn/UI**: Component Library
*   **WebSockets**: Real-time communication with the backend

### Backend (The "Brain")
*   **Python 3.10+**: Core logic
*   **FastAPI**: High-performance web framework
*   **MediaPipe**: Computer Vision (Face, Hands, Pose)
*   **OpenCV**: Image processing
*   **NumPy**: Numerical analysis

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10)
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/Ashar-256/AutisMind-AI.git
cd AutisMind-AI
```

### 2. Setup Backend
The backend handles all the heavy AI processing.

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
The backend will start at `http://localhost:8000`.

### 3. Setup Frontend
The frontend is the user interface.

```bash
# Open a new terminal in the root directory
cd .. 
# Install dependencies
npm install

# Run the development server
npm run dev
```
The frontend will start at `http://localhost:5173`.

## ☁️ Deployment

### Frontend (GitHub Pages)
This project is configured to deploy to GitHub Pages automatically or via manual script.
The live site is available at: **[https://ashar-256.github.io/AutisMind-AI/](https://ashar-256.github.io/AutisMind-AI/)**

### Backend (Render/Cloud)
To make the app work online for everyone, the backend must be hosted on a cloud provider like Render.

1.  Create a new **Web Service** on [Render](https://render.com/).
2.  Connect your GitHub repository.
3.  **Root Directory**: `backend`
4.  **Build Command**: `pip install -r requirements.txt`
5.  **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6.  **Environment Variables**: Ensure Python version is set to `3.10.12` (handled by `.python-version` file).

### Connecting Frontend to Hosted Backend
Once your backend is deployed (e.g., `https://your-app.onrender.com`), go to the live website:
1.  Click the **"⚙️ Backend"** button in the bottom right.
2.  Enter your new Backend URL.
3.  The app will now use the cloud backend!

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open-source and available under the MIT License.
