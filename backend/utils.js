/** Strip Markdown fences/backticks */
const stripFences = (text) => {
  let t = text.trim();
  if (t.startsWith('```')) {
    const parts = t.split('```');
    if (parts.length >= 3) {
      t = parts[1].trim();
      if (t.toLowerCase().startsWith('json')) t = t.slice(4).trim();
    }
  }
  return t.replace(/(^`+|`+$)/g, '').trim();
}

module.exports = { stripFences };
