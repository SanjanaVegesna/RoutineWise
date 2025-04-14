import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import MainWrapper from "../../context/MainWrapper";

function Dashboard() {
  const navigate = useNavigate();


  const [analytics, setAnalytics] = useState([
    { id: 1, title: "Task 1", time: "8:00 AM", completed: false },
    { id: 2, title: "Task 2", time: "10:00 AM", completed: false },
    { id: 3, title: "Task 3", time: "12:00 PM", completed: false },
    { id: 4, title: "Task 4", time: "1:00 PM", completed: false },
    { id: 5, title: "Task 5", time: "1:15 PM", completed: false },
    { id: 6, title: "Task 6", time: "2:00 PM", completed: false },
    { id: 7, title: "Task 7", time: "4:00 PM", completed: false },
    { id: 8, title: "Task 8", time: "6:30 PM", completed: false },
    { id: 9, title: "Task 9", time: "7:00 PM", completed: false },
    { id: 10, title: "Task 10", time: "8:00 PM", completed: false },
    { id: 11, title: "Task 11", time: "9:00 PM", completed: false },
    { id: 12, title: "Task 12", time: "10:00 PM", completed: false },
  ]);

  const [showNightPrompt, setShowNightPrompt] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 23 && !showNightPrompt) {
        setShowNightPrompt(true);
      }
    };
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [showNightPrompt]);

  const handleToggle = (id) => {
    setAnalytics((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
            ...task,
            completed: !task.completed,
            time: !task.completed
              ? `${new Date().toLocaleTimeString()} ✅`
              : task.time,
          }
          : task
      )
    );
  };

  const totalTasks = analytics.length;
  const completedTasks = analytics.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const upcomingTask = analytics.find((task) => !task.completed);
  const allCompleted = completedTasks === totalTasks;

  let achievementText = "Great Going";
  let achievementColor = "text-green-600";
  const completionRate = completedTasks / totalTasks;

  if (completionRate < 0.7 && completionRate >= 0.4) {
    achievementText = "You can do better";
    achievementColor = "text-yellow-600";
  } else if (completionRate < 0.4) {
    achievementText = "You're falling behind your schedule. You can do this";
    achievementColor = "text-red-600";
  }

  return (
    <MainWrapper
    >      {allCompleted && <Confetti recycle={false} numberOfPieces={400} />}

      <main className="p-4 sm:p-6 md:p-8 space-y-8 max-w-6xl mx-auto text-gray-800">
        <motion.div
          className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold  flex items-center gap-2 mb-6" >
            📊 <span>Task Summary for Today</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-600 font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-600">{totalTasks}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-red-500">{pendingTasks}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 h-[55vh] overflow-y-auto border-t-4 border-indigo-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold ">📌 Upcoming Task:</h2>
            {upcomingTask && (
              <div className="flex gap-2 text-sm text-blue-600 font-medium">
                <span>{upcomingTask.title}</span>
                <span className="text-gray-400">|</span>
                <span>{upcomingTask.time}</span>
              </div>
            )}
          </div>

          {analytics.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.01 }}
              className={`flex justify-between items-center p-4 mb-3 rounded-xl border shadow transition ${task.completed ? "bg-green-100" : "bg-gray-50 hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className={`w-5 h-5 rounded-full ${task.completed ? "accent-green-600" : "accent-blue-600"
                    }`}
                />
                <span className=" font-medium">{task.title}</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">{task.time}</span>
            </motion.div>
          ))}
        </motion.div>

        {showNightPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-5 py-4 rounded-xl shadow-md text-center"
          >
            🌙 It's almost the end of the day!{" "}
            <button
              className="underline font-semibold hover:text-yellow-900"
              onClick={() => navigate("/plan")}
            >
              Plan for tomorrow
            </button>
          </motion.div>
        )}

        <motion.div
          className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-xl font-bold ">
            📅 Weekly Achievement
          </h2>

          <p className={`text-lg font-medium ${achievementColor}`}>{achievementText}</p>
        </motion.div>
      </main>
    </MainWrapper>
  );
}

export default Dashboard;
