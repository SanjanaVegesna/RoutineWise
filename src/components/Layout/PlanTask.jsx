import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaPlus } from 'react-icons/fa';
import MainWrapper from "../../context/MainWrapper"; // Adjust path as needed

const PlanTask = () => {
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showPreviousTaskModal, setShowPreviousTaskModal] = useState(false);


  const motivationalQuotes = [
    {
      text: "“The key is not to prioritize what’s on your schedule, but to schedule your priorities.”",
      author: "Stephen Covey"
    },
    {
      text: "“You don’t have to see the whole staircase, just take the first step.”",
      author: "Martin Luther King Jr."
    },
    {
      text: "“Small habits make a big difference.”",
      author: "James Clear"
    },
    {
      text: "“Clutter is not just stuff on the floor, it’s anything that stands between you and the life you want.”",
      author: "Peter Walsh"
    },
    {
      text: "“Discipline is choosing between what you want now and what you want most.”",
      author: "Abraham Lincoln"
    },
    {
      text: "“Taking breaks isn’t lazy—it’s how we grow stronger.”",
      author: "Unknown"
    },
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

  const handleSubmit = () => {
    // TODO: Replace with AI logic later
    /*setTasks([
      "Drink water",
      "Review tasks from yesterday",
      "Respond to urgent emails",
      "Code 2 Pomodoros",
      "Take a 15-min walk",
    ]);*/
    setShowPreviousTaskModal(true);
    setTaskInput('');
  };

  return (
    <MainWrapper>
      <div className="h-screen flex flex-col justify-between bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-white p-6">
        {/* Main Content */}
        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left Panel - Task List */}
          <div className="w-1/2 bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🧠 Today's Plan</h2>
            <ul className="space-y-4 text-sm">
              {tasks.length > 0 ? (
                tasks.map((task, idx) => (
                  <li key={idx} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg shadow-sm">
                    ✅ {task}
                  </li>
                ))
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  AI-generated tasks will appear here after you submit.
                </p>
              )}
            </ul>
          </div>

          {/* Right Panel - Task Input */}
          <div className="w-1/2 bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">✍️ Describe Your Day</h2>
            <textarea
              rows={6}
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Type what you plan to do today..."
              className="w-full p-4 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-blue-400"
            />
            {/* Speak button centered below textarea */}
            <div className="flex justify-center mt-6">
            <button
                onClick={handleVoiceInput}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 text-white shadow-md transition"
                aria-label="Start Voice Input"
            >
                <FaMicrophone size={20} />
            </button>
            </div>
            <div>
                
            </div>
            {/* Submit button centered below speak button */}
            <div className="flex justify-center mt-4">
            <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-sky-500/75 hover:bg-blue-500 text-white text-sm font-medium shadow-md transition"
            >
                ➕ Submit
            </button>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="text-center mt-6">
          <p
            className={`italic text-sm transition-opacity duration-500 ${
              fade ? 'opacity-100' : 'opacity-0'
            } text-slate-600 dark:text-gray-300`}
          >
            {motivationalQuotes[quoteIndex].text}
          </p>
          <span className="text-xs text-blue-500 dark:text-blue-300 font-medium">
            — {motivationalQuotes[quoteIndex].author}
          </span>
        </div>
      </div>
      {showPreviousTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white w-full max-w-md mx-auto p-8 rounded-2xl shadow-2xl border dark:border-slate-700 relative transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-center">
                🕒 Add Previous Day’s Tasks?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                Would you like to carry forward tasks from yesterday into today’s plan?
            </p>
            <div className="flex justify-center gap-4">
                <button
                onClick={() => {
                    // Load previous day tasks (stubbed)
                    setTasks((prev) => [
                    ...prev,
                    "Complete yesterday’s design review",
                    "Follow up with client",
                    "Push pending code to GitHub"
                    ]);
                    setShowPreviousTaskModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                Yes, Add Tasks
                </button>
                <button
                onClick={() => setShowPreviousTaskModal(false)}
                className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white transition"
                >
                No, Start Fresh
                </button>
            </div>
            </div>
        </div>
        )}


    </MainWrapper>
  );
};

export default PlanTask;
