const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const updatePatternData = require('./services/patternRecognition');
const { generateDailyPlan } = require('./services/generateDailyPlan');
const { analyzePatterns } = require('./services/analyzePatterns');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

admin.initializeApp();
const db = admin.firestore();

const { GENERATIVE_API_KEY } = process.env;
const MODEL_NAME = 'gemini-1.5-pro';

if (!GENERATIVE_API_KEY) {
  throw new Error("❌ Missing GENERATIVE_API_KEY in .env");
}

module.exports = {
  generateDailyPlan: onRequest(
    { secrets: ['GENERATIVE_API_KEY'] },
    (req, res) => generateDailyPlan(req, res, db, GENERATIVE_API_KEY, MODEL_NAME)
  ),

  analyzePatterns: onRequest(
    { secrets: ['GENERATIVE_API_KEY'] },
    (req, res) => analyzePatterns(req, res, db)
  ),

  nightlyPatternRecognition: onSchedule(
    {
      schedule: '0 23 * * *', // 11:00 PM daily
      timeZone: 'America/New_York'
    },
    async (event) => {
      const profileSnapshot = await db.collection("profileData").get();

      if (profileSnapshot.empty) {
        console.log("⚠️ No users found in profileData.");
        return;
      }

      const promises = [];

      profileSnapshot.forEach(doc => {
        const userId = doc.id;
        console.log(` Running pattern recognition for ${userId}`);
        promises.push(updatePatternData(userId));
      });

      await Promise.all(promises);
      console.log(" Completed pattern recognition for all users.");
    }
  )
};