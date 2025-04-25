const { stripFences } = require("../utils");
 
async function rankTasksByAI(ai, model, taskNames) {
    const prompt = `
You are a smart productivity assistant. Given this list of tasks, do two things:
 
1. Rank them in a logical order for a productive day (assume the user is most focused 9AM–12PM).
2. Suggest estimated durations for each task in minutes. Be thoughtful — tasks like studying or skill learning may take 60–120 minutes, light tasks like journaling or calling a friend may take 10–30 minutes.
 
Return ONLY a JSON array of objects, each with:
- "task": the task name,
- "duration": suggested time in minutes.
 
Input Tasks:
${JSON.stringify(taskNames)}
 
Example:
[
  { "task": "Study Java", "duration": 90 },
  { "task": "Do yoga", "duration": 30 },
  { "task": "Watch TV", "duration": 20 }
]
`;
 
    const res = await ai.models.generateContent({
        model: model,
        contents: prompt,
        temperature: 0.3,
        maxOutputTokens: 300
    });
 
    const json = stripFences(res.text);
    return JSON.parse(json);
}
 
module.exports = { rankTasksByAI };