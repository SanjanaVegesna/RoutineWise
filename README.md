
# RoutineWise
RoutineWise is a smart, voice-enabled, and emotionally aware planner designed for neurodivergent users and everyday humans who need more than just checkboxes—it adapts to your lifestyle, mood, and energy.

RoutineWise does not rely on external datasets. Instead, we leverage Google's Vertex AI with prompt-based logic and adapt using real-time user feedback. Over time, our app passively learns user behavior — average task durations, peak focus hours, and preferred planning styles — and feeds that back into future plans.


# Folder Structure
RoutineWise/
├── backend/                  # Firebase Functions backend
│   ├── functions/
│   │   ├── index.js
│   │   ├── generateDailyPlan.js
│   │   ├── ...other functions
│   │   └── package.json
│   └── firebase.json
│
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
└── README.md

# Step1:
git clone https://github.com/your-username/RoutineWise.git
cd RoutineWise

# Step2:
cd frontend
npm install         # Install all dependencies
npm start           # Runs on http://localhost:3000


# Step3:
cd ../backend
npm install         # Install Firebase and other dependencies

# If not already done, log in to Firebase CLI
firebase login

# Start Firebase emulator for local testing
firebase emulators:start

This will start the emulator at: http://127.0.0.1:5001/routinewise-2025/us-central1/generateDailyPlan
