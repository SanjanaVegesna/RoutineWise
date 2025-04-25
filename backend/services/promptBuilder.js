function buildPrompt({ goals, durations = {}, checkin = {}, profileData = {}, strategy = '', startOfDay = "08:00", endOfDay = "22:00" }) {
    const historicalDurations =
        profileData && typeof profileData === 'object' && profileData.avg_task_times ?
        profileData.avg_task_times : {};

    const mergedDurations = {...historicalDurations, ...durations };
    const exceptions = Array.isArray(checkin.exceptions) ? checkin.exceptions : [];

    const goalsStr = goals.join('; ');
    const exceptionsStr = exceptions
        .map(ex =>
            typeof ex === 'object' && ex.name && ex.start && ex.duration ?
            `${ex.name} at ${ex.start} for ${ex.duration} mins` :
            typeof ex === 'string' ?
            ex :
            ''
        )
        .filter(Boolean)
        .join('; ');

    return `
You are an intelligent AI day planner. Your job is to generate a thoughtful, well-structured daily schedule between ${startOfDay} and ${endOfDay}.

Strategy: ${strategy || 'Default'}

User-defined Goals:
${goalsStr}

Estimated Task Durations (in minutes):
${JSON.stringify(mergedDurations)}

Time Exceptions (must avoid):
${exceptionsStr}

Instructions:
- The **very first task must start exactly at ${startOfDay}**. This is non-negotiable.
- Fit all tasks strictly between ${startOfDay} and ${endOfDay}.
- Schedule all user goals using the durations provided (or intelligently estimate if missing).
- Tasks must NOT overlap.
- Each task must appear only **once** (except for split parts due to exceptions).
- DO NOT repeat the same task name multiple times unless explicitly split (e.g., “(part 1)” and “(part 2)”).
- Place exceptions exactly where noted.
- Time-fixed exceptions (e.g., meetings, classes, appointments) must be scheduled as a **single continuous block**. Do NOT split them.
- If a **goal** overlaps an exception, you may split it into “(part 1)” and “(part 2)” as needed.
- OPTIONAL: After long work blocks, you may insert a short “Catch-up: <task name>” block (max 15 mins).
- Catch-up blocks must not repeat full tasks — they are just placeholders for overflow or quick reviews.


Adjust the schedule based on the following strategy:
- Front-loaded: prioritize cognitively demanding tasks early in the day.
- Focus-window heavy: align complex tasks with focus windows provided.
- Even spread: balance all goals, breaks, and routines evenly.
- Minimal breaks: combine blocks, minimize idle time and micro-breaks.

Human Routines to include (with flexibility):
- Include a mix of natural routines like bathing/getting ready, meals, snacks, and breaks — and randomize their **order and timing** across the day.
- Do NOT always place "Bathing / Getting ready" or "Breakfast" at the beginning. These can appear **mid-morning or later**, depending on the day’s structure.
- Bathing / Getting ready
- Breakfast, Lunch, and Dinner (mealtimes should vary — not fixed order)
- Physical activity (stretch, walk, yoga)
- Include one creative/hobby time block (music, reading, journaling, or relaxation)
- End the day with “Review & plan tomorrow” (15 mins)

Variation Encouraged:
- Each variant must include **unique** routine placements.
- Avoid always placing the same tasks at the beginning or middle.
- Prefer logical but creative structure — for example, stretch before lunch or bathing before dinner are valid.
- Introduce randomness in when and where routines appear, across different strategy variants.

Format rules:
- After any continuous work > 40 mins, insert a 5-min “Break”
- Only split tasks if they overlap exceptions
- DO NOT add explanations or markdown

Output Format (JSON only):
[
  { "task": "First goal or routine", "time": "${startOfDay}", "duration": 30 },
  { "task": "Next task", "time": "hh:mm", "duration": X }
]
`.trim();
}

module.exports = { buildPrompt };