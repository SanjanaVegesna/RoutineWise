
const { stripFences } = require("../utils");

async function estimateDurations(ai, model, taskNames, avgTaskTimes = {}) {
  if (!taskNames || taskNames.length === 0) return {};

  const prompt = `
You are a productivity assistant. A user has listed several tasks for today, but we don’t know how long they might take.

The user also has historical average durations for other tasks. Try to match each of the new tasks to a semantically or categorically similar historical task. For example:

- "Study Java" is similar to "C++"
- "Mindfulness meditation" is similar to "Practice mindfulness meditation"
- "Draft whitepaper intro" is similar to "Write report" or "Outline document"

Use these historical durations to estimate the duration of each new task. If no match is found, make your best educated guess (default to 30 if unsure).

### New Tasks:
${JSON.stringify(taskNames)}

### Historical Task Durations:
${JSON.stringify(avgTaskTimes)}

Return ONLY a JSON object mapping each new task to a number (duration in minutes). No extra commentary.

Example output:
{
  "Study Java": 60,
  "Finish report": 50
}
`;

  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    temperature: 0.2,
    maxOutputTokens: 200
  });

  const json = stripFences(res.text);
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch (err) {
    console.error("❌ Failed to parse AI response:", json);
    return {};
  }
}

module.exports = { estimateDurations };
