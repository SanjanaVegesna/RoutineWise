// Full Dashboard.jsx with manual calendar sync button

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import MainWrapper from "../../context/MainWrapper";
import PlanVariants from "./PlanVariants";
import PlanTask from "./PlanTask";

import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  getDoc
} from "firebase/firestore";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getUserPlan, getPlanVariants } from "../../services/firestoreService";

function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState([]);
  const [variants, setVariants] = useState([]);
  const [userReady, setUserReady] = useState(false);
  const [showNightPrompt, setShowNightPrompt] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [showPlanTask, setShowPlanTask] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(false);
  const [calendarButtonText, setCalendarButtonText] = useState("Add to Calendar");

  const totalTasks = analytics.length;
  const completedTasks = analytics.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const upcomingTask = analytics.find((task) => !task.completed);
  const allCompleted = completedTasks === totalTasks && totalTasks > 0;

  let achievementText = "Great Going";
  let achievementColor = "text-green-600";
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  if (completionRate < 0.7 && completionRate >= 0.4) {
    achievementText = "You can do better";
    achievementColor = "text-yellow-600";
  } else if (completionRate < 0.4) {
    achievementText = "You're falling behind your schedule. You can do this";
    achievementColor = "text-red-600";
  }

  const requestCalendarAccess = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.events");
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      return credential.accessToken;
    } catch (error) {
      console.error("Google Calendar authorization failed:", error);
      return null;
    }
  };

  const deleteOldRoutineWiseEvents = async (accessToken) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeMin = today.toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    const tasksToDelete = data.items.filter(
      (event) => event.summary?.startsWith("Task: ") &&
        new Date(event.start.dateTime).toDateString() === today.toDateString()
    );

    for (const event of tasksToDelete) {
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }
  };

  const addEventToGoogleCalendar = async (task, accessToken) => {
    const [hour, minute] = task.time.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hour, minute, 0, 0);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    const event = {
      summary: `Task: ${task.title}`,
      start: { dateTime: startTime.toISOString(), timeZone: "America/New_York" },
      end: { dateTime: endTime.toISOString(), timeZone: "America/New_York" },
      reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 10 }] },
    };

    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
  };

  const syncAllTasksToCalendar = async (taskList) => {
    try {
      const accessToken = await requestCalendarAccess();
      if (!accessToken) {
        alert("Failed to get calendar access. Please try again.");
        return false;
      }
      
      await deleteOldRoutineWiseEvents(accessToken);
      for (const task of taskList) {
        if (task.time) await addEventToGoogleCalendar(task, accessToken);
      }
      return true;
    } catch (error) {
      console.error("Error syncing to calendar:", error);
      alert("Failed to sync with calendar. Please try again.");
      return false;
    }
  };

  const handleCalendarSync = async () => {
    if (analytics.length === 0) {
      alert("No tasks to add to calendar. Please create a plan first.");
      return;
    }

    const success = await syncAllTasksToCalendar(analytics);
    if (success) {
      setCalendarSynced(true);
      setCalendarButtonText("Update Calendar");
      alert("Tasks successfully synced with your Google Calendar!");
    }
  };

  const fetchCompletions = async (userId) => {
    const snapshot = await getDocs(collection(db, "completions", userId, "entries"));
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setAnalytics((prev) =>
      prev.map((task) => {
        const entry = data.find((entry) => entry.task === task.title);
        return {
          ...task,
          started: !!entry,
          completed: !!entry?.completedAt,
        };
      })
    );
  };

  const handleStart = async (task) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const taskRefQuery = query(
      collection(db, "completions", userId, "entries"),
      where("task", "==", task.title),
      limit(1)
    );
    const snapshot = await getDocs(taskRefQuery);
    if (snapshot.docs.length > 0) {
      await deleteDoc(doc(db, "completions", userId, "entries", snapshot.docs[0].id));
      setAnalytics((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, started: false, completed: false } : t))
      );
      return;
    }

    const actualStartTime = new Date();
    const [h, m] = task.time.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(h, m, 0, 0);

    let taskStatus = "on-time";
    if (actualStartTime < scheduledTime) taskStatus = "early";
    else if (actualStartTime > scheduledTime) taskStatus = "late";

    await addDoc(collection(db, "completions", userId, "entries"), {
      task: task.title,
      taskType: "general",
      scheduledTime,
      startTime: actualStartTime,
      taskStatus,
    });

    setAnalytics((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, started: true } : t))
    );
  };

  const handleToggle = async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const taskToToggle = analytics.find((task) => task.id === id);
    if (!taskToToggle) return;

    const q = query(
      collection(db, "completions", userId, "entries"),
      where("task", "==", taskToToggle.title),
      orderBy("startTime", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = doc(db, "completions", userId, "entries", snapshot.docs[0].id);
      const existingCompleted = taskToToggle.completed;

      await updateDoc(docRef, {
        completedAt: existingCompleted ? null : new Date(),
      });

      setAnalytics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !existingCompleted } : t))
      );
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserReady(true);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const isFirstTime = !userDoc.exists() || !userDoc.data()?.hasCreatedPlan;
        setIsNewUser(isFirstTime);
        await loadPlan(user.uid);
        await fetchCompletions(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadPlan = async (userId) => {
    const dateKey = new Date().toISOString().split("T")[0];
    const planData = await getUserPlan(userId, dateKey);
    const fallbackVariants = await getPlanVariants(userId, dateKey);
    setVariants(fallbackVariants);

    if (Array.isArray(planData?.plan) && planData.plan.length > 0) {
      setSelectedVariant(planData.selectedVariant || null);
      const updatedTasks = planData.plan.map((task, i) => ({
        id: i + 1,
        title: task.task,
        time: task.time,
        started: false,
        completed: false,
      }));
      setAnalytics(updatedTasks);
      if (!showVariants) setShowVariants(false);
    } else {
      setAnalytics([]);
      setShowVariants(true);
    }
  };

  const handleVariantSelected = async () => {
    setShowVariants(false);
    const userId = auth.currentUser?.uid;
    if (userId) {
      await loadPlan(userId);
      await fetchCompletions(userId);
      setCalendarButtonText("Update Calendar");
    }
  };

  const handlePlanCreated = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setIsNewUser(false);
    setShowPlanTask(false);
    await loadPlan(userId);
    await fetchCompletions(userId);
    setCalendarButtonText("Add to Calendar");
  };

  return (
    <MainWrapper>
      {/* Only show confetti if user has tasks and all are completed */}
      {!isNewUser && allCompleted && <Confetti recycle={false} numberOfPieces={400} />}
      
      <main className="p-4 sm:p-6 md:p-8 space-y-8 max-w-6xl mx-auto text-gray-800">
        {/* Welcome message for new users */}
        {isNewUser && analytics.length === 0 && (
          <motion.div
            className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 rounded-2xl shadow-lg p-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">👋 Welcome to RoutineWise!</h2>
            <p className="text-lg mb-6">Hi there! What's your plan for today? Let's break it down together and make your day more productive.</p>
            <button
              onClick={() => setShowPlanTask(true)}
              className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-lg font-medium"
            >
              ✏️ Make Your First Plan
            </button>
          </motion.div>
        )}

        {/* Task Summary section */}
        <motion.div
          className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
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
          {selectedVariant && (
            <div className="text-sm text-blue-500 mt-2 font-medium text-center">
              🧠 Current Plan: <span className="underline">{selectedVariant}</span>
            </div>
          )}
        </motion.div>

        {/* Conditional rendering - Show either PlanVariants or Task List */}
        {showVariants ? (
          // Show PlanVariants when showVariants is true
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {variants.length > 0 ? (
              <PlanVariants
                variants={variants}
                onVariantSelected={handleVariantSelected}
              />
            ) : (
              <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
                <p className="text-lg text-gray-600 mb-4">No plan variants available for today.</p>
                <button
                  onClick={() => setShowPlanTask(true)}
                  className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-md"
                >
                  ✏️ Create New Plan
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          // Show Task List when showVariants is false
          analytics.length > 0 && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg p-6 h-[55vh] overflow-y-auto border-t-4 border-indigo-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold">📌 Upcoming Task:</h2>
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
                  className={`flex justify-between items-center p-4 mb-3 rounded-xl border shadow transition ${
                    task.completed ? "bg-green-100" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      className="px-3 py-1 rounded bg-blue-100 text-blue-600 text-xs"
                      onClick={() => handleStart(task)}
                    >
                      {task.started ? "Undo Start" : "Start"}
                    </button>
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={task.completed}
                      onChange={() => handleToggle(task.id)}
                      disabled={!task.started}
                    />
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{task.time}</span>
                </motion.div>
              ))}
            </motion.div>
          )
        )}

        {/* Action buttons - Only show when not displaying variants */}
        {!showVariants && !isNewUser && (
          <div className="text-center mt-6 space-x-4">
            <button
              onClick={() => setShowVariants(true)}
              className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white shadow-md"
            >
              🔁 Change Plan
            </button>
            
            <button
              onClick={() => setShowPlanTask(true)}
              className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-md"
            >
              ✏️ Create New Plan
            </button>
            
            <button
              onClick={handleCalendarSync}
              className={`px-6 py-2 rounded-lg ${
                calendarSynced ? "bg-purple-500 hover:bg-purple-600" : "bg-blue-500 hover:bg-blue-600"
              } text-white shadow-md`}
            >
              {calendarSynced ? "🔄 " : "📅 "}{calendarButtonText}
            </button>
          </div>
        )}

        {/* Night prompt */}
        {showNightPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-5 py-4 rounded-xl shadow-md text-center"
          >
            🌙 It's almost the end of the day!{" "}
            <button
              className="underline font-semibold hover:text-yellow-900"
              onClick={() => setShowPlanTask(true)}
            >
              Plan for tomorrow
            </button>
          </motion.div>
        )}

        {/* Achievement section - Only show if user is not new */}
        {!isNewUser && (
          <motion.div
            className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold">📅 Daily Achievement</h2>
            <p className={`text-lg font-medium ${achievementColor}`}>
              {achievementText}
            </p>
            {calendarSynced && (
              <p className="text-sm text-green-600 mt-2">
                ✅ Your tasks are synced with Google Calendar
              </p>
            )}
          </motion.div>
        )}
        
        {/* PlanTask modal */}
        <PlanTask 
          isOpen={showPlanTask} 
          onClose={() => setShowPlanTask(false)}
          onPlanCreated={handlePlanCreated}
        />
      </main>
    </MainWrapper>
  );
}

export default Dashboard;