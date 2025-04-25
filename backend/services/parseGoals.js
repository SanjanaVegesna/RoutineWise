// 📁 backend/services/parseGoals.js
const { stripFences } = require("../utils");

async function parseGoals(ai, model, text) {
    const prompt = `
You are a productivity assistant. The user will describe their plans for today in natural language.

Your job is to extract:
1. A JSON array of flexible tasks (goals) with no fixed time.
2. A JSON array of time-fixed exceptions in this format:
   { "name": "Event name", "start": "HH:MM", "duration": minutes }

Instructions:
- If time is mentioned as a range (e.g., "2:00–3:30pm"), convert it to 24-hour "start" and calculate "duration" in minutes.
- DO NOT split fixed-time events. For example, "Maths class from 1:30 to 4:10pm" must appear as a single object: 
  { "name": "Maths class", "start": "13:30", "duration": 160 }
- All start times must be in "HH:MM" 24-hour format.
- Return ONLY a single valid JSON object.

Example input:
"I have to attend a lab meeting from 2:30 to 3:30pm, meet my professor at 1pm for 30 minutes, and work on my ML assignment."

Example output:
{
  "goals": ["Work on ML assignment"],
  "exceptions": [
    { "name": "Lab meeting", "start": "14:30", "duration": 60 },
    { "name": "Meet professor", "start": "13:00", "duration": 30 }
  ]
}

User message:
"${text}"
`;

    const res = await ai.models.generateContent({
        model,
        contents: prompt,
        temperature: 0.2,
        maxOutputTokens: 300
    });

    const json = stripFences(res.text);
    const parsed = JSON.parse(json);

    return {
        goals: parsed.goals || [],
        exceptions: parsed.exceptions || []
    };
}

module.exports = { parseGoals };