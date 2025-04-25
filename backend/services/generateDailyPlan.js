const { GoogleGenAI } = require('@google/genai');
const { parseGoals } = require('./parseGoals');
const { buildPrompt } = require('./promptBuilder');
const { rankTasksByAI } = require('./rankTasks');
const { stripFences } = require('../utils');

function getRandomTime(start, end) {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes + 1)) + startMinutes;
    const h = Math.floor(randomMinutes / 60);
    const m = randomMinutes % 60;

    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

async function generateDailyPlan(req, res, db, apiKey, model) {
    const ai = new GoogleGenAI({ apiKey });

    try {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

        const { userId, goals: rawGoals, checkin = {} } = req.body;
        if (!userId || !rawGoals) return res.status(400).json({ error: 'Missing userId or goals' });

        const profileSnap = await db.collection('profileData').doc(userId).get();
        const profileData = profileSnap.exists ? profileSnap.data() : {};
        const avgTimes = profileData.avg_task_times || {};
        const bestFocusTimes = Array.isArray(profileData.best_focus_times) ?
            profileData.best_focus_times.filter(t => typeof t === 'string' && t.trim()) : [];

        const parsed = await parseGoals(ai, model, rawGoals);
        const goals = parsed.goals || [];
        const exceptions = parsed.exceptions || [];

        const rankedTasks = await rankTasksByAI(ai, model, goals);
        const rankedNames = rankedTasks.map(t => t.task);
        const durations = Object.fromEntries(rankedTasks.map(t => [t.task, t.duration]));

        const dateKey = new Date().toISOString().split('T')[0];
        const planCollection = db.collection('plans').doc(userId).collection(dateKey);

        // === CHECKIN PATH ===
        if (checkin && checkin.startOfDay) {
            const prompt = buildPrompt({
                goals: rankedNames,
                durations,
                checkin: {...checkin, exceptions },
                profileData
            });

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                temperature: 0.4,
                maxOutputTokens: 1024
            });

            let plan = JSON.parse(stripFences(response.text));
            plan = deduplicateAndMergeTasks(plan);

            await planCollection.doc('plan').set({
                createdAt: new Date().toISOString(),
                source: 'gemini-checkin',
                selectedVariant: 'gemini-checkin',
                plan
            });

            return res.json({
                plan,
                variants: [],
                usedProfile: {
                    avg_task_times: Object.keys(avgTimes).length > 0,
                    focus_windows: bestFocusTimes.length > 0
                }
            });
        }

        // === FALLBACK VARIANTS PATH ===
        const fallbackVariants = {
            variant1_front_loaded: { strategy: 'Front-loaded', startOfDay: getRandomTime('07:30', '09:30') },
            variant2_focus_window: { strategy: 'Focus-window heavy', startOfDay: getRandomTime('08:30', '10:00'), focusWindows: ['09:00', '14:00'] },
            variant3_even_spread: { strategy: 'Even distribution', startOfDay: getRandomTime('09:00', '10:30') },
            variant4_minimal_breaks: { strategy: 'Minimal breaks', startOfDay: getRandomTime('08:00', '09:30') }
        };

        const batch = db.batch();
        const variantsToReturn = [];

        for (const [variantName, config] of Object.entries(fallbackVariants)) {
            const prompt = buildPrompt({
                goals: rankedNames,
                durations,
                checkin: {
                    exceptions,
                    focusWindows: config.focusWindows || []
                },
                profileData,
                strategy: config.strategy,
                startOfDay: config.startOfDay
            });

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                temperature: 0.5,
                maxOutputTokens: 1024
            });

            let plan = JSON.parse(stripFences(response.text));
            plan = deduplicateAndMergeTasks(plan);

            const variantsCollection = planCollection.doc('plan').collection('variants');
            const docRef = variantsCollection.doc(variantName);

            batch.set(docRef, {
                createdAt: new Date().toISOString(),
                strategy: config.strategy,
                startOfDay: config.startOfDay,
                focusWindows: config.focusWindows || [],
                plan
            });

            variantsToReturn.push({ name: variantName, strategy: config.strategy, plan });
        }

        const firstVariant = variantsToReturn.length > 0 ? variantsToReturn[0] : null;

        batch.set(planCollection.doc('plan'), {
            createdAt: new Date().toISOString(),
            source: 'fallback-variants',
            selectedVariant: firstVariant ? firstVariant.name : '',
            plan: firstVariant ? firstVariant.plan : []
        });

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
        console.error('Error in generateDailyPlan:', err);
        return res.status(500).json({ error: err.message });
    }
}

function deduplicateAndMergeTasks(plan) {
    const cleaned = [];
    const seen = new Set();

    for (let i = 0; i < plan.length; i++) {
        const curr = plan[i];
        const key = curr.task.replace(/ \(part \d+\)|Catch-up: /g, '').trim().toLowerCase();
        const prev = cleaned[cleaned.length - 1];

        // Merge if back-to-back identical tasks
        if (prev && prev.task === curr.task && timeEquals(endTime(prev), curr.time)) {
            prev.duration += curr.duration;
            continue;
        }

        // Skip duplicates unless they are part/catch-up
        if (seen.has(key) && !/part \d+|Catch-up/i.test(curr.task)) continue;

        seen.add(key);
        cleaned.push(curr);
    }

    return cleaned;
}

function endTime(task) {
    const [h, m] = task.time.split(':').map(Number);
    const end = h * 60 + m + (task.duration || 0);
    const hh = String(Math.floor(end / 60)).padStart(2, '0');
    const mm = String(end % 60).padStart(2, '0');
    return `${hh}:${mm}`;
}

function timeEquals(t1, t2) {
    return t1.trim() === t2.trim();
}

module.exports = { generateDailyPlan };