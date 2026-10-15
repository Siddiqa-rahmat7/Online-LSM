import { useState } from 'react';
import { demoUsers } from '../AuthContext.jsx';
import { getCourses, saveCourses } from '../data/courseStore.js';

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

// Saare students ke enrollments: [{ email, courseId }]
function allEnrollments() {
  const rows = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('enrolled_')) {
      const email = key.slice('enrolled_'.length);
      read(key, []).forEach((courseId) => rows.push({ email, courseId }));
    }
  }
  return rows;
}

// Total assignment submissions
function countSubmissions() {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('subs_')) count += Object.keys(read(key, {})).length;
  }
  return count;
}

export default function AdminDashboard() {
  const [registered, setRegistered] = useState(read('users', []));
  const [courses, setCourses] = useState(getCourses());

  const users = [...demoUsers, ...registered];
  const enrollments = allEnrollments().filter((e) =>
    courses.some((c) => c.id === e.courseId)
  );

  const titleOf = (id) => courses.find((c) => c.id === id)?.title;

  // Sabse popular courses
  const counts = courses
    .map((c) => ({
      title: c.title,
      count: enrollments.filter((e) => e.courseId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  const deleteUser = (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    const list = registered.filter((u) => u.email !== email);
    localStorage.setItem('users', JSON.stringify(list));
    localStorage.removeItem(`enrolled_${email}`);
    setRegistered(list);
  };

  const deleteCourse = (id) => {
    if (!window.confirm('Delete this course?')) return;
    const list = courses.filter((c) => c.id !== id);
    saveCourses(list);
    setCourses(list);
  };

  return (
    <>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="stats">
        <div className="stat"><b>{users.filter((u) => u.role === 'student').length}</b><span>Students</span></div>
        <div className="stat"><b>{users.filter((u) => u.role === 'instructor').length}</b><span>Instructors</span></div>
        <div className="stat"><b>{courses.length}</b><span>Courses</span></div>
        <div className="stat"><b>{enrollments.length}</b><span>Enrollments</span></div>
        <div className="stat"><b>{countSubmissions()}</b><span>Submissions</span></div>
      </div>

      <h2>Most popular courses</h2>
      <div className="card">
        {counts.map((c) => (
          <div className="chart-row" key={c.title}>
            <span className="chart-label">{c.title}</span>
            <div className="bar"><div className="bar-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} /></div>
            <span>{c.count}</span>
          </div>
        ))}
      </div>

      <h2>Users</h2>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.email}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className="tag">{u.role}</span></td>
              <td>
                {/* demo users delete nahi hote */}
                {registered.some((r) => r.email === u.email) && (
                  <button className="btn btn-small btn-danger" onClick={() => deleteUser(u.email)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Courses</h2>
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Instructor</th><th></th></tr></thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.category}</td>
              <td>{c.instructor}</td>
              <td><button className="btn btn-small btn-danger" onClick={() => deleteCourse(c.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Enrollments</h2>
      {enrollments.length === 0 ? (
        <p className="muted">No enrollments yet.</p>
      ) : (
        <table>
          <thead><tr><th>Student</th><th>Course</th></tr></thead>
          <tbody>
            {enrollments.map((e, i) => (
              <tr key={i}><td>{e.email}</td><td>{titleOf(e.courseId)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}