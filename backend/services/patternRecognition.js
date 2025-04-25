/*// 🔍 File: functions/utils/patternRecognition.js
const admin = require("firebase-admin");
const db = admin.firestore();
const classifyTaskLabel = require("./classifyTaskLabel");

//function classifyTaskLabel(taskName) {
// return taskName.trim(); // keep original task name for personalized pattern
//}

async function updatePatternData(userId) {
  const completionsRoot = db.collection("completions").doc(userId);
  const dateCollections = await completionsRoot.listCollections();

  const taskDurations = {}; // { "Task Name": [duration1, duration2, ...] }

  
    for (const doc of entrySnap.docs) {
      const data = doc.data();
      const { task, startTime, completedAt } = data;
    
      if (!task || !startTime || !completedAt) continue;
    
      const taskLabel = await classifyTaskLabel(task); // AI call
      const duration = (completedAt.toDate() - startTime.toDate()) / (1000 * 60);
    
      if (duration < 1 || duration > 300) continue;
    
      if (!taskDurations[taskLabel]) taskDurations[taskLabel] = [];
      taskDurations[taskLabel].push(duration);
    }
    

  const avg_task_times = {};
  for (let taskName in taskDurations) {
    const durations = taskDurations[taskName];
    const avg = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    avg_task_times[taskName] = Math.round(avg); // round to nearest minute
  }

  await db.collection("profileData").doc(userId).set({ avg_task_times }, { merge: true });
  console.log(" Pattern recognition data updated for:", userId);
  return avg_task_times;
}

module.exports = updatePatternData;


// 🔍 File: functions/utils/patternRecognition.js
const admin = require("firebase-admin");
const db = admin.firestore();
const classifyTaskLabel = require("./classifyTaskLabel");

async function updatePatternData(userId) {
  const completionsRoot = db.collection("completions").doc(userId);
  const dateCollections = await completionsRoot.listCollections();

  const taskDurations = {}; // { "Task Type": [duration1, duration2, ...] }

  for (const dateCol of dateCollections) {
    const entrySnap = await dateCol.get();

    for (const doc of entrySnap.docs) {
      const data = doc.data();
      const { task, startTime, completedAt } = data;

      if (!task || !startTime || !completedAt) continue;

      const taskLabel = await classifyTaskLabel(task);
      const duration = (completedAt.toDate() - startTime.toDate()) / (1000 * 60);

      if (duration < 1 || duration > 300) continue;

      if (!taskDurations[taskLabel]) taskDurations[taskLabel] = [];
      taskDurations[taskLabel].push(duration);
    }
  }

  const avg_task_times = {};
  for (let taskName in taskDurations) {
    const durations = taskDurations[taskName];
    const avg = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    avg_task_times[taskName] = Math.round(avg);
  }

  await db.collection("profileData").doc(userId).set({ avg_task_times }, { merge: true });
  console.log("✅ Pattern recognition data updated for:", userId);
  return avg_task_times;
}

module.exports = updatePatternData;
*/
/*
const admin = require("firebase-admin");
const classifyTaskLabel = require("./classifyTaskLabel");

async function updatePatternData(userId) {
  const db = admin.firestore(); // Move inside the function

  const completionsRoot = db.collection("completions").doc(userId);
  const dateCollections = await completionsRoot.listCollections();

  const taskDurations = {};

  for (const dateCol of dateCollections) {
    const entrySnap = await dateCol.get();

    for (const doc of entrySnap.docs) {
      const data = doc.data();
      const { task, startTime, completedAt } = data;

      if (!task || !startTime || !completedAt) continue;

      const taskType = await classifyTaskLabel(task);
      data.taskType = taskType; // optional: update Firestore here too

      // Use actual task name as key, but store taskType alongside
      if (!taskDurations[task]) {
        taskDurations[task] = { durations: [], taskType };
      }
      taskDurations[task].durations.push(duration);

    }
  }

  const avg_task_times = {};
  for (let taskName in taskDurations) {
    const durations = taskDurations[taskName];
    const avg = durations.reduce((sum, val) => sum + val, 0) / durations.length;
    avg_task_times[taskName] = Math.round(avg);
  }

  await db.collection("profileData").doc(userId).set({ avg_task_times }, { merge: true });
  console.log("✅ Pattern recognition data updated for:", userId);
  return avg_task_times;
}

module.exports = updatePatternData;
*/
const admin = require("firebase-admin");
const classifyTaskLabel = require("./classifyTaskLabel");

async function updatePatternData(userId) {
  const db = admin.firestore();

  const completionsRoot = db.collection("completions").doc(userId);
  const dateCollections = await completionsRoot.listCollections();

  const taskDurations = {};

  for (const dateCol of dateCollections) {
    const entrySnap = await dateCol.get();

    for (const doc of entrySnap.docs) {
      const data = doc.data();
      const { task, startTime, completedAt } = data;

      if (!task || !startTime || !completedAt) continue;

      const taskType = await classifyTaskLabel(task); // ✅ CLASSIFY HERE
      const duration = (completedAt.toDate() - startTime.toDate()) / (1000 * 60);
      if (duration < 1 || duration > 300) continue;

      if (!taskDurations[task]) {
        taskDurations[task] = { durations: [], taskType };
      }
      taskDurations[task].durations.push(duration);
    }
  }

  const avg_task_times = {};
  for (const taskName in taskDurations) {
    const { durations, taskType } = taskDurations[taskName];
    const avg = durations.reduce((sum, val) => sum + val, 0) / durations.length;

    avg_task_times[taskName] = {
      taskType,
      avgMinutes: Math.round(avg)
    };
  }

  await db.collection("profileData").doc(userId).set({ avg_task_times }, { merge: true });
  console.log("✅ Pattern recognition data updated for:", userId);
  return avg_task_times;
}

module.exports = updatePatternData;
