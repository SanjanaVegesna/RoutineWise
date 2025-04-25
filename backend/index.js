if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const updatePatternData = require('./services/patternRecognition');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const { generateDailyPlan } = require('./services/generateDailyPlan');
const { analyzePatterns } = require('./services/analyzePatterns');
const MODEL_NAME = 'gemini-1.5-pro';


try {
  const { GENERATIVE_API_KEY } = process.env;

  if (GENERATIVE_API_KEY) {
    exports.getPlan = onRequest(
      { secrets: ['GENERATIVE_API_KEY'] },
      (req, res) => {
        const apiKey = process.env.GENERATIVE_API_KEY;
        const model = MODEL_NAME;
        return generateDailyPlan(req, res, db, apiKey, model);
      }
    );

    exports.generateDailyPlan = onRequest(
      { secrets: ['GENERATIVE_API_KEY'] },
      (req, res) => {
        const apiKey = process.env.GENERATIVE_API_KEY;
        const model = 'gemini-1.5-pro';
        return generateDailyPlan(req, res, db, apiKey, model);
      }
    );

    exports.analyzePatterns = onRequest(
      { secrets: ['GENERATIVE_API_KEY'] },
      (req, res) => analyzePatterns(req, res, db)
    );
     
    exports.nightlyPatternRecognition = onSchedule(
      {
        schedule: '0 23 * * *', // 11:00 PM daily
        timeZone: 'America/New_York'
      },
      async (event) => {
        const profileSnapshot = await db.collection("profileData").get();
  
        if (profileSnapshot.empty) {
          console.log("No users found in profileData.");
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
  } else {
    throw "Missing GENERATIVE_API_KEY"
  }

} catch (e) {
  throw "Error " + e

}

