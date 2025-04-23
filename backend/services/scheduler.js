function hhmmToMin(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) {
        console.error(`❌ Invalid time format in hhmmToMin: ${hhmm}`);
        return null;
    }
    return h * 60 + m;
}

function minToHhmm(mins) {
    if (isNaN(mins)) {
        console.error(`❌ Cannot convert NaN minutes to hh:mm: ${mins}`);
        return "00:00";
    }
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
}

function scheduleDay({ goals, exceptions = [], startOfDay = '09:00', focusWindows = [] }) {
    goals = goals.map(g => ({
        task: (g.task || g.name || '').trim(),
        duration: Number(g.duration) || 30 // fallback to 30 if missing
    }));

    const startMinutes = hhmmToMin(startOfDay);
    if (startMinutes === null) throw new Error(`Invalid startOfDay: ${startOfDay}`);

    const fixed = [];
    const scheduledNames = new Set();

    for (const ex of exceptions) {
        const s = hhmmToMin(ex.start);
        if (s === null) continue;

        fixed.push({ name: `Prep for ${ex.name}`, start: s - 5, duration: 5 });
        fixed.push({ name: ex.name, start: s, duration: ex.duration });
        scheduledNames.add(`Prep for ${ex.name}`);
        scheduledNames.add(ex.name);
    }

    const sortedByLen = goals.slice().sort((a, b) => b.duration - a.duration);
    const [g1, g2] = sortedByLen;

    if (focusWindows[0] && g1) {
        const fw1 = hhmmToMin(focusWindows[0]);
        if (fw1 !== null) {
            fixed.push({ name: g1.task, start: fw1, duration: g1.duration, reserved: true });
            scheduledNames.add(g1.task);
        }
    }

    if (focusWindows[1] && g2) {
        const fw2 = hhmmToMin(focusWindows[1]);
        if (fw2 !== null && g2.task !== g1.task) {
            fixed.push({ name: g2.task, start: fw2, duration: g2.duration, reserved: true });
            scheduledNames.add(g2.task);
        }
    }

    fixed.sort((a, b) => a.start - b.start);

    let cursor = startMinutes;
    const tasks = [];

    const remaining = goals
        .map(g => ({ ...g }))
        .filter(g => !scheduledNames.has(g.task));


    function scheduleWorkInWindow(windowEnd) {
        const minBlock = 15;

        while (remaining.length && cursor < windowEnd) {
            const { task: name, duration } = remaining.shift();

            if (cursor + duration <= windowEnd) {
                tasks.push({ task: name, time: minToHhmm(cursor), duration });
                cursor += duration;
                if (duration > 40) {
                    tasks.push({ task: 'Break', time: minToHhmm(cursor), duration: 5 });
                    cursor += 5;
                }
            } else {
                const available = windowEnd - cursor;
                if (available < minBlock) break;

                const part1 = available;
                tasks.push({ task: `${name} (part 1)`, time: minToHhmm(cursor), duration: part1 });
                cursor += part1;
                if (part1 > 40) {
                    tasks.push({ task: 'Break', time: minToHhmm(cursor), duration: 5 });
                    cursor += 5;
                }

                const remainingTime = duration - part1;
                remaining.unshift({ task: `${name} (part 2)`, duration: remainingTime });
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

    scheduleWorkInWindow(Infinity);

    tasks.push({ task: 'Review & plan tomorrow', time: minToHhmm(cursor), duration: 15 });

    tasks.sort((a, b) => a.time.localeCompare(b.time));

    console.log("✅ Final Scheduled Plan:");
    console.table(tasks);

    return tasks;
}

module.exports = { scheduleDay };
