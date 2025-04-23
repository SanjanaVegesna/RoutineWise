// backend/promptBuilder.js
module.exports = function buildPrompt({ goals, checkin, profileData }) {
  const durations = profileData?.avg_task_times || {};
  const exList    = (checkin.exceptions || []).join('; ');

  return `
You’re a strict scheduler. Produce ONLY a JSON array of objects; no narrative or Markdown.

Inputs:
- Goals: ${goals.join('; ')}
- Exceptions: ${exList}
- Durations (min): ${JSON.stringify(durations)}

Rules:
1. Use exactly those durations.
2. List tasks chronologically, with no overlaps.
3. Place each exception at its exact time.
4. A work task that overlaps an exception may be split into **at most two** parts:
   • Part 1 before the exception, named "<task> (part 1)".  
   • Part 2 after the exception, named "<task> (part 2)".  
5. Don’t split tasks for any other reason—only around exceptions.
6. After any continuous work >40 min, insert a 5 min “Break”.
7. After each work or part, insert a catch‑up named "<task> (if needed)" same duration.
   
Example output:
[
  { "task":"Review PRs (part 1)","time":"10:00","duration":30 },
  { "task":"Lunch with client","time":"12:30","duration":60 },
  { "task":"Review PRs (part 2)","time":"13:30","duration":30 },
  …
]
`;
};
