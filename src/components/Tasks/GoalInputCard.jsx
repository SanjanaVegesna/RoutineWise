// src/components/GoalInputCard.jsx
import React, { useState } from 'react';

const GoalInputCard = ({ onAddTask }) => {
  const [task, setTask] = useState('');
  const [recognition, setRecognition] = useState(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTask(spokenText);
    };

    recog.onerror = (event) => {
      alert("Voice input failed: " + event.error);
    };

    recog.start();
    setRecognition(recog);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim() !== '') {
      onAddTask(task.trim());
      setTask('');
    }
  };

  return (
    <div className="w-full max-w-md p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-2">📝 Add Your Task</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="flex-grow border px-3 py-2 rounded"
          placeholder="Enter task"
        />
        <button type="button" onClick={handleVoiceInput} className="px-3 py-2 bg-yellow-400 rounded">
          🎙️
        </button>
        <button type="submit" className="px-3 py-2 bg-blue-500 text-white rounded">
          ➕
        </button>
      </form>
    </div>
  );
};

export default GoalInputCard;
