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
    console.error(" classifyTaskLabel error:", err);
    return "general";
  }
}

module.exports = classifyTaskLabel;