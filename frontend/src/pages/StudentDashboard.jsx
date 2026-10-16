import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../API/axios';
import { useAuth } from '../AuthContext.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [enr, all] = await Promise.all([
          api.get('/enrollments/my'),
          api.get('/courses'),
        ]);

        // /enrollments/my mein instructor ka naam populate nahi hota,
        // isliye /courses se naam nikaal lete hain
        const instructorOf = {};
        all.data.forEach((c) => (instructorOf[c._id] = c.instructor?.name || 'Unknown'));

        const rows = await Promise.all(
          enr.data
            .filter((e) => e.course)
            .map(async (e) => {
              const c = e.course;
              const subsRes = await api.get(`/submissions/my/${c._id}`);

              // sirf wahi gino jo abhi course mein maujood hain
              const materialIds = c.materials.map((m) => m._id);
              const assignmentIds = c.assignments.map((a) => a._id);
              const done = e.completedMaterials.filter((id) => materialIds.includes(id)).length;
              const submitted = new Set(
                subsRes.data.map((s) => s.assignmentId).filter((id) => assignmentIds.includes(id))
              ).size;

              const total = c.materials.length + c.assignments.length;
              return {
                id: c._id,
                title: c.title,
                instructor: instructorOf[c._id] || 'Unknown',
                assignmentsCount: c.assignments.length,
                submitted,
                progress: total ? Math.round(((done + submitted) / total) * 100) : 0,
              };
            })
        );
        setMyCourses(rows);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your courses');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        myCourses.length === 0 ? (
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
                  {c.progress}% complete · {c.submitted}/{c.assignmentsCount} assignments
                </p>
                <Link className="btn btn-small" to={`/courses/${c.id}`}>Continue</Link>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}