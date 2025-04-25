// 🔍 File: functions/utils/classifyTaskLabel.js
/*
const { VertexAI } = require("@google-cloud/vertexai");

const vertexAI = new VertexAI({ project: "routinewise-2025", location: "us-central1" });
const model = vertexAI.getTextModel("text-bison");

async function classifyTaskLabel(taskName) {
  const prompt = `
Identify a broad task category based on the task description.
Categories: reading, coding, communication, planning, writing, cleaning, meditation, general

Task: "${taskName}"
Category:`.trim();

  try {
    const result = await model.predict({ prompt });
    return result.text.trim().toLowerCase();
  } catch (err) {
    console.error("Task classification failed:", err.message);
    return "general"; // fallback
  }
}

module.exports = classifyTaskLabel;
*/

// 🔍 File: backend/services/classifyTaskLabel.js
/*
const { VertexAI } = require("@google-cloud/vertexai");

// Initialize Vertex AI
const vertexAI = new VertexAI({ project: "routinewise-2025", location: "us-central1" });

// Get the Text Generation model
const model = vertexAI.generativeModel({
  model: 'gemini-pro', // Or 'text-bison' depending on availability and preference
});

async function classifyTaskLabel(taskName) {
  const prompt = `
Identify a broad task category based on the task description.
Categories: reading, coding, communication, planning, writing, cleaning, meditation, general

Task: "${taskName}"
Category:`.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response;
    const category = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || "general";
    return category;

  } catch (err) {
    console.error("Task classification failed:", err);
    return "general"; // fallback
  }
}

module.exports = classifyTaskLabel;
*/

// 🔍 File: backend/services/classifyTaskLabel.js
// 🔍 File: backend/services/classifyTaskLabel.js

// 🔍 File: backend/services/classifyTaskLabel.js
 // Load the .env at the top


 /*
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize GoogleGenAI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);

// Get the GenerativeModel
const generativeModel = genAI.geminiPro; // Or genAI.geminiProVision if you intend to use multimodal models

async function classifyTaskLabel(taskName) {
  const prompt = `
Identify a broad task category based on the task description.
Categories: reading, coding, communication, planning, writing, cleaning, meditation, general

Task: "${taskName}"
Category:`.trim();

  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = result.response;
    const category = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || "general";
    //console.log(category);
    return category;

  } catch (err) {
    console.error("Task classification failed:", err);
    return "general"; // fallback
  }
}

module.exports = classifyTaskLabel;

*/
/*
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);
const generativeModel = genAI.getGenerativeModel({ model: "models/gemini-pro" });
// const generativeModel = genAI.getGenerativeModel({ model: "gemini-pro" });

async function classifyTaskLabel(taskName) {
  const prompt = `
Identify a broad task category based on the task description.
Categories: reading, coding, communication, planning, writing, cleaning, meditation, general

Task: "${taskName}"
Category:`.trim();

  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const category = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
    console.log(`📌 "${taskName}" → ${category}`);
    return category || "general";
  } catch (err) {
    console.error("❌ classifyTaskLabel error:", err.message);
    return "general";
  }
}

module.exports = classifyTaskLabel;
*/

require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_API_KEY);

async function classifyTaskLabel(taskName) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Use getGenerativeModel with the new model name

  const prompt = `
Identify a broad task category based on the task description.
Categories: reading, coding, communication, planning, writing, cleaning, meditation, general

Task: "${taskName}"
Category:`.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const category = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
    console.log(`📌 "${taskName}" → ${category}`);
    return category || "general";
  } catch (err) {
    console.error("❌ classifyTaskLabel error:", err);
    return "general";
  }
}

module.exports = classifyTaskLabel;