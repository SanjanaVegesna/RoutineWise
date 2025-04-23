// PlanTask.jsx
import React, { useState, useEffect } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import MainWrapper from "../../context/MainWrapper";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const PlanTask = () => {
  const navigate = useNavigate(); // <-- Add this line
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showPreviousTaskModal, setShowPreviousTaskModal] = useState(false);

  const motivationalQuotes = [
    { text: "The key is not to prioritize what’s on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
    { text: "You don’t have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "Small habits make a big difference.", author: "James Clear" },
    { text: "Clutter is not just stuff on the floor, it’s anything that stands between you and the life you want.", author: "Peter Walsh" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Taking breaks isn’t lazy—it’s how we grow stronger.", author: "Unknown" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
        setFade(true);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTaskInput(transcript);
    };
    recognition.onerror = (event) => {
      alert("Voice error: " + event.error);
    };
    recognition.start();
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const payload = {
      userId: user.uid,
      goals: taskInput || "Finish report and do yoga"
    };

    try {
      const response = await fetch("http://127.0.0.1:5001/routinewise-2025/us-central1/generateDailyPlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setTasks(data.plan?.map(t => t.task) || []);
        setShowPreviousTaskModal(true);
        setTaskInput('');
        navigate("/dashboard"); //
      } else {
        console.error("❌ Failed to generate plan:", data.error);
      }
    } catch (err) {
      console.error("❌ Error during plan generation:", err);
    }
  };

  return (
    <MainWrapper>
      <div className="h-screen flex flex-col justify-between p-6">
        <div className="flex flex-1 gap-6">
          <div className="w-1/2 bg-white shadow-lg rounded-2xl p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🧠 Today's Plan</h2>
            <ul className="space-y-4 text-sm">
              {tasks.length > 0 ? (
                tasks.map((task, idx) => (
                  <li key={idx} className="p-3 bg-slate-100 rounded-lg shadow-sm">
                    ✅ {task}
                  </li>
                ))
              ) : (
                <p className="text-gray-400 italic">
                  AI-generated tasks will appear here after you submit.
                </p>
              )}
            </ul>
          </div>

          <div className="w-1/2 bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">✍️ Describe Your Day</h2>
            <textarea
              rows={6}
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Type what you plan to do today..."
              className="w-full p-4 rounded-lg border border-slate-300 focus:outline-blue-400"
            />
            <div className="flex justify-center mt-6">
              <button
                onClick={handleVoiceInput}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-400 text-white shadow-md"
              >
                <FaMicrophone size={20} />
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-sky-500 hover:bg-blue-500 text-white text-sm font-medium"
              >
                ➕ Submit
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className={`italic text-sm transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'} text-slate-600`}>
            {motivationalQuotes[quoteIndex].text}
          </p>
          <span className="text-xs text-blue-500 font-medium">
            — {motivationalQuotes[quoteIndex].author}
          </span>
        </div>

        {showPreviousTaskModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border relative">
              <h2 className="text-xl font-semibold mb-4 text-center">🕒 Add Previous Day’s Tasks?</h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                Would you like to carry forward tasks from yesterday into today’s plan?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setTasks((prev) => [...prev, "Complete yesterday’s design review", "Follow up with client"]);
                    setShowPreviousTaskModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  Yes, Add Tasks
                </button>
                <button
                  onClick={() => setShowPreviousTaskModal(false)}
                  className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
                >
                  No, Start Fresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainWrapper>
  );
};

export default PlanTask;