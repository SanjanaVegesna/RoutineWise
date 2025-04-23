const { stripFences } = require("../utils");


async function estimateDurations(ai, model, taskNames) {
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
    model: model,
    contents: prompt,
    temperature: 0,
    maxOutputTokens: 150
  });
  const json = stripFences(res.text);
  return JSON.parse(json);
}

module.exports = { estimateDurations };
