const { stripFences } = require("../utils");

async function rankTasksByAI(ai, model, taskNames) {
    const prompt = `
  You're a productivity coach. Given this list of tasks, rank them in the ideal order for an average person who is most focused between 9AM–12PM.
  Start with deep focus tasks (like studying, writing, coding), then schedule light tasks (like yoga, watching TV) later in the day.
  
  Return ONLY a JSON array of task names in your recommended order.
  
  Tasks:
  ${JSON.stringify(taskNames)}
  
  Example output:
  [
    "Study Java",
    "Finish report",
    "Do meditation",
    "Do yoga",
    "Watch TV"
  ]
  `;


    const res = await ai.models.generateContent({
        model: model,
        contents: prompt,
        temperature: 0.2,
        maxOutputTokens: 150
    });

    const json = stripFences(res.text);
    return JSON.parse(json);
}

module.exports = { rankTasksByAI }
