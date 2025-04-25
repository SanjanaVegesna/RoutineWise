
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
