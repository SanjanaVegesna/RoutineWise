// backend/services/promptBuilder.js or backend/promptBuilder.js
 
function buildPrompt({ goals, durations = {}, checkin = {}, profileData = {}, strategy = '', startOfDay = "08:00", endOfDay = "22:00" }) {
  // Merge durations from arguments with historical ones if available
  const historicalDurations =
      profileData && typeof profileData === 'object' && profileData.avg_task_times ?
      profileData.avg_task_times : {};

  const mergedDurations = {...historicalDurations, ...durations };

  const exceptions = Array.isArray(checkin.exceptions) ? checkin.exceptions : [];

  const goalsStr = goals.join('; ');
  const exceptionsStr = exceptions
      .map(ex => (typeof ex === 'object' && ex.name && ex.start && ex.duration ?
          `${ex.name} at ${ex.start} for ${ex.duration} mins` :
          typeof ex === 'string' ?
          ex :
          ''))
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
- Schedule all user goals using the durations provided (or intelligently estimate if missing).
- Tasks must NOT overlap.
- Fit everything strictly between ${startOfDay} and ${endOfDay}.
- Place exceptions exactly where noted.
- If a goal overlaps an exception, split into “(part 1)” and “(part 2)”.

Adjust the schedule based on the following strategy:
- Front-loaded: prioritize cognitively demanding tasks early in the day.
- Focus-window heavy: align complex tasks with focus windows provided.
- Even spread: balance all goals, breaks, and routines evenly.
- Minimal breaks: combine blocks, minimize idle time and micro-breaks.

Human Routines to include (with flexibility):
- Include a mix of natural routines like bathing/getting ready, meals, snacks, and breaks — but their order and presence can vary creatively.
- Bathing / Getting ready (can be early or mid-morning, based on schedule flow)
- Breakfast, Lunch, and Dinner (mealtimes are flexible and should not always follow the same pattern)
- Physical activity (stretch, walk, yoga) at some point during the day
- Include at least one block of a light/creative routine: hobbies (reading, music, journaling), pet time, or light relaxation — choose what best fits the day’s tone
- End with: “Review & plan tomorrow” (15 mins) as the last task

Variation Encouraged:
- You may replace or shuffle human routines depending on the day's goals and energy.
- Do **not** always place bathing or breakfast at the beginning.
- Do **not** repeat the same routines if creative alternatives make better use of time.

Format rules:
- After any continuous work > 40 mins, insert a 5-min “Break”
- After each work block, insert "<task> (if needed)" catch-up block of same duration
- Only split tasks if they overlap exceptions
- DO NOT add explanations or markdown

Output Format (JSON only):
[
{ "task": "Breakfast", "time": "08:00", "duration": 20 },
{ "task": "Work on Maths homework", "time": "08:30", "duration": 60 },
{ "task": "Mid-morning snack", "time": "09:30", "duration": 15 }
]`.trim();
}

module.exports = { buildPrompt };