function hhmmToMin(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}
function minToHhmm(mins) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
}

function scheduleDay({ goals, exceptions = [], startOfDay = '09:00', focusWindows = [] }) {
    const fixed = [];
    const scheduledNames = new Set();

    // Exceptions + prep
    for (const ex of exceptions) {
        const s = hhmmToMin(ex.start);
        fixed.push({ name: `Prep for ${ex.name}`, start: s - 5, duration: 5 });
        fixed.push({ name: ex.name, start: s, duration: ex.duration });
        scheduledNames.add(`Prep for ${ex.name}`);
        scheduledNames.add(ex.name);
    }

    // Reserve top 2 tasks for focus windows
    const sortedByLen = goals.slice().sort((a, b) => b.duration - a.duration);
    const [g1, g2] = sortedByLen;
    if (focusWindows[0] && g1) {
        fixed.push({ name: g1.name, start: hhmmToMin(focusWindows[0]), duration: g1.duration, reserved: true });
        scheduledNames.add(g1.name);
    }
    if (focusWindows[1] && g2) {
        fixed.push({ name: g2.name, start: hhmmToMin(focusWindows[1]), duration: g2.duration, reserved: true });
        scheduledNames.add(g2.name);
    }

    fixed.sort((a, b) => a.start - b.start);

    let cursor = hhmmToMin(startOfDay);
    const tasks = [];

    const remaining = goals
        .map(g => ({ ...g }))
        .filter(g => !scheduledNames.has(g.name));

    function scheduleWorkInWindow(windowEnd) {
        const minBlock = 15;

        while (remaining.length && cursor < windowEnd) {
            const { name, duration } = remaining.shift();

            // If fits fully in window
            if (cursor + duration <= windowEnd) {
                tasks.push({ task: name, time: minToHhmm(cursor), duration });
                cursor += duration;
                if (duration > 40) {
                    tasks.push({ task: 'Break', time: minToHhmm(cursor), duration: 5 });
                    cursor += 5;
                }
            } else {
                const available = windowEnd - cursor;

                // Not enough space, skip if too small to be useful
                if (available < minBlock) break;

                // Split large task into part1 and defer rest
                const part1 = available;
                tasks.push({ task: `${name} (part 1)`, time: minToHhmm(cursor), duration: part1 });
                cursor += part1;
                if (part1 > 40) {
                    tasks.push({ task: 'Break', time: minToHhmm(cursor), duration: 5 });
                    cursor += 5;
                }

                // Schedule part 2 later
                const remainingTime = duration - part1;
                remaining.unshift({ name: `${name} (part 2)`, duration: remainingTime });
                break;
            }
        }
    }


    for (const ev of fixed) {
        if (cursor < ev.start) {
            scheduleWorkInWindow(ev.start);
        }

        tasks.push({
            task: ev.name,
            time: minToHhmm(ev.start),
            duration: ev.duration
        });

        let newCursor = ev.start + ev.duration;
        if (ev.duration > 40) {
            tasks.push({
                task: 'Break',
                time: minToHhmm(newCursor),
                duration: 5
            });
            newCursor += 5;
        }

        cursor = Math.max(cursor, newCursor);
    }

    // 🛠️ Schedule any remaining tasks after last fixed event
    scheduleWorkInWindow(Infinity);

    // ✅ Final wrap-up block (guaranteed last)
    tasks.push({ task: 'Review & plan tomorrow', time: minToHhmm(cursor), duration: 15 });

    tasks.sort((a, b) => a.time.localeCompare(b.time));
    return tasks;
}

module.exports = { scheduleDay };
