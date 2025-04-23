
# RoutineWise
RoutineWise is a smart, voice-enabled, and emotionally aware planner designed for neurodivergent users and everyday humans who need more than just checkboxes—it adapts to your lifestyle, mood, and energy.

RoutineWise does not rely on external datasets. Instead, we leverage Google's Vertex AI with prompt-based logic and adapt using real-time user feedback. Over time, our app passively learns user behavior — average task durations, peak focus hours, and preferred planning styles — and feeds that back into future plans.


# Folder Structure
<pre> <code>
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
</code> </pre>

# Step1:
<pre> <code>
git clone https://github.com/your-username/RoutineWise.git
cd RoutineWise
</code> </pre>

# Step2:
<pre> <code>
cd frontend
npm install         # Install all dependencies
npm start           # Runs on http://localhost:3000
</code> </pre>


# Step3:
<pre> <code>
cd ../backend
npm install         # Install Firebase and other dependencies
</code> </pre>

# If not already done, log in to Firebase CLI
<pre> <code>
firebase login
</code> </pre>

# Start Firebase emulator for local testing
<pre> <code>
firebase emulators:start
</code> </pre>

This will start the emulator at: http://127.0.0.1:5001/routinewise-2025/us-central1/generateDailyPlan
