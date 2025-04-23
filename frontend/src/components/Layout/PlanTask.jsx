// PlanTask.jsx
import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaTimes } from 'react-icons/fa';
import { auth, db } from "../../firebase";
import { doc, updateDoc } from "firebase/firestore";

const PlanTask = ({ isOpen, onClose, onPlanCreated }) => {
  const [taskInput, setTaskInput] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const motivationalQuotes = [
    { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
    { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
    { text: "Small habits make a big difference.", author: "James Clear" },
    { text: "Clutter is not just stuff on the floor, it's anything that stands between you and the life you want.", author: "Peter Walsh" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Taking breaks isn't lazy—it's how we grow stronger.", author: "Unknown" },
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

    setIsLoading(true);
    
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
        // Update user document to indicate they have created a plan
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          hasCreatedPlan: true
        }).catch(err => {
          // If document doesn't exist yet, this might fail, but we can ignore
          console.log("User document may not exist yet:", err);
        });
        
        // Call the callback to notify parent component that plan was created
        onPlanCreated(data.plan);
        setTaskInput('');
        onClose();
      } else {
        console.error("❌ Failed to generate plan:", data.error);
        alert("Failed to generate plan. Please try again.");
      }
    } catch (err) {
      console.error("❌ Error during plan generation:", err);
      alert("Error generating plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white w-full max-w-2xl mx-auto p-6 rounded-2xl shadow-2xl border relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">✍️ Describe Your Day</h2>
        
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
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm font-medium`}
          >
            {isLoading ? '⏳ Generating...' : '✨ Generate My Plan'}
          </button>
        </div>
        
        <div className="text-center mt-6">
          <p className={`italic text-sm transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'} text-slate-600`}>
            {motivationalQuotes[quoteIndex].text}
          </p>
          <span className="text-xs text-blue-500 font-medium">
            — {motivationalQuotes[quoteIndex].author}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanTask;