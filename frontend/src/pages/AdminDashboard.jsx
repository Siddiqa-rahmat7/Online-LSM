import { useState, useEffect } from 'react';
import api from '../API/axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    students: 0,
    instructors: 0,
    courses: 0,
    enrollments: 0,
    submissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [u, c, e, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/courses'),
        api.get('/admin/enrollments'),
        api.get('/admin/stats'),
      ]);
      setUsers(u.data);
      setCourses(c.data);
      setEnrollments(e.data.filter((x) => x.student && x.course));
      setStats(s.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Sabse popular courses (enrollments ke hisaab se)
  const counts = courses
    .map((c) => ({
      title: c.title,
      count: enrollments.filter((e) => e.course._id === c._id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete ${u.email}?`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete user');
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete course');
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <>
      <h1 className="page-title">Admin Dashboard</h1>
      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="stat"><b>{stats.students}</b><span>Students</span></div>
        <div className="stat"><b>{stats.instructors}</b><span>Instructors</span></div>
        <div className="stat"><b>{stats.courses}</b><span>Courses</span></div>
        <div className="stat"><b>{stats.enrollments}</b><span>Enrollments</span></div>
        <div className="stat"><b>{stats.submissions}</b><span>Submissions</span></div>
      </div>

      <h2>Most popular courses</h2>
      <div className="card">
        {counts.length === 0 && <p className="muted">No courses yet.</p>}
        {counts.map((c) => (
          <div className="chart-row" key={c.title}>
            <span className="chart-label">{c.title}</span>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} />
            </div>
            <span>{c.count}</span>
          </div>
        ))}
      </div>

      <h2>Users</h2>
      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="tag">{u.role}</span></td>
              <td>
                {/* admin delete nahi hota */}
                {u.role !== 'admin' && (
                  <button className="btn btn-small btn-danger" onClick={() => deleteUser(u)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Courses</h2>
      <table>
        <thead>
          <tr><th>Title</th><th>Category</th><th>Instructor</th><th></th></tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td>{c.title}</td>
              <td>{c.category}</td>
              <td>{c.instructor?.name}</td>
              <td>
                <button className="btn btn-small btn-danger" onClick={() => deleteCourse(c._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Enrollments</h2>
      {enrollments.length === 0 ? (
        <p className="muted">No enrollments yet.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Student</th><th>Course</th></tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e._id}>
                <td>{e.student.email}</td>
                <td>{e.course.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}