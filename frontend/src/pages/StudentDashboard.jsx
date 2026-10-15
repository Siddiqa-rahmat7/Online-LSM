import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { getCourses } from '../data/courseStore.js';

// localStorage se safe tarike se padhne ka helper
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export default function StudentDashboard() {
  const { user } = useAuth();

  // is user ne kin courses mein enroll kiya hai
  const enrolledIds = read(`enrolled_${user.email}`, []);

  // har enrolled course ka progress nikalo
  const myCourses = getCourses()
    .filter((c) => enrolledIds.includes(c.id))
    .map((c) => {
      const done = read(`done_${user.email}_${c.id}`, []);
      const subs = read(`subs_${user.email}_${c.id}`, {});
      const submitted = Object.keys(subs).length;
      const total = c.materials.length + c.assignments.length;
      const finished = done.length + submitted;
      return {
        ...c,
        submitted,
        progress: total ? Math.round((finished / total) * 100) : 0,
      };
    });

  const avg = myCourses.length
    ? Math.round(myCourses.reduce((sum, c) => sum + c.progress, 0) / myCourses.length)
    : 0;
  const totalSubmitted = myCourses.reduce((sum, c) => sum + c.submitted, 0);

  return (
    <>
      <h1 className="page-title">Welcome, {user.name}</h1>

      <div className="stats">
        <div className="stat"><b>{myCourses.length}</b><span>Enrolled courses</span></div>
        <div className="stat"><b>{avg}%</b><span>Average progress</span></div>
        <div className="stat"><b>{totalSubmitted}</b><span>Assignments submitted</span></div>
      </div>

      <h2>My Learning</h2>
      {myCourses.length === 0 ? (
        <p className="muted">
          You haven't enrolled in any course yet. <Link to="/courses">Browse courses</Link>
        </p>
      ) : (
        <div className="grid">
          {myCourses.map((c) => (
            <div className="card" key={c.id}>
              <h3>{c.title}</h3>
              <p className="small muted">by {c.instructor}</p>
              <div className="bar"><div className="bar-fill" style={{ width: `${c.progress}%` }} /></div>
              <p className="small">
                {c.progress}% complete · {c.submitted}/{c.assignments.length} assignments
              </p>
              <Link className="btn btn-small" to={`/courses/${c.id}`}>Continue</Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}