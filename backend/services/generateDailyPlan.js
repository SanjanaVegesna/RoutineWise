
const { GoogleGenAI } = require('@google/genai');
const { parseFreeformGoals } = require('./parseGoals');
const { estimateDurations } = require('./estimateDurations');
const { rankTasksByAI } = require('./rankTasks');
const { scheduleDay } = require('./scheduler');


async function generateDailyPlan(req, res, db, apiKey, model) {
  const ai = new GoogleGenAI({ apiKey }); // ✅ use injected secret
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { userId, goals: rawGoals, checkin = null } = req.body;
    if (!userId || !rawGoals) {
      return res.status(400).json({ error: 'Missing userId or goals' });
    }

    // Step A: Fetch user profile and sanitize
    const profileSnap = await db.collection('profileData').doc(userId).get();
    let profileData = profileSnap.exists ? profileSnap.data() : {};

    if (typeof profileData !== 'object') profileData = {};


    const avgTimes = profileData.avg_task_times || {};
    const bestFocusTimes = Array.isArray(profileData.best_focus_times)
      ? profileData.best_focus_times.filter(t => typeof t === 'string' && t.trim())
      : [];

    // Step B: Parse freeform goals
    let goals = Array.isArray(rawGoals)
      ? rawGoals
      : await parseFreeformGoals(ai, model, rawGoals);

    

    const durations = {};
    goals.forEach((g) => {
      if (avgTimes[g] != null) {
        durations[g] = avgTimes[g];
      }
    });

    const missing = goals.filter((g) => durations[g] == null);

    if (missing.length > 0) {
      const est = await estimateDurations(ai, model, missing, avgTimes);
      missing.forEach((g) => {
        durations[g] = est[g] || 30;
      });
    }


    const rankedNames = await rankTasksByAI(ai, model, goals);


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
        focusWindows: bestFocusTimes || []
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
    return res.json({
      plan: null,
      variants: variantsToReturn,
      usedProfile: {
        avg_task_times: Object.keys(avgTimes).length > 0,
        focus_windows: bestFocusTimes.length > 0
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { generateDailyPlan }
