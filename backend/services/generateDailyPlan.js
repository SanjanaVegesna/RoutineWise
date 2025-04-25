const { GoogleGenAI } = require('@google/genai');
const { parseGoals } = require('./parseGoals');
const { buildPrompt } = require('./promptBuilder');
const { rankTasksByAI } = require('./rankTasks');
const { stripFences } = require('../utils');
 
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
            const prompt = buildPrompt({ goals: rankedNames, durations, checkin: {...checkin, exceptions }, profileData });
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                temperature: 0.4,
                maxOutputTokens: 1024
            });
 
            const plan = JSON.parse(stripFences(response.text));
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
            variant1_front_loaded: { strategy: 'Front-loaded', startOfDay: '08:00' },
            variant2_focus_window: { strategy: 'Focus-window heavy', startOfDay: '09:00', focusWindows: ['09:00', '14:00'] },
            variant3_even_spread: { strategy: 'Even distribution', startOfDay: '10:00' },
            variant4_minimal_breaks: { strategy: 'Minimal breaks', startOfDay: '08:30' }
        };
 
        const batch = db.batch();
        const variantsToReturn = [];
 
        for (const [variantName, config] of Object.entries(fallbackVariants)) {
            const prompt = buildPrompt({
                goals: rankedNames,
                durations,
                checkin: {
                    startOfDay: config.startOfDay,
                    exceptions,
                    focusWindows: config.focusWindows || []
                },
                profileData,
                strategy: config.strategy
            });
 
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                temperature: 0.5,
                maxOutputTokens: 1024
            });
 
            const plan = JSON.parse(stripFences(response.text));
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
 
        // Store selectedVariant (default: first variant)
        // Store selectedVariant (default: first variant)
        // Store selectedVariant (default: first variant safely)
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
 
module.exports = { generateDailyPlan };