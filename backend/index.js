
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');
const buildPrompt = require('./promptBuilder');
const { scheduleDay } = require('./scheduler');
const { stripFences } = require('./utils');  // your fence‑stripping helper



exports.analyzePatterns = require('./analyzePatterns').analyzePatterns;

admin.initializeApp();
const db = admin.firestore();

// Init your AI client (ensure GENERATIVE_API_KEY is set in secrets or .env)
const ai = new GoogleGenAI({ apiKey: process.env.GENERATIVE_API_KEY });
const MODEL_NAME = 'gemini-1.5-pro';

// 1) Turn a free‑form goals string into an array of goal phrases
async function parseFreeformGoals(text) {
  const prompt = `
Extract each distinct task I want to work on today from the text below.
Return ONLY a JSON array of strings—no extra commentary.

Text:
"${text}"

Example output:
[
  "Work on Maths Assignment questions",
  "Deep Learning project work"
]
`;
  const res = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    temperature: 0,
    maxOutputTokens: 100
  });
  const json = stripFences(res.text);
  return JSON.parse(json);
}

// 2) Ask the AI to estimate durations for any missing tasks
async function estimateDurations(taskNames) {
  const prompt = `
Given these tasks, estimate a reasonable duration (in whole minutes) for each:
Return ONLY a JSON object mapping each task to a number.

Tasks:
${JSON.stringify(taskNames)}

Example:
{
  "Task A": 45,
  "Task B": 30
}
`;
  const res = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    temperature: 0,
    maxOutputTokens: 150
  });
  const json = stripFences(res.text);
  return JSON.parse(json);
}

// 3) Ask AI to prioritize tasks
async function rankTasksByAI(taskNames) {
  const prompt = `
You're a productivity coach. Given this list of tasks, rank them in the ideal order for an average person who is most focused between 9AM–12PM.
Start with deep focus tasks (like studying, writing, coding), then schedule light tasks (like yoga, watching TV) later in the day.

Return ONLY a JSON array of task names in your recommended order.

Tasks:
${JSON.stringify(taskNames)}

Example output:
[
  "Study Java",
  "Finish report",
  "Do meditation",
  "Do yoga",
  "Watch TV"
]
`;


  const res = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    temperature: 0.2,
    maxOutputTokens: 150
  });

  const json = stripFences(res.text);
  return JSON.parse(json);
}


exports.generateDailyPlan = onRequest(
  { secrets: ['GENERATIVE_API_KEY'] },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { userId, goals: rawGoals, checkin = null } = req.body;
      if (!userId || !rawGoals) {
        return res.status(400).json({ error: 'Missing userId or goals' });
      }

      // Step A: Fetch user profile
      const profileSnap = await db.collection('profileData').doc(userId).get();
      const profileData = profileSnap.exists
        ? profileSnap.data()
        : { avg_task_times: {}, best_focus_times: [] };

      // Step B: Parse freeform goals
      let goals = Array.isArray(rawGoals)
        ? rawGoals
        : await parseFreeformGoals(rawGoals);

      // Step C: Build durations
      const avgTimes = profileData.avg_task_times || {};
      const durations = {};
      goals.forEach(g => {
        if (avgTimes[g] != null) durations[g] = avgTimes[g];
      });
      const missing = goals.filter(g => durations[g] == null);
      if (missing.length) {
        const est = await estimateDurations(missing);
        missing.forEach(g => {
          durations[g] = est[g] || 30;
        });
      }

      const rankedNames = await rankTasksByAI(goals);

      const annotatedGoals = rankedNames.map(name => ({
        name,
        duration: durations[name] || 30
      }));

      const dateKey = new Date().toISOString().split('T')[0];
      const planCollection = db.collection('plans').doc(userId).collection(dateKey);

      // IF CHECKIN PROVIDED → SINGLE PRIORITIZED PLAN
      if (checkin) {
        const exceptions = (checkin.exceptions || []).map(ex => {
          if (typeof ex === 'object' && ex.name && ex.start && ex.duration) {
            return ex;
          }
          const [name, , time] = ex.split(' ');
          return { name: name.trim(), start: time.trim(), duration: 60 };
        });

        const plan = scheduleDay({
          goals: annotatedGoals,
          exceptions,
          startOfDay: checkin.startOfDay || '09:00',
          focusWindows: profileData.best_focus_times || []
        });

        await planCollection.doc('plan').set({
          createdAt: new Date().toISOString(),
          source: 'prioritized',
          plan
        });

        return res.json({ plan, variants: null });
      }

      // NO CHECKIN → GENERATE 3–4 PLAN VARIANTS
      const fallbackPlans = {
        variant1_front_loaded: {
          strategy: 'Front-loaded',
          startOfDay: '08:00'
        },
        variant2_focus_window: {
          strategy: 'Focus-window heavy',
          startOfDay: '09:00',
          focusWindows: ['09:00', '14:00']
        },
        variant3_even_spread: {
          strategy: 'Even distribution',
          startOfDay: '10:00'
        },
        variant4_minimal_breaks: {
          strategy: 'Minimal breaks',
          startOfDay: '08:30'
        }
      };

      const batch = db.batch();
      const variantsToReturn = [];

      for (const [variantName, config] of Object.entries(fallbackPlans)) {
        const variantPlan = scheduleDay({
          goals: annotatedGoals,
          startOfDay: config.startOfDay,
          focusWindows: config.focusWindows || []
        });

        const variantsCollection = planCollection.doc('plan').collection('variants');
        const docRef = variantsCollection.doc(variantName);

        batch.set(docRef, {
          createdAt: new Date().toISOString(),
          strategy: config.strategy,
          startOfDay: config.startOfDay,
          focusWindows: config.focusWindows || [],
          plan: variantPlan
        });

        variantsToReturn.push({
          name: variantName,
          strategy: config.strategy,
          plan: variantPlan
        });
      }

      await batch.commit();
      return res.json({ plan: null, variants: variantsToReturn });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);
