// promptBuilder.js
const { stripFences } = require("../utils");

async function promptBuilder(ai, model, rawGoals, avgTimes = {}) {
  const prompt = `
You're a productivity assistant. A user gave you a list of free-form goals. 
Your task is to convert them into structured tasks with:
1. A task name
2. Estimated duration in minutes (use provided average times when possible)
3. Task priority (high, medium, low)
4. Preferred window if applicable (e.g., 09:00)

Return a JSON array of objects with keys: task, duration, priority, preferredWindow.
Do NOT include any extra explanation.

User's average task durations:
${JSON.stringify(avgTimes)}

User's goals:
"""
${rawGoals}
"""

Example:
[
  {
    "task": "Study Java",
    "duration": 60,
    "priority": "high",
    "preferredWindow": "09:00"
  }
]
`;

  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    temperature: 0.4,
    maxOutputTokens: 300
  });

  const json = stripFences(res.text);
  return JSON.parse(json);
}

module.exports = { buildPrompt: promptBuilder };
