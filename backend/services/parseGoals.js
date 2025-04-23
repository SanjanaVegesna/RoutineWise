const { stripFences } = require("../utils");

async function parseFreeformGoals(ai, model, text) {
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
      model: model,
      contents: prompt,
      temperature: 0,
      maxOutputTokens: 100
    });
    const json = stripFences(res.text);
    return JSON.parse(json);
  }
  module.exports = { parseFreeformGoals };