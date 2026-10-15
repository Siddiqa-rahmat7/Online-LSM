import seed from './courses.js';

const KEY = 'lms_courses';

// Saved courses do, agar kuch saved nahi hai to shuruaati (seed) courses
export function getCourses() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    // ignore, seed use hoga
  }
  return seed;
}

export function saveCourses(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}