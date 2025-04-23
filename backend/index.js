if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const { generateDailyPlan } = require('./services/generateDailyPlan');
const { analyzePatterns } = require('./services/analyzePatterns');
const MODEL_NAME = 'gemini-1.5-pro';


try {
  const { GENERATIVE_API_KEY } = process.env;

  if (GENERATIVE_API_KEY) {
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
  } else {
    throw "Missing GENERATIVE_API_KEY"
  }

} catch (e) {
  throw "Error " + e

}

