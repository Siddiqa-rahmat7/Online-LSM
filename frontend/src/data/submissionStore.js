const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

// Ek course ke saare students ki submissions (localStorage ki keys scan karke)
export function getSubmissions(courseId) {
  const list = [];
  const suffix = `_${courseId}`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('subs_') && key.endsWith(suffix)) {
      const email = key.slice('subs_'.length, key.length - suffix.length);
      Object.entries(read(key, {})).forEach(([aid, text]) => {
        list.push({ email, aid, text });
      });
    }
  }
  return list;
}

// Ek student ke us course ke grades: { assignmentId: { marks, feedback } }
export function getGrades(email, courseId) {
  return read(`grades_${email}_${courseId}`, {});
}

export function saveGrade(email, courseId, aid, grade) {
  const all = getGrades(email, courseId);
  localStorage.setItem(
    `grades_${email}_${courseId}`,
    JSON.stringify({ ...all, [aid]: grade })
  );
}