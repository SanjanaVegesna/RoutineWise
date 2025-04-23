// const { onRequest } = require("firebase-functions/v2/https");
// const admin = require("firebase-admin");

// if (!admin.apps.length) {
//   admin.initializeApp();
// }
// const db = admin.firestore();

// function formatHour(timestamp) {
//   const date = timestamp.toDate();
//   return date.getHours().toString().padStart(2, '0') + ":00";
// }

// exports.analyzePatterns = onRequest(async (req, res) => {
//   const userId = req.query.userId || 'testUser';

//   try {
//     const completionsRef = db.collection('completions').doc(userId);
//     const snapshot = await completionsRef.listCollections();

//     const durations = {};
//     const focusHourCount = {};

//     for (const dateCol of snapshot) {
//       const tasksSnap = await dateCol.listDocuments();

//       for (const docRef of tasksSnap) {
//         const doc = await docRef.get();
//         const task = doc.data();

//         console.log('hey there', task)
//         if (!task?.task || !task?.completedAt || !task?.duration) continue;

//         // ⏱️ Track average duration
//         const name = task.task;
//         durations[name] = durations[name] || [];
//         durations[name].push(task.duration);

//         // 🕒 Track focus hour
//         const hour = formatHour(task.completedAt);
//         focusHourCount[hour] = (focusHourCount[hour] || 0) + 1;
//       }
//     }

//     console.log('hey thereeeee', durations)
//     // Calculate averages
//     const avg_task_times = {};
//     for (const task in durations) {
//       const all = durations[task];
//       const avg = Math.round(all.reduce((a, b) => a + b) / all.length);
//       avg_task_times[task] = avg;
//     }

//     // Sort focus times by frequency
//     const best_focus_times = Object.entries(focusHourCount)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 3)
//       .map(([hour]) => hour);

//     // Store in /profileData/{userId}
//     await db.collection('profileData').doc(userId).set({
//       avg_task_times,
//       best_focus_times
//     });

//     return res.json({ message: 'Pattern analysis complete ✅', avg_task_times, best_focus_times });

//   } catch (err) {
//     console.error('Pattern recognition error:', err);
//     return res.status(500).json({ error: err.message });
//   }
// });
